import { useState, useEffect } from 'react';
import './InstallPrompt.css';

function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Prüfe, ob bereits installiert
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Nicht anzeigen, wenn bereits dismissed
  if (localStorage.getItem('pwa-install-dismissed') === 'true') {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <span className="install-icon">📱</span>
        <div className="install-text">
          <strong>Als App installieren</strong>
          <p>Für bessere Nutzung auf deinem Gerät</p>
        </div>
        <button className="install-button" onClick={handleInstall}>
          Installieren
        </button>
        <button className="dismiss-button" onClick={handleDismiss}>
          ✕
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;
