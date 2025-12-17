import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface LocalPDFFile {
  id: string;
  filename: string;
  path: string;
  folder: string;
  fileSize: number;
  modifiedAt: string;
  uri?: string;
}

export interface ScanResult {
  scanned: number;
  added: number;
  errors: string[];
}

class LocalFileService {
  private isNative = Capacitor.isNativePlatform();

  /**
   * Scannt ein lokales Verzeichnis nach PDF-Dateien
   */
  async scanDirectory(dirPath: string): Promise<ScanResult> {
    const result: ScanResult = {
      scanned: 0,
      added: 0,
      errors: [],
    };

    try {
      if (!this.isNative) {
        // Browser-Modus: Nutze File System Access API
        result.errors.push('Browser-Modus: Bitte Verzeichnis manuell auswählen');
        return result;
      }

      // Native App: Scanne Verzeichnis
      const files = await this.listFiles(dirPath);
      result.scanned = files.length;
      result.added = files.length;

      return result;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unbekannter Fehler');
      return result;
    }
  }

  /**
   * Listet alle Dateien in einem Verzeichnis auf
   */
  async listFiles(path: string): Promise<LocalPDFFile[]> {
    try {
      if (!this.isNative) {
        return [];
      }

      const result = await Filesystem.readdir({
        path: path,
        directory: Directory.External,
      });

      const pdfFiles: LocalPDFFile[] = [];

      for (const file of result.files) {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          const stat = await Filesystem.stat({
            path: `${path}/${file.name}`,
            directory: Directory.External,
          });

          pdfFiles.push({
            id: this.generateId(`${path}/${file.name}`),
            filename: file.name,
            path: `${path}/${file.name}`,
            folder: path,
            fileSize: stat.size,
            modifiedAt: new Date(stat.mtime).toISOString(),
            uri: stat.uri,
          });
        }
      }

      return pdfFiles;
    } catch (error) {
      console.error('Fehler beim Lesen des Verzeichnisses:', error);
      return [];
    }
  }

  /**
   * Liest eine PDF-Datei als Base64
   */
  async readPDFFile(path: string): Promise<string> {
    try {
      const result = await Filesystem.readFile({
        path: path,
        directory: Directory.External,
      });

      return result.data as string;
    } catch (error) {
      console.error('Fehler beim Lesen der Datei:', error);
      throw error;
    }
  }

  /**
   * Prüft, ob eine Datei existiert
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      await Filesystem.stat({
        path: path,
        directory: Directory.External,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fordert Berechtigungen an (Android)
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.isNative) {
      return true; // Browser braucht keine Permissions
    }

    try {
      const result = await Filesystem.requestPermissions();
      return result.publicStorage === 'granted';
    } catch (error) {
      console.error('Fehler bei Berechtigungsanfrage:', error);
      return false;
    }
  }

  /**
   * Prüft, ob Berechtigungen erteilt sind
   */
  async checkPermissions(): Promise<boolean> {
    if (!this.isNative) {
      return true;
    }

    try {
      const result = await Filesystem.checkPermissions();
      return result.publicStorage === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Importiert ausgewählte Dateien direkt in die Datenbank
   */
  async importSelectedFiles(filePaths: string[]): Promise<ScanResult> {
    const result: ScanResult = {
      scanned: filePaths.length,
      added: 0,
      errors: [],
    };

    // Dynamischer Import von localDatabase
    const { localDatabase } = await import('./localDatabase');
    await localDatabase.init();

    for (const filePath of filePaths) {
      try {
        const filename = filePath.split('/').pop() || 'unknown.pdf';
        const folder = filePath.substring(0, filePath.lastIndexOf('/'));
        
        // Erstelle Score-Eintrag
        const score = {
          id: this.generateId(filePath),
          title: filename.replace(/\.pdf$/i, ''),
          composer: '',
          folder: folder,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          fileSize: 0,
        };

        // Prüfe ob Score bereits existiert
        const existing = await localDatabase.getScore(score.id);
        if (!existing) {
          await localDatabase.addScore(score);
          result.added++;
        } else {
          // Aktualisiere bestehenden Score
          await localDatabase.updateScore({
            ...existing,
            updatedAt: new Date().toISOString(),
          });
          result.added++;
        }

        // Speichere Dateipfad für späteren Zugriff
        localStorage.setItem(`ds_sheet_file_path_${score.id}`, filePath);
      } catch (error) {
        result.errors.push(`${filePath}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    }

    return result;
  }

  /**
   * Generiert eine ID aus dem Pfad
   */
  private generateId(path: string): string {
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      const char = path.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

export const localFileService = new LocalFileService();
