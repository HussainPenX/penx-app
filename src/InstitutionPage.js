import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import config from './config';

function InstitutionPage() {
  const navigate = useNavigate();
  const [institutionData, setInstitutionData] = useState({
    name: 'PenX Institution',
    collectiveScore: 0,
    collectivePublications: 0,
    authors: [],
  });

  useEffect(() => {
    const fetchInstitutionData = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/institution-data`);
        const data = await response.json();
        setInstitutionData(data);
      } catch (error) {
        console.error('Error fetching institution data:', error);
      }
    };

    fetchInstitutionData();
  }, []);

  const handleBackToAuthor = () => {
    navigate('/author-home'); // Redirect back to the author home page
  };

  return (
    <div className="institution-page">
      <div className="institution-logo-frame">
        <img src="/images/PenX logo 0002.png" alt="Institution Logo" className="institution-logo" />
      </div>
      <h1>{institutionData.name}</h1>
      <p><strong>Collective Score:</strong> {institutionData.collectiveScore}</p>
      <p><strong>Collective Publications:</strong> {institutionData.collectivePublications}</p>

      <div className="author-cards">
        {institutionData.authors.map((author) => (
          <div key={author.name} className="author-card">
            {author.profilePicture && (
              <div className="profile-picture-frame">
                <img src={author.profilePicture} alt="Author Profile" className="profile-picture" />
              </div>
            )}
            <h3>{author.name}</h3>
            <p><strong>Score:</strong> {author.score}</p>
            <p><strong>Publications:</strong> {author.publications}</p>
            <a href={`/author-account?name=${encodeURIComponent(author.name)}`}>View Account</a>
          </div>
        ))}
      </div>

      <button onClick={handleBackToAuthor}>Back to Author Page</button>
      <Footer />
    </div>
  );
}

export default InstitutionPage;