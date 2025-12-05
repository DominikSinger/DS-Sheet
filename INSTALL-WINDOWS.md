# DS-Sheet - Windows Installation (Desktop-App)

## Voraussetzungen
- Windows 10 (64-bit) oder neuer
- Mindestens 4 GB RAM
- 500 MB freier Festplattenspeicher
- Verbindung zum Server (im gleichen Netzwerk)

## Option 1: Installer-Version (Empfohlen)

### 1. Installer herunterladen

Die Windows-Installer-Datei wird im Build-Prozess erstellt:
- Datei: `DS-Sheet Setup 1.0.0.exe`
- Speicherort: `desktop/release/DS-Sheet Setup 1.0.0.exe`

### 2. Installation durchführen

1. **Doppelklick** auf `DS-Sheet Setup 1.0.0.exe`
2. Windows SmartScreen-Warnung (falls angezeigt):
   - Klicken Sie auf **"Weitere Informationen"**
   - Klicken Sie auf **"Trotzdem ausführen"**
   - (Warnung erscheint bei unsigned Apps - ist normal)
3. Wählen Sie **Installationsort** (Standard: `C:\Users\[Username]\AppData\Local\Programs\DS-Sheet`)
4. Optional: Häkchen bei "Desktop-Verknüpfung erstellen"
5. Klicken Sie auf **"Installieren"**
6. Warten Sie, bis Installation abgeschlossen ist
7. ✅ Fertig! DS-Sheet ist installiert

### 3. Erste Konfiguration

Beim ersten Start muss die Server-URL konfiguriert werden:

1. Öffnen Sie DS-Sheet über:
   - **Startmenü** → "DS-Sheet"
   - Oder **Desktop-Verknüpfung** (falls erstellt)
2. Die App verbindet sich automatisch mit dem konfigurierten Backend

**Server-URL ändern:**

Die Desktop-App nutzt standardmäßig `http://localhost:3000` für die API.

Für einen Server im Netzwerk:
1. Erstellen Sie eine Datei: `C:\Users\[Username]\AppData\Local\DS-Sheet\config.json`
2. Inhalt:
```json
{
  "apiUrl": "http://192.168.1.100:3000"
}
```
3. Ersetzen Sie `192.168.1.100` durch Ihre Server-IP
4. Starten Sie DS-Sheet neu

## Option 2: Portable Version

### 1. Portable-EXE herunterladen

- Datei: `DS-Sheet 1.0.0.exe` (Portable)
- Speicherort: `desktop/release/DS-Sheet 1.0.0.exe`

### 2. Verwendung

1. Kopieren Sie `DS-Sheet 1.0.0.exe` an einen beliebigen Ort (z.B. USB-Stick, Desktop)
2. **Doppelklick** zum Starten - keine Installation nötig!
3. Alle Einstellungen werden im gleichen Ordner gespeichert

**Vorteile:**
- ✅ Keine Installation erforderlich
- ✅ Läuft von USB-Stick
- ✅ Keine Admin-Rechte nötig
- ✅ Hinterlässt keine Spuren im System

## App verwenden

### Erste Schritte

1. **App starten**: Startmenü → DS-Sheet
2. **Bibliothek**: Übersicht aller verfügbaren Noten
3. **Noten öffnen**: Klick auf eine Note öffnet den Viewer
4. **Navigation**:
   - Pfeiltasten ← → oder PageUp/PageDown
   - Buttons unten: "Zurück", "Vorherige Seite", "Nächste Seite"
   - **Fußpedal**: Funktioniert sofort (siehe unten)

### Vollbild-Modus

- **F11**: Vollbild ein/aus
- **Escape**: Vollbild beenden
- Menü → Ansicht → Vollbild

### Tastatur-Shortcuts

