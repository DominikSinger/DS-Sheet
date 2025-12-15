export interface Score {
  id: string;
  filename: string;
  relativePath: string;
  folder: string;
  fileSize: number;
  modifiedAt: string;
  pages: number | null;
  indexedAt: string;
}

export interface ScoreListResponse {
  scores: Score[];
  total: number;
}

export interface ScoreDetailResponse extends Score {
  exists: boolean;
  score?: Score;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  noteRoot: string;
  accessible: boolean;
  scoreCount: number;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface FolderListResponse {
  folders: string[];
}
