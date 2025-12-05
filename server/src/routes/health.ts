import { Router, Request, Response } from 'express';
import { config } from '../config';
import { db } from '../services/database';
import { fileService } from '../services/file';
import { HealthResponse } from '../types';
import fs from 'fs';

const router = Router();

/**
 * GET /api/health
 * Health-Check für Monitoring
 */
router.get('/health', (req: Request, res: Response) => {
  let accessible = false;
  let error: string | undefined;

  try {
    // Prüfe, ob NOTE_ROOT erreichbar ist
    fs.accessSync(config.noteRoot, fs.constants.R_OK);
    accessible = true;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unbekannter Fehler';
  }

  const scoreCount = accessible ? db.getCount() : 0;

  const response: HealthResponse = {
    status: accessible ? 'ok' : 'error',
    noteRoot: config.noteRoot,
    accessible,
    scoreCount,
    error,
  };

  const statusCode = accessible ? 200 : 503;
  res.status(statusCode).json(response);
});

/**
 * GET /api/version
 * API-Version und Server-Info
 */
router.get('/version', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    apiVersion: 'v1',
    nodeVersion: process.version,
    environment: config.nodeEnv,
  });
});

export default router;