| Shortcut | Funktion |
|----------|----------|
| **F11** | Vollbild umschalten |
| **Escape** | Vollbild beenden |
| **→ / PageDown / Space** | Nächste Seite |
| **← / PageUp / Backspace** | Vorherige Seite |
| **Strg + Q** | App beenden |
| **Strg + R** | Seite neu laden |
| **Strg + 0** | Zoom zurücksetzen |
| **Strg + Plus** | Vergrößern |
| **Strg + Minus** | Verkleinern |

## Fußpedal einrichten

DS-Sheet unterstützt Bluetooth- und USB-Fußpedale ohne zusätzliche Konfiguration!

### 1. Fußpedal verbinden

**Bluetooth-Fußpedal:**
1. Windows-Einstellungen → Bluetooth & Geräte
2. "Gerät hinzufügen"
3. Fußpedal in Pairing-Modus versetzen
4. Auswählen und verbinden

**USB-Fußpedal:**
1. Einfach einstecken - Windows erkennt es automatisch als Tastatur

### 2. Fußpedal konfigurieren

Die meisten Fußpedale haben eigene Software zur Konfiguration:

**Empfohlene Tastenzuordnung:**
- **Linkes Pedal**: `PageUp` oder `ArrowLeft` (Vorherige Seite)
- **Rechtes Pedal**: `PageDown` oder `Space` (Nächste Seite)
- **Mittleres Pedal** (falls vorhanden): `F11` (Vollbild)

### 3. Testen

1. Öffnen Sie eine Note im Viewer
2. Betätigen Sie das Fußpedal
3. Seite sollte umblättern
4. ✅ Funktioniert sofort ohne weitere Einrichtung!

**Gängige Fußpedal-Modelle:**
- AirTurn BT200S / BT500
- PageFlip Cicada / Firefly
- Donner Bluetooth Page Turner
- IK Multimedia iRig BlueTurn

## Updates

### Automatische Update-Benachrichtigung

DS-Sheet prüft automatisch auf Updates (falls konfiguriert).

### Manuelles Update

1. Alte Version deinstallieren:
   - Einstellungen → Apps → DS-Sheet → Deinstallieren
   - Oder: Programme und Features → DS-Sheet → Deinstallieren
2. Neue Installer-Version herunterladen
3. Neue Version installieren (siehe oben)

**Hinweis:** Ihre Einstellungen bleiben erhalten!

## App deinstallieren

### Methode 1: Windows-Einstellungen
1. **Einstellungen** → **Apps** → **Installierte Apps**
2. Suchen Sie **"DS-Sheet"**
3. Klicken Sie auf **"Deinstallieren"**
4. Bestätigen Sie

### Methode 2: Programme und Features
1. **Systemsteuerung** → **Programme** → **Programme und Features**
2. Suchen Sie **"DS-Sheet"**
3. Rechtsklick → **"Deinstallieren"**
4. Bestätigen Sie

### Methode 3: Uninstaller
1. Öffnen Sie: `C:\Users\[Username]\AppData\Local\Programs\DS-Sheet`
2. Doppelklick auf **"Uninstall DS-Sheet.exe"**
3. Bestätigen Sie

## Troubleshooting

### App startet nicht

**Windows Defender blockiert App:**
1. Windows-Sicherheit öffnen
2. Viren- & Bedrohungsschutz → Schutzverlauf
3. DS-Sheet in "Zulässige Bedrohungen" hinzufügen
4. App erneut starten

**Fehlt .NET Framework:**
- Sollte nicht vorkommen (Electron ist selbstständig)
- Falls doch: Windows Update durchführen

### "Keine Verbindung zum Server"

**Server-IP prüfen:**
1. Öffnen Sie Eingabeaufforderung: `Win + R` → `cmd`
2. Tippen Sie: `ping [SERVER-IP]`
3. Wenn "Zeitüberschreitung": Netzwerkverbindung prüfen

**Firewall-Regel hinzufügen:**
1. Windows Defender Firewall → Erweiterte Einstellungen
2. Eingehende Regeln → Neue Regel
3. Port 3000 (Backend) freigeben

