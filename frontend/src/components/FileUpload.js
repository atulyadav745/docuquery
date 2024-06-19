import React, { useState, useEffect } from "react";
import { uploadPDF } from "../api";

function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [isUploading, setIsUploading] = useState(false); // State for upload status

  useEffect(() => {
    // Automatically hide success message after 3 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [successMessage]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMessage(""); // Clear error message when file is selected
    setSuccessMessage(""); // Clear success message when a new file is selected
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true); // Start uploading
    setErrorMessage(""); // Clear any previous error message
    setSuccessMessage(""); // Clear any previous success message

    try {
      const response = await uploadPDF(formData);
      onUpload(response.data);
      setSuccessMessage("File uploaded successfully!");
      setIsUploading(false); // End uploading on success
    } catch (error) {
      console.error("File upload error:", error);
      setErrorMessage("Failed to upload file");
      setIsUploading(false); // End uploading on failure
    }
  };

  const handleDismissSuccessMessage = () => {
    setSuccessMessage(""); // Manually clear success message
  };

  return (
    <>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
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
              disabled={isUploading} // Disable input during upload
            />
            <button
              className="btn btn-outline-success"
              onClick={handleUpload}
              disabled={isUploading} // Disable button during upload
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </span>
        </div>
      </nav>

      {isUploading && (
        <div className="alert alert-info mt-4" role="alert">
          Uploading...
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show mt-4" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleDismissSuccessMessage}
          ></button>
        </div>
      )}
      
      {errorMessage && (
        <div className="alert alert-danger mt-4" role="alert">
          {errorMessage}
        </div>
      )}
    </>
  );
}

export default FileUpload;
