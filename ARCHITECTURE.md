# Musiknoten-Verwaltungssystem - Architektur

## Executive Summary

Ein webbasiertes System zur Verwaltung und Anzeige von Musiknoten (PDFs) mit Multi-Device-Support (Desktop-Browser, Android-Tablets) und zentraler Dateiverwaltung.

## 1. Architekturüberblick

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
├─────────────────┬──────────────────┬────────────────────────┤
│   Desktop Web   │  Android Tablet  │   Electron Desktop     │
│   (Chrome/FF)   │  (Chrome PWA)    │   (Windows/Mac/Linux)  │
└────────┬────────┴────────┬─────────┴──────────┬─────────────┘
         │                 │                    │
         └─────────────────┼────────────────────┘
                           │ HTTPS/HTTP
                    ┌──────▼───────┐
                    │   REST API   │
                    │ Node/Express │
                    └──────┬───────┘
                           │
                    ┌──────▼────────┐
                    │  File System  │
                    │  (NOTE_ROOT)  │
                    │ \\SERVER\NOTES │
                    │ /srv/notes    │
                    └───────────────┘
```

## 2. Tech-Stack-Entscheidungen

### Backend
**Node.js + Express + TypeScript**

**Begründung:**
- ✅ Hervorragende File-Stream-Performance für PDF-Delivery
- ✅ Einfache Integration mit Windows-UNC-Pfaden und Linux-Dateisystemen
- ✅ Große Ecosystem für PDF-Metadaten-Extraktion (pdf-parse)
- ✅ Nicht-blockierendes I/O für parallele Zugriffe
- ✅ TypeScript für Type Safety

**Dependencies:**
- `express` - Web-Framework
- `cors` - Cross-Origin-Support
- `helmet` - Security-Headers
- `morgan` - Logging
- `dotenv` - Konfiguration
- `better-sqlite3` - Lokale Metadaten-DB (siehe Storage-Strategie)
- `chokidar` - File-Watcher für automatisches Rescan

### Frontend
**React + TypeScript + Vite + React-PDF**

**Begründung:**
- ✅ Vite: Schnellste Build-Performance, native ESM, optimiert für moderne Browser
- ✅ React: Große Community, perfekt für SPA
- ✅ TypeScript: Type Safety, bessere IDE-Unterstützung
- ✅ react-pdf: Bewährte PDF.js-Integration mit React
- ✅ React Router v6: Moderne Navigation
- ✅ TanStack Query (React Query): Server State Management, Caching

**Dependencies:**
- `react` + `react-dom`
- `react-router-dom` - Routing
- `react-pdf` - PDF-Rendering
- `@tanstack/react-query` - Data Fetching
- `workbox` - Service Worker / PWA

### Desktop (Optional)
**Electron**

**Begründung:**
- ✅ Nutzt dieselbe React-App
- ✅ Native Fullscreen-Kontrolle
- ✅ Bessere Keyboard-Event-Behandlung
- ✅ Cross-Platform (Windows/macOS/Linux)

## 3. REST-API-Design

### Base URL
```
http://server:3000/api
```

### Endpunkte

#### `GET /api/health`
Health-Check für Monitoring.

**Response:**
```json
{
  "status": "ok",
  "noteRoot": "/srv/notes",
  "accessible": true,
  "scoreCount": 142
}
```

#### `GET /api/scores`
Liste aller Noten mit Metadaten.

**Query Parameters:**
- `search` (optional): Suchstring für Dateinamen
- `folder` (optional): Filterung nach Unterordner

**Response:**
```json
{
  "scores": [
    {
      "id": "abc123",
      "filename": "Beethoven - Mondscheinsonate.pdf",
      "relativePath": "Klassik/Beethoven/Mondscheinsonate.pdf",
      "folder": "Klassik/Beethoven",
      "fileSize": 2457600,
      "modifiedAt": "2025-11-15T10:30:00Z",
      "pages": 8
    }
  ],
  "total": 142
}
```

#### `GET /api/scores/:id`
Metadaten für eine spezifische Noten-Datei.

**Response:**
```json
{
  "id": "abc123",
  "filename": "Beethoven - Mondscheinsonate.pdf",
  "relativePath": "Klassik/Beethoven/Mondscheinsonate.pdf",
  "folder": "Klassik/Beethoven",
  "fileSize": 2457600,
  "modifiedAt": "2025-11-15T10:30:00Z",
  "pages": 8,
  "exists": true
}
```

#### `GET /api/scores/:id/file`
Liefert die PDF-Datei als Stream.

**Headers:**
- `Content-Type: application/pdf`
- `Content-Length: <bytes>`
- `Content-Disposition: inline; filename="..."`
- `Accept-Ranges: bytes` (für Partial Content)

**Response:** Binary PDF Stream

**Unterstützt HTTP Range Requests** für große PDFs (wichtig für mobile Geräte).

#### `POST /api/scores/scan`
Triggert ein Rescan des Notenverzeichnisses.

**Auth:** Erfordert Admin-Token (siehe Security)

**Response:**
```json
{
  "status": "scanning",
  "message": "Scan initiated"
}
```

#### `GET /api/folders`
Liste aller Ordner/Verzeichnisse.

**Response:**
```json
{
  "folders": [
    "Klassik",
    "Klassik/Beethoven",
    "Klassik/Mozart",
    "Jazz",
    "Jazz/Standards"
  ]
}
```

## 4. Storage-Strategie

### Dateispeicherung
**Zentrales Verzeichnis (NOTE_ROOT)**

- Alle PDFs liegen im Dateisystem unter `NOTE_ROOT`
- Kann sein:
  - Windows: `\\FILESERVER\Musiknoten` (UNC)
  - Linux: `/srv/musiknoten`
  - macOS: `/Volumes/Musiknoten`

### Metadaten-Speicherung
**SQLite3 + File Watcher**

**Begründung:**
- ✅ Embedded, keine separate DB-Server nötig
- ✅ Schnelle Queries für Liste/Suche
- ✅ Kleine Footprint
- ✅ ACID-Garantien
- ⚠️ Nur vom Backend-Prozess verwendet (keine Multi-Writer-Konflikte)

**Schema:**
```sql
CREATE TABLE scores (
  id TEXT PRIMARY KEY,           -- Hash von relativePath
  filename TEXT NOT NULL,
  relative_path TEXT UNIQUE NOT NULL,
  folder TEXT,
  file_size INTEGER,
  modified_at TEXT,
  pages INTEGER,
  indexed_at TEXT,
  UNIQUE(relative_path)
);

