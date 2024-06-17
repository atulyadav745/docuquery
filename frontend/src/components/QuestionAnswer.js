import React, { useState } from 'react';
import { askQuestion } from '../api';

function QuestionAnswer({ pdf }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const handleQuestionChange = (e) => {
        setQuestion(e.target.value);
    };

    const handleAskQuestion = async () => {
        try {
            const response = await askQuestion({
                pdf_id: pdf.id,
                question: question
            });
            setAnswer(response.data.answer);
        } catch (error) {
            console.error("Question error:", error);
        }
    };

    return (
        <div>
            <h3>Ask a question about: {pdf.filename}</h3>
            <input type="text" value={question} onChange={handleQuestionChange} />
            <button onClick={handleAskQuestion}>Ask</button>
            <p>Answer: {answer}</p>
        </div>
    );
}

export default QuestionAnswer;
