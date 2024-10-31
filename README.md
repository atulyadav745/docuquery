# Full-Stack PDF NLP Application

## Overview

This project is a full-stack application that allows users to upload PDF documents and ask questions regarding the content of these documents. The backend processes these documents and utilizes natural language processing (NLP) to provide answers to the questions posed by the users.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Setup](#setup)
4. [Usage](#usage)
5. [API Documentation](#api-documentation)
6. [Application Architecture](#application-architecture)
7. [Demo](#demo)

## Prerequisites

- **Python 3.9+**: Required for the backend.
- **Node.js 14+**: Required for the frontend.
- **PostgreSQL or SQLite**: Required if using a database for storing document metadata.
- **Docker**: Optional, for containerized deployment.


## Installation

### Backend
#### Structure

1. Clone the repository:

    ```sh
    git clone https://github.com/atulyadav745/pdf-chatbot.git
    cd pdf-chatbot/backend
    ```

2. Create and activate a virtual environment:

    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the required packages:

    ```sh
    pip install -r requirements.txt
    ```

### Frontend

1. Navigate to the frontend directory:

    ```sh
    cd ../frontend
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

## Setup

### Backend Configuration

1. **Environment Variables**: Create a `.env` file in the `backend` directory with the following:

    ```ini
    DATABASE_URL=sqlite:///./test.db  # or your PostgreSQL connection string
    STORAGE_PATH=./uploads
    ```

2. **Initialize the Database**:

    ```sh
    python main.py db init
    ```

3. **Run the Backend**:

    ```sh
    uvicorn main:app --reload
    ```

### Frontend Configuration
1. **Run the Frontend**:

    ```sh
    npm start
    ```

## Usage

### Uploading PDFs

1. Navigate to the home page.
2. Click on the "Upload PDF" button.
3. Select and upload a PDF document.

### Asking Questions

1. After uploading a PDF, go to the question input section.
2. Enter your question in the input field and submit.
3. View the answer below the question field.

## API Documentation

### Endpoints

#### Upload PDF

- **URL**: `/upload`
- **Method**: `POST`
- **Description**: Uploads a PDF document.
- **Request**:
  - **Headers**: `Content-Type: multipart/form-data`
  - **Body**: `file`: the PDF file.

- **Response**:
  - **200**: Success, returns document metadata.
  - **400**: Error, returns error details.

#### Ask Question

- **URL**: `/ask`
- **Method**: `POST`
- **Description**: Receives a question and returns an answer based on the uploaded PDF.
- **Request**:
  - **Headers**: `Content-Type: application/json`
  - **Body**: `{ "doc_id": "<document_id>", "question": "<user_question>" }`

- **Response**:
  - **200**: Success, returns the answer.
  - **400**: Error, returns error details.

## Application Architecture
You can view Application Architecture [here](https://drive.google.com/file/d/1hIdGTj55QqRZbadh7jA8XIANSJcjlZXg/view?usp=sharing).

### Backend

- **Framework**: FastAPI
- **NLP**: LangChain for processing questions and generating answers.
- **PDF Processing**: PyMuPDF for extracting text from PDFs.
- **Data Management**: SQLite/PostgreSQL for metadata storage.
- **File Storage**: Local filesystem or AWS S3 for PDF storage.

### Frontend

- **Framework**: React.js
- **State Management**: Context API.
- **HTTP Client**: Axios for API requests.
- **Styling**: CSS Modules or styled-components.

### Data Flow

1. **PDF Upload**: The frontend sends the PDF file to the backend.
2. **PDF Processing**: The backend extracts text and stores metadata.
3. **Question Processing**: The frontend sends questions, which the backend processes and responds to with answers.

## Demo

You can view a live demo [here](https://aiplanet-ten.vercel.app/).

Alternatively, watch a screencast [here](https://drive.google.com/file/d/1AEbNJiZBQFbklivikyQZTO2M_4J6seuI/view?usp=sharing).

---

If you have any questions or need further assistance, feel free to [open an issue](https://github.com/your-repo/fullstack-pdf-nlp-app/issues).

---

Happy coding! 🎉
