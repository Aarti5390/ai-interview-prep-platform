import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './InterviewPage.css';
import API from "../api/api";

const InterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const res = await API.get(`/interview/${id}/question`);
      const data = res.data;

      if (!data || data.completed) {
        navigate(`/result/${id}`);
        return;
      }

      setCurrentQuestion(data.question);
    } catch (err) {
      console.error("Fetch Question Error:", err);
      setError(err.response?.data?.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      await API.post(`/interview/${id}/answer`, { answer });
      // Immediately load the next question (or results)
      await fetchQuestion();
    } catch (err) {
      console.error("Submit Answer Error:", err);
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
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
          </>
        ) : (
          !loading && <p>No more questions. Redirecting...</p>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;