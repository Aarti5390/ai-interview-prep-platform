import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import './HistoryPage.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/interview/history?page=${page}&limit=5`);
      setInterviews(res.data.interviews);
      setTotalPages(res.data.pages);
      setTotalItems(res.data.total);
    } catch (err) {
      console.error(err);
      setError('Failed to load interview history.');
    } finally {
      setLoading(false);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading) return <div className="loading">Loading history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="history-page">
      <h1>My Interview History</h1>
      <p>Total interviews: {totalItems}</p>

      {interviews.length === 0 ? (
        <p>No interviews yet. Start your first interview!</p>
      ) : (
        <>
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
                  <button onClick={() => navigate(`/result/${interview._id}`)} className="view-result-btn">
                    View Result
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button onClick={goToPrevPage} disabled={page === 1}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={goToNextPage} disabled={page === totalPages}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryPage;