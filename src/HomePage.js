import React from 'react';
import './App.css';
import Footer from './Footer';

function HomePage() {
  return (
    <div className="home-page">
      <header className="home-header">
        <img src="/images/PenX%20logo%200002.png" alt="PenX Logo" className="signup-logo" />
        <p>Your gateway to amazing books and stories.</p>
      </header>
      <main className="home-content">
        <section className="featured-books">
          <h2>Featured Books</h2>
          <div className="book-list">
            {[1, 2, 3, 4].map((book) => (
              <div key={book} className="book-card">
                <img src="https://via.placeholder.com/150" alt="Book Cover" />
                <h3>Book Title {book}</h3>
                <p>Author Name</p>
              </div>
            ))}
          </div>
        </section>
        <section className="cta-section">
          <h2>Join Our Community</h2>
          <p>Sign up to publish your stories or explore as a reader.</p>
          <button onClick={() => (window.location.href = '/reader-signup')}>
            Sign Up as Reader
          </button>
          <button onClick={() => (window.location.href = '/author-signup')}>
            Sign Up as Author
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;