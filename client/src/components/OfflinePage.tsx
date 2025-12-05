import './OfflinePage.css';

function OfflinePage() {
  return (
    <div className="offline-page">
      <div className="offline-content">
        <div className="offline-icon">📡</div>
        <h1>Offline</h1>
        <p>Keine Internetverbindung verfügbar.</p>
        <p>Bitte überprüfe deine Netzwerkverbindung.</p>
        <button onClick={() => window.location.reload()}>
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}

export default OfflinePage;
