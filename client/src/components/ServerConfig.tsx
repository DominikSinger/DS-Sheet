import { useState, useEffect } from 'react';
import './ServerConfig.css';

interface ServerConfigProps {
  onSave: (url: string) => void;
}

function ServerConfig({ onSave }: ServerConfigProps) {
  const [serverUrl, setServerUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Lade gespeicherte URL
    const saved = localStorage.getItem('ds_sheet_server_url');
    if (saved) {
      setServerUrl(saved);
    }
  }, []);

  const handleSave = () => {
    if (!serverUrl.trim()) {
      setError('Bitte gib eine Server-URL ein');
      return;
    }

    // Validiere URL-Format
    try {
      const url = new URL(serverUrl);
      if (!url.protocol.match(/^https?:$/)) {
        setError('URL muss mit http:// oder https:// beginnen');
        return;
      }
    } catch {
      setError('Ungültige URL. Format: http://192.168.1.100:3000');
      return;
    }

    // Speichere und übernehme
    localStorage.setItem('ds_sheet_server_url', serverUrl);
    onSave(serverUrl);
  };

  const exampleUrls = [
    'http://192.168.1.100:3000',
    'http://192.168.178.50:3000',
    'http://10.0.0.50:3000',
  ];

  return (
    <div className="server-config">
      <div className="config-card">
        <div className="config-icon">⚙️</div>
        <h2>Server-Konfiguration</h2>
        <p className="config-description">
          DS-Sheet benötigt eine Verbindung zu deinem Musiknoten-Server.
          Bitte gib die IP-Adresse und den Port deines Servers ein.
        </p>

        <div className="config-form">
          <label htmlFor="server-url">Server-URL:</label>
          <input
            id="server-url"
            type="text"
            value={serverUrl}
            onChange={(e) => {
              setServerUrl(e.target.value);
              setError('');
            }}
            placeholder="http://192.168.1.100:3000"
            autoFocus
          />
          
          {error && <div className="config-error">{error}</div>}

          <button onClick={handleSave} className="config-save-btn">
            Verbinden
          </button>
        </div>

        <div className="config-help">
          <h3>💡 Beispiele:</h3>
          <ul>
            {exampleUrls.map(url => (
              <li key={url}>
                <code>{url}</code>
                <button 
                  onClick={() => setServerUrl(url)}
                  className="use-example-btn"
                >
                  Verwenden
                </button>
              </li>
            ))}
          </ul>

          <h3>📡 Server-IP herausfinden:</h3>
          <p>Auf dem Computer mit dem Server:</p>
          <ul>
            <li><strong>Windows:</strong> <code>ipconfig</code> im CMD</li>
            <li><strong>Linux/Mac:</strong> <code>hostname -I</code> im Terminal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ServerConfig;
