import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';
  const isAdmin = location.pathname === '/admin';
  const isHistory = location.pathname === '/history';
  const isStatistics = location.pathname === '/statistics';
  const isSettings = location.pathname === '/settings';
  const isInterviewPage = location.pathname.includes('/interview/') || location.pathname === '/interview/setup';

  // Debug log – check console
  console.log('Layout path:', location.pathname, 'isInterviewPage:', isInterviewPage);

  const showBackButton = !isDashboard && !isAdmin;

  const handleBack = () => {
    navigate(-1);
  };

  let contentClass = 'layout-content';
  if (isDashboard) contentClass += ' dashboard-content';
  if (isAdmin) contentClass += ' admin-content';
  if (isHistory || isStatistics || isSettings) contentClass += ' reduced-padding';
  if (isInterviewPage) contentClass += ' interview-page-content';

  return (
    <div className="layout-wrapper">
      {showBackButton && (
        <button onClick={handleBack} className="global-back-btn">
          <i className="fas fa-arrow-left"></i> Back
        </button>
      )}
      <div className={contentClass}>
        {children}
      </div>
    </div>
  );
};

export default Layout;