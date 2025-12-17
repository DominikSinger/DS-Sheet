#!/bin/bash

# ============================================
# DS-Sheet - Android APK Build Script
# ============================================

set -e

echo "=========================================="
echo "  DS-Sheet Android APK Build"
echo "=========================================="
echo ""

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfe Android SDK
if [ -z "$ANDROID_HOME" ]; then
    log_error "ANDROID_HOME ist nicht gesetzt!"
    echo ""
    echo "Bitte installieren Sie Android SDK und setzen Sie ANDROID_HOME:"
    echo "  export ANDROID_HOME=/path/to/android-sdk"
    echo "  export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
    echo ""
    log_warn "Alternative: Nutzen Sie die PWA-Installation (siehe INSTALL-ANDROID.md)"
    exit 1
fi

log_info "Android SDK gefunden: $ANDROID_HOME"
echo ""

# Schritt 1: Frontend bauen
log_info "Schritt 1/3: React-Frontend wird gebaut..."
cd client

if [ ! -d "node_modules" ]; then
    log_warn "Dependencies werden installiert..."
    npm install
fi

npm run build

if [ ! -d "dist" ]; then
    log_error "Build fehlgeschlagen"
    exit 1
fi

log_info "✓ Frontend-Build erfolgreich"
echo ""

# Schritt 2: Capacitor Sync
log_info "Schritt 2/3: Capacitor Sync..."
npx cap sync android

log_info "✓ Capacitor Sync erfolgreich"
echo ""

# Schritt 3: APK bauen
log_info "Schritt 3/3: APK wird gebaut..."
cd android

# Lösche alte APKs
log_info "Lösche alte APK-Dateien..."
rm -f ../../install.apk
rm -f ../../DS-Sheet*.apk

./gradlew assembleDebug

if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    log_info "✓ APK erfolgreich erstellt!"
    echo ""
    
    # Kopiere APK als install.apk ins Root-Verzeichnis
    cp app/build/outputs/apk/debug/app-debug.apk ../../install.apk
    
    # Dateigröße anzeigen
    APK_SIZE=$(du -h ../../install.apk | cut -f1)
    log_info "✓ APK gespeichert als: install.apk (${APK_SIZE})"
else
    log_error "APK wurde nicht erstellt"
    exit 1
fi

echo ""
log_info "=========================================="
log_info "  Build erfolgreich! ✓"
log_info "=========================================="
echo ""
echo "Nächste Schritte:"
echo "1. Übertrage install.apk auf dein Android-Gerät"
echo "2. Installiere die APK (Unbekannte Quellen erlauben)"
echo "3. Starte DS-Sheet"
echo ""
echo "Alternativ: Nutze die einfachere PWA-Installation"
echo "Siehe INSTALL-ANDROID.md für Details"
echo ""

