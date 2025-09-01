import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import CommentSection from './components/CommentSection';
import { FaArrowLeft } from 'react-icons/fa';

function ReadingPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [pdfPath, setPdfPath] = useState(`/Books/${bookId}/`);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const url = `${process.env.PUBLIC_URL}/Books/${bookId}/book.json`;
        console.log("Fetching book.json from:", url);
    
        const response = await fetch(url);
        console.log("Response status:", response.status);
    
        if (response.ok) {
          const bookData = await response.json();
          console.log("Book data fetched:", bookData);
    
          if (bookData.Pdf) {
            setPdfPath(`${process.env.PUBLIC_URL}/Books/${bookId}/${bookData.Pdf}`);
          } else {
            console.error("No PDF file specified in book.json.");
            setPdfPath(null);
          }
        } else {
          console.error("Failed to fetch book.json for bookId:", bookId);
          setPdfPath(null);
        }
      } catch (error) {
        console.error("Error fetching book.json:", error);
        setPdfPath(null);
      }
    };
    

    fetchBookData();
  }, [bookId]);

  useEffect(() => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.onload = () => {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        iframeDocument.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          alert('Right-click is disabled inside the iframe.');
        });
      };
    }
  }, []);

  return (
    <div className="reading-page" oncopy={(e) => e.preventDefault()}>
      <Header />
      <div className="reading-navigation">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          <FaArrowLeft /> Back
        </button>
      </div>
      {pdfPath && (
        <iframe
          src={pdfPath + '#toolbar=0&navpanes=0&scrollbar=0'}
          title="Book PDF"
          width="100%"
          height="1000px"
          style={{ border: 'none' }}
        ></iframe>
      )}
      {!pdfPath && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: 'red' }}>
          No PDF file available for this book.
        </div>
      )}
      {pdfPath && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: 'green' }}>
          PDF file found: {pdfPath.split('/').pop()}
        </div>
      )}
      
      <div className="comments-section-container">
        <CommentSection bookId={bookId} />
      </div>
      
      {console.log('Final PDF Path:', pdfPath)} {/* Debugging log to verify the final PDF path */}
      <Footer />
    </div>
  );
}

export default ReadingPage;