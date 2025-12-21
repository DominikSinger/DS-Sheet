import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import LibraryView from './components/LibraryView';
import ViewerPage from './components/ViewerPage';
import OfflinePage from './components/OfflinePage';
import ServerConfig from './components/ServerConfig';
import LocalSetup from './components/LocalSetup';
import { updateApiBaseUrl } from './services/api';

type AppMode = 'local' | 'server' | 'none';

function App() {
  const [mode, setMode] = useState<AppMode>('none');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = () => {
    try {
      console.log('Checking configuration...');
      console.log('Platform:', Capacitor.getPlatform());
      console.log('Native Platform:', Capacitor.isNativePlatform());
      
      // Prüfe, welcher Modus bereits konfiguriert ist
      const savedMode = localStorage.getItem('ds_sheet_mode') as AppMode;
      const localFolder = localStorage.getItem('ds_sheet_local_folder');
      const serverUrl = localStorage.getItem('ds_sheet_server_url');
      const envUrl = import.meta.env.VITE_API_BASE_URL;

      console.log('Saved mode:', savedMode);
      console.log('Local folder:', localFolder);
      
      // Für native Apps: Standard auf 'local' setzen
      if (Capacitor.isNativePlatform() && !savedMode) {
        console.log('Native platform detected, setting local mode');
        localStorage.setItem('ds_sheet_mode', 'local');
        setMode('local');
      } else if (savedMode === 'local' && localFolder) {
        console.log('Using local mode');
        setMode('local');
      } else if (savedMode === 'server' && (serverUrl || envUrl)) {
        console.log('Using server mode');
        setMode('server');
        if (serverUrl) {
          updateApiBaseUrl(serverUrl);
        }
      } else {
        console.log('No mode configured');
        setMode('none');
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
      // Fallback zu local mode bei Fehler
      setMode('local');
    } finally {
      setIsChecking(false);
    }
  };

  const handleLocalSetup = (folderPath: string) => {
    localStorage.setItem('ds_sheet_mode', 'local');
    localStorage.setItem('ds_sheet_local_folder', folderPath);
    setMode('local');
  };

  const handleServerSetup = (url: string) => {
    localStorage.setItem('ds_sheet_mode', 'server');
    updateApiBaseUrl(url);
    setMode('server');
  };

  const handleModeSelect = (selectedMode: AppMode) => {
    setMode(selectedMode);
  };

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#1e1e1e',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎵</div>
          <div>DS-Sheet wird geladen...</div>
        </div>
      </div>
    );
  }

  // Modus-Auswahl bei erstem Start
  if (mode === 'none') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎵</div>
          <h1 style={{ fontSize: '28px', color: '#333', margin: '0 0 16px 0' }}>
            Willkommen bei DS-Sheet
          </h1>
          <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
            Wähle, wie du deine Noten verwenden möchtest:
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => handleModeSelect('local')}
              style={{
                padding: '20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              📁 Lokale Dateien
              <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '8px', opacity: 0.9 }}>
                PDFs von deinem Gerät
              </div>
            </button>
            
            <button
              onClick={() => handleModeSelect('server')}
              style={{
                padding: '20px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🌐 Netzwerk-Server
              <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '8px', opacity: 0.9 }}>
                Zugriff auf zentralen Server
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Zeige Setup-Screens je nach Modus
  if (mode === 'local') {
    const localFolder = localStorage.getItem('ds_sheet_local_folder');
    if (!localFolder) {
      return <LocalSetup onComplete={handleLocalSetup} />;
    }
  }

  if (mode === 'server') {
    const serverUrl = localStorage.getItem('ds_sheet_server_url');
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (!serverUrl && !envUrl) {
      return <ServerConfig onSave={handleServerSetup} />;
    }
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LibraryView mode={mode} />} />
        <Route path="/viewer/:id" element={<ViewerPage mode={mode} />} />
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="/config/server" element={<ServerConfig onSave={handleServerSetup} />} />
        <Route path="/config/local" element={<LocalSetup onComplete={handleLocalSetup} />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
