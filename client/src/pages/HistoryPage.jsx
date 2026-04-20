import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import './HistoryPage.css'; // optional

const HistoryPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/interview/history');
      setInterviews(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load interview history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="history-page">
      <h1>My Interview History</h1>

      {interviews.length === 0 ? (
        <p>No interviews yet. Start your first interview!</p>
      ) : (
        <div className="history-list">
          {interviews.map((interview) => (
            <div key={interview._id} className="history-card">
              <div className="history-header">
                <h3>Interview from {new Date(interview.createdAt).toLocaleDateString()}</h3>
                <span className={`status ${interview.status}`}>{interview.status}</span>
              </div>
              <p><strong>Category:</strong> {interview.category || 'N/A'}</p>
              <p><strong>Difficulty:</strong> {interview.difficulty || 'N/A'}</p>
              <p><strong>Questions answered:</strong> {interview.questions.filter(q => q.userAnswer).length} / {interview.questions.length}</p>
              {interview.status === 'completed' && (
                <button
                  onClick={() => navigate(`/result/${interview._id}`)}
                  className="view-result-btn"
                >
                  View Result
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;