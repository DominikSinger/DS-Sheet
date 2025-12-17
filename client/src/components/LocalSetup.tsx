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

      setError('Wähle mehrere PDF-Dateien aus dem Ordner aus...');

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
          
          // Speichere Dateipfade für später
          localStorage.setItem('ds_sheet_local_files', JSON.stringify(paths));
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

    setError(`Importiere ${selectedFiles.length} PDF-Datei(en)...`);

    try {
      // Importiere ausgewählte Dateien direkt
      if (selectedFiles.length > 0) {
        const result = await localFileService.importSelectedFiles(selectedFiles);
        
        if (result.errors.length > 0) {
          console.warn('Import-Fehler:', result.errors);
        }

        // Speichere Dateipfade
        localStorage.setItem('ds_sheet_local_files', JSON.stringify(selectedFiles));
        
        // Zeige Erfolgsmeldung
        setError(`✓ ${result.added} von ${result.scanned} Dateien erfolgreich importiert!`);
        
        // Warte kurz, damit Benutzer die Meldung sieht
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Fallback: Versuche Ordner zu scannen
        const scanResult = await localFileService.scanDirectory(pathToSave);
        
        if (scanResult.errors.length > 0) {
          console.warn('Scan-Fehler:', scanResult.errors);
        }
      }

      // Speichere Konfiguration
      localStorage.setItem('ds_sheet_local_folder', pathToSave);
      localStorage.setItem('ds_sheet_mode', 'local');
      
      onComplete(pathToSave);
    } catch (err) {
      console.error('Fehler beim Import:', err);
      setError('Fehler beim Importieren der Dateien. Bitte versuche es erneut.');
    }
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
        <h2>PDF-Noten auswählen</h2>
        <p className="setup-description">
          Wähle deine PDF-Noten aus, um sie in der App anzuzeigen.
        </p>

        <div className="setup-form">
          {/* Hauptaktion: Dateien auswählen */}
          <button onClick={handleFilePicker} className="setup-btn picker-btn">
            📂 PDF-Dateien auswählen
          </button>

          {/* Ausgewählte Dateien anzeigen */}
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <p className="files-count">✓ {selectedFiles.length} Datei(en) ausgewählt</p>
              <div className="file-list">
                {selectedFiles.slice(0, 5).map((path, idx) => (
                  <div key={idx} className="file-item">
                    📄 {path.split('/').pop()}
                  </div>
                ))}
                {selectedFiles.length > 5 && (
                  <div className="file-item more-files">
                    ... und {selectedFiles.length - 5} weitere
                  </div>
                )}
              </div>
              
              {/* Deutlicher Bestätigungs-Button */}
              <button onClick={handleFolderSave} className="setup-btn confirm-btn">
                ✓ Diese Dateien verwenden
              </button>
            </div>
          )}
          
          {error && <div className="setup-error">{error}</div>}
        </div>

        {/* Erweiterte Optionen ausklappbar */}
        <details className="advanced-options">
          <summary>🔧 Erweiterte Optionen</summary>
          
          <div className="advanced-content">
            <label htmlFor="folder-path">Ordnerpfad manuell eingeben:</label>
            <div className="path-input-group">
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
              <button 
                onClick={handleFolderSave} 
                className="apply-path-btn"
                disabled={!folderPath.trim()}
              >
                Übernehmen
              </button>
            </div>

            <div className="common-folders">
              <h4>Häufige Ordner:</h4>
              {commonFolders.map(path => (
                <button 
                  key={path}
                  onClick={() => setFolderPath(path)}
                  className="folder-suggestion"
                >
                  📁 {path}
                </button>
              ))}
            </div>
          </div>
        </details>

        <div className="setup-help">
          <div className="help-box">
            <strong>💡 So funktioniert's:</strong>
            <ol>
              <li>Tippe auf "PDF-Dateien auswählen"</li>
              <li>Wähle eine oder mehrere PDF-Noten aus</li>
              <li>Tippe auf "Diese Dateien verwenden"</li>
              <li>Fertig! Die Noten erscheinen in deiner Bibliothek</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalSetup;
