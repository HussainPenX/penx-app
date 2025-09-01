import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from './config';
import './App.css';
import Footer from './Footer';

function AuthorLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/author/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token, author ID, and email in localStorage
        localStorage.setItem('authorToken', data.token);
        localStorage.setItem('authorId', data.authorId);
        localStorage.setItem('loggedInUserEmail', email);
        // Navigate to author home page
        navigate('/author-home');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-page">
      {!animationComplete ? (
        <div className="logo-animation">
          <span className="pen">Pen</span>
          <span className="x">X</span>
        </div>
      ) : (
        <>
          <img src="/images/PenX%20logo%200002.png" alt="PenX Logo" className="login-logo" />
          <h1>Author Login</h1>
          <div className="login-form">
            {error && <p className="error-message" style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Log In</button>
            <button onClick={() => navigate('/author-signup')}>
              Sign Up
            </button>
            <button onClick={() => navigate('/welcome')}>
              Back to Home
            </button>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}

export default AuthorLoginPage;