# DS-Sheet Desktop App

Electron-basierte Desktop-Anwendung für Windows, macOS und Linux.

## Features

- Native Desktop-App für alle Plattformen
- Vollbild-Modus mit F11
- Globale Tastatur-Shortcuts
- Integrierte PDF-Anzeige
- Fußpedal-Unterstützung (Keyboard-Events)
- Single-Instance (nur eine App-Instanz)

## Installation

```bash
cd desktop
npm install
```

## Development

### 1. React-App im Dev-Modus starten

```bash
cd client
npm run dev
# Läuft auf http://localhost:5173
```

### 2. Electron starten

```bash
cd desktop
npm run dev
```

Die Electron-App lädt automatisch die React-App vom Dev-Server.

## Production Build

### 1. React-App bauen

```bash
cd client
npm run build
# Output: client/dist/
```

### 2. Electron kompilieren

```bash
cd desktop
npm run build
```

### 3. Distributable erstellen

```bash
# Windows (NSIS Installer + Portable)
npm run package:win

# macOS (DMG + ZIP)
npm run package:mac

# Linux (AppImage + DEB)
npm run package:linux

# Alle Plattformen (benötigt entsprechendes OS)
npm run package:all
```

**Output**: `desktop/release/`

## Distributables

### Windows
- `DS-Sheet Setup 1.0.0.exe` - Installer (NSIS)
- `DS-Sheet 1.0.0.exe` - Portable Version

### macOS
- `DS-Sheet-1.0.0.dmg` - Disk Image
- `DS-Sheet-1.0.0-mac.zip` - ZIP-Archiv

### Linux
- `DS-Sheet-1.0.0.AppImage` - Universal (alle Distros)
- `ds-sheet_1.0.0_amd64.deb` - Debian/Ubuntu

## Konfiguration

### Umgebungsvariablen

```bash
# Development: React Dev Server URL
export ELECTRON_DEV_URL=http://localhost:5173

# Backend API URL
export API_URL=http://192.168.1.100:3000

# Development-Modus erzwingen
export NODE_ENV=development
```

### Fullscreen beim Start

```bash
npm run dev -- --fullscreen
# oder
electron dist/main.js --fullscreen
```

## Tastatur-Shortcuts

### Global (immer verfügbar)

| Shortcut | Funktion |
|----------|----------|
| `F11` | Vollbild umschalten |
| `Escape` | Vollbild beenden |
| `Ctrl+Q` / `Cmd+Q` | App beenden |

### Development

| Shortcut | Funktion |
|----------|----------|
| `Ctrl+R` / `Cmd+R` | Seite neu laden |
| `Ctrl+Shift+I` / `Cmd+Shift+I` | DevTools öffnen |

### Ansicht

| Shortcut | Funktion |
|----------|----------|
| `Ctrl+0` / `Cmd+0` | Zoom zurücksetzen |
| `Ctrl++` / `Cmd++` | Vergrößern |
| `Ctrl+-` / `Cmd+-` | Verkleinern |

## Fußpedal-Unterstützung

Bluetooth-Fußpedale, die Tastatur-Events senden, funktionieren out-of-the-box:

1. Fußpedal mit Computer verbinden (Bluetooth/USB)
2. Fußpedal sendet Tastencodes (z.B. PageDown, Space, Arrow Keys)
3. Events werden direkt an die React-App weitergeleitet
4. `useKeyboardNavigation` Hook verarbeitet die Events

**Typische Mappings**:
- Linkes Pedal → `PageUp` / `ArrowLeft`
- Rechtes Pedal → `PageDown` / `ArrowRight` / `Space`

## Icons erstellen

Electron-Builder benötigt Icons in verschiedenen Formaten:

```bash
# Windows: .ico (256x256)
convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 assets/icon.ico

# macOS: .icns (512x512)
mkdir icon.iconset
sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
# ... (weitere Größen)
iconutil -c icns icon.iconset -o assets/icon.icns

# Linux: .png (512x512)
convert icon.png -resize 512x512 assets/icon.png
```