CREATE INDEX idx_folder ON scores(folder);
CREATE INDEX idx_filename ON scores(filename);
```

**Synchronisierung:**
- Initialer Scan beim Start
- Chokidar überwacht NOTE_ROOT für Änderungen (add/change/unlink)
- Bei Änderungen: DB-Update
- Optionaler manueller Rescan via API

## 5. Frontend-Architektur

### Routen
```
/                    → LibraryView (Übersicht aller Noten)
/viewer/:id          → ViewerPage (PDF-Anzeige)
/offline             → Offline-Fallback (PWA)
```

### Komponenten-Struktur
```
src/
├── components/
│   ├── LibraryView.tsx       // Tabelle/Grid der Noten
│   ├── SearchBar.tsx         // Suche/Filter
│   ├── ScoreCard.tsx         // Einzelner Noten-Eintrag
│   ├── ViewerPage.tsx        // PDF-Viewer mit Navigation
│   ├── PDFViewer.tsx         // react-pdf Wrapper
│   ├── NavigationControls.tsx
│   └── InstallPrompt.tsx     // PWA-Installation
├── hooks/
│   ├── useKeyboardNavigation.ts  // Keyboard/Fußpedal
│   ├── useFullscreen.ts          // Fullscreen API
│   └── useScores.ts              // API-Calls
├── services/
│   └── api.ts                // Axios/Fetch Client
├── types/
│   └── score.ts              // TypeScript Interfaces
└── App.tsx
```

### State Management
**TanStack Query + React Context**

- React Query für Server-State (API-Daten, Caching)
- React Context für UI-State (Fullscreen, aktuelle Seite)
- LocalStorage für User Preferences

## 6. Keyboard/Fußpedal-Strategie

### Event-Handling
Zentrale Keyboard-Event-Listener auf Document-Level:

**Unterstützte Keys:**
```typescript
const NEXT_PAGE_KEYS = ['ArrowRight', 'PageDown', 'Space', 'Enter'];
const PREV_PAGE_KEYS = ['ArrowLeft', 'PageUp', 'Backspace'];
const FULLSCREEN_KEYS = ['F11', 'f'];
const CLOSE_KEYS = ['Escape'];
```

### Fußpedal-Integration
Die meisten Bluetooth-Fußpedale emulieren Keyboard-Events:

**Typische Mappings:**
- Links-Pedal → `ArrowLeft` oder `PageUp`
- Rechts-Pedal → `ArrowRight` oder `PageDown`

**Konfiguration:**
User-Setting in LocalStorage zur Anpassung der Key-Mappings.

### Touch-Gesten
```typescript
// Tap-Zonen auf dem Screen
// Linke 40% → Vorherige Seite
// Rechte 40% → Nächste Seite
// Mitte 20% → Controls anzeigen
```

## 7. PWA-Features

### Installierbarkeit
- `manifest.json` mit Icons, Start-URL, Display-Mode
- Service Worker für Offline-Fähigkeit
- Install-Prompt für Chrome/Android

### Offline-Strategie
**App-Shell-Caching:**
- HTML, CSS, JS werden gecached
- PDF-Files: Network First, dann Cache
- API-Calls: Network Only (mit Error-Handling)

**Partial Offline:**
- Zuletzt angesehene PDFs können gecached werden
- Offline-Indikator im UI

### Fullscreen auf Android
- `display: "fullscreen"` in manifest.json
- Landscape-Orientation bevorzugt
- Theme-Color für Status-Bar

## 8. Multi-Device-Zugriff

### Concurrency-Modell
**Read-Only-System mit Event-Notifications**

Da primär Lesezugriffe stattfinden:
- ✅ Beliebig viele parallele Leser
- ⚠️ Schreibzugriffe (neue PDFs) über Backend-API oder direkt im Filesystem
- File-Watcher erkennt Änderungen automatisch

### Caching-Strategie
- **Backend:** Metadaten in SQLite, File-Watcher aktualisiert
- **Frontend:** React Query mit 5-Minuten-Stale-Time
- **Browser:** Service Worker cached App-Shell + zuletzt verwendete PDFs

### Session-Handling
Kein klassisches Session-Handling nötig (stateless API).
Jeder Client:
- Fragt Liste ab
- Cached lokal
- Nutzt optimistic UI-Updates

## 9. Sicherheit

### Network-Level
**Internes Netzwerk bevorzugt**

Deployment-Szenarien:
1. **Intern:** Server nur im LAN erreichbar (keine externe Firewall-Regel)
2. **VPN:** Zugriff via VPN für Remote-Musiker
3. **Reverse Proxy:** nginx mit HTTPS + Basic Auth

### Authentication
**Zwei Stufen:**

**Stufe 1 (Minimum):**
- Basic Auth über Express-Middleware
- Credentials in `.env`
- Alle API-Endpunkte geschützt

**Stufe 2 (Optional):**
- JWT-basierte Auth
- Login-Page
- User-Management

**Empfehlung für Start:** Basic Auth über Reverse Proxy (nginx)

### Autorisierung
- Lesezugriff: Alle authentifizierten User
- Scan-Endpoint: Admin-Token required
- Keine File-Uploads (PDFs werden direkt im Filesystem abgelegt)

### Path Traversal Protection
```typescript
// Backend validiert alle Pfade
function sanitizePath(relativePath: string): string {
  const resolved = path.resolve(NOTE_ROOT, relativePath);
  if (!resolved.startsWith(NOTE_ROOT)) {
    throw new Error('Path traversal detected');
  }
  return resolved;
}
```

## 10. Performance-Überlegungen

### Backend
- **Stream statt Buffer:** PDFs werden gestreamt, nicht komplett in RAM geladen
- **HTTP Range Support:** Für große PDFs (10MB+)
- **Gzip-Compression:** Für API-Responses (nicht für PDFs)
- **Connection Pooling:** Bei vielen parallelen Requests

### Frontend
- **Lazy Loading:** PDFs werden erst bei Anzeige geladen
- **Virtual Scrolling:** Für große Bibliotheken (1000+ Noten)
- **Image Optimization:** Thumbnails (optional, via pdf-thumbnail)
- **Code Splitting:** React.lazy für Routes

### Network
- **CDN (optional):** Static Assets über CDN
- **HTTP/2:** Wenn via HTTPS deployed
- **Brotli-Compression:** Für JS/CSS

## 11. Deployment-Übersicht

### Produktions-Stack
```
┌─────────────────────────────────────┐
│  nginx (Reverse Proxy + HTTPS)      │
│  Port 443 → Basic Auth              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Node.js Backend (systemd/NSSM)     │
│  Port 3000 (localhost only)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  File System (NOTE_ROOT)            │
│  /srv/musiknoten                    │
│  \\FILESERVER\Musiknoten            │
└─────────────────────────────────────┘
```

### Build-Prozess
```bash
# Backend
cd server
npm run build        # TypeScript → JavaScript
npm run start        # Production

