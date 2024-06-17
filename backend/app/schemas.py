from pydantic import BaseModel
from typing import Optional

class PDFDocumentBase(BaseModel):
    filename: str

class QuestionRequest(BaseModel):
    pdf_id: int
    question: str

class PDFDocumentCreate(PDFDocumentBase):
    text_content: str

class PDFDocument(PDFDocumentBase):
    id: int
    text_content: Optional[str] = None

    class Config:
        orm_mode = True
