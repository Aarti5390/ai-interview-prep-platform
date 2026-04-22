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

  const showBackButton = !isDashboard && !isAdmin;

  const handleBack = () => {
    navigate(-1);
  };

  let contentClass = 'layout-content';
  if (isDashboard) contentClass += ' dashboard-content';
  if (isAdmin) contentClass += ' admin-content';
  if (isHistory || isStatistics || isSettings) contentClass += ' reduced-padding';

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