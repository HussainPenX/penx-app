import React, { useState, useEffect } from 'react';
import './App.css';

function SplashScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    console.log('SplashScreen mounted'); // Debugging log
    const timer = setTimeout(() => {
      console.log('Navigating to WelcomePage'); // Debugging log
      window.location.href = '/welcome';
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="splash-screen">
      <img src="/images/PenX%20logo%200002.png" alt="PenX Logo" className="splash-logo" />
      <p className="splash-tagline">
        Empowering <span>Authors</span>. Enriching <span>Readers</span>.
      </p>
      <div className="loading">Loading{dots}</div>
    </div>
  );
}

export default SplashScreen;