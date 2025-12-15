import axios from 'axios';
import type { ScoreListResponse, ScoreDetailResponse, HealthResponse, FolderListResponse } from '../types/score';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    return `${API_BASE_URL}/api/scores/${id}/file`;
  },

  // Liste aller Ordner
  getFolders: async (): Promise<FolderListResponse> => {
    const response = await api.get<FolderListResponse>('/api/folders');
    return response.data;
  },
};
