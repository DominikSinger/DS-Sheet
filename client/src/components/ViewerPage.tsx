import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScoreDetail } from '../hooks/useScores';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useFullscreen } from '../hooks/useFullscreen';
import PDFViewer from './PDFViewer';
import NavigationControls from './NavigationControls';
import './ViewerPage.css';

interface ViewerPageProps {
  mode?: 'local' | 'server';
}

function ViewerPage({ mode = 'server' }: ViewerPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Mode wird später für lokale vs. Server-PDFs genutzt
  const isLocalMode = mode === 'local';
  const [localFile, setLocalFile] = useState<{filename: string; path: string} | null>(null);
  
  // Lade lokale Datei-Info wenn im lokalen Modus
  useEffect(() => {
    if (isLocalMode && id?.startsWith('local-')) {
      const storedFiles = localStorage.getItem('ds_sheet_local_files');
      if (storedFiles) {
        const paths = JSON.parse(storedFiles) as string[];
        const index = parseInt(id.replace('local-', ''));
        if (index >= 0 && index < paths.length) {
          setLocalFile({
            filename: paths[index].split('/').pop() || 'Unknown',
            path: paths[index],
          });
        }
      }
    }
  }, [isLocalMode, id]);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);

  const { data: scoreDetail, isLoading, error } = useScoreDetail(id!);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const goToNextPage = useCallback(() => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, numPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Keyboard/Fußpedal-Navigation
  useKeyboardNavigation({
    onNext: goToNextPage,
    onPrev: goToPrevPage,
    onFullscreen: toggleFullscreen,
    onEscape: isFullscreen ? toggleFullscreen : handleBack,
    enabled: !isLoading && !error,
  });

  // Touch-Navigation
  const handleTouchZone = (zone: 'left' | 'right' | 'center') => {
    if (zone === 'left') {
      goToPrevPage();
    } else if (zone === 'right') {
      goToNextPage();
    } else {
      setShowControls(prev => !prev);
    }
  };

  if (!isLocalMode && error) {
    return (
      <div className="viewer-error">
        <h2>❌ Fehler beim Laden</h2>
        <p>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>
        <button onClick={handleBack}>Zurück zur Bibliothek</button>
      </div>
    );
  }

  if (!isLocalMode && (isLoading || !scoreDetail)) {
    return (
      <div className="viewer-loading">
        <div className="spinner"></div>
        <p>Lade Noten...</p>
      </div>
    );
  }

  if (isLocalMode && !localFile) {
    return (
      <div className="viewer-loading">
        <div className="spinner"></div>
        <p>Lade lokale Datei...</p>
      </div>
    );
  }

  if (!isLocalMode && scoreDetail && !scoreDetail.exists) {
    return (
      <div className="viewer-error">
        <h2>⚠️ Datei nicht gefunden</h2>
        <p>Die Datei existiert nicht mehr im System.</p>
        <button onClick={handleBack}>Zurück zur Bibliothek</button>
      </div>
    );
  }

  const displayFilename = isLocalMode ? localFile?.filename : scoreDetail?.filename;

  return (
    <div className={`viewer-page ${isFullscreen ? 'fullscreen' : ''}`}>
      {showControls && (
        <div className="viewer-header">
          <button className="back-button" onClick={handleBack}>
            ← Zurück
          </button>
          <h2 className="viewer-title">{displayFilename}</h2>
          <div className="viewer-info">
            Seite {currentPage} / {numPages || '...'}
          </div>
        </div>
      )}

      <div className="viewer-content">
        <PDFViewer
          scoreId={id!}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLoadSuccess={setNumPages}
          onTouchZone={handleTouchZone}
        />
      </div>

      {showControls && (
        <NavigationControls
          currentPage={currentPage}
          totalPages={numPages || 0}
          onPrevious={goToPrevPage}
          onNext={goToNextPage}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      {!showControls && (
        <div className="hint-overlay" onClick={() => setShowControls(true)}>
          Tap für Steuerung
        </div>
      )}
    </div>
  );
}

export default ViewerPage;
