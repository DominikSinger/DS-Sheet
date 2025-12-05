import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { scoresApi } from '../services/api';
import type { ScoreListResponse, ScoreDetailResponse, HealthResponse } from '../types/score';

export const useScores = (search?: string, folder?: string): UseQueryResult<ScoreListResponse> => {
  return useQuery({
    queryKey: ['scores', search, folder],
    queryFn: () => scoresApi.getScores(search, folder),
    staleTime: 1000 * 60 * 5, // 5 Minuten
  });
};

export const useScoreDetail = (id: string): UseQueryResult<ScoreDetailResponse> => {
  return useQuery({
    queryKey: ['score', id],
    queryFn: () => scoresApi.getScoreDetail(id),
    enabled: !!id,
  });
};

export const useHealth = (): UseQueryResult<HealthResponse> => {
  return useQuery({
    queryKey: ['health'],
    queryFn: scoresApi.getHealth,
    refetchInterval: 1000 * 60, // 1 Minute
  });
};
