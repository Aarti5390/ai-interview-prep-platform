import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import './ResultPage.css';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No interview ID provided');
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const res = await API.get(`/interview/${id}/result`);
        setResult(res.data);
      } catch (err) {
        console.error("Fetch result error:", err);
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="result-container loading">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="result-container">
        <div className="result-card error">{error}</div>
      </div>
    );
  }

  // Safely calculate highest score
  const highestScore = result?.questions?.length
    ? Math.max(...result.questions.map(q => q.score || 0))
    : 0;

  return (
    <div className="result-container">
      <div className="result-card">
        <h1>Interview Results</h1>

        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Questions</span>
            <span className="stat-value">{result.summary.totalQuestions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Score</span>
            <span className="stat-value">{result.summary.averageScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Highest Score</span>
            <span className="stat-value">{highestScore}</span>
          </div>
        </div>

        <h2>Detailed Review</h2>
        <div className="questions-list">
          {result.questions.map((q, index) => (
            <div key={index} className="question-review">
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                <span className="question-score">Score: {q.score ?? 0}/10</span>
              </div>
              <p className="question-text"><strong>Question:</strong> {q.text}</p>
              <p className="user-answer"><strong>Your Answer:</strong> {q.userAnswer || "Not answered"}</p>
              
              <div className="ai-feedback">
                <strong>Strengths:</strong> {q.strengths || "—"}
              </div>
              <div className="ai-feedback">
                <strong>Weaknesses:</strong> {q.weaknesses || "—"}
              </div>
              <div className="ai-feedback">
                <strong>Suggestions for improvement:</strong> {q.suggestions || "—"}
              </div>
            </div>
          ))}
        </div>

        <button onClick={goToDashboard} className="dashboard-btn">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultPage;