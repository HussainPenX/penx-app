import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import Footer from './Footer';
import CommentSection from './components/CommentSection';
import './App.css';
import config from './config';

function BookDescriptionPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(localStorage.getItem('loggedInUserEmail'));

  useEffect(() => {
    let isMounted = true;

    const fetchBookData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First, get the list of books to find the correct folder name
        const response = await fetch(`${config.API_URL}/Books`);
        if (!response.ok) {
          throw new Error('Failed to fetch books list');
        }
        
        const folders = await response.json();
        const folderName = folders.find(folder => folder === bookId);
        
        if (!folderName) {
          throw new Error('Book not found');
        }

        // Now fetch the specific book data
        const bookResponse = await fetch(`${config.API_URL}/Books/${folderName}/book.json`);
        if (!bookResponse.ok) {
          throw new Error('Failed to fetch book data');
        }
        
        const bookData = await bookResponse.json();
        if (isMounted) {
          setBook({ ...bookData, FolderName: folderName });
        }
      } catch (error) {
        console.error('Error fetching book data:', error);
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchFavoriteStatus = async () => {
      if (!loggedInUserEmail) return;

      try {
        const response = await fetch(`${config.API_URL}/api/book-stats?email=${encodeURIComponent(loggedInUserEmail)}&bookId=${bookId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch favorite status');
        }
        
        const data = await response.json();
        if (isMounted) {
          setIsFavorite(data.isFavorited);
        }
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      }
    };

    fetchBookData();
    fetchFavoriteStatus();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [bookId, loggedInUserEmail]);

  const toggleFavorite = async () => {
    if (!loggedInUserEmail) {
      alert('Please log in to add favorites');
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/toggle-favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loggedInUserEmail,
          bookId: book.FolderName,
          isFavorited: !isFavorite
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorite status:', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  const handleReadClick = async () => {
    if (!loggedInUserEmail) {
      alert('Please log in to read books');
      return;
    }

    try {
      // Track the read
      await fetch(`${config.API_URL}/api/track-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loggedInUserEmail,
          bookId: book.FolderName
        })
      });

      // Navigate to reading page
      navigate(`/reading/${book.FolderName}`);
    } catch (error) {
      console.error('Error tracking read:', error);
      // Still navigate even if tracking fails
      navigate(`/reading/${book.FolderName}`);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="error-container">
        <h2>Book Not Found</h2>
        <p>The requested book could not be found.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="book-description-page">
      <div className="book-description-content">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="book-description-header">
          <div className="book-cover">
            <img 
              src={book.Cover || `/Books/${book.FolderName}/1BookCover.png`} 
              alt={book.Title} 
              onError={(e) => {
                e.target.src = '/images/PenX logo 0002.png';
              }}
            />
          </div>
          <div className="book-info">
            <h1>{book.Title}</h1>
            <h2>by {book.Author}</h2>
            <div className="book-meta">
              <span className="book-language">{book.Language}</span>
              <div className="book-genres">
                {book.Genres && book.Genres.map((genre, idx) => (
                  <span key={idx} className="genre-tag">{genre}</span>
                ))}
              </div>
            </div>
            <div className="book-actions">
              <button 
                onClick={toggleFavorite}
                className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
              >
                <FaHeart /> {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
              <button 
                onClick={handleReadClick}
                className="read-button"
              >
                Read Book
              </button>
            </div>
          </div>
        </div>

        <div className="book-description-body">
          <h3>Description</h3>
          <p>{book.Description || 'No description available.'}</p>
        </div>
        
        <div className="book-comments-section">
          <CommentSection bookId={book.FolderName} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BookDescriptionPage; 