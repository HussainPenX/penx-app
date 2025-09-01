import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from './config';
import './App.css';
import Footer from './Footer';

function AuthorAccountPage() {
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [stats, setStats] = useState({ score: 0, publications: 0 });
  const [institution, setInstitution] = useState(null);
  const [showInstitutionForm, setShowInstitutionForm] = useState(false);
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    description: '',
    website: '',
    location: ''
  });
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    bio: '',
    profilePicture: null
  });

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
        console.log('Raw author data from backend:', JSON.stringify(authorData, null, 2));
        
        // Check if profile picture exists in the response
        if (!authorData.profilePicture) {
          console.log('No profile picture in response, checking for alternative fields');
          // Check for alternative field names that might contain the profile picture
          const possibleFields = ['profile_picture', 'profilePicture', 'avatar', 'image'];
          for (const field of possibleFields) {
            if (authorData[field]) {
              console.log(`Found profile picture in field: ${field}`);
              authorData.profilePicture = authorData[field];
              break;
            }
          }
        }

        console.log('Profile picture path from backend:', authorData.profilePicture);
        
        // Handle profile picture URL construction
        if (authorData.profilePicture) {
          const profilePicUrl = authorData.profilePicture.startsWith('http') 
            ? authorData.profilePicture 
            : `${config.API_URL}${authorData.profilePicture}`;
          console.log('Constructed profile picture URL:', profilePicUrl);
          authorData.profilePicture = profilePicUrl;
        } else {
          console.log('No profile picture data received from backend, using default');
          authorData.profilePicture = '/images/PenX logo 0002.png';
        }
        
        console.log('Final author data being set:', JSON.stringify(authorData, null, 2));
        setAuthor(authorData);

        // Fetch author's publications
        const publicationsResponse = await fetch(`${config.API_URL}/api/author/${authorId}/books`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (publicationsResponse.ok) {
          const publicationsData = await publicationsResponse.json();
          setPublications(publicationsData.books || []);
        }

        // If author has institution details, set them
        if (authorData.institutionDetails) {
          setInstitution(authorData.institutionDetails);
        }

        // Fetch author stats
        const statsResponse = await fetch(`${config.API_URL}/api/author-stats?authorName=${encodeURIComponent(authorData.name)}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
        setError('Failed to load author data');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [navigate]);

  const handleInstitutionSubmit = async (e) => {
    e.preventDefault();
    const authorId = localStorage.getItem('authorId');
    const token = localStorage.getItem('authorToken');

    try {
      const response = await fetch(`${config.API_URL}/api/institution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newInstitution,
          adminId: authorId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInstitution(data);
        setShowInstitutionForm(false);
        // Update author's institution
        const updateResponse = await fetch(`${config.API_URL}/api/author/${authorId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            institution: data.id
          })
        });
        if (updateResponse.ok) {
          const updatedAuthor = await updateResponse.json();
          setAuthor(updatedAuthor);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create institution');
      }
    } catch (error) {
      console.error('Error creating institution:', error);
      setError(error.message);
    }
  };

  const handleInstitutionInputChange = (e) => {
    const { name, value } = e.target;
    setNewInstitution(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProfile = () => {
    setEditedProfile({
      bio: author.bio || '',
      profilePicture: null
    });
    setIsEditing(true);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setEditedProfile(prev => ({
        ...prev,
        profilePicture: file,
        previewUrl: previewUrl
      }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const authorId = localStorage.getItem('authorId');
    const token = localStorage.getItem('authorToken');

    if (!authorId || !token) {
      setError('Authentication required. Please log in again.');
      navigate('/author-login');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('bio', editedProfile.bio);
      if (editedProfile.profilePicture) {
        console.log('Adding profile picture to form data:', editedProfile.profilePicture);
        formData.append('profilePicture', editedProfile.profilePicture);
      }

      console.log('Sending profile update with:', {
        bio: editedProfile.bio,
        hasProfilePicture: !!editedProfile.profilePicture,
        profilePicture: editedProfile.profilePicture
      });

      const response = await fetch(`${config.API_URL}/api/author/${authorId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedAuthor = await response.json();
        console.log('Profile update response:', JSON.stringify(updatedAuthor, null, 2));
        
        // Check for profile picture in response
        if (!updatedAuthor.profilePicture) {
          console.log('No profile picture in update response, checking for alternative fields');
          const possibleFields = ['profile_picture', 'profilePicture', 'avatar', 'image'];
          for (const field of possibleFields) {
            if (updatedAuthor[field]) {
              console.log(`Found profile picture in field: ${field}`);
              updatedAuthor.profilePicture = updatedAuthor[field];
              break;
            }
          }
        }

        // Update the profile picture URL in the author data
        if (updatedAuthor.profilePicture) {
          updatedAuthor.profilePicture = updatedAuthor.profilePicture.startsWith('http')
            ? updatedAuthor.profilePicture
            : `${config.API_URL}${updatedAuthor.profilePicture}`;
          console.log('Final profile picture URL:', updatedAuthor.profilePicture);
        } else {
          console.log('No profile picture in update response, using existing or default');
          updatedAuthor.profilePicture = author?.profilePicture || '/images/PenX logo 0002.png';
        }
        
        setAuthor(updatedAuthor);
        setIsEditing(false);
        setError('');
        
        // Show success message
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Profile update failed:', errorData);
        if (response.status === 401) {
          localStorage.removeItem('authorId');
          localStorage.removeItem('authorToken');
          navigate('/author-login');
          return;
        }
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="author-account-page">
      <div className="author-account-content">
        <div className="author-profile-container">
          <div className="author-profile">
            <div className="profile-header">
              <div className="profile-picture-container">
                {console.log('Current author state:', author)}
                {console.log('Current profile picture URL:', author?.profilePicture)}
                <img 
                  src={isEditing && editedProfile.previewUrl 
                    ? editedProfile.previewUrl 
                    : (author?.profilePicture || '/images/PenX logo 0002.png')} 
                  alt="Profile" 
                  className="profile-picture"
                  onError={(e) => {
                    console.error('Error loading profile picture. Attempted URL:', e.target.src);
                    console.log('Current author state:', author);
                    console.log('Current profile picture path:', author?.profilePicture);
                    if (e.target.src !== '/images/PenX logo 0002.png') {
                      console.log('Attempting to load fallback image');
                      e.target.src = '/images/PenX logo 0002.png';
                    } else {
                      console.error('Fallback image also failed to load');
                    }
                  }}
                />
                {isEditing && (
                  <div className="profile-picture-edit">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      id="profile-picture-input"
                      className="profile-picture-input"
                    />
                    <label htmlFor="profile-picture-input" className="edit-picture-button">
                      Change Picture
                    </label>
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h1>{author?.name}</h1>
                <p className="email">{author?.email}</p>
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="profile-edit-form">
                    <div className="form-group">
                      <textarea
                        name="bio"
                        value={editedProfile.bio}
                        onChange={handleProfileInputChange}
                        placeholder="Write your bio..."
                        className="bio-input"
                      />
                    </div>
                    <div className="form-buttons">
                      <button type="submit" className="submit-button">
                        Save Changes
                      </button>
                      <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="bio">{author?.bio || 'No bio available'}</p>
                    <button 
                      onClick={handleEditProfile}
                      className="edit-profile-button"
                    >
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="stats-container">
              <div className="stat-card">
                <h3>Score</h3>
                <p className="stat-value">{stats.score}</p>
              </div>
              <div className="stat-card">
                <h3>Publications</h3>
                <p className="stat-value">{stats.publications}</p>
              </div>
            </div>

            <div className="publications-section">
              <h2>Your Publications</h2>
              {publications.length > 0 ? (
                <div className="publications-grid">
                  {publications.map((book) => (
                    <div 
                      key={book.id} 
                      className="publication-card"
                      onClick={() => navigate(`/book-stats/${book.folder_name}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={book.cover} alt={book.title} className="publication-cover" />
                      <div className="publication-info">
                        <h3>{book.title}</h3>
                        <p className="publication-language">{book.language}</p>
                        <div className="publication-genres">
                          {book.genres.map((genre, index) => (
                            <span key={index} className="genre-tag">{genre}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-publications">No publications yet. Start writing your first book!</p>
              )}
            </div>

            <div className="institution-section">
              {institution ? (
                <div className="institution-card">
                  <h3>Institution</h3>
                  <div className="institution-details">
                    <p><strong>Name:</strong> {institution.name}</p>
                    <p><strong>Location:</strong> {institution.location}</p>
                    <a 
                      href={`/institution/${institution.id}`} 
                      className="institution-link"
                    >
                      View Institution Profile
                    </a>
                  </div>
                </div>
              ) : (
                <div className="institution-form-container">
                  {showInstitutionForm ? (
                    <form onSubmit={handleInstitutionSubmit} className="institution-form">
                      <h3>Create New Institution</h3>
                      <div className="form-group">
                        <input
                          type="text"
                          name="name"
                          placeholder="Institution Name"
                          value={newInstitution.name}
                          onChange={handleInstitutionInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <textarea
                          name="description"
                          placeholder="Institution Description"
                          value={newInstitution.description}
                          onChange={handleInstitutionInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="url"
                          name="website"
                          placeholder="Institution Website"
                          value={newInstitution.website}
                          onChange={handleInstitutionInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          name="location"
                          placeholder="Institution Location"
                          value={newInstitution.location}
                          onChange={handleInstitutionInputChange}
                          required
                        />
                      </div>
                      <div className="form-buttons">
                        <button type="submit" className="submit-button">
                          Create Institution
                        </button>
                        <button 
                          type="button" 
                          className="cancel-button"
                          onClick={() => setShowInstitutionForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setShowInstitutionForm(true)}
                      className="create-institution-button"
                    >
                      Create Institution Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="navigation-buttons">
          <button 
            onClick={() => navigate('/author-home')} 
            className="home-button"
          >
            Go to Home
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('authorId');
              localStorage.removeItem('authorToken');
              navigate('/welcome');
            }} 
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>
      <div style={{ marginBottom: '60px' }}></div>
      <Footer />
    </div>
  );
}

export default AuthorAccountPage;