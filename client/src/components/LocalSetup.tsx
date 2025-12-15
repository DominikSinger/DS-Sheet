import { useState, useEffect } from 'react';
import { localFileService } from '../services/localFileService';
import './LocalSetup.css';

interface LocalSetupProps {
  onComplete: (folderPath: string) => void;
}

function LocalSetup({ onComplete }: LocalSetupProps) {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [folderPath, setFolderPath] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await localFileService.checkPermissions();
    setHasPermissions(granted);
    setIsChecking(false);

    // Lade gespeicherten Pfad
    const saved = localStorage.getItem('ds_sheet_local_folder');
    if (saved) {
      setFolderPath(saved);
    }
  };

  const requestPermissions = async () => {
    const granted = await localFileService.requestPermissions();
    setHasPermissions(granted);
    
    if (!granted) {
      setError('Berechtigungen wurden nicht erteilt. Bitte erlaube Dateizugriff in den App-Einstellungen.');
    }
  };

  const handleFolderSave = async () => {
    if (!folderPath.trim()) {
      setError('Bitte gib einen Ordnerpfad ein');
      return;
    }

    // Speichere Pfad
    localStorage.setItem('ds_sheet_local_folder', folderPath);
    localStorage.setItem('ds_sheet_mode', 'local');
    onComplete(folderPath);
  };

  const commonFolders = [
    '/storage/emulated/0/Music/Noten',
    '/storage/emulated/0/Documents/Musiknoten',
    '/storage/emulated/0/Download/Noten',
    '/sdcard/Music/Noten',
  ];

  if (isChecking) {
    return (
      <div className="local-setup">
        <div className="setup-card">
          <div className="spinner"></div>
          <p>Prüfe Berechtigungen...</p>
        </div>
      </div>
    );
  }

  if (!hasPermissions) {
    return (
      <div className="local-setup">
        <div className="setup-card">
          <div className="setup-icon">📁</div>
          <h2>Dateizugriff erforderlich</h2>
          <p className="setup-description">
            DS-Sheet benötigt Zugriff auf deinen Gerätespeicher, um PDF-Noten anzuzeigen.
          </p>
          
          <button onClick={requestPermissions} className="setup-btn">
            Berechtigungen erteilen
          </button>

          {error && <div className="setup-error">{error}</div>}

          <div className="setup-help">
            <h3>ℹ️ Warum wird das benötigt?</h3>
            <ul>
              <li>Zugriff auf PDF-Dateien im Musikordner</li>
              <li>Anzeige deiner lokal gespeicherten Noten</li>
              <li>Keine Internetverbindung erforderlich</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="local-setup">
      <div className="setup-card">
        <div className="setup-icon">🎵</div>
        <h2>Lokaler Noten-Ordner</h2>
        <p className="setup-description">
          Wähle den Ordner aus, in dem deine PDF-Noten gespeichert sind.
        </p>

        <div className="setup-form">
          <label htmlFor="folder-path">Ordnerpfad:</label>
          <input
            id="folder-path"
            type="text"
            value={folderPath}
            onChange={(e) => {
              setFolderPath(e.target.value);
              setError('');
            }}
            placeholder="/storage/emulated/0/Music/Noten"
          />
          
          {error && <div className="setup-error">{error}</div>}

          <button onClick={handleFolderSave} className="setup-btn">
            Ordner verwenden
          </button>
        </div>

        <div className="setup-help">
          <h3>💡 Häufige Ordner:</h3>
          <ul>
            {commonFolders.map(path => (
              <li key={path}>
                <code>{path}</code>
                <button 
                  onClick={() => setFolderPath(path)}
                  className="use-folder-btn"
                >
                  Verwenden
                </button>
              </li>
            ))}
          </ul>

          <div className="setup-tip">
            <strong>Tipp:</strong> Lege einen Ordner auf deinem Gerät an und kopiere 
            alle PDF-Noten dorthin. Dann gib hier den vollständigen Pfad an.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalSetup;
