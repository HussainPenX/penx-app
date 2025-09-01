import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import getResponsiveStyles from './utils/responsiveStyles';
import './AdminLoginPage.css';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [styles, setStyles] = useState(getResponsiveStyles());

  // Update styles when window is resized
  useEffect(() => {
    const handleResize = () => {
      setStyles(getResponsiveStyles());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple admin authentication (in production, this should be more secure)
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true');
      navigate('/admin');
    } else {
      setError('Invalid username or password');
    }
    
    setLoading(false);
  };

  return (
    <div className="admin-login-page" style={{
      padding: styles.spacing.lg,
    }}>
      <div className="admin-login-container" style={{
        padding: styles.spacing.xl,
        maxWidth: styles.width < styles.breakpoints.medium ? '350px' : '400px',
      }}>
        <div className="admin-login-header">
          <h1 style={{
            fontSize: styles.fontSize['2xl'],
          }}>PenX Admin</h1>
          <p style={{
            fontSize: styles.fontSize.base,
          }}>Administrator Access</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form" style={{
          gap: styles.spacing.lg,
        }}>
          <div className="form-group">
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="admin-input"
                style={{
                  padding: styles.spacing.base,
                  fontSize: styles.fontSize.base,
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-input"
                style={{
                  padding: styles.spacing.base,
                  fontSize: styles.fontSize.base,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && <div className="error-message" style={{
            fontSize: styles.fontSize.sm,
          }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="admin-login-btn"
            style={{
              padding: styles.spacing.base,
              fontSize: styles.fontSize.base,
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="admin-login-footer" style={{
          marginTop: styles.spacing.lg,
        }}>
          <button
            onClick={() => navigate('/welcome')}
            className="back-btn"
            style={{
              padding: styles.spacing.base,
              fontSize: styles.fontSize.sm,
            }}
          >
            Back to Welcome
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage; 