import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [userName, setUserName] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    overallScore: 0,
    completed: 0,
    practiceTime: 0
  });

  const menuItems = ["Dashboard", "My Interviews", "Statistics", "Settings"];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    fetchUser();
    fetchInterviews();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUserName(res.data.name);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await API.get("/interview/history");
      setInterviews(res.data);

      const completed = res.data.filter(i => i.status === "completed");

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

    } catch (error) {
      console.error(error);
    }
  };

  const handleStartInterview = async () => {
    try {
      const res = await API.post("/interview/start");

      const interviewId = res.data.interviewId;

      navigate(`/interview/${interviewId}`);

    } catch (error) {
      console.error("Failed to start interview");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const renderDashboard = () => (
    <>
      <section className="welcome-section">
        <h2>Welcome Back, {userName || "User"}!</h2>
        <p>Let’s ace your next interview.</p>
      </section>

      <div className="start-interview-container">
        <button className="start-interview-btn" onClick={handleStartInterview}>
          <i className="fas fa-play-circle"></i>
          Start AI Interview
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <h3>Overall Prep Score</h3>
            <p className="stat-value">{stats.overallScore}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h3>Interviews Completed</h3>
            <p className="stat-value">{stats.completed}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>Practice Time</h3>
            <p className="stat-value">{stats.practiceTime} hrs</p>
          </div>
        </div>
      </div>

      <section className="recent-activity">
        <h3>Recent Interviews</h3>

        <div className="activity-list">
          {interviews.slice(0, 3).map((item) => (
            <div className="activity-item" key={item._id}>
              <div className="activity-icon">
                <i className="fas fa-briefcase"></i>
              </div>

              <div className="activity-details">
                <h4>Mock Interview</h4>
                <p>
                  Status: {item.status}{" "}
                  <span className="activity-time">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderMyInterviews = () => (
    <div className="interview-history">
      <h2>My Interviews</h2>

      {interviews.map((interview) => (
        <div className="history-card" key={interview._id}>
          <p>ID: {interview._id}</p>
          <p>Status: {interview.status}</p>

          <button
            onClick={() => navigate(`/result/${interview._id}`)}
            className="view-result-btn"
          >
            View Result
          </button>
        </div>
      ))}
    </div>
  );

  const renderStatistics = () => (
    <div className="statistics-page">
      <h2>Performance Statistics</h2>
      <p>Total Interviews: {interviews.length}</p>
      <p>Completed Interviews: {stats.completed}</p>
      <p>Average Score: {stats.overallScore}%</p>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-page">
      <h2>Settings</h2>

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeMenuItem) {
      case "Dashboard":
        return renderDashboard();
      case "My Interviews":
        return renderMyInterviews();
      case "Statistics":
        return renderStatistics();
      case "Settings":
        return renderSettings();
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">

      <aside className="sidebar">
        <div className="sidebar-header">
          <i className="fas fa-robot logo-icon"></i>
          <span className="logo-text">AI Interview Ace</span>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item}
                className={activeMenuItem === item ? "active" : ""}
                onClick={() => setActiveMenuItem(item)}
              >
                <i className={`fas fa-${getIconForMenuItem(item)}`}></i>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <span>{userName || "User"}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>{activeMenuItem}</h1>

          <div className="header-actions">
            <i className="fas fa-bell"></i>
            <i className="fas fa-envelope"></i>
          </div>
        </header>

        {renderContent()}
      </main>

    </div>
  );
};

const getIconForMenuItem = (item) => {
  switch (item) {
    case "Dashboard":
      return "tachometer-alt";
    case "My Interviews":
      return "list";
    case "Statistics":
      return "brain";
    case "Settings":
      return "cog";
    default:
      return "circle";
  }
};

export default Dashboard;

