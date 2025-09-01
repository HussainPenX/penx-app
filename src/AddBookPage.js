import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from './config';
import './App.css';
import Footer from './Footer';
import Header from './Header';

function AddBookPage() {
  const [formData, setFormData] = useState({
    bookTitle: '',
    authorName: '',
    language: '',
    genres: [],
    bookCover: null,
    bookPdf: null,
    description: ''
  });

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Russian',
    'Chinese',
    'Japanese',
    'Arabic',
    'Other'
  ];

  const availableGenres = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Thriller',
    'Horror',
    'Biography',
    'History',
    'Science',
    'Technology',
    'Philosophy',
    'Poetry',
    'Drama',
    'Comedy',
    'Educational',
    'Self-Help',
    'Business',
    'Politics',
    'Research',
    'Academic',
    'Scientific Research',
    'Medical Research',
    'Social Research',
    'Market Research',
    'Case Studies',
    'Thesis',
    'Dissertation',
    'Research Papers',
    'Data Analysis',
    'Qualitative Research',
    'Experimental Research',
    'Literature Review',
    'Research Methodology',
    'Other'
  ];

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenreChange = (e) => {
    const genre = e.target.value;
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Keep the original file but sanitize the name for storage
      const originalFile = files[0];
      const timestamp = Date.now();
      const extension = originalFile.name.split('.').pop();
      const sanitizedFileName = `${timestamp}.${extension}`;
      
      const sanitizedFile = new File(
        [originalFile],
        sanitizedFileName,
        { type: originalFile.type }
      );
      
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedFile
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    // Keep the original title for display but use timestamp for file storage
    const timestamp = Date.now();
    
    formDataToSend.append('bookTitle', formData.bookTitle); // Original title
    formDataToSend.append('authorName', formData.authorName);
    formDataToSend.append('authorEmail', localStorage.getItem('loggedInUserEmail')); // Add author's email
    formDataToSend.append('language', formData.language);
    formDataToSend.append('genres', JSON.stringify(formData.genres));
    formDataToSend.append('description', formData.description);
    formDataToSend.append('timestamp', timestamp);
    
    if (formData.bookCover) {
      formDataToSend.append('bookCover', formData.bookCover);
    }
    if (formData.bookPdf) {
      formDataToSend.append('bookPdf', formData.bookPdf);
    }

    try {
      // First, create the necessary directories
      const createDirsResponse = await fetch(`${config.API_URL}/api/create-dirs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paths: [
            'public/images/profile_pictures',
            'public/Books'
          ]
        })
      });

      if (!createDirsResponse.ok) {
        throw new Error('Failed to create necessary directories');
      }

      // Then proceed with book upload
      const response = await fetch(`${config.API_URL}/api/add-book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authorToken')}`
        },
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Book added successfully!');
        navigate('/author-home');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to add book'}`);
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('An error occurred while adding the book. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/author-home');
  };

  // 🛡️ Disable copy and cut globally on this page, but allow paste
  useEffect(() => {
    const disableCopyCut = (e) => {
      if (e.type === 'copy' || e.type === 'cut') {
        e.preventDefault();
      }
    };

    const allowPaste = (e) => {
      // Allow paste operation
      return true;
    };

    document.addEventListener('copy', disableCopyCut);
    document.addEventListener('cut', disableCopyCut);
    document.addEventListener('paste', allowPaste);

    return () => {
      document.removeEventListener('copy', disableCopyCut);
      document.removeEventListener('cut', disableCopyCut);
      document.removeEventListener('paste', allowPaste);
    };
  }, []);

  return (
    <div className="add-book-page">
      <Header />
      <h1>Add a New Book</h1>
      <div className="add-book-form">
        <label>
          Book Cover Image:
          <input
            type="file"
            name="bookCover"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
        <label>
          Book PDF:
          <input
            type="file"
            name="bookPdf"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </label>
        <label>
          Book Title:
          <input
            type="text"
            name="bookTitle"
            placeholder="Enter book title"
            value={formData.bookTitle}
            onChange={handleInputChange}
            onPaste={(e) => e.stopPropagation()}
          />
        </label>
        <label>
          Author Name:
          <input
            type="text"
            name="authorName"
            placeholder="Enter author name"
            value={formData.authorName}
            onChange={handleInputChange}
            onPaste={(e) => e.stopPropagation()}
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            placeholder="Enter a detailed description of your book..."
            value={formData.description}
            onChange={handleInputChange}
            onPaste={(e) => e.stopPropagation()}
            rows="6"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'vertical',
              minHeight: '120px',
              fontFamily: 'inherit'
            }}
          />
        </label>
        <label>
          Language:
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
        <label>
          Genres:
          <div className="genres-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '10px',
            marginTop: '10px'
          }}>
            {availableGenres.map((genre) => (
              <label key={genre} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  value={genre}
                  checked={formData.genres.includes(genre)}
                  onChange={handleGenreChange}
                />
                {genre}
              </label>
            ))}
          </div>
        </label>
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={handleBack}>Back</button>
      </div>
      <Footer />
    </div>
  );
}

export default AddBookPage;
