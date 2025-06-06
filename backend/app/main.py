from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, crud, database, utils
from .utils import upload_to_gcs
import os
import logging
import json
import tempfile
import numpy as np
import torch

# Configure numpy to use OpenBLAS
os.environ["OPENBLAS_NUM_THREADS"] = "1"

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Get port from environment variable or use default
PORT = int(os.getenv("PORT", 8000))

# Handle GCS credentials
GCS_CREDENTIALS = os.getenv('GOOGLE_CREDENTIALS')
if GCS_CREDENTIALS:
    # We're in production, create a temporary credentials file
    try:
        creds_dict = json.loads(GCS_CREDENTIALS)
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as creds_file:
            json.dump(creds_dict, creds_file)
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = creds_file.name
        logger.info("Successfully set up GCS credentials from environment variable")
    except Exception as e:
        logger.error(f"Error setting up GCS credentials: {str(e)}")

GCS_BUCKET_NAME = "docuquery-atul-uploads" 

app = FastAPI()
@app.get("/")
async def read_root():
    return {"message": "Welcome to the API!"}
# CORS settings
origins = [
    "http://localhost:3000",  # Your frontend URL
    "https://pdf-chatbot2.netlify.app",  # Your production site
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency for database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create directories if not existing
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Initialize QA pipeline with specific device placement
try:
    # Import here to avoid early torch initialization issues
    from transformers import pipeline
    
    # Check if CUDA is available and set device accordingly
    device = 0 if torch.cuda.is_available() else -1
    
    # Initialize the pipeline with explicit device placement
    qa_pipeline = pipeline(
        "question-answering", 
        model="deepset/roberta-base-squad2",
        device=device,
        model_kwargs={"low_cpu_mem_usage": True}
    )
    logger.info(f"Successfully initialized QA pipeline on device: {device}")
except Exception as e:
    logger.error(f"Error initializing QA pipeline: {str(e)}")
    raise

# @app.post("/upload/", response_model=schemas.PDFDocument)
# async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
#     file_location = f"uploads/{file.filename}"
#     with open(file_location, "wb+") as file_object:
#         file_object.write(file.file.read())

#     text_content = utils.extract_text_from_pdf(file_location)
#     pdf_create = schemas.PDFDocumentCreate(filename=file.filename, text_content=text_content)
#     pdf = crud.create_pdf_document(db=db, pdf=pdf_create)
#     return pdf

@app.post("/upload/", response_model=schemas.PDFDocument)
async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        logger.debug(f"Starting upload for file: {file.filename}")
        file_data = await file.read()

        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        
        # First save locally and extract text
        local_path = f"uploads/{file.filename}"
        logger.debug(f"Saving file locally to: {local_path}")
        
        with open(local_path, "wb") as f:
            f.write(file_data)
        
        try:
            text_content = utils.extract_text_from_pdf(local_path)
            logger.debug("Successfully extracted text from PDF")
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to extract text from PDF: {str(e)}")
        
        # Try uploading to GCS
        gcs_url = None
        try:
            logger.debug("Attempting to upload to GCS")
            if not os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
                logger.warning("GCS credentials not found. Skipping GCS upload.")
            else:
                gcs_url = upload_to_gcs(GCS_BUCKET_NAME, file.filename, file_data)
                logger.debug(f"Successfully uploaded to GCS, URL: {gcs_url}")
        except Exception as e:
            logger.error(f"GCS upload error: {str(e)}")
            logger.warning("Continuing without GCS upload. File will be stored locally only.")
            # Don't raise an exception, continue with local file
            
        # Create database entry
        try:
            pdf_create = schemas.PDFDocumentCreate(
                filename=file.filename,
                text_content=text_content,
                file_url=gcs_url
            )
            pdf = crud.create_pdf_document(db=db, pdf=pdf_create)
            logger.debug("Successfully created database entry")
            return pdf
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
            
    except Exception as e:
        logger.error(f"Unexpected error in upload_pdf: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        # Clean up local file
        try:
            if os.path.exists(local_path):
                os.remove(local_path)
        except Exception as e:
            logger.error(f"Error cleaning up local file: {str(e)}")

@app.get("/pdf/{pdf_id}", response_model=schemas.PDFDocument)
def read_pdf(pdf_id: int, db: Session = Depends(get_db)):
    db_pdf = crud.get_pdf_document(db, pdf_id=pdf_id)
    if db_pdf is None:
        raise HTTPException(status_code=404, detail="PDF not found")
    return db_pdf

@app.post("/question/")
def ask_question(question_request: schemas.QuestionRequest, db: Session = Depends(get_db)):
    try:
        db_pdf = crud.get_pdf_document(db, pdf_id=question_request.pdf_id)
        if db_pdf is None:
            raise HTTPException(status_code=404, detail="PDF not found")
        
        # Handle potential memory issues with large texts
        max_length = 384  # Maximum context length for RoBERTa
        context = db_pdf.text_content[:max_length * 10]  # Limit context size
        
        answer = qa_pipeline(
            question=question_request.question, 
            context=context,
            max_answer_len=50  # Limit answer length
        )
        return {
            "question": question_request.question, 
            "answer": answer["answer"],
            "confidence": round(float(answer["score"]), 4)
        }
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
