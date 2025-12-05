# Musiknoten-Backend

Node.js/Express-Backend für das Musiknoten-Verwaltungssystem.

## Features

- ✅ REST-API für Notenverwaltung
- ✅ Rekursives Scanning von PDF-Dateien
- ✅ SQLite-Datenbank für Metadaten
- ✅ Automatischer File-Watcher (Chokidar)
- ✅ HTTP Range-Support für große PDFs
- ✅ Basic Auth (optional)
- ✅ CORS-Konfiguration
- ✅ TypeScript

## Installation

```bash
cd server
npm install
```

## Konfiguration

1. Kopiere `.env.example` nach `.env`:
```bash
cp .env.example .env
```

2. Passe die `.env` an:
```env
# Wichtig: NOTE_ROOT auf dein Notenverzeichnis setzen
NOTE_ROOT=/pfad/zu/deinen/noten
# oder Windows UNC:
# NOTE_ROOT=\\\\FILESERVER\\Musiknoten

PORT=3000
ADMIN_TOKEN=dein-geheimer-token
CORS_ORIGINS=http://localhost:5173
```

## Starten

### Development
```bash
npm run dev
```
Startet den Server mit Hot-Reload (tsx watch).

### Production
```bash
# Build
npm run build

# Start
npm start
```

## API-Endpunkte

### Health & Info
- `GET /api/health` - Health-Check
- `GET /api/version` - API-Version

### Noten
- `GET /api/scores` - Liste aller Noten
  - Query: `?search=beethoven` - Suche
  - Query: `?folder=Klassik` - Filter nach Ordner
- `GET /api/scores/:id` - Metadaten einer Datei
- `GET /api/scores/:id/file` - PDF-Datei (Stream)
- `POST /api/scores/scan` - Manueller Rescan (erfordert Admin-Token)
  - Header: `X-Admin-Token: your-token`

### Ordner
- `GET /api/folders` - Liste aller Ordner

## Verzeichnisstruktur

```
server/
├── src/
│   ├── config/           # Konfiguration
│   ├── middleware/       # Express-Middleware
│   ├── routes/           # API-Routen
│   ├── services/         # Business-Logik
│   │   ├── database.ts   # SQLite-Service
│   │   ├── scanner.ts    # File-Scanner
│   │   ├── watcher.ts    # File-Watcher
│   │   └── file.ts       # File-Operations
│   ├── types/            # TypeScript-Typen
│   └── index.ts          # Entry-Point
├── data/                 # SQLite-DB (erstellt beim Start)
├── test-notes/           # Test-PDFs (optional)
└── package.json
```

## NOTE_ROOT Setup

### Windows

**Lokales Verzeichnis:**
```env
NOTE_ROOT=C:\\Musiknoten
```

**Netzlaufwerk (UNC):**
```env
NOTE_ROOT=\\\\FILESERVER\\Musiknoten
```

**Gemapptes Laufwerk:**
```env
NOTE_ROOT=Z:\\Musiknoten
```

### Linux/macOS

**Lokales Verzeichnis:**
```env
NOTE_ROOT=/srv/musiknoten
```

**NFS-Mount:**
```env
NOTE_ROOT=/mnt/nfs/musiknoten
```

**SMB-Mount:**
```env
NOTE_ROOT=/mnt/samba/musiknoten
```

## File-Watcher

Der File-Watcher überwacht `NOTE_ROOT` automatisch:
- ➕ Neue PDFs werden automatisch indexiert
- 🔄 Geänderte PDFs werden aktualisiert
- ➖ Gelöschte PDFs werden aus der DB entfernt

Deaktivieren:
```env
FILE_WATCH_ENABLED=false
```

## Basic Auth

Für Produktions-Deployment:

```env
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=sicheres-passwort
```

Oder nutze einen Reverse Proxy (nginx) mit Auth.

## Admin-Token

Der `ADMIN_TOKEN` schützt den `/api/scores/scan`-Endpunkt:

```bash
curl -X POST http://localhost:3000/api/scores/scan \
  -H "X-Admin-Token: dein-geheimer-token"
```

## Troubleshooting

### NOTE_ROOT nicht erreichbar
```
❌ NOTE_ROOT ist nicht lesbar: /pfad/zu/noten
   Überprüfe Dateiberechtigungen!
```

**Lösung:**
- Prüfe Pfad: `ls -la /pfad/zu/noten`
- Prüfe Rechte: `chmod +r /pfad/zu/noten`
- Bei Windows UNC: Prüfe Netzwerkverbindung

### Keine PDFs gefunden
```
✅ Scan abgeschlossen: 0 Dateien gescannt
```

**Lösung:**
- Prüfe, ob PDFs im Verzeichnis liegen
- PDFs müssen `.pdf`-Endung haben
- Unterverzeichnisse werden automatisch gescannt

### Port bereits in Verwendung
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Lösung:**
- Ändere `PORT` in `.env`
- Oder stoppe anderen Prozess: `lsof -ti:3000 | xargs kill`

## Development

### Test-Daten erstellen
```bash
mkdir -p test-notes/Klassik/Beethoven
mkdir -p test-notes/Jazz

# Kopiere Test-PDFs
cp /pfad/zu/test.pdf test-notes/Klassik/
```

### Logging
Development: Detailliertes Logging (morgan dev)
Production: Apache Combined Log Format

### Hot-Reload
`npm run dev` nutzt `tsx watch` für automatisches Neuladen bei Code-Änderungen.

## Production Deployment

Siehe `../DEPLOYMENT.md` für:
- Systemd-Service (Linux)
- Windows-Service (NSSM)
- nginx Reverse Proxy
- SSL/HTTPS-Setup

## Scripts

- `npm run dev` - Development-Server mit Hot-Reload
- `npm run build` - TypeScript → JavaScript kompilieren
- `npm start` - Production-Server starten
- `npm run lint` - Code-Linting

## Dependencies

**Runtime:**
- `express` - Web-Framework
- `better-sqlite3` - Embedded-DB
- `chokidar` - File-Watcher
- `pdf-parse` - PDF-Metadaten
- `cors`, `helmet`, `morgan` - Middleware

**Dev:**
- `typescript` - Type-Safety
- `tsx` - TypeScript-Executor
- `@types/*` - Type-Definitionen

## Lizenz

MIT
