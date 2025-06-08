import React, { useState } from "react";
import { askQuestion } from "../api";

function QuestionAnswer({ pdf }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    setError(null);
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
            confidence: response.data.confidence,
            hasAnswer: response.data.has_answer,
            timestamp: new Date().toLocaleTimeString()
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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-success";
    if (confidence >= 0.5) return "text-warning";
    return "text-danger";
  };

  return (
    <div className="flex flex-col flex-1 p-4 mt-4 mx-auto" style={{ width: "100%", maxWidth: "800px" }}>
      <div className="mb-4 overflow-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
        {messages.map((msg, index) => (
          <div key={index} className={`alert ${msg.hasAnswer ? 'alert-light' : 'alert-warning'} border mb-3`}>
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <p className="fw-bold mb-2">Q: {msg.question}</p>
                <p className="mb-2">A: {msg.answer}</p>
                <div className="d-flex align-items-center mt-2">
                  <small className={`${getConfidenceColor(msg.confidence)} me-2`}>
                    Confidence: {(msg.confidence * 100).toFixed(1)}%
                  </small>
                  <small className="text-muted">{msg.timestamp}</small>
                </div>
              </div>
            </div>
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
      
      <div className="input-group sticky-bottom bg-white p-3 border-top">
        <input
          type="text"
          className="form-control"
          placeholder="Ask a question about the PDF..."
          value={question}
          onChange={handleQuestionChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button 
          className={`btn ${isLoading ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleAskQuestion}
          disabled={isLoading || !question.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : (
            'Ask'
          )}
        </button>
      </div>
    </div>
  );
}

export default QuestionAnswer;
