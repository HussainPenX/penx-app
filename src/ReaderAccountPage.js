import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { FaHeart } from 'react-icons/fa';
import config from './config';
import getResponsiveStyles from './utils/responsiveStyles';
import Header from './Header';

function ReaderAccountPage() {
  const navigate = useNavigate();
  const [readerStats, setReaderStats] = useState({ booksRead: 0, favoriteGenres: [] });
  const [profilePicture, setProfilePicture] = useState(null);
  const [showFileInput, setShowFileInput] = useState(false);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [styles, setStyles] = useState(getResponsiveStyles());

  // Update styles when window is resized
  useEffect(() => {
    const handleResize = () => {
      setStyles(getResponsiveStyles());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEditProfilePicture = () => {
    setShowFileInput(true);
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
      if (!loggedInUserEmail) {
        console.error('No logged-in user email found.');
        return;
      }

      const formData = new FormData();
      formData.append('profilePicture', file);
      formData.append('email', loggedInUserEmail);

      try {
        const response = await fetch(`${config.API_URL}/api/reader/update-profile`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          setProfilePicture(`${config.API_URL}${data.profilePicture}`);
          setShowFileInput(false);
          alert('Profile picture updated successfully!');
        } else {
          const errorData = await response.json();
          console.error('Failed to update profile picture:', errorData);
          alert('Failed to update profile picture. Please try again.');
        }
      } catch (error) {
        console.error('Error updating profile picture:', error);
        alert('Error updating profile picture. Please try again.');
      }
    }
  };

  useEffect(() => {
    const fetchReaderStats = async () => {
      try {
        const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
        if (!loggedInUserEmail) {
          console.error('No logged-in user email found.');
          return;
        }

        const response = await fetch(`${config.API_URL}/api/reader-stats?email=${encodeURIComponent(loggedInUserEmail)}`);
        const data = await response.json();
        console.log('Backend response data:', data);
        
        // Calculate favorite genres from favorited books
        const genreCounts = {};
        favoriteBooks.forEach(book => {
          if (book.Genres) {
            book.Genres.forEach(genre => {
              genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
          }
        });

        // Sort genres by count and get top 5
        const favoriteGenres = Object.entries(genreCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([genre]) => genre);

        setReaderStats({
          ...data,
          favoriteGenres: favoriteGenres
        });

        // Fetch additional user details
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        // Update profile picture from backend data
        if (data.profilePicture) {
          console.log('Profile picture data from backend:', data.profilePicture);
          const profilePicUrl = data.profilePicture.startsWith('http') 
            ? data.profilePicture 
            : `${config.API_URL}${data.profilePicture}`;
          console.log('Constructed profile picture URL:', profilePicUrl);
          setProfilePicture(profilePicUrl);
        } else {
          console.log('No profile picture data received from backend');
          setProfilePicture('/images/PenX logo 0002.png');
        }
      } catch (error) {
        console.error('Error fetching reader stats:', error);
      }
    };

    fetchReaderStats();
  }, [favoriteBooks]);

  useEffect(() => {
    const fetchFavoriteBooks = async () => {
      const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
      if (!loggedInUserEmail) {
        console.error('No logged-in user email found.');
        return;
      }

      try {
        // Fetch favorites from the backend
        const favoritesResponse = await fetch(`${config.API_URL}/api/favorites?email=${encodeURIComponent(loggedInUserEmail)}`);
        if (!favoritesResponse.ok) {
          throw new Error('Failed to fetch favorites');
        }
        const { favorites } = await favoritesResponse.json();

        // Fetch book details for each favorite
        const books = await Promise.all(
          favorites.map(async (folderName) => {
            try {
              const response = await fetch(`/Books/${folderName}/book.json`);
              if (response.ok) {
                const bookData = await response.json();
                return { ...bookData, FolderName: folderName };
              }
            } catch (error) {
              console.error(`Error fetching book data for folder ${folderName}:`, error);
            }
            return null;
          })
        );
        setFavoriteBooks(books.filter((book) => book !== null));
      } catch (error) {
        console.error('Error fetching favorite books:', error);
      }
    };

    fetchFavoriteBooks();
  }, []);

  const toggleFavorite = async (book) => {
    const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
    if (!loggedInUserEmail) {
      console.error('No logged-in user email found. Cannot toggle favorite.');
      return;
    }

    const isCurrentlyFavorite = isFavorite(book);
    console.log('Toggling favorite for book:', book);
    console.log('Current favorite status:', isCurrentlyFavorite);

    try {
      const response = await fetch(`${config.API_URL}/api/toggle-favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loggedInUserEmail,
          bookId: book.FolderName,
          isFavorited: !isCurrentlyFavorite,
        }),
      });

      if (response.ok) {
        const { favorites } = await response.json();
        // Update the favorite books list
        const updatedBooks = favoriteBooks.filter(b => b.FolderName !== book.FolderName);
        if (!isCurrentlyFavorite) {
          updatedBooks.push(book);
        }
        setFavoriteBooks(updatedBooks);
      } else {
        console.error('Failed to update favorite status.');
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const isFavorite = (book) => favoriteBooks.some((favBook) => favBook.FolderName === book.FolderName);

  return (
    <>
      <Header welcomeMessage={`Welcome, ${firstName || 'Reader'}`} />
      <div className="account-page" style={{
        padding: styles.spacing.base,
        maxWidth: styles.containerWidth.lg,
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.lg,
      }}>
        
        <div className="profile-picture-section" style={{
          marginTop: styles.spacing.xl,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: styles.spacing.xl,
          gap: styles.spacing.base,
        }}>
          {profilePicture ? (
            <div className="profile-picture-frame" style={{
              width: styles.profilePictureSize.lg,
              height: styles.profilePictureSize.lg,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              border: '4px solid white',
            }}>
              <img 
                src={profilePicture || '/images/PenX logo 0002.png'} 
                alt="Profile" 
                className="profile-picture"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  console.error('Error loading profile picture. Attempted URL:', e.target.src);
                  if (e.target.src !== '/images/PenX logo 0002.png') {
                    console.log('Attempting to load fallback image');
                    e.target.src = '/images/PenX logo 0002.png';
                  } else {
                    console.error('Fallback image also failed to load');
                  }
                }}
              />
            </div>
          ) : (
            <p style={{ 
              fontSize: styles.fontSize.base,
              color: '#666',
            }}>No profile picture uploaded</p>
          )}
          {!showFileInput && (
            <button 
              onClick={handleEditProfilePicture}
              style={{
                ...styles.buttonSize.md,
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: styles.card.borderRadius,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Edit Profile Picture
            </button>
          )}
          {showFileInput && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: styles.spacing.sm,
              alignItems: 'center',
              width: '100%',
              maxWidth: styles.width < styles.breakpoints.medium ? '100%' : '300px',
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ 
                  marginBottom: styles.spacing.sm,
                  width: '100%',
                  fontSize: styles.fontSize.sm,
                  padding: styles.spacing.xs,
                }}
              />
              <button 
                onClick={() => setShowFileInput(false)}
                style={{
                  ...styles.buttonSize.sm,
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: styles.card.borderRadius,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="account-details" style={{
          backgroundColor: '#f8f9fa',
          padding: styles.card.padding,
          borderRadius: styles.card.borderRadius,
          marginBottom: styles.spacing.xl,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}>
          <p style={{ 
            fontSize: styles.fontSize.base, 
            marginBottom: styles.spacing.sm,
            color: '#333',
          }}>
            <strong>Name: </strong>{firstName} {lastName}
          </p>
          <p style={{ 
            fontSize: styles.fontSize.base, 
            marginBottom: styles.spacing.sm,
            color: '#333',
          }}>
            <strong>Email: </strong>{email}
          </p>
          <p style={{ 
            fontSize: styles.fontSize.base, 
            marginBottom: styles.spacing.sm,
            color: '#333',
          }}>
            <strong>Member Since:</strong> May 2025
          </p>
          <p style={{ 
            fontSize: styles.fontSize.base, 
            marginBottom: styles.spacing.sm,
            color: '#333',
          }}>
            <strong>Books Read:</strong> {readerStats.booksRead}
          </p>
          <p style={{ 
            fontSize: styles.fontSize.base,
            color: '#333',
          }}>
            <strong>Favorite Genres:</strong> {readerStats.favoriteGenres.length > 0 ? readerStats.favoriteGenres.join(', ') : 'No favorite genres yet'}
          </p>
        </div>

        <div className="favorite-books" style={{
          width: '80%',
          maxWidth: styles.containerWidth.lg,
          marginBottom: styles.spacing.xl,
        }}>
          <h2 style={{
            fontSize: styles.fontSize.xl,
            marginBottom: styles.spacing.lg,
            color: '#4169E1',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}>Favorite Books</h2>
          {favoriteBooks.length > 0 ? (
            <div className="book-list" style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${styles.grid.columns}, 1fr)`,
              gap: styles.grid.gap,
              padding: styles.spacing.base,
            }}>
              {favoriteBooks.map((book) => (
                <div 
                  key={book.FolderName} 
                  className="book-card"
                  onClick={() => window.location.href = `/reading/${book.FolderName}`}
                  style={{
                    cursor: 'pointer',
                    width: styles.bookCard.width,
                    height: styles.bookCard.height,
                    backgroundColor: 'white',
                    borderRadius: styles.card.borderRadius,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-5px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  <img
                    src={book.Cover || `/Books/${book.FolderName}/1BookCover.png`}
                    alt="Book Cover"
                    style={{
                      width: '80%',
                      height: styles.bookCard.imageHeight,
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{ 
                    padding: styles.card.padding,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: styles.spacing.xs,
                  }}>
                    <h3 style={{
                      fontSize: styles.fontSize.base,
                      color: '#333',
                      margin: 0,
                    }}>{book.Title}</h3>
                    <p style={{
                      fontSize: styles.fontSize.sm,
                      color: '#666',
                      margin: 0,
                    }}>{book.Author}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(book);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: styles.spacing.xs,
                        alignSelf: 'flex-end',
                      }}
                    >
                      <FaHeart color={isFavorite(book) ? 'red' : 'grey'} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ 
              fontSize: styles.fontSize.base, 
              textAlign: 'center',
              color: '#666',
            }}>
              No favorite books added yet.
            </p>
          )}
        </div>

      </div>

      <div className="account-actions" style={{
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        gap: 0,
        background: '#fff',
        boxShadow: '0 -2px 8px rgba(65,105,225,0.07)',
        padding: 0,
        marginLeft: 0,
        marginRight: 0,
        paddingLeft: 0,
        paddingRight: 0,
        position: 'relative',
      }}>
        <button 
          onClick={() => alert('Edit Profile functionality coming soon!')}
          style={{
            ...styles.buttonSize.md,
            background: 'linear-gradient(90deg, #4169E1 0%, #5A8DEE 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'background 0.3s, box-shadow 0.3s',
            width: '100%',
            minWidth: 0,
            boxShadow: 'none',
            fontWeight: 600,
            fontSize: styles.fontSize.base,
            letterSpacing: '0.5px',
            flex: 1,
          }}
          onMouseOver={e => e.target.style.background = 'linear-gradient(90deg, #27408B 0%, #4169E1 100%)'}
          onMouseOut={e => e.target.style.background = 'linear-gradient(90deg, #4169E1 0%, #5A8DEE 100%)'}
        >
          Edit Profile
        </button>
        <button 
          onClick={() => navigate('/reader-home')}
          style={{
            ...styles.buttonSize.md,
            background: 'linear-gradient(90deg, #f8f9fa 0%, #e3eafc 100%)',
            color: '#4169E1',
            border: '1px solid #d1d9ec',
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'background 0.3s, color 0.3s, box-shadow 0.3s',
            width: '100%',
            minWidth: 0,
            boxShadow: 'none',
            fontWeight: 600,
            fontSize: styles.fontSize.base,
            letterSpacing: '0.5px',
            flex: 1,
          }}
          onMouseOver={e => {
            e.target.style.background = 'linear-gradient(90deg, #e3eafc 0%, #f8f9fa 100%)';
            e.target.style.color = '#27408B';
          }}
          onMouseOut={e => {
            e.target.style.background = 'linear-gradient(90deg, #f8f9fa 0%, #e3eafc 100%)';
            e.target.style.color = '#4169E1';
          }}
        >
          Home
        </button>
        <button 
          onClick={() => navigate('/')}
          style={{
            ...styles.buttonSize.md,
            background: 'linear-gradient(90deg, #ff6b6b 0%, #ff8787 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'background 0.3s, box-shadow 0.3s',
            width: '100%',
            minWidth: 0,
            boxShadow: 'none',
            fontWeight: 600,
            fontSize: styles.fontSize.base,
            letterSpacing: '0.5px',
            flex: 1,
          }}
          onMouseOver={e => e.target.style.background = 'linear-gradient(90deg, #c82333 0%, #ff6b6b 100%)'}
          onMouseOut={e => e.target.style.background = 'linear-gradient(90deg, #ff6b6b 0%, #ff8787 100%)'}
        >
          Logout
        </button>
      </div>
      <Footer />
    </>
  );
}

export default ReaderAccountPage;