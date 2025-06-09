import React, { useState } from "react";
import { askQuestion } from "../api";

function QuestionAnswer({ pdf }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleAskQuestion = async () => {
    if (question.trim() === "") {
      return; // Do not send if the question is empty
    }

    try {
      setIsLoading(true); // Start loading
      const response = await askQuestion({
        pdf_id: pdf.id,
        question: question,
      });
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { question: question, answer: response.data.answer }
      ]);

      setQuestion(""); // Clear the input field after sending the question
    } catch (error) {
      console.error("Question error:", error);
    } finally {
      setIsLoading(false); // Stop loading regardless of success/failure
    }
  };

  return (
    <div
      className="flex flex-col flex-1 p-4 mt-4 mx-auto"
      style={{ minWidth: "50%", maxWidth: "50%", width: "100%" }}
    >
      <div className="mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="alert alert-light border">
            <p><strong>Question:</strong> {msg.question}</p>
            <p><strong>Answer:</strong> {msg.answer}</p>
          </div>
        ))}
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-2">Processing your question...</span>
          </div>
        )}
      </div>
      
      <div className="input-group position-fixed bottom-0 mb-4 w-50">
        <input
          type="text"
          className="form-control"
          placeholder="Send a message..."
          value={question}
          onChange={handleQuestionChange}
          disabled={isLoading}
        />
        <div className="input-group-append">
          <button 
            className="btn btn-outline-secondary" 
            onClick={handleAskQuestion}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionAnswer;
