import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { Score } from '../types';

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    // Stelle sicher, dass das Datenbank-Verzeichnis existiert
    const dbDir = path.dirname(config.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(config.dbPath);
    this.initialize();
  }

  private initialize(): void {
    // Erstelle Tabelle
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scores (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        relative_path TEXT UNIQUE NOT NULL,
        folder TEXT,
        file_size INTEGER,
        modified_at TEXT,
        pages INTEGER,
        indexed_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_folder ON scores(folder);
      CREATE INDEX IF NOT EXISTS idx_filename ON scores(filename);
      CREATE INDEX IF NOT EXISTS idx_modified ON scores(modified_at);
    `);

    console.log('✅ Datenbank initialisiert');
  }

  public insertScore(score: Omit<Score, 'id' | 'indexedAt'>): string {
    const id = this.generateId(score.relativePath);
    const indexedAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO scores (id, filename, relative_path, folder, file_size, modified_at, pages, indexed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(relative_path) DO UPDATE SET
        filename = excluded.filename,
        folder = excluded.folder,
        file_size = excluded.file_size,
        modified_at = excluded.modified_at,
        pages = excluded.pages,
        indexed_at = excluded.indexed_at
    `);

    stmt.run(
      id,
      score.filename,
      score.relativePath,
      score.folder,
      score.fileSize,
      score.modifiedAt,
      score.pages,
      indexedAt
    );

    return id;
  }

  public getScoreById(id: string): Score | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        filename,
        relative_path as relativePath,
        folder,
        file_size as fileSize,
        modified_at as modifiedAt,
        pages,
        indexed_at as indexedAt
      FROM scores
      WHERE id = ?
    `);

    return stmt.get(id) as Score | null;
  }

  public getAllScores(search?: string, folder?: string): Score[] {
    let query = `
      SELECT 
        id,
        filename,
        relative_path as relativePath,
        folder,
        file_size as fileSize,
        modified_at as modifiedAt,
        pages,
        indexed_at as indexedAt
      FROM scores
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      query += ` AND (filename LIKE ? OR relative_path LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (folder) {
      query += ` AND folder LIKE ?`;
      params.push(`${folder}%`);
    }

    query += ` ORDER BY folder, filename`;

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as Score[];
  }

  public deleteScore(relativePath: string): void {
    const stmt = this.db.prepare('DELETE FROM scores WHERE relative_path = ?');
    stmt.run(relativePath);
  }

  public clearAll(): void {
    this.db.exec('DELETE FROM scores');
  }

  public getCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM scores');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  public getFolders(): string[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT folder 
      FROM scores 
      WHERE folder IS NOT NULL AND folder != ''
      ORDER BY folder
    `);
    
    const results = stmt.all() as { folder: string }[];
    return results.map(r => r.folder);
  }

  private generateId(relativePath: string): string {
    // Einfacher Hash-basierter ID-Generator
    let hash = 0;
    for (let i = 0; i < relativePath.length; i++) {
      const char = relativePath.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  public close(): void {
    this.db.close();
  }
}

// Singleton-Instanz
export const db = new DatabaseService();
