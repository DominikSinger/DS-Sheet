import type { Score } from '../types/score';
import './ScoreCard.css';

interface ScoreCardProps {
  score: Score;
  onClick: () => void;
}

function ScoreCard({ score, onClick }: ScoreCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="score-card" onClick={onClick}>
      <div className="score-card-icon">📄</div>
      <div className="score-card-content">
        <h3 className="score-card-title">{score.filename}</h3>
        {score.folder && (
          <p className="score-card-folder">📁 {score.folder}</p>
        )}
        <div className="score-card-meta">
          {score.pages && <span>📑 {score.pages} Seiten</span>}
          <span>💾 {formatFileSize(score.fileSize)}</span>
          <span>📅 {formatDate(score.modifiedAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;
