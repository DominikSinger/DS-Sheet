import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScores, useHealth } from '../hooks/useScores';
import SearchBar from './SearchBar';
import ScoreCard from './ScoreCard';
import InstallPrompt from './InstallPrompt';
import './LibraryView.css';

interface LibraryViewProps {
  mode?: 'local' | 'server';
}

function LibraryView({ mode = 'server' }: LibraryViewProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [localFiles, setLocalFiles] = useState<Array<{id: string; filename: string; path: string}>>([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  
  const isLocalMode = mode === 'local';
  
  // Lade lokale Dateien wenn im lokalen Modus
  useEffect(() => {
    if (isLocalMode) {
      loadLocalFiles();
    }
  }, [isLocalMode]);

  const loadLocalFiles = () => {
    try {
      setIsLoadingLocal(true);
      const storedFiles = localStorage.getItem('ds_sheet_local_files');
      
      if (storedFiles) {
        const paths = JSON.parse(storedFiles) as string[];
        const files = paths.map((path, index) => ({
          id: `local-${index}`,
          filename: path.split('/').pop() || 'Unknown',
          path: path,
          folder: path.substring(0, path.lastIndexOf('/')),
        }));
        setLocalFiles(files);
      }
    } catch (err) {
      console.error('Fehler beim Laden lokaler Dateien:', err);
    } finally {
      setIsLoadingLocal(false);
    }
  };
  
  const { data: scoresData, isLoading, error } = useScores(searchTerm, selectedFolder, !isLocalMode);
  const { data: healthData } = useHealth(!isLocalMode);

  // Extrahiere eindeutige Ordner
  const folders = useMemo(() => {
    if (!scoresData?.scores) return [];
    const folderSet = new Set(scoresData.scores.map(s => s.folder).filter(Boolean));
    return Array.from(folderSet).sort();
  }, [scoresData]);

  const handleScoreClick = (id: string) => {
    navigate(`/viewer/${id}`);
  };

  if (!isLocalMode && error) {
    return (
      <div className="library-view">
        <div className="error-message">
          <h2>❌ Verbindungsfehler</h2>
          <p>{error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            Kann keine Verbindung zum Server herstellen. Bitte überprüfe deine Server-Konfiguration.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => window.location.reload()}>Neu laden</button>
            <button 
              onClick={() => window.location.href = '/config/server'}
              style={{ background: '#2196F3' }}
            >
              Server konfigurieren
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wähle Datenquelle basierend auf Modus
  const displayScores = isLocalMode ? localFiles : (scoresData?.scores || []);
  const loading = isLocalMode ? isLoadingLocal : isLoading;

  return (
    <div className="library-view">
      <header className="library-header">
        <h1>🎵 Musiknoten-Bibliothek</h1>
        
        <div className="mode-indicator" style={{
          padding: '8px 16px',
          background: isLocalMode ? '#4CAF50' : '#2196F3',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {isLocalMode ? '📁 Lokal' : '🌐 Server'}
        </div>
        
        {!isLocalMode && healthData && (
          <div className="health-status">
            <span className={`status-indicator ${healthData.status}`}>
              {healthData.status === 'ok' ? '✓' : '✗'}
            </span>
            <span>{healthData.scoreCount} Noten verfügbar</span>
          </div>
        )}
      </header>

      <div className="library-controls">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        
        {!isLocalMode && folders.length > 0 && (
          <select 
            className="folder-filter"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
          >
            <option value="">Alle Ordner</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>
        )}

        {isLocalMode && (
          <button 
            onClick={() => window.location.href = '/config/local'}
            style={{
              padding: '10px 20px',
              background: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Ordner ändern
          </button>
        )}
      </div>

      <InstallPrompt />

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Lade Noten...</p>
        </div>
      ) : (
        <div className="scores-grid">
          {displayScores
            .filter((score: any) => {
              if (!searchTerm) return true;
              const filename = score.filename || '';
              return filename.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .map((score: any) => (
              <ScoreCard
                key={score.id}
                score={score}
                onClick={() => handleScoreClick(score.id)}
              />
            ))}
          {displayScores.length === 0 && (
            <div className="empty-state">
              <p>Keine Noten gefunden</p>
              {isLocalMode ? (
                <p>Wähle einen Ordner mit PDF-Dateien aus</p>
              ) : searchTerm ? (
                <p>Versuche einen anderen Suchbegriff</p>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LibraryView;
