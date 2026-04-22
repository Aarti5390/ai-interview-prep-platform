import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/me');
      setProfile({ name: res.data.name, email: res.data.email });
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await API.put('/auth/update-profile', { name: profile.name, email: profile.email });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await API.put('/auth/change-password', passwordData);
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Password change failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await API.delete('/auth/delete-account');
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Account deletion failed' });
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      {message.text && (
        <div className={`settings-message ${message.type}`}>{message.text}</div>
      )}

      {/* Profile Information */}
      <div className="settings-card">
        <h3>Profile Information</h3>
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
          </div>
          <button type="submit" disabled={loading}>Update Profile</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="settings-card">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
          </div>
          <button type="submit" disabled={loading}>Change Password</button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="settings-card danger-zone">
        <h3>Danger Zone</h3>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="delete-btn">Delete Account</button>
        ) : (
          <div className="confirm-delete">
            <p>Are you sure? This action cannot be undone.</p>
            <button onClick={handleDeleteAccount} className="confirm-btn">Yes, delete my account</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="cancel-btn">Cancel</button>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="settings-card">
        <h3>Session</h3>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default SettingsPage;