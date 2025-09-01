import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import './App.css';

function Header({ welcomeMessage }) {
  const navigate = useNavigate();
  const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');

  const handleHomeClick = () => {
    if (loggedInUserEmail) {
      const authorToken = localStorage.getItem('authorToken');
      if (authorToken) {
        navigate('/author-home');
      } else {
        navigate('/reader-home');
      }
    } else {
      navigate('/welcome');
    }
  };

  const handleAccountClick = () => {
    if (!loggedInUserEmail) {
      navigate('/welcome');
      return;
    }
    const authorToken = localStorage.getItem('authorToken');
    if (authorToken) {
      navigate('/author-account');
    } else {
      navigate('/reader-account');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src="/images/PenX%20logo%200002.png"
            alt="PenX Logo"
            className="header-logo"
            onClick={handleHomeClick}
            style={{ cursor: 'pointer' }}
          />
          {welcomeMessage && (
            <span className="header-welcome-message">{welcomeMessage}</span>
          )}
        </div>
        <div className="header-buttons">
          <button
            className="header-button account-button"
            onClick={handleAccountClick}
            title="Account"
          >
            <FaUser />
            <span>Account</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;