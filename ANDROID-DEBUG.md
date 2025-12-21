# Android APK - Schwarzer Bildschirm beheben

## Problem
Nach der Installation zeigt die App einen schwarzen Bildschirm.

## Behobene Probleme

### 1. Content Security Policy (CSP)
✅ **Hinzugefügt in `index.html`:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' https://ssl.gstatic.com 'unsafe-inline' 'unsafe-eval' data: blob: capacitor: https:; ...">
```

### 2. SplashScreen-Handling
✅ **Korrigiert in `capacitor.config.ts`:**
- `launchAutoHide: false` - Manuelles Verstecken
- SplashScreen wird in `main.tsx` versteckt nachdem die App geladen ist

### 3. App-Initialisierung
✅ **Verbessert in `main.tsx`:**
- Capacitor SplashScreen Plugin integriert
- Fehlerbehandlung mit sichtbarer Fehler-UI
- Native Platform Detection

### 4. Native Platform Support
✅ **Android wird automatisch erkannt:**
- Standard-Modus ist "local" für native Apps
- Keine Server-Konfiguration nötig

## Neue APK erstellen

```bash
cd /workspaces/DS-Sheet/client

# 1. Build
npm run build

# 2. Sync
npx cap sync android

# 3. APK erstellen (im Dev Container nicht möglich, auf lokalem System:)
cd android
./gradlew clean assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk ../../install.apk
```

## Debugging

### Chrome Remote Debugging
1. APK auf Android installieren
2. USB-Debugging am Gerät aktivieren
3. Gerät per USB verbinden
4. Chrome öffnen: `chrome://inspect`
5. "Discover USB devices" aktivieren
6. WebView auswählen und Console öffnen

### ADB Logcat
```bash
chmod +x debug-android.sh
./debug-android.sh
```

Zeigt Console-Logs der App in Echtzeit.

## Was zu überprüfen ist:

1. **Laden-Screen sichtbar?** → SplashScreen funktioniert
2. **Weißer statt schwarzer Screen?** → JavaScript Error
3. **App startet nicht?** → Manifest/Permissions Problem
4. **Chrome inspect funktioniert?** → WebView Debug aktivieren

## Wichtige Dateien:

- `/client/index.html` - CSP und Meta-Tags
- `/client/capacitor.config.ts` - Capacitor Konfiguration
- `/client/src/main.tsx` - App-Initialisierung
- `/client/src/App.tsx` - Native Platform Detection
- `/client/android/app/src/main/AndroidManifest.xml` - Android Permissions

## Test-Version

Eine minimale Test-Version wurde erstellt: `/client/test.html`

Um sie zu testen:
1. Ersetze temporär in `capacitor.config.ts`: `webDir: 'test'`
2. Kopiere `test.html` nach `/client/test/index.html`
3. Build und Test

## Weitere Schritte

Falls der Fehler weiterhin auftritt:
1. Chrome Remote Debugging nutzen (siehe oben)
2. Console-Fehler identifizieren
3. Logcat für native Errors prüfen

## APK installieren

```bash
# Auf Gerät kopieren
adb push install.apk /sdcard/

# Oder direkt installieren
adb install -r install.apk
```

Die APK heißt immer `install.apk` und wird überschrieben bei jedem Build.
