import React, { useState } from "react";
import { askQuestion } from "../api";

function QuestionAnswer({ pdf }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    setError(null); // Clear any previous errors when user starts typing
  };

  const handleAskQuestion = async () => {
    if (question.trim() === "") {
      setError("Please enter a question");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await askQuestion({
        pdf_id: pdf.id,
        question: question,
      });
      
      if (response.data && response.data.answer) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            question: question, 
            answer: response.data.answer,
            confidence: response.data.confidence 
          }
        ]);
        setQuestion("");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Question error:", error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        "An error occurred while processing your question. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div
      className="flex flex-col flex-1 p-4 mt-4 mx-auto"
      style={{ minWidth: "50%", maxWidth: "50%", width: "100%" }}
    >
      <div className="mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="alert alert-light border mb-3">
            <p><strong>Question:</strong> {msg.question}</p>
            <p><strong>Answer:</strong> {msg.answer}</p>
            {msg.confidence && (
              <p className="text-muted"><small>Confidence: {(msg.confidence * 100).toFixed(1)}%</small></p>
            )}
          </div>
        ))}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
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
          placeholder="Ask a question about the PDF..."
          value={question}
          onChange={handleQuestionChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <div className="input-group-append">
          <button 
            className="btn btn-primary" 
            onClick={handleAskQuestion}
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? "Processing..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionAnswer;
