import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./LandingPage.css";

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const res = await API.post("/auth/login", loginData);
      console.log("Login response:", res.data);

      // 🔑 Handle different token locations
      const token = res.data.token || res.data.data?.token || res.data.accessToken;
      if (!token) throw new Error("No token in response");

      localStorage.setItem("token", token);
      console.log("Token stored:", localStorage.getItem("token"));

      // 🔄 Set the token in axios default headers for subsequent requests
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 👤 Fetch the logged-in user's data to get the role
      const userRes = await API.get("/auth/me");
      const userRole = userRes.data.role;

      // 🚀 Redirect based on role
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Login failed"
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      await API.post("/auth/register", registerData);
      setMessage({ type: "success", text: "Registration successful! You can now log in." });
      setIsLogin(true);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Registration failed"
      });
    }
  };

  // OAuth handlers
  const handleGoogleLogin = () => {
    window.location.href = `${API.defaults.baseURL}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API.defaults.baseURL}/auth/github`;
  };

  return (
    <div className="landing-container">
      <div className="overlay">
        <div className="card">
          <div className="left-panel">
            <h1>AI Interview Preparation Platform</h1>
            <p className="description">
              Unlock Your Career Potential with AI Interview Prep.
              Practice with real-time AI feedback and ace your next interview.
            </p>
            <p className="sub-text">
              Join thousands of successful candidates who landed their dream jobs.
            </p>
          </div>

          <div className="right-panel">
            <div className="form-wrapper">
              {message.text && (
                <div className={`message-banner ${message.type}`}>
                  {message.text}
                </div>
              )}

              {/* Login Form */}
              <div className={`form-container ${isLogin ? "form-visible" : "form-hidden"}`}>
                <h2 className="form-title">Log In</h2>
                <form onSubmit={handleLogin}>
                  <div className="input-group">
                    <i className="fas fa-envelope input-icon"></i>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="form-input"
                      onChange={handleLoginChange}
                    />
                  </div>
                  <div className="input-group">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="form-input"
                      onChange={handleLoginChange}
                    />
                  </div>
                  <div className="forgot-link">
                    <a href="#">Forgot Password?</a>
                  </div>
                  <button type="submit" className="btn-primary">Log In</button>
                </form>

                <div className="social-login">
                  <p className="text-muted">or continue with</p>
                  <div className="social-buttons">
                    <button className="social-btn google" onClick={handleGoogleLogin}>
                      <i className="fab fa-google"></i> Google
                    </button>
                    <button className="social-btn github" onClick={handleGithubLogin}>
                      <i className="fab fa-github"></i> GitHub
                    </button>
                  </div>
                </div>

                <p className="toggle-text">
                  Don't have an account?{" "}
                  <button onClick={() => setIsLogin(false)} className="toggle-link">
                    Register
                  </button>
                </p>
              </div>

              {/* Register Form */}
              <div className={`form-container ${!isLogin ? "form-visible" : "form-hidden"}`}>
                <h2 className="form-title">Create Account</h2>
                <form onSubmit={handleRegister}>
                  <div className="input-group">
                    <i className="fas fa-user input-icon"></i>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      className="form-input"
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="input-group">
                    <i className="fas fa-envelope input-icon"></i>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="form-input"
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="input-group">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="form-input"
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <button type="submit" className="btn-success">Get Started for Free</button>
                </form>

                <div className="social-login">
                  <p className="text-muted">or sign up with</p>
                  <div className="social-buttons">
                    <button className="social-btn google" onClick={handleGoogleLogin}>
                      <i className="fab fa-google"></i> Google
                    </button>
                    <button className="social-btn github" onClick={handleGithubLogin}>
                      <i className="fab fa-github"></i> GitHub
                    </button>
                  </div>
                </div>

                <p className="toggle-text">
                  Already have an account?{" "}
                  <button onClick={() => setIsLogin(true)} className="toggle-link">
                    Log In
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;