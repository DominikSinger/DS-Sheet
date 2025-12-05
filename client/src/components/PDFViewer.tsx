import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { scoresApi } from '../services/api';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PDFViewer.css';

// PDF.js Worker Setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  scoreId: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  onLoadSuccess: (numPages: number) => void;
  onTouchZone?: (zone: 'left' | 'right' | 'center') => void;
}

function PDFViewer({
  scoreId,
  currentPage,
  onPageChange,
  onLoadSuccess,
  onTouchZone,
}: PDFViewerProps) {
  const [pdfWidth, setPdfWidth] = useState<number>();
  const fileUrl = scoresApi.getScoreFileUrl(scoreId);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    onLoadSuccess(numPages);
  };

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!onTouchZone) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.3) {
      onTouchZone('left');
    } else if (x > width * 0.7) {
      onTouchZone('right');
    } else {
      onTouchZone('center');
    }
  }, [onTouchZone]);

  // Berechne PDF-Breite basierend auf Viewport
  const calculatePdfWidth = useCallback(() => {
    const container = document.querySelector('.pdf-container');
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      // Nutze 95% der verfügbaren Breite, max. basierend auf Höhe im Verhältnis A4 (√2)
      const maxWidthFromHeight = containerHeight * 0.7071; // 1/√2
      setPdfWidth(Math.min(containerWidth * 0.95, maxWidthFromHeight));
    }
  }, []);

  // Initial und bei Resize
  useState(() => {
    calculatePdfWidth();
    window.addEventListener('resize', calculatePdfWidth);
    return () => window.removeEventListener('resize', calculatePdfWidth);
  });

  return (
    <div className="pdf-container" onClick={handleClick}>
      <Document
        file={fileUrl}
        onLoadSuccess={handleDocumentLoadSuccess}
        loading={
          <div className="pdf-loading">
            <div className="spinner"></div>
            <p>Lade PDF...</p>
          </div>
        }
        error={
          <div className="pdf-error">
            <p>❌ PDF konnte nicht geladen werden</p>
          </div>
        }
      >
        <Page
          pageNumber={currentPage}
          width={pdfWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={
            <div className="page-loading">
              <div className="spinner"></div>
            </div>
          }
        />
      </Document>

      {/* Touch-Zonen-Visualisierung (nur für Debugging) */}
      {/* <div className="touch-zones">
        <div className="zone zone-left"></div>
        <div className="zone zone-center"></div>
        <div className="zone zone-right"></div>
      </div> */}
    </div>
  );
}

export default PDFViewer;
