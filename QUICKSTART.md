# 🚀 DS-Sheet Quick Start Guide

Schnelleinstieg in 5 Minuten!

## Schritt 1: Voraussetzungen prüfen

```bash
# Node.js Version prüfen (benötigt: v20 LTS)
node --version

# Falls nicht installiert:
# https://nodejs.org → Download LTS-Version
```

## Schritt 2: Projekt klonen

```bash
git clone <REPO-URL>
cd DS-Sheet
```

## Schritt 3: Backend starten

```bash
# In Terminal 1:
cd server

# Dependencies installieren
npm install

# .env-Datei erstellen
cp .env.example .env

# .env bearbeiten und NOTE_ROOT setzen:
# NOTE_ROOT=./test-notes

# Test-Verzeichnis erstellen
mkdir -p test-notes

# Server starten
npm run dev
```

**✅ Backend läuft auf:** `http://localhost:3000`

## Schritt 4: Frontend starten

```bash
# In Terminal 2 (neues Terminal öffnen):
cd client

# Dependencies installieren
npm install

# Frontend starten
npm run dev
```

**✅ Frontend läuft auf:** `http://localhost:5173`

## Schritt 5: Browser öffnen

1. Öffne: `http://localhost:5173`
2. Du siehst die Bibliothek (noch leer)
3. Füge PDFs hinzu: Kopiere PDF-Dateien nach `server/test-notes/`
4. Klicke auf "Rescan" oder starte Backend neu
5. ✅ Noten erscheinen in der Bibliothek!

## 🎹 Funktionen testen

### Noten anzeigen
1. Klicke auf eine Note in der Liste
2. PDF-Viewer öffnet sich
3. Nutze Pfeiltasten ← → zum Blättern

### Vollbild
- Drücke **F11** (Desktop)
- Vollbild-Button in der App

### Touch (auf Tablet)
- Tap links = Vorherige Seite
- Tap rechts = Nächste Seite

### Fußpedal
- Verbinde Bluetooth-Fußpedal
- Konfiguriere: PageDown/PageUp
- Öffne Viewer → Funktioniert sofort!

## 📱 PWA auf Android testen

1. Finde deine Server-IP:
   ```bash
   hostname -I  # Linux
   ipconfig     # Windows
   ```

2. Auf Android-Tablet:
   - Öffne Chrome
   - Gehe zu: `http://[SERVER-IP]:5173`
   - Tippe auf "Installieren" im Banner
   - ✅ App ist installiert!

## 🖥️ Windows-Desktop-App bauen

```bash
# React-App bauen
cd client
npm run build

# Electron-App bauen
cd ../desktop
npm install
npm run build

# Windows-Installer erstellen
npm run package:win

# Installer finden:
# desktop/release/DS-Sheet Setup 1.0.0.exe
```

## 🔧 Konfiguration anpassen

### Backend (.env)
```bash
# Server-Port ändern
PORT=3000

# Noten-Verzeichnis (wichtig!)
NOTE_ROOT=/pfad/zu/deinen/noten

# CORS für Frontend
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```bash
# API-URL ändern
VITE_API_BASE_URL=http://localhost:3000
```

## 📚 Nächste Schritte

### Development
- Backend: `server/README.md`
- Frontend: `client/README.md`
- Desktop: `desktop/README.md`

### Production-Deployment
- Siehe: `DEPLOYMENT.md`
- Nginx-Setup, HTTPS, Systemd-Service

### PWA
- Siehe: `PWA-SETUP.md`
- Icons erstellen, Service Worker optimieren

### Installation für End-User
- Android: `INSTALL-ANDROID.md`
- Windows: `INSTALL-WINDOWS.md`

## 🆘 Troubleshooting

### Backend startet nicht
```bash
# Port bereits belegt?
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Anderen Port nutzen:
# .env → PORT=3001
```

### Frontend zeigt keine Noten
```bash
# API erreichbar?
curl http://localhost:3000/api/scores

# CORS-Fehler in Browser Console?
# → server/.env → CORS_ORIGINS prüfen
```

### PDFs werden nicht angezeigt
```bash
# NOTE_ROOT existiert?
ls -la ./test-notes

# Dateien vorhanden?
ls -la ./test-notes/*.pdf

# Backend neu starten (Rescan)
```

## 🎯 Fertig!

Du hast jetzt:
- ✅ Backend läuft
- ✅ Frontend läuft
- ✅ Kannst Noten anzeigen
- ✅ Navigation funktioniert
- ✅ Bereit für weitere Konfiguration

**Viel Erfolg!** 🎵
