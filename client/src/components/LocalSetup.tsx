import { useState, useEffect } from 'react';
import { localFileService } from '../services/localFileService';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Capacitor } from '@capacitor/core';
import './LocalSetup.css';

interface LocalSetupProps {
  onComplete: (folderPath: string) => void;
}

function LocalSetup({ onComplete }: LocalSetupProps) {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [folderPath, setFolderPath] = useState('');
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

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

  const handleFilePicker = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        setError('Dateiauswahl ist nur auf mobilen Geräten verfügbar');
        return;
      }

      const result = await FilePicker.pickFiles({
        types: ['application/pdf'],
        readData: false,
      });

      if (result.files && result.files.length > 0) {
        const paths = result.files.map(f => f.path).filter((p): p is string => !!p);
        setSelectedFiles(paths);
        
        // Extrahiere gemeinsamen Ordnerpfad
        if (paths.length > 0) {
          const firstPath = paths[0];
          const folderPath = firstPath.substring(0, firstPath.lastIndexOf('/'));
          setFolderPath(folderPath);
          setError('');
        }
      }
    } catch (err) {
      console.error('Fehler beim Datei-Picker:', err);
      setError('Fehler bei der Dateiauswahl. Bitte versuche es erneut.');
    }
  };

  const handleFolderSave = async () => {
    if (!folderPath.trim() && selectedFiles.length === 0) {
      setError('Bitte wähle einen Ordner oder Dateien aus');
      return;
    }

    const pathToSave = folderPath.trim() || (selectedFiles.length > 0 ? 
      selectedFiles[0].substring(0, selectedFiles[0].lastIndexOf('/')) : '');

    if (!pathToSave) {
      setError('Kein gültiger Pfad gefunden');
      return;
    }

    // Speichere Pfad
    localStorage.setItem('ds_sheet_local_folder', pathToSave);
    localStorage.setItem('ds_sheet_mode', 'local');
    onComplete(pathToSave);
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
          <button onClick={handleFilePicker} className="setup-btn picker-btn">
            📂 Dateien durchsuchen
          </button>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <p><strong>{selectedFiles.length} Dateien ausgewählt</strong></p>
              <div className="file-list">
                {selectedFiles.slice(0, 3).map((path, idx) => (
                  <div key={idx} className="file-item">
                    📄 {path.split('/').pop()}
                  </div>
                ))}
                {selectedFiles.length > 3 && (
                  <div className="file-item">... und {selectedFiles.length - 3} weitere</div>
                )}
              </div>
            </div>
          )}

          <div className="or-divider">
            <span>oder</span>
          </div>

          <label htmlFor="folder-path">Ordnerpfad manuell eingeben:</label>
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
            {selectedFiles.length > 0 ? 'Diese Dateien verwenden' : 'Ordner verwenden'}
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
