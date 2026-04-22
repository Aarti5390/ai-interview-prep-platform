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
  const [deleteConfirm, setDeleteConfirm] = useState(null); // stores interview id to delete

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

  const handleDelete = async (id) => {
    try {
      await API.delete(`/interview/${id}`);
      // Refresh current page after deletion
      if (interviews.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchHistory();
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete interview');
    }
  };

  const goToPrevPage = () => { if (page > 1) setPage(page - 1); };
  const goToNextPage = () => { if (page < totalPages) setPage(page + 1); };

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
                  <div className="history-actions">
                    <span className={`status ${interview.status}`}>{interview.status}</span>
                    <button 
                      className="delete-btn" 
                      onClick={() => setDeleteConfirm(interview._id)}
                      title="Delete interview"
                    >
                      🗑️
                    </button>
                  </div>
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
          <div className="pagination-controls">
            <button onClick={goToPrevPage} disabled={page === 1}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={goToNextPage} disabled={page === totalPages}>Next</button>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Delete Interview</h3>
            <p>Are you sure you want to delete this interview? This action cannot be undone.</p>
            <div className="confirm-buttons">
              <button onClick={() => setDeleteConfirm(null)} className="cancel-btn">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="confirm-delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;