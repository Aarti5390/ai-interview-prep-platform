import React, { useEffect, useState } from 'react';
import API from '../api/api';
import './StatisticsPage.css'; // optional

const StatisticsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    overallScore: 0,
    completed: 0,
    practiceTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await API.get('/interview/history');
      setInterviews(res.data);

      const completed = res.data.filter(i => i.status === 'completed');

      let totalScore = 0;
      let questionCount = 0;

      completed.forEach(interview => {
        interview.questions.forEach(q => {
          if (q.score) {
            totalScore += q.score;
            questionCount++;
          }
        });
      });

      const avgScore = questionCount ? Math.round(totalScore / questionCount) : 0;

      setStats({
        overallScore: avgScore,
        completed: completed.length,
        practiceTime: (completed.length * 5) / 2
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading statistics...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="statistics-page">
      <h1>Your Performance Statistics</h1>

      <div className="stats-summary">
        <div className="stat-card">
          <h3>Overall Prep Score</h3>
          <p>{stats.overallScore}%</p>
        </div>
        <div className="stat-card">
          <h3>Completed Interviews</h3>
          <p>{stats.completed}</p>
        </div>
        <div className="stat-card">
          <h3>Practice Time (approx.)</h3>
          <p>{stats.practiceTime} hrs</p>
        </div>
      </div>

      <div className="detailed-stats">
        <h2>Interview History</h2>
        {interviews.length === 0 ? (
          <p>No interviews yet. Start your first interview!</p>
        ) : (
          <table className="interview-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map(interview => {
                const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
                const avgScore = interview.questions.length ? Math.round(totalScore / interview.questions.length) : 0;
                return (
                  <tr key={interview._id}>
                    <td>{new Date(interview.createdAt).toLocaleDateString()}</td>
                    <td>{interview.category || 'N/A'}</td>
                    <td>{interview.difficulty || 'N/A'}</td>
                    <td>{interview.status}</td>
                    <td>{interview.status === 'completed' ? `${avgScore}%` : 'In progress'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;