### PDFs werden nicht angezeigt

**Cache leeren:**
1. App beenden
2. Ordner löschen: `C:\Users\[Username]\AppData\Roaming\DS-Sheet\Cache`
3. App neu starten

### Fußpedal funktioniert nicht

**Verbindung prüfen:**
1. Öffnen Sie Notepad
2. Drücken Sie Fußpedal
3. Erscheint ein Zeichen/Tastendruck? → Fußpedal funktioniert
4. Nichts passiert? → Fußpedal neu verbinden

**Tastenzuordnung prüfen:**
- Fußpedal-Software öffnen und Tasten überprüfen
- PageDown, Space, Pfeiltasten werden unterstützt

### App läuft langsam

**Mehr RAM freigeben:**
- Andere Programme schließen
- Task-Manager: Strg + Shift + Esc → Prozesse mit hohem RAM-Verbrauch beenden

**App-Cache zurücksetzen:**
- Siehe "PDFs werden nicht angezeigt" oben

## Build-Anleitung (für Entwickler)

Falls Sie die App selbst bauen möchten:

### Voraussetzungen
```bash
# Node.js 20 LTS installieren
# Von: https://nodejs.org
```

### Build-Prozess

```bash
# 1. React-App bauen
cd client
npm install
npm run build

# 2. Electron-Projekt bauen
cd ../desktop
npm install
npm run build

# 3. Windows-Distributable erstellen
npm run package:win

# Output: desktop/release/
# - DS-Sheet Setup 1.0.0.exe (Installer)
# - DS-Sheet 1.0.0.exe (Portable)
```

### Build-Konfiguration anpassen

`desktop/package.json` → `build`-Sektion:
```json
{
  "build": {
    "appId": "com.dssheet.desktop",
    "win": {
      "target": ["nsis", "portable"],
      "icon": "assets/icon.ico"
    }
  }
}
```

## Erweiterte Konfiguration

### Startoptionen ändern

Verknüpfung bearbeiten:
1. Rechtsklick auf DS-Sheet-Verknüpfung
2. Eigenschaften → Verknüpfung
3. Ziel ergänzen:
   - `--fullscreen` - Startet im Vollbild
   - `--disable-gpu` - Deaktiviert GPU (bei Grafik-Problemen)

### Mehrere Profile (Verschiedene Server)

Erstellen Sie mehrere Verknüpfungen mit verschiedenen `config.json`-Dateien:

**Profil 1** (Proberaum):
```
C:\DS-Sheet-Configs\proberaum\config.json
{"apiUrl": "http://192.168.1.100:3000"}
```

**Profil 2** (Konzert):
```
C:\DS-Sheet-Configs\konzert\config.json
{"apiUrl": "http://10.0.0.50:3000"}
```

## System-Anforderungen

✅ **Unterstützt:**
- Windows 10 (64-bit) Version 1809 oder neuer
- Windows 11 (alle Versionen)
- Windows Server 2019+

⚠️ **Nicht empfohlen:**
- Windows 7/8/8.1 (keine Unterstützung mehr)
- 32-bit Systeme (Build muss angepasst werden)

**Hardware-Mindestanforderungen:**
- CPU: Intel Core i3 / AMD Ryzen 3 oder besser
- RAM: 4 GB (8 GB empfohlen)
- Speicher: 500 MB freier Speicherplatz
- Bildschirm: 1280x720 oder höher (1920x1080 empfohlen)

## Support

Bei Problemen:
1. Prüfen Sie diese Anleitung
2. Lesen Sie `desktop/README.md` (technische Details)
3. Kontaktieren Sie Ihren Administrator

---

**Status**: Installationsanleitung für Windows (Electron) ✅
**Zielgruppe**: End-User (Musiker)
**Schwierigkeit**: Einfach - grundlegende Windows-Kenntnisse ausreichend
