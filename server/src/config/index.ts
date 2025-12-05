import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  noteRoot: string;
  dbPath: string;
  basicAuth: {
    enabled: boolean;
    user: string;
    password: string;
  };
  adminToken: string;
  corsOrigins: string[];
  fileWatchEnabled: boolean;
  logLevel: string;
}

function validateNoteRoot(noteRootPath: string): string {
  const resolved = path.resolve(noteRootPath);
  
  // Überprüfe, ob das Verzeichnis existiert
  if (!fs.existsSync(resolved)) {
    console.warn(`⚠️  NOTE_ROOT existiert nicht: ${resolved}`);
    console.warn(`⚠️  Versuche Verzeichnis zu erstellen...`);
    
    try {
      fs.mkdirSync(resolved, { recursive: true });
      console.log(`✅ Verzeichnis erstellt: ${resolved}`);
    } catch (error) {
      throw new Error(
        `NOTE_ROOT konnte nicht erstellt werden: ${resolved}\n` +
        `Fehler: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Überprüfe Leseberechtigung
  try {
    fs.accessSync(resolved, fs.constants.R_OK);
  } catch (error) {
    throw new Error(
      `NOTE_ROOT ist nicht lesbar: ${resolved}\n` +
      `Überprüfe Dateiberechtigungen!`
    );
  }

  return resolved;
}

function getConfig(): Config {
  const noteRoot = process.env.NOTE_ROOT || './test-notes';
  const basicAuthUser = process.env.BASIC_AUTH_USER || '';
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD || '';

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    noteRoot: validateNoteRoot(noteRoot),
    dbPath: process.env.DB_PATH || './data/notes.db',
    basicAuth: {
      enabled: !!(basicAuthUser && basicAuthPassword),
      user: basicAuthUser,
      password: basicAuthPassword,
    },
    adminToken: process.env.ADMIN_TOKEN || 'change-this-secret-token',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map(origin => origin.trim()),
    fileWatchEnabled: process.env.FILE_WATCH_ENABLED === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}

export const config = getConfig();

// Log wichtige Konfiguration beim Start
console.log('📋 Konfiguration:');
console.log(`   Port: ${config.port}`);
console.log(`   Environment: ${config.nodeEnv}`);
console.log(`   NOTE_ROOT: ${config.noteRoot}`);
console.log(`   DB Path: ${config.dbPath}`);
console.log(`   Basic Auth: ${config.basicAuth.enabled ? 'Aktiviert' : 'Deaktiviert'}`);
console.log(`   File Watch: ${config.fileWatchEnabled ? 'Aktiviert' : 'Deaktiviert'}`);
console.log(`   CORS Origins: ${config.corsOrigins.join(', ')}`);
