import React, { useState, useEffect } from "react";
import API from "../api/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [interviewsPage, setInterviewsPage] = useState(1);
  const [interviewsPages, setInterviewsPages] = useState(1);
  const [searchEmail, setSearchEmail] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchInterviews();
  }, [usersPage, interviewsPage, searchEmail, filterStatus]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get(`/admin/users?page=${usersPage}&limit=10`);
      setUsers(res.data.users);
      setUsersPages(res.data.pages);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    }
  };

  const fetchInterviews = async () => {
    try {
      let url = `/admin/interviews?page=${interviewsPage}&limit=10`;
      if (searchEmail) url += `&email=${encodeURIComponent(searchEmail)}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      const res = await API.get(url);
      setInterviews(res.data.interviews);
      setInterviewsPages(res.data.pages);
    } catch (err) {
      console.error(err);
      setError("Failed to load interviews");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setInterviewsPage(1);
    fetchInterviews();
  };

  const clearFilters = () => {
    setSearchEmail("");
    setFilterStatus("");
    setInterviewsPage(1);
  };

  if (loading) return <div className="admin-loading">Loading admin dashboard...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>Statistics</button>
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Users</button>
        <button className={activeTab === "interviews" ? "active" : ""} onClick={() => setActiveTab("interviews")}>Interviews</button>
      </div>

      {activeTab === "stats" && stats && (
        <div className="stats-grid">
          <div className="stat-card"><h3>Total Users</h3><p>{stats.totalUsers}</p></div>
          <div className="stat-card"><h3>Total Interviews</h3><p>{stats.totalInterviews}</p></div>
          <div className="stat-card"><h3>Completed Interviews</h3><p>{stats.completedInterviews}</p></div>
          <div className="stat-card"><h3>Average Score</h3><p>{stats.averageScore}%</p></div>
          <button onClick={() => window.open('/api/admin/export/users', '_blank')}>Export Users CSV</button>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <div className="users-table-container">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role || "user"}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button onClick={() => setUsersPage(p => Math.max(1, p-1))} disabled={usersPage === 1}>Previous</button>
            <span>Page {usersPage} of {usersPages}</span>
            <button onClick={() => setUsersPage(p => Math.min(usersPages, p+1))} disabled={usersPage === usersPages}>Next</button>
          </div>
        </div>
      )}

      {activeTab === "interviews" && (
        <div>
          <div className="filter-bar">
            <form onSubmit={handleSearch} className="filter-form">
              <input type="text" placeholder="User email" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button type="submit">Apply Filters</button>
              <button type="button" onClick={clearFilters}>Clear</button>
            </form>
          </div>
          <div className="interviews-table-container">
            <table className="admin-table">
              <thead><tr><th>User</th><th>Category</th><th>Difficulty</th><th>Status</th><th>Questions</th><th>Date</th></tr></thead>
              <tbody>
                {interviews.map(interview => (
                  <tr key={interview._id}>
                    <td>{interview.user?.name || "Unknown"}</td>
                    <td>{interview.category || "—"}</td>
                    <td>{interview.difficulty || "—"}</td>
                    <td className={`status-${interview.status}`}>{interview.status}</td>
                    <td>{interview.questions?.length || 0}</td>
                    <td>{new Date(interview.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button onClick={() => setInterviewsPage(p => Math.max(1, p-1))} disabled={interviewsPage === 1}>Previous</button>
            <span>Page {interviewsPage} of {interviewsPages}</span>
            <button onClick={() => setInterviewsPage(p => Math.min(interviewsPages, p+1))} disabled={interviewsPage === interviewsPages}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;