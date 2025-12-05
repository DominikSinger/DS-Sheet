import { Router, Request, Response } from 'express';
import { db } from '../services/database';
import { scanner } from '../services/scanner';
import { fileService } from '../services/file';
import { config } from '../config';
import { requireAdminToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  ScoreListResponse,
  ScoreDetailResponse,
  ScanResponse,
  FolderListResponse,
} from '../types';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * GET /api/scores
 * Liste aller Noten mit optionaler Suche und Filterung
 */
router.get('/scores', (req: Request, res: Response) => {
  const { search, folder } = req.query;

  const scores = db.getAllScores(
    search as string | undefined,
    folder as string | undefined
  );

  const response: ScoreListResponse = {
    scores,
    total: scores.length,
  };

  res.json(response);
});

/**
 * GET /api/scores/:id
 * Metadaten für eine spezifische Noten-Datei
 */
router.get('/scores/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const score = db.getScoreById(id);

  if (!score) {
    throw new AppError(404, 'Noten-Datei nicht gefunden');
  }

  // Prüfe, ob Datei noch existiert
  const absolutePath = fileService.sanitizePath(score.relativePath);
  const exists = fileService.fileExists(absolutePath);

  const response: ScoreDetailResponse = {
    ...score,
    exists,
  };

  res.json(response);
});

/**
 * GET /api/scores/:id/file
 * Liefert die PDF-Datei als Stream
 */
router.get('/scores/:id/file', (req: Request, res: Response) => {
  const { id } = req.params;

  const score = db.getScoreById(id);

  if (!score) {
    throw new AppError(404, 'Noten-Datei nicht gefunden');
  }

  const absolutePath = fileService.sanitizePath(score.relativePath);

  if (!fileService.fileExists(absolutePath)) {
    throw new AppError(404, 'Datei existiert nicht mehr im Dateisystem');
  }

  const stats = fileService.getFileStats(absolutePath);
  const mimeType = fileService.getMimeType(score.filename);

  // Support für Range-Requests (wichtig für große PDFs und Mobile)
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
    const chunksize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(score.filename)}"`,
    });

    const stream = fs.createReadStream(absolutePath, { start, end });
    stream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stats.size,
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(score.filename)}"`,
      'Accept-Ranges': 'bytes',
    });

    const stream = fileService.createReadStream(absolutePath);
    stream.pipe(res);
  }
});

/**
 * POST /api/scores/scan
 * Triggert ein Rescan des Notenverzeichnisses
 * Erfordert Admin-Token
 */
router.post('/scores/scan', requireAdminToken, async (req: Request, res: Response) => {
  try {
    const result = await scanner.scanDirectory();

    const response: ScanResponse = {
      status: 'completed',
      message: 'Scan erfolgreich abgeschlossen',
      scanned: result.scanned,
      added: result.added,
      updated: result.updated,
      removed: result.removed,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('bereits in Bearbeitung')) {
      throw new AppError(409, error.message);
    }
    throw error;
  }
});

/**
 * GET /api/folders
 * Liste aller Ordner/Verzeichnisse
 */
router.get('/folders', (req: Request, res: Response) => {
  const folders = db.getFolders();

  const response: FolderListResponse = {
    folders,
  };

  res.json(response);
});

export default router;
