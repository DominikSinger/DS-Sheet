import './NavigationControls.css';

interface NavigationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

function NavigationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onToggleFullscreen,
  isFullscreen,
}: NavigationControlsProps) {
  return (
    <div className="navigation-controls">
      <div className="controls-group">
        <button
          className="nav-button"
          onClick={onPrevious}
          disabled={currentPage <= 1}
          aria-label="Vorherige Seite"
        >
          ← Zurück
        </button>

        <div className="page-indicator">
          <input
            type="number"
            value={currentPage}
            min={1}
            max={totalPages}
            className="page-input"
            readOnly
          />
          <span className="page-separator">/</span>
          <span className="page-total">{totalPages}</span>
        </div>

        <button
          className="nav-button"
          onClick={onNext}
          disabled={currentPage >= totalPages}
          aria-label="Nächste Seite"
        >
          Weiter →
        </button>
      </div>

      <button
        className="fullscreen-button"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
      >
        {isFullscreen ? '⊗' : '⊕'} {isFullscreen ? 'Beenden' : 'Vollbild'}
      </button>

      <div className="keyboard-hint">
        ⌨️ Pfeiltasten, Leertaste oder Fußpedal zur Navigation
      </div>
    </div>
  );
}

export default NavigationControls;
