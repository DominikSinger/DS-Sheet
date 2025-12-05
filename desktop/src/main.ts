import { app, BrowserWindow, globalShortcut, Menu, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Konfiguration
const CONFIG = {
  // Entwicklungsmodus: React Dev Server
  DEV_URL: process.env.ELECTRON_DEV_URL || 'http://localhost:5173',
  // Produktionsmodus: Gebaute React-App
  PROD_PATH: path.join(__dirname, '../app/index.html'),
  // Backend-API-URL
  API_URL: process.env.API_URL || 'http://localhost:3000',
};

let mainWindow: BrowserWindow | null = null;
let isFullscreen = false;

// Prüfe, ob wir im Development-Modus sind
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  // Hauptfenster erstellen
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 768,
    // Für sauberes App-Gefühl optional ohne Frame starten
    // frame: false,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Für Sicherheit: keine Node.js-APIs im Renderer
      sandbox: true,
      // Erlaube Navigation nur zu unseren URLs
      webSecurity: true,
    },
    show: false, // Erst zeigen, wenn bereit
  });

  // Lade die App
  if (isDev) {
    console.log('Development mode - loading from:', CONFIG.DEV_URL);
    mainWindow.loadURL(CONFIG.DEV_URL);
    // DevTools in Development öffnen
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Production mode - loading from:', CONFIG.PROD_PATH);
    if (fs.existsSync(CONFIG.PROD_PATH)) {
      mainWindow.loadFile(CONFIG.PROD_PATH);
    } else {
      console.error('Production build not found at:', CONFIG.PROD_PATH);
      console.error('Please build the React app first: cd client && npm run build');
      app.quit();
      return;
    }
  }

  // Zeige Fenster, wenn Seite geladen ist
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Optional: Vollbild beim Start
    if (process.argv.includes('--fullscreen')) {
      mainWindow?.setFullScreen(true);
      isFullscreen = true;
    }
  });

  // Navigations-Guard: Nur interne URLs erlauben
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Externe Links im Standard-Browser öffnen
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Beim Schließen aufräumen
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Console-Logs aus Renderer-Prozess weiterleiten
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Renderer ${level}]:`, message);
  });
}

function setupGlobalShortcuts() {
  // F11: Vollbild umschalten
  globalShortcut.register('F11', () => {
    if (mainWindow) {
      isFullscreen = !isFullscreen;
      mainWindow.setFullScreen(isFullscreen);
    }
  });

  // ESC: Vollbild beenden
  globalShortcut.register('Escape', () => {
    if (mainWindow && isFullscreen) {
      isFullscreen = false;
      mainWindow.setFullScreen(false);
    }
  });

  // Strg+R / Cmd+R: Seite neu laden (nur Development)
  if (isDev) {
    globalShortcut.register('CommandOrControl+R', () => {
      mainWindow?.reload();
    });
    
    // Strg+Shift+I / Cmd+Shift+I: DevTools
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      mainWindow?.webContents.toggleDevTools();
    });
  }

  // Strg+Q / Cmd+Q: App beenden
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });
}

function createMenu() {
  const template: any[] = [
    {
      label: 'Datei',
      submenu: [
        {
          label: 'Neu laden',
          accelerator: 'CommandOrControl+R',
          click: () => mainWindow?.reload(),
        },
        { type: 'separator' },
        {
          label: 'Beenden',
          accelerator: 'CommandOrControl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Ansicht',
      submenu: [
        {
          label: 'Vollbild',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              isFullscreen = !isFullscreen;
              mainWindow.setFullScreen(isFullscreen);
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Zoom zurücksetzen',
          accelerator: 'CommandOrControl+0',
          click: () => mainWindow?.webContents.setZoomLevel(0),
        },
        {
          label: 'Vergrößern',
          accelerator: 'CommandOrControl+Plus',
          click: () => {
            const level = mainWindow?.webContents.getZoomLevel() || 0;
            mainWindow?.webContents.setZoomLevel(level + 0.5);
          },
        },
        {
          label: 'Verkleinern',
          accelerator: 'CommandOrControl+-',
          click: () => {
            const level = mainWindow?.webContents.getZoomLevel() || 0;
            mainWindow?.webContents.setZoomLevel(level - 0.5);
          },
        },
      ],
    },
  ];

  // DevTools-Menü nur in Development
  if (isDev) {
    template.push({
      label: 'Entwickler',
      submenu: [
        {
          label: 'DevTools',
          accelerator: 'CommandOrControl+Shift+I',
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App-Lifecycle
app.whenReady().then(() => {
  createWindow();
  setupGlobalShortcuts();
  createMenu();

  app.on('activate', () => {
    // macOS: Fenster wiederherstellen, wenn Dock-Icon geklickt
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Alle Fenster geschlossen
app.on('window-all-closed', () => {
  // macOS: App läuft weiter, bis explizit beendet
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// App wird beendet
app.on('will-quit', () => {
  // Alle globalen Shortcuts entfernen
  globalShortcut.unregisterAll();
});

// Single Instance Lock (nur eine App-Instanz)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // Zweite Instanz: Sofort beenden
  app.quit();
} else {
  app.on('second-instance', () => {
    // Wenn jemand versucht, zweite Instanz zu starten: Fokus auf erstes Fenster
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}
