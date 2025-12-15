import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LibraryView from './components/LibraryView';
import ViewerPage from './components/ViewerPage';
import OfflinePage from './components/OfflinePage';
import ServerConfig from './components/ServerConfig';
import { updateApiBaseUrl } from './services/api';

function App() {
  const [serverConfigured, setServerConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Prüfe, ob Server-URL bereits konfiguriert ist
    const savedUrl = localStorage.getItem('ds_sheet_server_url');
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (savedUrl || envUrl) {
      setServerConfigured(true);
    }
    setIsChecking(false);
  }, []);

  const handleServerSave = (url: string) => {
    updateApiBaseUrl(url);
    setServerConfigured(true);
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

  if (!serverConfigured) {
    return <ServerConfig onSave={handleServerSave} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LibraryView />} />
        <Route path="/viewer/:id" element={<ViewerPage />} />
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="/config" element={<ServerConfig onSave={handleServerSave} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
