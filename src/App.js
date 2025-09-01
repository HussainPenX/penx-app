import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ReaderAccountPage from './ReaderAccountPage';
import ReaderHomePage from './ReaderHomePage';
import AuthorAccountPage from './AuthorAccountPage';
import AuthorHomePage from './AuthorHomePage';
import WelcomePage from './WelcomePage';
import ReaderLoginPage from './ReaderLoginPage';
import ReaderSignupPage from './ReaderSignupPage';
import AuthorLoginPage from './AuthorLoginPage';
import AuthorSignupPage from './AuthorSignupPage';
import InstitutionPage from './InstitutionPage';
import HomePage from './HomePage';
import AuthorReadingPage from './AuthorReadingPage';
import BookStatsPage from './BookStatsPage';
import AddBookPage from './AddBookPage';
import SplashScreen from './SplashScreen';
import BookDescriptionPage from './BookDescriptionPage';
import AdminDashboard from './AdminDashboard';
import AdminLoginPage from './AdminLoginPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/reader-home" element={<ReaderHomePage />} />
      <Route path="/reader-account" element={<ReaderAccountPage />} />
      <Route path="/reader-login" element={<ReaderLoginPage />} />
      <Route path="/reader-signup" element={<ReaderSignupPage />} />
      <Route path="/author-home" element={<AuthorHomePage />} />
      <Route path="/author-account" element={<AuthorAccountPage />} />
      <Route path="/author-login" element={<AuthorLoginPage />} />
      <Route path="/author-signup" element={<AuthorSignupPage />} />
      <Route path="/institution" element={<InstitutionPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/author-reading/:bookId" element={<AuthorReadingPage />} />
      <Route path="/book-stats/:bookId" element={<BookStatsPage />} />
      <Route path="/add-book" element={<AddBookPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/" element={<SplashScreen />} />
      <Route path="/book/:bookId" element={<BookDescriptionPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default App;
