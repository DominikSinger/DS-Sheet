import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Suche nach Titel, Komponist, etc..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
      {value && (
        <button
          className="clear-button"
          onClick={() => onChange('')}
          aria-label="Suche löschen"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
