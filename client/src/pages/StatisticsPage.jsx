import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    overallScore: 0,
    completed: 0,
    practiceTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch paginated interviews for history table
      const res = await API.get(`/interview/history?page=${page}&limit=5`);
      const interviewsData = res.data.interviews || [];
      setInterviews(interviewsData);
      setTotalPages(res.data.pages || 1);

      // Fetch all interviews for statistics (overall numbers)
      const allRes = await API.get('/interview/history?limit=1000');
      const allInterviews = Array.isArray(allRes.data) ? allRes.data : (allRes.data.interviews || []);
      const completed = allInterviews.filter(i => i.status === 'completed');
      let totalScore = 0, questionCount = 0;
      completed.forEach(interview => {
        interview.questions.forEach(q => {
          if (q.score) {
            totalScore += q.score;
            questionCount++;
          }
        });
      });
      const avgScore = questionCount ? Math.round(totalScore / questionCount) : 0;
      let totalMinutes = 0;
      completed.forEach(interview => {
        if (interview.startedAt && interview.endedAt) {
          const diff = new Date(interview.endedAt) - new Date(interview.startedAt);
          totalMinutes += Math.floor(diff / 60000);
        }
      });
      setStats({
        overallScore: avgScore,
        completed: completed.length,
        practiceTime: totalMinutes
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for chart (last 5 completed interviews)
  const chartData = interviews
    .filter(i => i.status === 'completed')
    .slice(0, 5)
    .map(interview => {
      const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
      const avgScore = interview.questions.length ? Math.round(totalScore / interview.questions.length) : 0;
      return {
        date: new Date(interview.createdAt).toLocaleDateString(),
        score: avgScore
      };
    })
    .reverse(); // show oldest first for trend

  if (loading) return <div className="loading">Loading statistics...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="statistics-page">
      <h1>Your Performance Statistics</h1>

      <div className="stats-summary">
        <div className="stat-card"><h3>Overall Prep Score</h3><p>{stats.overallScore}%</p></div>
        <div className="stat-card"><h3>Completed Interviews</h3><p>{stats.completed}</p></div>
        <div className="stat-card"><h3>Practice Time</h3><p>{stats.practiceTime} min</p></div>
      </div>

      {/* Score Trend Chart */}
      {chartData.length > 0 && (
        <div className="chart-container">
          <h3>Score Trend (Last {chartData.length} Interviews)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="detailed-stats">
        <h2>Interview History</h2>
        {interviews.length === 0 ? (
          <p>No interviews yet.</p>
        ) : (
          <>
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
                      <td data-label="Date">{new Date(interview.createdAt).toLocaleDateString()}</td>
                      <td data-label="Category">{interview.category || 'N/A'}</td>
                      <td data-label="Difficulty">{interview.difficulty || 'N/A'}</td>
                      <td data-label="Status">{interview.status}</td>
                      <td data-label="Score">{interview.status === 'completed' ? `${avgScore}%` : 'In progress'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;