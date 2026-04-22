import React, { useState, useEffect } from 'react';
import API from '../api/api';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    resumeUrl: '',
    phone: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    if (isOpen) fetchProfile();
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/profile/me');
      setFormData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleUploadResume = async () => {
    if (!resumeFile) return;
    const data = new FormData();
    data.append('resume', resumeFile);
    setUploading(true);
    setError('');
    try {
      const res = await API.post('/profile/upload-resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, resumeUrl: res.data.resumeUrl }));
      alert('Resume uploaded successfully');
      setResumeFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.put('/profile/me', formData);
      if (onProfileUpdate) onProfileUpdate(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Complete Your Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Qualification (e.g., B.Tech, MCA)</label>
            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Resume (PDF/DOC)</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            {formData.resumeUrl && (
              <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer">View uploaded resume</a>
            )}
            <button type="button" onClick={handleUploadResume} disabled={uploading || !resumeFile} style={{ marginTop: '0.5rem' }}>
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;