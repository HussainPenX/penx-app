import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

function AuthorReadingPage() {
  const { bookId } = useParams();
  const [pdfPath, setPdfPath] = useState(`/Books/${bookId}/`);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const response = await fetch(`/Books/${bookId}/book.json`);
        if (response.ok) {
          const bookData = await response.json();
          if (bookData.Pdf) {
            setPdfPath(bookData.Pdf);
          } else {
            setPdfPath(null);
          }
        } else {
          setPdfPath(null);
        }
      } catch (error) {
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
      <button onClick={() => window.location.href = '/author-account'} style={{ margin: '10px', padding: '10px', backgroundColor: '#4169E1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Leave
      </button>
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
      <Footer />
    </div>
  );
}

export default AuthorReadingPage;