#!/bin/bash

# ============================================
# DS-Sheet - Windows Build Script
# ============================================
# Erstellt die Windows-Installer und Portable-Version
# der DS-Sheet Desktop-App
# ============================================

set -e  # Bei Fehler abbrechen

echo "=========================================="
echo "  DS-Sheet Windows Build"
echo "=========================================="
echo ""

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktionen
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfe, ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    log_error "Node.js ist nicht installiert!"
    echo "Bitte installieren Sie Node.js von https://nodejs.org"
    exit 1
fi

log_info "Node.js Version: $(node --version)"
log_info "npm Version: $(npm --version)"
echo ""

# Schritt 1: React-Frontend bauen
log_info "Schritt 1/3: React-Frontend wird gebaut..."
cd client

if [ ! -d "node_modules" ]; then
    log_warn "node_modules nicht gefunden - Dependencies werden installiert..."
    npm install
fi

log_info "Führe Production-Build aus..."
npm run build

if [ ! -d "dist" ]; then
    log_error "Build fehlgeschlagen - dist/ Ordner wurde nicht erstellt"
    exit 1
fi

log_info "✓ Frontend-Build erfolgreich (client/dist/)"
echo ""

# Schritt 2: Electron-Projekt kompilieren
log_info "Schritt 2/3: Electron-Projekt wird kompiliert..."
cd ../desktop

if [ ! -d "node_modules" ]; then
    log_warn "node_modules nicht gefunden - Dependencies werden installiert..."
    npm install
fi

log_info "Kompiliere TypeScript..."
npm run build

if [ ! -f "dist/main.js" ]; then
    log_error "Kompilierung fehlgeschlagen - dist/main.js wurde nicht erstellt"
    exit 1
fi

log_info "✓ Electron-Build erfolgreich (desktop/dist/)"
echo ""

# Schritt 3: Windows-Distributable erstellen
log_info "Schritt 3/3: Windows-Installer wird erstellt..."
log_warn "Dies kann einige Minuten dauern..."
echo ""

npm run package:win

if [ ! -d "release" ]; then
    log_error "Build fehlgeschlagen - release/ Ordner wurde nicht erstellt"
    exit 1
fi

echo ""
log_info "=========================================="
log_info "  Build erfolgreich abgeschlossen! ✓"
log_info "=========================================="
echo ""

# Zeige erstellte Dateien
log_info "Erstellte Dateien:"
echo ""

cd release

if [ -f "DS-Sheet Setup 1.0.0.exe" ]; then
    INSTALLER_SIZE=$(du -h "DS-Sheet Setup 1.0.0.exe" | cut -f1)
    echo "  📦 DS-Sheet Setup 1.0.0.exe ($INSTALLER_SIZE) - Installer"
else
    log_warn "Installer wurde nicht erstellt"
fi

if [ -f "DS-Sheet 1.0.0.exe" ]; then
    PORTABLE_SIZE=$(du -h "DS-Sheet 1.0.0.exe" | cut -f1)
    echo "  💾 DS-Sheet 1.0.0.exe ($PORTABLE_SIZE) - Portable"
else
    log_warn "Portable-Version wurde nicht erstellt"
fi

echo ""
log_info "Speicherort: $(pwd)"
echo ""

# Weitere Informationen
echo "=========================================="
echo "Nächste Schritte:"
echo "=========================================="
echo ""
echo "1. Testen Sie die Installer-Version:"
echo "   • Doppelklick auf 'DS-Sheet Setup 1.0.0.exe'"
echo "   • Folgen Sie dem Installations-Assistenten"
echo ""
echo "2. Oder nutzen Sie die Portable-Version:"
echo "   • 'DS-Sheet 1.0.0.exe' auf USB-Stick kopieren"
echo "   • Direkt ausführen ohne Installation"
echo ""
echo "3. Verteilung:"
echo "   • Dateien an Musiker verteilen"
echo "   • Siehe INSTALL-WINDOWS.md für Installationsanleitung"
echo ""
echo "=========================================="

# Optional: Release-Ordner öffnen (wenn auf Linux mit xdg-open)
if command -v xdg-open &> /dev/null; then
    read -p "Release-Ordner öffnen? (j/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        xdg-open .
    fi
fi

log_info "Build-Script abgeschlossen!"
