import fs from 'fs';
import path from 'path';
import { config } from '../config';

export class FileService {
  /**
   * Bereinigt und validiert einen relativen Pfad gegen Path Traversal
   */
  public sanitizePath(relativePath: string): string {
    // Entferne führende Slashes
    const cleaned = relativePath.replace(/^[\/\\]+/, '');
    
    // Resolve absoluten Pfad
    const absolutePath = path.resolve(config.noteRoot, cleaned);
    
    // Stelle sicher, dass der Pfad innerhalb von NOTE_ROOT liegt
    if (!absolutePath.startsWith(config.noteRoot)) {
      throw new Error('Path traversal detected');
    }
    
    return absolutePath;
  }

  /**
   * Prüft, ob eine Datei existiert
   */
  public fileExists(absolutePath: string): boolean {
    try {
      return fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile();
    } catch {
      return false;
    }
  }

  /**
   * Gibt einen Read-Stream für eine Datei zurück
   */
  public createReadStream(absolutePath: string): fs.ReadStream {
    return fs.createReadStream(absolutePath);
  }

  /**
   * Gibt Datei-Statistiken zurück
   */
  public getFileStats(absolutePath: string): fs.Stats {
    return fs.statSync(absolutePath);
  }

  /**
   * Gibt den MIME-Type für eine Datei zurück
   */
  public getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export const fileService = new FileService();
