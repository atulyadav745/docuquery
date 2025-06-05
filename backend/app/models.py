from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class PDFDocument(Base):
    __tablename__ = "pdf_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    upload_date = Column(DateTime, default=datetime.utcnow)
    text_content = Column(String)
    file_url = Column(String)  # New column for GCS public URL

# from sqlalchemy import Column, Integer, String, Text

# class PDFDocument(Base):
#     __tablename__ = "pdf_documents"

#     id = Column(Integer, primary_key=True, index=True)
#     filename = Column(String, index=True)
#     text_content = Column(Text)
#     file_url = Column(String)  # New column for GCS public URL
