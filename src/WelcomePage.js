import React, { useEffect, useState } from 'react';
import './App.css';
import Footer from './Footer';
import getResponsiveStyles from './utils/responsiveStyles';

function WelcomePage() {
  const [styles, setStyles] = useState(getResponsiveStyles());

  // Update styles when window is resized
  useEffect(() => {
    const handleResize = () => {
      setStyles(getResponsiveStyles());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="welcome-page" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: styles.spacing.base,
      gap: styles.spacing.lg,
    }}>
      <img 
        src="/images/PenX%20logo%200002.png" 
        alt="PenX Logo" 
        className="welcome-logo" 
        style={{
          width: 'min(300px, 80vw)',
          height: 'auto',
          marginBottom: styles.spacing.lg,
        }}
      />
      <h1 style={{
        fontSize: styles.fontSize['2xl'],
        color: '#F2F1F1',
        marginBottom: styles.spacing.base,
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
      }}>Welcome</h1>
      <p style={{
        fontSize: styles.fontSize.lg,
        color: '#F2F1F1',
        marginBottom: styles.spacing.xl,
        textAlign: 'center',
        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)',
      }}>Discover books. Publish your stories.</p>
      <div style={{
        display: 'flex',
        flexDirection: styles.width < styles.breakpoints.medium ? 'column' : 'row',
        gap: styles.spacing.base,
        width: '100%',
        maxWidth: styles.containerWidth.md,
        justifyContent: 'center',
        marginBottom: styles.width < styles.breakpoints.medium ? '120px' : styles.spacing['2xl'],
      }}>
        <button 
          onClick={() => (window.location.href = '/reader-login')}
          style={{
            padding: styles.buttonSize.lg.padding,
            fontSize: styles.buttonSize.lg.fontSize,
            color: '#4169E1',
            backgroundColor: '#F2F1F1',
            border: '2px solid #4169E1',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: styles.width < styles.breakpoints.medium ? '100%' : 'auto',
            minWidth: '200px',
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#4169E1';
            e.target.style.color = '#F2F1F1';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#F2F1F1';
            e.target.style.color = '#4169E1';
          }}
        >
          Continue as Reader
        </button>
        <button 
          onClick={() => (window.location.href = '/author-login')}
          style={{
            padding: styles.buttonSize.lg.padding,
            fontSize: styles.buttonSize.lg.fontSize,
            color: '#4169E1',
            backgroundColor: '#F2F1F1',
            border: '2px solid #4169E1',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: styles.width < styles.breakpoints.medium ? '100%' : 'auto',
            minWidth: '200px',
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#4169E1';
            e.target.style.color = '#F2F1F1';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#F2F1F1';
            e.target.style.color = '#4169E1';
          }}
        >
          Continue as Author
        </button>
      </div>
      <div style={{
        marginTop: styles.spacing.base,
        textAlign: 'center',
      }}>
        <button 
          onClick={() => (window.location.href = '/admin-login')}
          style={{
            padding: styles.buttonSize.sm.padding,
            fontSize: styles.buttonSize.sm.fontSize,
            color: '#F2F1F1',
            backgroundColor: 'transparent',
            border: '1px solid #F2F1F1',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: 0.8,
          }}
          onMouseOver={(e) => {
            e.target.style.opacity = '1';
            e.target.style.backgroundColor = 'rgba(242, 241, 241, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.opacity = '0.8';
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          Admin Access
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default WelcomePage;