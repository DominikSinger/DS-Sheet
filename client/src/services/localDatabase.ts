/**
 * Lokale Datenbank-Verwaltung für Standalone-Betrieb
 * Funktioniert in Browser (IndexedDB) und in nativen Apps
 */

export interface LocalScore {
  id: string;
  title: string;
  composer?: string;
  folder?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  fileData?: string; // Base64 encoded PDF
  fileSize?: number;
  pageCount?: number;
}

class LocalDatabase {
  private dbName = 'DS-Sheet-DB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Scores Store
        if (!db.objectStoreNames.contains('scores')) {
          const scoresStore = db.createObjectStore('scores', { keyPath: 'id' });
          scoresStore.createIndex('title', 'title', { unique: false });
          scoresStore.createIndex('composer', 'composer', { unique: false });
          scoresStore.createIndex('folder', 'folder', { unique: false });
          scoresStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Files Store (für große PDF-Dateien)
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
      };
    });
  }

  async getAllScores(): Promise<LocalScore[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scores'], 'readonly');
      const store = transaction.objectStore('scores');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getScore(id: string): Promise<LocalScore | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scores'], 'readonly');
      const store = transaction.objectStore('scores');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async addScore(score: LocalScore): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scores'], 'readwrite');
      const store = transaction.objectStore('scores');
      const request = store.add(score);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateScore(score: LocalScore): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scores'], 'readwrite');
      const store = transaction.objectStore('scores');
      const request = store.put(score);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteScore(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scores', 'files'], 'readwrite');
      const scoresStore = transaction.objectStore('scores');
      const filesStore = transaction.objectStore('files');
      
      scoresStore.delete(id);
      filesStore.delete(id);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async saveFile(id: string, fileData: Blob): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.put({ id, data: fileData });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFile(id: string): Promise<Blob | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async searchScores(query: string): Promise<LocalScore[]> {
    const allScores = await this.getAllScores();
    const lowerQuery = query.toLowerCase();
    
    return allScores.filter(score => 
      score.title.toLowerCase().includes(lowerQuery) ||
      score.composer?.toLowerCase().includes(lowerQuery) ||
      score.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async getScoresByFolder(folder: string): Promise<LocalScore[]> {
    const allScores = await this.getAllScores();
    return allScores.filter(score => score.folder === folder);
  }

  async getFolders(): Promise<string[]> {
    const allScores = await this.getAllScores();
    const folders = new Set<string>();
    
    allScores.forEach(score => {
      if (score.folder) folders.add(score.folder);
    });
    
    return Array.from(folders).sort();
  }
}

export const localDB = new LocalDatabase();
