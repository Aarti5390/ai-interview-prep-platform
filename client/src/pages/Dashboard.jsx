import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import ProfileModal from "../components/ProfileModal";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    overallScore: 0,
    completed: 0,
    practiceTime: 0
  });
  const [profileCompleted, setProfileCompleted] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    fetchUser();
    fetchInterviews();
    fetchProfileStatus();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUserName(res.data.name);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProfileStatus = async () => {
    try {
      const res = await API.get("/profile/me");
      setProfileCompleted(res.data.profileCompleted);
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await API.get("/interview/history");
      const interviewsData = Array.isArray(res.data) ? res.data : (res.data.interviews || []);
      setInterviews(interviewsData);

      const completed = interviewsData.filter(i => i.status === "completed");
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

      let totalMinutes = 0;
      completed.forEach(interview => {
        if (interview.startedAt && interview.endedAt) {
          const diff = new Date(interview.endedAt) - new Date(interview.startedAt);
          totalMinutes += Math.floor(diff / 60000);
        } else {
          const answeredCount = interview.questions.filter(q => q.userAnswer).length;
          totalMinutes += answeredCount * 2;
        }
      });

      setStats({
        overallScore: avgScore,
        completed: completed.length,
        practiceTime: totalMinutes
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartInterview = () => {
    navigate("/interview/setup");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleProfileUpdate = (updatedUser) => {
    setUserName(updatedUser.name);
    setProfileCompleted(updatedUser.profileCompleted);
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
            <li><Link to="/dashboard"><i className="fas fa-tachometer-alt"></i><span>Dashboard</span></Link></li>
            <li><Link to="/history"><i className="fas fa-list"></i><span>My Interviews</span></Link></li>
            <li><Link to="/statistics"><i className="fas fa-brain"></i><span>Statistics</span></Link></li>
            <li><Link to="/settings"><i className="fas fa-cog"></i><span>Settings</span></Link></li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="header-left"></div>
          <div className="header-actions">
            <button onClick={handleLogout} className="icon-btn logout-btn" title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
            <button onClick={() => setShowProfileModal(true)} className="icon-btn profile-btn" title="Profile">
              <i className="fas fa-user-circle"></i>
            </button>
          </div>
        </header>

        {!profileCompleted && (
          <div className="profile-warning">
            <span>⚠️ Your profile is incomplete. Please complete it to get better recommendations.</span>
            <button onClick={() => setShowProfileModal(true)} className="complete-profile-btn">
              Complete Profile
            </button>
          </div>
        )}

        <section className="welcome-section">
          <h2>Welcome Back, {userName || "User"}!</h2>
          <p>Let’s ace your next interview.</p>
        </section>

        <div className="start-interview-container">
          <button className="start-interview-btn" onClick={handleStartInterview}>
            <i className="fas fa-play-circle"></i> Start AI Interview
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
            <div className="stat-content"><h3>Overall Prep Score</h3><p className="stat-value">{stats.overallScore}%</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
            <div className="stat-content"><h3>Interviews Completed</h3><p className="stat-value">{stats.completed}</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-clock"></i></div>
            <div className="stat-content"><h3>Practice Time</h3><p className="stat-value">{stats.practiceTime} min</p></div>
          </div>
        </div>

        <section className="recent-activity">
          <h3>Recent Interviews</h3>
          <div className="activity-list">
            {interviews.slice(0, 3).map((item) => (
              <div className="activity-item" key={item._id}>
                <div className="activity-icon"><i className="fas fa-briefcase"></i></div>
                <div className="activity-details">
                  <h4>Mock Interview</h4>
                  <p>Status: {item.status} <span className="activity-time">{new Date(item.createdAt).toLocaleDateString()}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} onProfileUpdate={handleProfileUpdate} />
    </div>
  );
};

export default Dashboard;