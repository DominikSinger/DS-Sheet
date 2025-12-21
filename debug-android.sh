#!/bin/bash

# ============================================
# Android WebView Debug Script
# ============================================

set -e

echo "=========================================="
echo "  Android WebView Debugging"
echo "=========================================="
echo ""

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

# Prüfe ob ADB verfügbar ist
if ! command -v adb &> /dev/null; then
    log_error "ADB nicht gefunden!"
    echo "Installiere Android Platform Tools für ADB"
    exit 1
fi

log_info "Prüfe verbundene Geräte..."
adb devices

echo ""
log_info "Starte Chrome Remote Debugging..."
echo ""
echo "1. Öffne Chrome am Desktop"
echo "2. Gehe zu: chrome://inspect"
echo "3. Aktiviere 'Discover USB devices'"
echo "4. Du siehst dein Gerät und kannst WebViews debuggen"
echo ""
echo "Alternativ: Logcat für Console-Output"
log_info "Starte Logcat (Ctrl+C zum Beenden)..."
echo ""

adb logcat | grep -i "chromium\|console\|capacitor\|dssheet"