# Frontend
cd client
npm run build        # Vite → dist/
# dist/ wird von nginx ausgeliefert
```

## 12. Erweiterbarkeit

### Zukünftige Features
- **Setlists:** Gruppierung von Noten für Konzerte
- **Annotations:** Markierungen/Notizen auf PDFs (PDF.js Annotations)
- **Transposition:** Automatische Transponierung (externe Services)
- **Metronome:** Integriertes Metronom
- **MIDI-Support:** Fußpedal über Web MIDI API
- **Collaborative Features:** Echtzeit-Sync für Band-Proben

### API-Versionierung
```
/api/v1/scores
/api/v2/scores  (zukünftig)
```

## 13. Testing-Strategie

### Backend
- Unit Tests: Services, Path-Sanitization
- Integration Tests: API-Endpunkte
- Tool: Jest + Supertest

### Frontend
- Component Tests: Vitest + React Testing Library
- E2E Tests: Playwright
- PWA-Tests: Lighthouse CI

## 14. Monitoring & Logging

### Backend
- Morgan für Access-Logs
- Winston für Application-Logs
- Log-Rotation (PM2 oder logrotate)
- Health-Check-Endpoint für Uptime-Monitoring

### Frontend
- Error-Boundary für React-Fehler
- Optional: Sentry für Error-Tracking
- Analytics (optional): Plausible/Matomo (DSGVO-konform)

---

## Quick Start (Was als nächstes?)

1. ✅ Backend erstellen (`server/`)
2. ✅ Frontend erstellen (`client/`)
3. ✅ PWA-Features hinzufügen
4. ✅ Electron-Wrapper (optional)
5. ✅ Deployment-Scripts

Die Implementierung folgt als nächstes!
