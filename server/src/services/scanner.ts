import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { db } from './database';
import pdfParse from 'pdf-parse';

export class ScannerService {
  private isScanning = false;

  public async scanDirectory(): Promise<{
    scanned: number;
    added: number;
    updated: number;
    removed: number;
  }> {
    if (this.isScanning) {
      throw new Error('Scan bereits in Bearbeitung');
    }

    this.isScanning = true;
    console.log('🔍 Starte Scan von:', config.noteRoot);

    try {
      const stats = {
        scanned: 0,
        added: 0,
        updated: 0,
        removed: 0,
      };

      // 1. Sammle alle PDF-Dateien
      const foundFiles = new Set<string>();
      await this.scanRecursive(config.noteRoot, foundFiles, stats);

      // 2. Entferne gelöschte Dateien aus DB
      const allScores = db.getAllScores();
      for (const score of allScores) {
        if (!foundFiles.has(score.relativePath)) {
          db.deleteScore(score.relativePath);
          stats.removed++;
          console.log(`   ➖ Entfernt: ${score.relativePath}`);
        }
      }

      console.log(`✅ Scan abgeschlossen: ${stats.scanned} Dateien gescannt, ${stats.added} neu, ${stats.updated} aktualisiert, ${stats.removed} entfernt`);
      return stats;
    } finally {
      this.isScanning = false;
    }
  }

  private async scanRecursive(
    dir: string,
    foundFiles: Set<string>,
    stats: { scanned: number; added: number; updated: number }
  ): Promise<void> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Rekursiv in Unterverzeichnisse
        await this.scanRecursive(fullPath, foundFiles, stats);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
        stats.scanned++;
        await this.indexFile(fullPath, foundFiles, stats);
      }
    }
  }

  private async indexFile(
    fullPath: string,
    foundFiles: Set<string>,
    stats: { added: number; updated: number }
  ): Promise<void> {
    const relativePath = path.relative(config.noteRoot, fullPath);
    foundFiles.add(relativePath);

    const fileStats = fs.statSync(fullPath);
    const filename = path.basename(fullPath);
    const folder = path.dirname(relativePath);

    // Prüfe, ob Datei bereits in DB existiert
    const existingScore = db.getAllScores().find(s => s.relativePath === relativePath);
    
    let pages: number | null = null;
    
    // Extrahiere Seitenzahl (nur für neue Dateien oder wenn sich modified_at geändert hat)
    if (!existingScore || existingScore.modifiedAt !== fileStats.mtime.toISOString()) {
      pages = await this.extractPageCount(fullPath);
      
      db.insertScore({
        filename,
        relativePath,
        folder: folder === '.' ? '' : folder,
        fileSize: fileStats.size,
        modifiedAt: fileStats.mtime.toISOString(),
        pages,
      });

      if (existingScore) {
        stats.updated++;
        console.log(`   🔄 Aktualisiert: ${relativePath}`);
      } else {
        stats.added++;
        console.log(`   ➕ Neu: ${relativePath}`);
      }
    }
  }

  private async extractPageCount(filePath: string): Promise<number | null> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.numpages;
    } catch (error) {
      console.warn(`   ⚠️  Konnte Seitenzahl nicht extrahieren für ${filePath}:`, error);
      return null;
    }
  }

  public addFile(fullPath: string): void {
    if (!fullPath.toLowerCase().endsWith('.pdf')) {
      return;
    }

    console.log('➕ Neue Datei erkannt:', fullPath);
    const foundFiles = new Set<string>();
    const stats = { scanned: 1, added: 0, updated: 0 };
    this.indexFile(fullPath, foundFiles, stats).catch(err => {
      console.error('Fehler beim Indexieren:', err);
    });
  }

  public changeFile(fullPath: string): void {
    if (!fullPath.toLowerCase().endsWith('.pdf')) {
      return;
    }

    console.log('🔄 Datei geändert:', fullPath);
    const foundFiles = new Set<string>();
    const stats = { scanned: 1, added: 0, updated: 0 };
    this.indexFile(fullPath, foundFiles, stats).catch(err => {
      console.error('Fehler beim Aktualisieren:', err);
    });
  }

  public removeFile(fullPath: string): void {
    if (!fullPath.toLowerCase().endsWith('.pdf')) {
      return;
    }

    console.log('➖ Datei gelöscht:', fullPath);
    const relativePath = path.relative(config.noteRoot, fullPath);
    db.deleteScore(relativePath);
  }
}

export const scanner = new ScannerService();
