import './App.css';
import Footer from './Footer';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from './config';

function ReaderLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Email entered:', email); // Debugging log
      console.log('Password entered:', password); // Debugging log

      const response = await fetch(`${config.API_URL}/reader-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      

      console.log('Login response status:', response.status); // Debugging log

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        localStorage.setItem('loggedInUserEmail', email); // Save the logged-in user's email
        console.log('Email saved to localStorage:', email); // Debugging log
        navigate('/reader-home');
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData); // Debugging log
        setError(errorData.error || 'Login failed.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An error occurred. Please try again later.');
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
          <h1>Reader Login</h1>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit">Login</button>
            <button onClick={() => (window.location.href = '/reader-signup')}>
            Sign Up 
          </button>
          <button onClick={() => (window.location.href = '/welcome')}>
            Back to Home
          </button>
          </form>
          
        </>
      )}
      <Footer />
    </div>
  );
}

export default ReaderLoginPage;