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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const fetchQuestion = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await API.get(`/interview/${id}/question`);
      const data = res.data;
      console.log("Fetch question response:", data);

      if (data.completed === true) {
        navigate(`/result/${id}`);
        return;
      }

      setCurrentQuestion(data.question);
      setCurrentIndex(data.currentIndex);
      setTotalQuestions(data.totalQuestions);
      setAnswer(''); // ✅ Always clear the answer for a new question
    } catch (err) {
      console.error("Fetch Question Error:", err);
      setError(err.response?.data?.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      await API.post(`/interview/${id}/answer`, { answer });
      await fetchQuestion(); // Load next question – will clear the answer box
    } catch (err) {
      console.error("Submit Answer Error:", err);
      setError(err.response?.data?.message || "Failed to submit answer. Please try again.");
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
            <div className="progress-bar">
              Question {currentIndex} of {totalQuestions}
            </div>
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
          !loading && (
            <div className="error-container">
              <p>No questions found for this interview.</p>
              <button onClick={() => navigate('/interview/setup')} className="retry-btn">
                Start New Interview
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default InterviewPage;