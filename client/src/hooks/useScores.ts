import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { scoresApi } from '../services/api';
import type { ScoreListResponse, ScoreDetailResponse, HealthResponse } from '../types/score';

export const useScores = (search?: string, folder?: string, enabled = true): UseQueryResult<ScoreListResponse> => {
  return useQuery({
    queryKey: ['scores', search, folder],
    queryFn: () => scoresApi.getScores(search, folder),
    staleTime: 1000 * 60 * 5, // 5 Minuten
    enabled,
  });
};

export const useScoreDetail = (id: string, enabled = true): UseQueryResult<ScoreDetailResponse> => {
  return useQuery({
    queryKey: ['score', id],
    queryFn: () => scoresApi.getScoreDetail(id),
    enabled: !!id && enabled,
  });
};

export const useHealth = (enabled = true): UseQueryResult<HealthResponse> => {
  return useQuery({
    queryKey: ['health'],
    queryFn: scoresApi.getHealth,
    refetchInterval: 1000 * 60, // 1 Minute
    enabled,
  });
};
