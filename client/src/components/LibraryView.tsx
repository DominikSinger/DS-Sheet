import { useState, useMemo } from 'react';
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
  
  // Mode wird später für lokale vs. Server-Daten genutzt
  const isLocalMode = mode === 'local';
  if (isLocalMode) {
    // TODO: Implementiere lokalen Datenzugriff
    console.log('Lokaler Modus aktiv');
  }
  
  const { data: scoresData, isLoading, error } = useScores(searchTerm, selectedFolder);
  const { data: healthData } = useHealth();

  // Extrahiere eindeutige Ordner
  const folders = useMemo(() => {
    if (!scoresData?.scores) return [];
    const folderSet = new Set(scoresData.scores.map(s => s.folder).filter(Boolean));
    return Array.from(folderSet).sort();
  }, [scoresData]);

  const handleScoreClick = (id: string) => {
    navigate(`/viewer/${id}`);
  };

  if (error) {
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
              onClick={() => window.location.href = '/config'}
              style={{ background: '#2196F3' }}
            >
              Server konfigurieren
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="library-view">
      <header className="library-header">
        <h1>🎵 Musiknoten-Bibliothek</h1>
        
        {healthData && (
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
        
        {folders.length > 0 && (
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
      </div>

      <InstallPrompt />

      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Lade Noten...</p>
        </div>
      ) : (
        <div className="scores-grid">
          {scoresData?.scores.map(score => (
            <ScoreCard
              key={score.id}
              score={score}
              onClick={() => handleScoreClick(score.id)}
            />
          ))}
          {scoresData?.scores.length === 0 && (
            <div className="empty-state">
              <p>Keine Noten gefunden</p>
              {searchTerm && <p>Versuche einen anderen Suchbegriff</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LibraryView;
