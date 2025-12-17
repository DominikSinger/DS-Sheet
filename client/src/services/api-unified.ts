/**
 * Unified API Service - Works both online (with server) and offline (local storage)
 * Automatically detects mode and switches between server and local database
 */

import axios from 'axios';
import type { ScoreListResponse, ScoreDetailResponse, HealthResponse, FolderListResponse } from '../types/score';
import { localDatabase, type LocalScore } from './localDatabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_LOCAL_MODE = import.meta.env.VITE_LOCAL_MODE === 'true' || !API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5s timeout for server requests
});

// Convert LocalScore to API format
function localScoreToApiFormat(score: LocalScore): any {
  return {
    id: score.id,
    title: score.title,
    composer: score.composer,
    folder: score.folder,
    tags: score.tags,
    createdAt: score.createdAt,
    updatedAt: score.updatedAt,
    pageCount: score.pageCount,
    fileSize: score.fileSize,
  };
}

export const scoresApi = {
  // Health-Check
  getHealth: async (): Promise<HealthResponse> => {
    if (USE_LOCAL_MODE) {
      await localDatabase.init();
      const scores = await localDatabase.getAllScores();
      return {
        status: 'ok',
        message: 'Local mode active',
        timestamp: new Date().toISOString(),
        noteRoot: 'local',
        accessible: true,
        scoreCount: scores.length,
      };
    }
    
    try {
      const response = await api.get<HealthResponse>('/api/health');
      return response.data;
    } catch (error) {
      // Fallback to local mode if server unavailable
      await localDatabase.init();
      const scores = await localDatabase.getAllScores();
      return {
        status: 'ok',
        message: 'Server unavailable - using local mode',
        timestamp: new Date().toISOString(),
        noteRoot: 'local',
        accessible: true,
        scoreCount: scores.length,
      };
    }
  },

  // Liste aller Noten
  getScores: async (search?: string, folder?: string): Promise<ScoreListResponse> => {
    if (USE_LOCAL_MODE) {
      await localDatabase.init();
      
      let scores: LocalScore[];
      
      if (search) {
        scores = await localDatabase.searchScores(search);
      } else if (folder) {
        scores = await localDatabase.getScoresByFolder(folder);
      } else {
        scores = await localDatabase.getAllScores();
      }
      
      return {
        scores: scores.map(localScoreToApiFormat),
        total: scores.length,
      };
    }
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (folder) params.append('folder', folder);
      
      const response = await api.get<ScoreListResponse>('/api/scores', { params });
      return response.data;
    } catch (error) {
      // Fallback to local database
      await localDatabase.init();
      const scores = await localDatabase.getAllScores();
      return {
        scores: scores.map(localScoreToApiFormat),
        total: scores.length,
      };
    }
  },

  // Einzelne Noten-Details
  getScoreDetail: async (id: string): Promise<ScoreDetailResponse> => {
    if (USE_LOCAL_MODE) {
      await localDatabase.init();
      const score = await localDatabase.getScore(id);
      
      if (!score) {
        throw new Error('Score not found');
      }
      
      return {
        ...localScoreToApiFormat(score),
        exists: true,
      };
    }
    
    try {
      const response = await api.get<ScoreDetailResponse>(`/api/scores/${id}`);
      return response.data;
    } catch (error) {
      // Fallback to local database
      await localDatabase.init();
      const score = await localDatabase.getScore(id);
      
      if (!score) {
        throw error;
      }
      
      return {
        ...localScoreToApiFormat(score),
        exists: true,
      };
    }
  },

  // PDF-URL für einen Score
  getScoreFileUrl: (id: string): string => {
    if (USE_LOCAL_MODE) {
      // In local mode, we'll use object URL from IndexedDB
      return `local://${id}`;
    }
    return `${API_BASE_URL}/api/scores/${id}/file`;
  },

  // Get file as Blob (for local mode)
  getScoreFile: async (id: string): Promise<Blob | null> => {
    if (USE_LOCAL_MODE) {
      await localDatabase.init();
      return await localDatabase.getFile(id);
    }
    
    try {
      const response = await api.get(`/api/scores/${id}/file`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      // Try local fallback
      await localDatabase.init();
      return await localDatabase.getFile(id);
    }
  },

  // Liste aller Ordner
  getFolders: async (): Promise<FolderListResponse> => {
    if (USE_LOCAL_MODE) {
      await localDatabase.init();
      const folders = await localDatabase.getFolders();
      
      return {
        folders: folders,
      };
    }
    
    try {
      const response = await api.get<FolderListResponse>('/api/folders');
      return response.data;
    } catch (error) {
      // Fallback to local database
      await localDatabase.init();
      const folders = await localDatabase.getFolders();
      
      return {
        folders: folders,
      };
    }
  },

  // Add new score (local mode only)
  addScore: async (score: LocalScore, file: File): Promise<void> => {
    await localDatabase.init();
    
    // Save score metadata
    await localDatabase.addScore(score);
    
    // Save file
    await localDatabase.saveFile(score.id, file);
  },

  // Update score (local mode only)
  updateScore: async (score: LocalScore): Promise<void> => {
    await localDatabase.init();
    await localDatabase.updateScore(score);
  },

  // Delete score (local mode only)
  deleteScore: async (id: string): Promise<void> => {
    await localDatabase.init();
    await localDatabase.deleteScore(id);
  },
};
