import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import getResponsiveStyles from '../utils/responsiveStyles';

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const PDFViewer = ({ fileUrl }) => {
  const canvasRef = useRef();
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [styles, setStyles] = useState(getResponsiveStyles());
  const [error, setError] = useState(null);

  // Update styles when window is resized
  useEffect(() => {
    const handleResize = () => {
      setStyles(getResponsiveStyles());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setError(null);
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setPageNum(1);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF. Please try again later.');
      }
    };

    loadPDF();
  }, [fileUrl]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdf) return;

      try {
        setError(null);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render page. Please try again.');
      }
    };

    renderPage();
  }, [pdf, pageNum, scale]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: styles.spacing.xl,
        color: '#dc3545',
        fontSize: styles.fontSize.lg,
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: styles.spacing.base,
      padding: styles.spacing.base,
    }}>
      <div
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        style={{ 
          userSelect: 'none',
          overflowX: 'auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: styles.spacing.base,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <button
          onClick={() => setPageNum((p) => Math.max(p - 1, 1))}
          disabled={pageNum <= 1}
          style={{
            padding: styles.buttonSize.sm.padding,
            fontSize: styles.buttonSize.sm.fontSize,
            backgroundColor: pageNum <= 1 ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: styles.card.borderRadius,
            cursor: pageNum <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            if (pageNum > 1) e.target.style.backgroundColor = '#0056b3';
          }}
          onMouseOut={(e) => {
            if (pageNum > 1) e.target.style.backgroundColor = '#007bff';
          }}
        >
          ◀ Prev
        </button>

        <span style={{ 
          fontSize: styles.fontSize.base,
          color: '#333',
        }}>
          Page {pageNum} of {totalPages}
        </span>

        <button
          onClick={() => setPageNum((p) => Math.min(p + 1, totalPages))}
          disabled={pageNum >= totalPages}
          style={{
            padding: styles.buttonSize.sm.padding,
            fontSize: styles.buttonSize.sm.fontSize,
            backgroundColor: pageNum >= totalPages ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: styles.card.borderRadius,
            cursor: pageNum >= totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            if (pageNum < totalPages) e.target.style.backgroundColor = '#0056b3';
          }}
          onMouseOut={(e) => {
            if (pageNum < totalPages) e.target.style.backgroundColor = '#007bff';
          }}
        >
          Next ▶
        </button>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: styles.spacing.sm,
        }}>
          <button
            onClick={handleZoomOut}
            style={{
              padding: styles.buttonSize.sm.padding,
              fontSize: styles.buttonSize.sm.fontSize,
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
            -
          </button>
          <span style={{ 
            fontSize: styles.fontSize.base,
            color: '#333',
          }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            style={{
              padding: styles.buttonSize.sm.padding,
              fontSize: styles.buttonSize.sm.fontSize,
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
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer; 