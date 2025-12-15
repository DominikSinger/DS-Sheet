# Android APK Build - Anleitung

## Übersicht

Es gibt **zwei Wege**, DS-Sheet auf Android zu installieren:

### 1. **PWA-Installation (Empfohlen - EINFACHER)** ✅
- Keine APK-Datei nötig
- Installation direkt über Chrome
- Siehe `INSTALL-ANDROID.md`

### 2. **Native APK (Optional - KOMPLEXER)** 
- Benötigt Android SDK
- Erstellt eigenständige .apk-Datei
- Siehe Anleitung unten

---

## APK Build Voraussetzungen

### Erforderliche Software:
1. **Node.js** (bereits installiert ✓)
2. **Gradle** (bereits installiert ✓)
3. **Android SDK** (muss installiert werden)

### Android SDK Installation:

#### Linux/Mac:
```bash
# Android Command Line Tools herunterladen
wget https://dl.google.com/android/repository/commandlinetools-linux-latest.zip

# Entpacken
mkdir -p ~/android-sdk/cmdline-tools
unzip commandlinetools-linux-latest.zip -d ~/android-sdk/cmdline-tools
mv ~/android-sdk/cmdline-tools/cmdline-tools ~/android-sdk/cmdline-tools/latest

# Umgebungsvariablen setzen
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# SDK Pakete installieren
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
```

#### Windows:
1. Lade Android Studio herunter: https://developer.android.com/studio
2. Installiere Android Studio
3. SDK Manager öffnen und installieren:
   - Android SDK Platform 33
   - Android SDK Build-Tools 33.0.0
4. Setze Umgebungsvariable:
   ```
   ANDROID_HOME=C:\Users\[Username]\AppData\Local\Android\Sdk
   ```

---

## APK Build durchführen

### Option A: Mit Build-Script (Empfohlen)

```bash
cd /workspaces/DS-Sheet
./build-android.sh
```

Das Script:
1. Baut das React-Frontend
2. Synchronisiert mit Capacitor
3. Erstellt die APK mit Gradle
4. Kopiert die APK nach `client/DS-Sheet.apk`

### Option B: Manuelle Schritte

```bash
# 1. Frontend bauen
cd client
npm run build

# 2. Capacitor sync
npx cap sync android

# 3. APK bauen
cd android
./gradlew assembleDebug

# APK finden in:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## APK installieren

### Auf Android-Gerät:

1. **Übertrage die APK** auf dein Gerät:
   - Via USB
   - Via Cloud-Dienst (Google Drive, Dropbox)
   - Via E-Mail

2. **Installation zulassen**:
   - Einstellungen → Sicherheit
   - "Unbekannte Quellen" aktivieren
   - Oder: "Diese Quelle zulassen" für den Dateimanager

3. **APK installieren**:
   - Tippe auf die APK-Datei
   - "Installieren" bestätigen
   - Warte bis Installation abgeschlossen

4. **App starten**:
   - DS-Sheet Icon auf dem Home-Screen
   - Oder in der App-Übersicht

---

## Troubleshooting

### "ANDROID_HOME nicht gesetzt"
- Android SDK muss installiert sein
- Umgebungsvariable setzen (siehe oben)
- Alternative: PWA-Installation nutzen

### "gradlew: Permission denied"
```bash
cd client/android
chmod +x gradlew
```

### Build-Fehler mit Gradle
```bash
# Gradle Wrapper neu erstellen
cd client/android
rm -rf .gradle
./gradlew wrapper --gradle-version=8.0
./gradlew assembleDebug
```

### APK lässt sich nicht installieren
- Prüfe: "Unbekannte Quellen" erlaubt?
- Prüfe: Ist bereits eine Version installiert?
  - Deinstalliere alte Version zuerst
- Prüfe: APK-Datei vollständig heruntergeladen?

---

## Unterschied: APK vs. PWA

| Feature | Native APK | PWA |
|---------|-----------|-----|
| Installation | .apk-Datei nötig | Direkt über Browser |
| Android SDK nötig? | ✅ Ja | ❌ Nein |
| Funktionen | Identisch | Identisch |
| Updates | Neue APK installieren | Automatisch |
| Speicher | ~10 MB | ~5 MB |
| **Empfehlung** | Für Entwickler | **Für Endnutzer** ✅ |

---

## Fazit

**Für die meisten Nutzer ist die PWA-Installation die beste Wahl!**

Siehe `INSTALL-ANDROID.md` für die einfache PWA-Installation.

Die native APK ist nur nötig wenn:
- Offline-Installation ohne Serververbindung gewünscht
- Spezielle Android-Features benötigt werden
- Entwicklung/Testing erforderlich ist
