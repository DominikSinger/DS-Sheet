# DS-Sheet - Digitale Notenblätter

Ein vollständiges System zur Verwaltung und Anzeige von Musiknoten (PDF) mit Unterstützung für Desktop, Browser und Tablets.

## 🎵 Übersicht

DS-Sheet ist eine professionelle Lösung für Musiker, Musikschulen und Orchester zur digitalen Verwaltung von Noten. Das System ermöglicht:

- ✅ Zentrale Speicherung aller PDFs auf einem Server/NAS
- ✅ Zugriff von beliebigen Geräten im Netzwerk
- ✅ Optimierte PDF-Anzeige mit Vollbildmodus
- ✅ Fußpedal-Steuerung für blattfreies Spiel
- ✅ Touch-Navigation auf Tablets
- ✅ PWA-Installation auf Android-Geräten
- ✅ Native Desktop-App für PCs

## 🏗️ Architektur

```
┌─────────────────────────────────┐
│  Zentrale Dateiablage (Server)  │
│  /srv/musiknoten oder           │
│  \\SERVER\Musiknoten             │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│    Backend (Node.js/Express)    │
│    Port 3000 - REST API         │
│    - Datei-Indexierung (SQLite) │
│    - PDF-Streaming              │
│    - Auto-Rescan (File Watcher) │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│    Frontend (React/Vite)        │
│    - PWA (Browser/Tablets)      │
│    - Electron (Desktop-App)     │
│    - PDF-Viewer                 │
│    - Keyboard/Touch-Navigation  │
└─────────────────────────────────┘
```

## 🚀 Schnellstart

### 1. Backend starten

```bash
cd server
npm install
cp .env.example .env
# .env bearbeiten: NOTE_ROOT setzen
npm run dev
```

**Server läuft auf**: `http://localhost:3000`

### 2. Frontend starten

```bash
cd client
npm install
npm run dev
```

**App läuft auf**: `http://localhost:5173`

### 3. Browser öffnen

Öffnen Sie `http://localhost:5173` und fügen Sie Noten zum `NOTE_ROOT`-Verzeichnis hinzu.

## 📚 Dokumentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detaillierte Systemarchitektur und Technologieentscheidungen
- **[PWA-SETUP.md](./PWA-SETUP.md)** - Installation und Konfiguration als Progressive Web App
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Komplette Deployment-Anleitung für On-Premise
- **[server/README.md](./server/README.md)** - Backend-Dokumentation
- **[desktop/README.md](./desktop/README.md)** - Electron-Desktop-App

## 🎹 Fußpedal-Unterstützung

Das System unterstützt Bluetooth-Fußpedale, die Tastatur-Events senden:

1. Fußpedal mit Gerät verbinden (Bluetooth/USB)
2. Fußpedal-Software konfigurieren (z.B. PageDown/PageUp)
3. DS-Sheet öffnen und Viewer starten
4. Fußpedal verwenden - funktioniert sofort!

**Unterstützte Tasten**:
- `Space`, `Enter`, `ArrowRight`, `PageDown` → Nächste Seite
- `Backspace`, `ArrowLeft`, `PageUp` → Vorherige Seite
- `F11` → Vollbild umschalten (Desktop)

## 📱 PWA-Installation (Android)

1. Öffnen Sie DS-Sheet in Chrome auf dem Tablet
2. Tippen Sie auf "Installieren" im Banner (oder Menü → "App installieren")
3. Icon erscheint auf dem Home-Screen
4. App öffnet sich im Vollbild wie eine native App

**Voraussetzungen**: Android 10+, Chrome Browser

## 🖥️ Desktop-App

Optional: Native Electron-App für Windows/macOS/Linux

```bash
cd desktop
npm install
npm run dev  # Development-Modus

# Oder Distributable bauen:
npm run package:win   # Windows
npm run package:mac   # macOS
npm run package:linux # Linux
```

## 🛠️ Tech-Stack

| Komponente | Technologie |
|------------|-------------|
| **Backend** | Node.js 20, Express, TypeScript |
| **Datenbank** | SQLite3 (Better-SQLite3) |
| **Frontend** | React 18, TypeScript, Vite |
| **PDF-Viewer** | React-PDF (PDF.js) |
| **Routing** | React Router DOM v6 |
| **State** | React Query (TanStack Query) |
| **Desktop** | Electron 28 |
| **PWA** | Service Worker, Web App Manifest |

## 📦 Projektstruktur

```
DS-Sheet/
├── server/              # Backend (Node.js/Express)
│   ├── src/
│   │   ├── index.ts     # Entry-Point
│   │   ├── routes/      # REST-API-Endpunkte
│   │   ├── services/    # Business-Logic
│   │   └── config/      # Konfiguration
│   ├── package.json
│   └── README.md
│
├── client/              # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/  # React-Komponenten
│   │   ├── hooks/       # Custom Hooks
│   │   ├── services/    # API-Client
│   │   └── types/       # TypeScript-Typen
│   ├── public/
│   │   ├── manifest.json  # PWA-Manifest
│   │   └── sw.js          # Service Worker
│   └── package.json
│
├── desktop/             # Electron-App (optional)
│   ├── src/
│   │   └── main.ts      # Electron Main Process
│   └── package.json
│
├── ARCHITECTURE.md      # Architektur-Dokumentation
├── DEPLOYMENT.md        # Deployment-Guide
└── PWA-SETUP.md         # PWA-Anleitung
```

## 🔒 Sicherheit

- **Path-Traversal-Schutz**: Zugriff nur innerhalb von `NOTE_ROOT`
- **CORS**: Konfigurierbare Allowed-Origins
- **Optional**: Basic Auth für Backend
- **HTTPS**: Self-Signed oder Let's Encrypt

## 🚢 Production-Deployment

Vollständige Anleitung siehe [DEPLOYMENT.md](./DEPLOYMENT.md)

**Kurzversion**:

```bash
# Backend
cd server
npm ci --production
npm run build
# Als Systemd-Service oder Windows-Dienst konfigurieren

# Frontend
cd client
npm ci
npm run build
# dist/ mit Nginx oder IIS ausliefern
```

## 📊 System-Anforderungen

### Server
- **OS**: Ubuntu 22.04 LTS / Debian 12 / Windows Server 2019+
- **CPU**: 2 Cores
- **RAM**: 2 GB (minimum 512 MB)
- **Disk**: 1 GB + Speicher für Noten

### Clients
- **Desktop**: Windows 10+, macOS 11+, Ubuntu 20.04+
- **Browser**: Chrome 90+, Edge 90+, Firefox 88+
- **Tablet**: Android 10+ mit Chrome

## 🤝 Contributing

Contributions sind willkommen! Bitte öffnen Sie ein Issue oder Pull Request.

## 📄 Lizenz

MIT License - Siehe LICENSE-Datei für Details.

## 👥 Support

- **Issues**: GitHub Issue Tracker
- **Dokumentation**: Siehe docs/ Verzeichnis
- **E-Mail**: support@ds-sheet.local

---

**Status**: Production-Ready ✅

Entwickelt für Musiker, von Musikern.
