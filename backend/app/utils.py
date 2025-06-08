from pypdf import PdfReader
from google.cloud import storage
import os
from datetime import datetime, timedelta

def upload_to_gcs(bucket_name: str, destination_blob_name: str, file_data: bytes) -> str:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_string(file_data, content_type='application/pdf')
    return blob.public_url

def get_signed_url(bucket_name: str, blob_name: str, expiration_minutes: int = 60) -> str:
    """
    Generate a signed URL for a GCS file that expires after specified minutes
    """
    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        # Generate signed URL that expires in specified minutes
        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.utcnow() + timedelta(minutes=expiration_minutes),
            method="GET",
            content_type="application/pdf",
        )
        return url
    except Exception as e:
        print(f"Error generating signed URL: {str(e)}")
        return None

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

    # upload to GCS

