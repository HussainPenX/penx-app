import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaHeart, FaFilter, FaUser } from 'react-icons/fa';
import './App.css';
import Footer from './Footer';
import Header from './Header';
import config from './config';

function ReaderHomePage() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
      if (!loggedInUserEmail) {
        console.error('No logged-in user email found.');
        return;
      }

      try {
        const response = await fetch(`${config.API_URL}/api/reader-stats?email=${encodeURIComponent(loggedInUserEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setFirstName(data.firstName || '');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
      if (!loggedInUserEmail) {
        console.error('No logged-in user email found.');
        return;
      }

      try {
        const response = await fetch(`${config.API_URL}/api/favorites?email=${encodeURIComponent(loggedInUserEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites || []);
        } else {
          console.error('Failed to fetch favorites.');
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    // Fetch books from the Books folder
    const fetchBooks = async () => {
      try {
        const response = await fetch('/Books/books.json'); // ✅ use static JSON file
        const folders = await response.json();
  
        const bookPromises = folders.map(async (folder) => {
          try {
            const bookResponse = await fetch(`/Books/${folder}/book.json`);
            if (bookResponse.ok) {
              const bookData = await bookResponse.json();
              return { ...bookData, FolderName: folder };
            } else {
              console.warn(`No book.json found in folder: ${folder}`);
              return null;
            }
          } catch (error) {
            console.error(`Error fetching book from folder ${folder}:`, error);
            return null;
          }
        });
  
        const booksData = await Promise.all(bookPromises);
        setBooks(booksData.filter((book) => book !== null));
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    // Extract unique languages and genres from books
    const languages = new Set();
    const genres = new Set();
    
    books.forEach(book => {
      if (book.Language) languages.add(book.Language);
      if (book.Genres) {
        book.Genres.forEach(genre => genres.add(genre));
      }
    });

    setAvailableLanguages(Array.from(languages).sort());
    setAvailableGenres(Array.from(genres).sort());
  }, [books]);

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
        const data = await response.json();
        setFavorites(data.favorites);
      } else {
        console.error('Failed to update favorite status.');
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const isFavorite = (book) => favorites.includes(book.FolderName);

  const filteredBooks = books.filter(
    (book) => {
      const matchesSearch = 
        (book.Title && book.Title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (book.Author && book.Author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (book.Genres && book.Genres.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        ));

      const matchesLanguage = !selectedLanguage || book.Language === selectedLanguage;
      const matchesGenre = !selectedGenre || (book.Genres && book.Genres.includes(selectedGenre));

      return matchesSearch && matchesLanguage && matchesGenre;
    }
  );

  const clearFilters = () => {
    setSelectedLanguage('');
    setSelectedGenre('');
    setSearchQuery('');
  };

  return (
    <div className="home-page">
      <Header welcomeMessage={`Welcome, ${firstName || 'Reader'}`} />
      <main className="home-content">
        <section className="featured-books">
          <h2>Available Books</h2>
          <div className="search-filter-toolbar">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="search-icon-button toolbar-icon"
              title="Search"
            >
              <FaSearch />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="filter-icon-button toolbar-icon"
              title="Filter"
            >
              <FaFilter />
            </button>
            {showSearch && (
              <input
                type="text"
                placeholder="Search by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar"
              />
            )}
          </div>
          {showFilters && (
            <div className="filters-container">
              <div className="filter-group">
                <label>Language:</label>
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Languages</option>
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Genre:</label>
                <select 
                  value={selectedGenre} 
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Genres</option>
                  {availableGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={clearFilters}
                className="clear-filters-button"
              >
                Clear Filters
              </button>
            </div>
          )}
          <div className="book-list">
            {filteredBooks.map((book, index) => (
              <div key={index} className="book-card" onClick={() => navigate(`/book/${book.FolderName}`)}>
                <img
                  src={book.Cover || `/Books/${book.FolderName}/1BookCover.png`}
                  alt="Book Cover"
                />
                <h3>{book.Title}</h3>
                <p>{book.Author}</p>
                <span className="book-language">{book.Language}</span>
                <div className="book-genres">
                  {book.Genres && book.Genres.map((genre, idx) => (
                    <span key={idx} className="genre-tag">{genre}</span>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(book);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <FaHeart color={isFavorite(book) ? 'red' : 'grey'} />
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="cta-section">
          <h2>Discover More</h2>
          <p>Find new books and authors to follow.</p>
          <button onClick={() => alert('Explore More Books')}>Explore</button>
        </section>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/welcome';
          }}
          style={{ margin: '10px', padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </main>
      <Footer />
    </div>
  );
}

export default ReaderHomePage;