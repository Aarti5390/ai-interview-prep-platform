import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './InterviewPage.css';
import API from "../api/api";

const InterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(null); // ✅ FIX ADDED
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch question on mount
  useEffect(() => {
    fetchQuestion();
  }, []);

  // ✅ FIXED: Using API instead of fetch
  const fetchQuestion = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await API.get(`/interview/${id}/question`);
      const data = res.data;

      console.log("Question API Response:", data); // DEBUG

      if (!data || data.completed) {
        navigate(`/result/${id}`);
        return;
      }

      setCurrentQuestion(data.question.question);
      setAnswer('');
      setEvaluation(null);

    } catch (err) {
      console.error("Fetch Question Error:", err);
      setError(err.response?.data?.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Using API instead of fetch
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await API.post(`/interview/${id}/answer`, { answer });
      const data = res.data;

      console.log("Answer API Response:", data); // DEBUG

setEvaluation({
  score: data.score,
  feedback:
    data.feedback ||
    data.evaluation?.feedback ||
    data.message ||
    "No feedback available"
});

    } catch (err) {
      console.error("Submit Answer Error:", err);
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    fetchQuestion();
  };

  if (loading && !currentQuestion) {
    return <div className="interview-container loading">Loading question...</div>;
  }

  return (
    <div className="interview-container">
      <div className="interview-card">
        <h1>AI Interview</h1>

        {error && <div className="error-message">{error}</div>}

        {currentQuestion ? (
          <>
            <div className="question-section">
              <h2>Question</h2>
              <p className="question-text">{currentQuestion}</p>
            </div>

            {!evaluation ? (
              <form onSubmit={handleSubmit} className="answer-form">
                <h3>Your Answer</h3>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={submitting}
                  rows="6"
                />
                <button type="submit" disabled={submitting || !answer.trim()}>
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </form>
            ) : (
              <div className="evaluation-section">
                <h3>AI Evaluation</h3>
                <div className="score-badge">
  Score: {evaluation?.score ?? "N/A"}
</div>
  <p className="feedback">
  {evaluation?.feedback || "No feedback available"}
</p>
                <button onClick={handleNext} className="next-btn">
                  Next Question
                </button>
              </div>
            )}
          </>
        ) : (
          !loading && <p>No more questions. Redirecting...</p>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;