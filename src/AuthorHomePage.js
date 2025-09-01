import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from './config';
import './App.css';
import Footer from './Footer';

function AuthorHomePage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const authorId = localStorage.getItem('authorId');
    const token = localStorage.getItem('authorToken');

    if (!authorId || !token) {
      navigate('/author-login', { replace: true });
      return;
    }

    const fetchAuthorData = async () => {
      try {
        // Fetch author details
        const authorResponse = await fetch(`${config.API_URL}/api/author/${authorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!authorResponse.ok) {
          if (authorResponse.status === 401) {
            localStorage.removeItem('authorId');
            localStorage.removeItem('authorToken');
            navigate('/author-login', { replace: true });
            return;
          }
          throw new Error('Failed to fetch author details');
        }

        const authorData = await authorResponse.json();
        setAuthor(authorData);

        // Fetch author's books
        const booksResponse = await fetch(`${config.API_URL}/api/author/${authorId}/books`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!booksResponse.ok) {
          if (booksResponse.status === 401) {
            localStorage.removeItem('authorId');
            localStorage.removeItem('authorToken');
            navigate('/author-login', { replace: true });
            return;
          }
          throw new Error('Failed to fetch books');
        }

        const booksData = await booksResponse.json();
        setBooks(booksData.books);
      } catch (error) {
        console.error('Error fetching author data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authorId');
    localStorage.removeItem('authorToken');
    navigate('/welcome', { replace: true });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!author) {
    return null;
  }

  return (
    <div className="home-page">
      <header className="home-header" style={{
        width: '100%',
        padding: '10px',
        backgroundColor: '#4169E1',
        color: 'white',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxSizing: 'border-box'
      }}>
        <img 
          src="/images/PenX%20logo%200002.png" 
          alt="PenX Logo" 
          style={{
            maxWidth: 'min(100px, 20vw)',
            height: 'auto'
          }}
        />
        <h1 style={{ 
          margin: 0,
          fontSize: 'clamp(1rem, 3vw, 1.5rem)',
          textAlign: 'center',
          padding: '0 5px',
          wordBreak: 'break-word'
        }}>Welcome, {author.name}</h1>
      </header>
      <main className="home-content">
        <section className="featured-books">
          <h2>Your Books</h2>
          <div className="book-list">
            {books.length > 0 ? (
              books.map((book, index) => (
                <div 
                  key={index} 
                  className="book-card"
                  onClick={() => navigate(`/book-stats/${book.folder_name}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={book.cover || `/Books/${book.folder_name}/1BookCover.png`}
                    alt="Book Cover"
                  />
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <span className="book-language">{book.language}</span>
                  <div className="book-genres">
                    {book.genres && book.genres.map((genre, idx) => (
                      <span key={idx} className="genre-tag">{genre}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-books-message">You haven't added any books yet</p>
            )}
          </div>
        </section>
        <section className="cta-section">
          <h2>Add a New Book</h2>
          <p>Start adding your next masterpiece to the library.</p>
          <button onClick={() => navigate('/add-book')}>Add Book</button>
        </section>
        <button
          onClick={() => navigate('/author-account')}
          style={{ margin: '10px', padding: '10px', backgroundColor: '#2C2C2C', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Account
        </button>
        <button
          onClick={handleLogout}
          style={{ margin: '10px', padding: '10px', backgroundColor: '#4169E1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Log out
        </button>
      </main>
      <Footer />
    </div>
  );
}

export default AuthorHomePage;