**Tipp**: Online-Tools wie [iConvert Icons](https://iconverticons.com/) verwenden.

## Architektur

```
desktop/
├── src/
│   └── main.ts          # Electron Main Process
├── assets/
│   ├── icon.ico         # Windows Icon
│   ├── icon.icns        # macOS Icon
│   └── icon.png         # Linux Icon
├── dist/                # Kompiliertes TypeScript
├── release/             # Distributables
├── package.json
└── tsconfig.json

Integriert:
../client/dist/          # Gebaute React-App (wird eingebettet)
```

## Build-Prozess

1. **React-App bauen**: Vite erstellt optimierte Produktions-Builds
2. **TypeScript kompilieren**: `tsc` erstellt `dist/main.js`
3. **Electron-Builder**: Packt alles zusammen
   - Kopiert `client/dist/` nach `resources/app/`
   - Erstellt plattform-spezifische Executables
   - Signiert optional (macOS/Windows Code Signing)

## Code-Signing (optional)

### Windows (Authenticode)

```json
// package.json
{
  "build": {
    "win": {
      "certificateFile": "path/to/cert.pfx",
      "certificatePassword": "password"
    }
  }
}
```

### macOS (Apple Developer)

```json
// package.json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)"
    }
  }
}
```

**Hinweis**: Code-Signing vermeidet Sicherheitswarnungen beim ersten Start.

## Auto-Update (optional)

Für automatische Updates mit `electron-updater`:

```bash
npm install electron-updater
```

```typescript
// In main.ts ergänzen:
import { autoUpdater } from 'electron-updater';

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

Benötigt einen Update-Server oder GitHub Releases.

## Troubleshooting

### "Production build not found"

**Problem**: React-App wurde noch nicht gebaut.

**Lösung**:
```bash
cd client
npm run build
cd ../desktop
npm run start
```

### DevTools öffnen sich nicht

**Problem**: Produktionsmodus aktiv.

**Lösung**:
```bash
export NODE_ENV=development
npm run dev
```

### Fußpedal funktioniert nicht

**Problem**: Events kommen nicht an.

**Check**:
1. Fußpedal richtig verbunden? (Bluetooth-Einstellungen)
2. Sendet Fußpedal Tastatur-Events? (In Texteditor testen)
3. DevTools Console: Event-Listener aktiv?

**Debug**:
```javascript
// In Electron DevTools Console:
window.addEventListener('keydown', (e) => console.log(e.key, e.code));
```

### App startet nicht (macOS)

**Problem**: Gatekeeper blockiert unsigned App.

**Lösung**:
```bash
# Rechtsklick → Öffnen
# oder
xattr -cr /Applications/DS-Sheet.app
```

## Performance-Tipps

1. **Hardware-Beschleunigung**: Standard aktiviert für smooth PDF-Rendering
2. **Speicher**: Electron nutzt Chrome-Engine, ca. 150-300 MB RAM
3. **PDF-Caching**: React-App cached PDFs im Service Worker
4. **Single-Instance**: Verhindert mehrfache App-Instanzen

## Vergleich: Desktop vs. Web-App

| Feature | Desktop (Electron) | Web (PWA) |
|---------|-------------------|-----------|
| Installation | Installer/DMG/AppImage | Zum Home-Screen |
| Plattform | Win/Mac/Linux | Browser-abhängig |
| Offline | ✅ Voll | ⚠️ Service Worker |
| Vollbild | ✅ Native | ⚠️ Browser-abhängig |
| Fußpedal | ✅ Direkt | ✅ Über Browser |
| Updates | Manual/Auto-Updater | Automatisch (SW) |
| Größe | ~150 MB | ~5 MB |

**Empfehlung**: 
- **Desktop**: Für stationäre PCs im Studio/Proberaum
- **PWA**: Für Tablets und mobile Nutzung

---

**Status**: Electron-App ist vollständig implementiert und produktionsbereit!
