import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SplashScreen from './SplashScreen';
import WelcomePage from './WelcomePage';
import ErrorBoundary from './ErrorBoundary';
import ReaderLoginPage from './ReaderLoginPage';
import ReaderSignupPage from './ReaderSignupPage';
import AuthorLoginPage from './AuthorLoginPage';
import AuthorSignupPage from './AuthorSignupPage';
import HomePage from './HomePage';
import AuthorHomePage from './AuthorHomePage';
import AddBookPage from './AddBookPage';
import ReaderHomePage from './ReaderHomePage';
import ReadingPage from './ReadingPage';
import AuthorAccountPage from './AuthorAccountPage';
import InstitutionPage from './InstitutionPage';
import ReaderAccountPage from './ReaderAccountPage';  
import AuthorReadingPage from './AuthorReadingPage';
import BookStatsPage from './BookStatsPage';
import BookDescriptionPage from './BookDescriptionPage';
import AdminDashboard from './AdminDashboard';
import AdminLoginPage from './AdminLoginPage';

document.addEventListener('copy', (event) => {
  event.preventDefault();
  alert('Copying is disabled on this page.');
});

document.addEventListener('cut', (event) => {
  event.preventDefault();
  console.log('Cut action prevented.');
});

document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  alert('Right-click is disabled on this page.');
});

document.oncontextmenu = function() {
  return false;
};

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 'c') {
    event.preventDefault();
    alert('Copying is disabled on this page.');
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

console.log('React version:', React.version); // Debugging log

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/reader-login" element={<ReaderLoginPage />} />
          <Route path="/reader-signup" element={<ReaderSignupPage />} />
          <Route path="/author-login" element={<AuthorLoginPage />} />
          <Route path="/author-signup" element={<AuthorSignupPage />} />
          <Route path="/author-home" element={<AuthorHomePage />} />
          <Route path="/author-account" element={<AuthorAccountPage />} />  
          <Route path="/reader-account" element={<ReaderAccountPage/>} />
          <Route path="/reader-home" element={<ReaderHomePage />} />
          <Route path="/reading/:bookId" element={<ReadingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/add-book" element={<AddBookPage />} />
          <Route path="/institution" element={<InstitutionPage />} />
          <Route path="/author-reading/:bookId" element={<AuthorReadingPage />} />
          <Route path="/book-stats/:bookId" element={<BookStatsPage />} />
          <Route path="/book/:bookId" element={<BookDescriptionPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);
