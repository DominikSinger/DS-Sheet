import chokidar from 'chokidar';
import { config } from '../config';
import { scanner } from './scanner';

export class WatcherService {
  private watcher: chokidar.FSWatcher | null = null;

  public start(): void {
    if (!config.fileWatchEnabled) {
      console.log('📁 File-Watcher deaktiviert');
      return;
    }

    console.log('👀 Starte File-Watcher für:', config.noteRoot);

    this.watcher = chokidar.watch(config.noteRoot, {
      ignored: /(^|[\/\\])\../, // Ignoriere versteckte Dateien
      persistent: true,
      ignoreInitial: true, // Ignoriere existierende Dateien beim Start
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (path) => scanner.addFile(path))
      .on('change', (path) => scanner.changeFile(path))
      .on('unlink', (path) => scanner.removeFile(path))
      .on('error', (error) => console.error('File-Watcher Fehler:', error));

    console.log('✅ File-Watcher aktiv');
  }

  public stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log('🛑 File-Watcher gestoppt');
    }
  }
}

export const watcher = new WatcherService();
