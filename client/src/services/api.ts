import axios from 'axios';
import type { ScoreListResponse, ScoreDetailResponse, HealthResponse, FolderListResponse } from '../types/score';

// API-Base-URL aus localStorage oder Environment
const getApiBaseUrl = (): string => {
  // 1. Prüfe localStorage (für dynamische Konfiguration)
  const stored = localStorage.getItem('ds_sheet_server_url');
  if (stored) {
    return stored;
  }
  
  // 2. Fallback auf Environment Variable
  return import.meta.env.VITE_API_BASE_URL || '';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 Sekunden Timeout
});

// Interceptor für dynamische URL-Updates
export const updateApiBaseUrl = (newUrl: string) => {
  api.defaults.baseURL = newUrl;
};

export const scoresApi = {
  // Health-Check
  getHealth: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/api/health');
    return response.data;
  },

  // Liste aller Noten
  getScores: async (search?: string, folder?: string): Promise<ScoreListResponse> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (folder) params.append('folder', folder);
    
    const response = await api.get<ScoreListResponse>('/api/scores', { params });
    return response.data;
  },

  // Einzelne Noten-Details
  getScoreDetail: async (id: string): Promise<ScoreDetailResponse> => {
    const response = await api.get<ScoreDetailResponse>(`/api/scores/${id}`);
    return response.data;
  },

  // PDF-URL für einen Score
  getScoreFileUrl: (id: string): string => {
    // Prüfe ob es eine lokale Datei ist
    if (id.startsWith('local-')) {
      const storedFiles = localStorage.getItem('ds_sheet_local_files');
      if (storedFiles) {
        const paths = JSON.parse(storedFiles) as string[];
        const index = parseInt(id.replace('local-', ''));
        if (index >= 0 && index < paths.length) {
          return paths[index]; // Lokaler Dateipfad
        }
      }
    }
    return `${getApiBaseUrl()}/api/scores/${id}/file`;
  },

  // Liste aller Ordner
  getFolders: async (): Promise<FolderListResponse> => {
    const response = await api.get<FolderListResponse>('/api/folders');
    return response.data;
  },
};
