from pypdf import PdfReader
from google.cloud import storage
import os

def upload_to_gcs(bucket_name: str, destination_blob_name: str, file_data: bytes) -> str:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_string(file_data, content_type='application/pdf')
    return blob.public_url

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

    # upload to GCS

