from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, crud, database, utils
from .utils import upload_to_gcs
from transformers import pipeline
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Get port from environment variable or use default
PORT = int(os.getenv("PORT", 8000))

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

# Initialize QA pipeline
qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")

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
        try:
            logger.debug("Attempting to upload to GCS")
            gcs_url = upload_to_gcs(GCS_BUCKET_NAME, file.filename, file_data)
            logger.debug(f"Successfully uploaded to GCS, URL: {gcs_url}")
        except Exception as e:
            logger.error(f"GCS upload error: {str(e)}")
            # Continue with local file if GCS fails
            gcs_url = None
            
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
    db_pdf = crud.get_pdf_document(db, pdf_id=question_request.pdf_id)
    if db_pdf is None:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    answer = qa_pipeline(question=question_request.question, context=db_pdf.text_content)
    return {"question": question_request.question, "answer": answer["answer"]}
