import React, { useState } from "react";
import { uploadPDF } from "../api";

function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMessage(""); // Clear error message when file is selected
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await uploadPDF(formData);
      onUpload(response.data);
    } catch (error) {
      console.error("File upload error:", error);
      setErrorMessage("Failed to upload file");
    }
  };

  return (
    <>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <a class="navbar-brand" href="#">
            <img
              src="/logo.svg"
              alt="AI Planet"
              width="100"
              height="50"
            />
          </a>

          <span className="d-flex">
            <input
              className="form-control me-2"
              type="file"
              onChange={handleFileChange}
            />
            <button className="btn btn-outline-success" onClick={handleUpload}>
              Upload
            </button>
          </span>
        </div>
      </nav>
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
    </>
  );
}

export default FileUpload;
