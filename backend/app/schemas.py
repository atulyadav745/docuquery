from pydantic import BaseModel
from typing import Optional

class PDFDocumentBase(BaseModel):
    filename: str
    file_url: Optional[str] = None

class QuestionRequest(BaseModel):
    pdf_id: int
    question: str

class PDFDocumentCreate(PDFDocumentBase):
    text_content: str

class PDFDocument(PDFDocumentBase):
    id: int
    text_content: Optional[str] = None

    class Config:
        from_attributes = True
