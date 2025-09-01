import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from './config';
import Footer from './Footer';
import Header from './Header';
import CommentSection from './components/CommentSection';
import './BookStatsPage.css';

function BookStatsPage() {
  const { bookId } = useParams();
  const [bookStats, setBookStats] = useState({
    reads: 0,
    favorites: 0,
    hasRead: false,
    title: '',
    author: '',
    language: '',
    genres: [],
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedGenres, setEditedGenres] = useState([]);
  const [editedDescription, setEditedDescription] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(null);

  // Override global paste restrictions for this component
  useEffect(() => {
    const allowPaste = (e) => {
      if (isEditing) {
        e.stopPropagation();
        return true;
      }
    };

    document.addEventListener('paste', allowPaste, true);

    return () => {
      document.removeEventListener('paste', allowPaste, true);
    };
  }, [isEditing]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
        console.log('Logged in user email:', loggedInUserEmail);
        
        // Fetch book data and stats in parallel
        const [bookResponse, statsResponse] = await Promise.all([
          fetch(`/Books/${bookId}/book.json`),
          loggedInUserEmail ? fetch(`${config.API_URL}/api/book-stats?email=${encodeURIComponent(loggedInUserEmail)}&bookId=${bookId}`) : null
        ]);

        if (bookResponse.ok) {
          const bookData = await bookResponse.json();
          console.log('Book data:', bookData);
          setBookStats(prevStats => ({
            ...prevStats,
            title: bookData.Title,
            author: bookData.Author,
            language: bookData.Language,
            genres: bookData.Genres,
            description: bookData.Description
          }));
          setEditedGenres(bookData.Genres || []);
          setEditedDescription(bookData.Description || '');
          
          // Check if logged in user is the author by comparing emails
          if (loggedInUserEmail && loggedInUserEmail.toLowerCase() === bookData.AuthorEmail?.toLowerCase()) {
            console.log('User is author');
            setIsAuthor(true);
          } else {
            console.log('User is not author');
            console.log('Logged in email:', loggedInUserEmail);
            console.log('Book author email:', bookData.AuthorEmail);
          }
        }

        if (statsResponse && statsResponse.ok) {
          const statsData = await statsResponse.json();
          setBookStats(prevStats => ({
            ...prevStats,
            reads: statsData.reads || 0,
            favorites: statsData.favorites || 0,
            hasRead: statsData.hasRead || false
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookId]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem('authorToken');
      if (!token) {
        console.error('No authorization token found');
        return;
      }

      const response = await fetch(`${config.API_URL}/api/update-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId,
          genres: editedGenres,
          description: editedDescription
        })
      });

      if (response.ok) {
        setBookStats(prev => ({
          ...prev,
          genres: editedGenres,
          description: editedDescription
        }));
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to update book:', errorData);
      }
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const handleCancelClick = () => {
    setEditedGenres(bookStats.genres || []);
    setEditedDescription(bookStats.description || '');
    setIsEditing(false);
  };

  const handleAddGenre = () => {
    if (newGenre && !editedGenres.includes(newGenre)) {
      setEditedGenres([...editedGenres, newGenre]);
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (genreToRemove) => {
    setEditedGenres(editedGenres.filter(genre => genre !== genreToRemove));
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  return (
    <div className="book-stats-page">
      <Header />
      <div className="book-stats-content">
        <div className="book-header">
          <img
            src={`/Books/${bookId}/1BookCover.png`}
            alt="Book Cover"
            className="book-header-cover"
            onError={(e) => {
              console.error('Error loading book cover:', e);
              e.target.src = '/images/PenX logo 0002.png';
            }}
          />
          <div className="book-header-info">
            <h1>{bookStats.title || 'Unknown Title'}</h1>
            <p>{`${bookStats.author || 'Unknown Author'}`}</p>
            <span className="book-language">{bookStats.language || 'Unknown Language'}</span>
            <div className="book-genres">
              {isEditing ? (
                <div className="genre-editor">
                  <div className="genre-list">
                    {editedGenres.map((genre, idx) => (
                      <span key={idx} className="genre-tag">
                        {genre}
                        <button
                          className="remove-genre"
                          onClick={() => handleRemoveGenre(genre)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="add-genre">
                    <input
                      type="text"
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      placeholder="Add new genre"
                      onPaste={(e) => e.stopPropagation()}
                    />
                    <button onClick={handleAddGenre}>Add</button>
                  </div>
                </div>
              ) : (
                <>
                  {bookStats.genres && bookStats.genres.map((genre, idx) => (
                    <span key={idx} className="genre-tag">{genre}</span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="book-description">
          <div className="description-header">
            <h2>Description</h2>
            {isAuthor && !isEditing && (
              <button 
                className="edit-button" 
                onClick={handleEditClick}
              >
                Edit Description & Tags
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="description-editor">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter book description..."
                rows="6"
                onPaste={(e) => e.stopPropagation()}
              />
              <div className="edit-actions">
                <button className="save-button" onClick={handleSaveClick}>Save Changes</button>
                <button className="cancel-button" onClick={handleCancelClick}>Cancel</button>
              </div>
            </div>
          ) : (
            <p>{bookStats.description || 'No description available.'}</p>
          )}
        </div>

        <div className="book-stats">
          <h1>Book Statistics</h1>
          <p><strong>Unique Readers:</strong> {bookStats.reads}</p>
          <p><strong>Favorites:</strong> {bookStats.favorites}</p>
          {bookStats.hasRead && <p className="read-status">You have read this book</p>}
        </div>

        <div className="book-actions">
          <button
            onClick={() => window.history.back()}
            className="back-button"
          >
            Back
          </button>
          <button
            onClick={() => window.location.href = `/reading/${bookId}`}
            className="read-button"
          >
            Read
          </button>
        </div>
        
        <div className="book-comments-section">
          <CommentSection bookId={bookId} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BookStatsPage;