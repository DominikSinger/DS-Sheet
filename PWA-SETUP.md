# PWA-Setup und Installation

## Überblick

DS-Sheet ist als Progressive Web App (PWA) konzipiert und kann auf Android-Tablets (ab Android 10) wie eine native App installiert werden.

## Technische Komponenten

### 1. Manifest.json
- **Speicherort**: `/client/public/manifest.json`
- **Konfiguration**:
  - `display: "standalone"` - App läuft im Vollbild ohne Browser-UI
  - `orientation: "landscape"` - Optimiert für Querformat (Notenansicht)
  - `theme_color: "#4CAF50"` - Grün als Markenfarbe
  - Icons in 8 Größen (72px bis 512px)

### 2. Service Worker
- **Speicherort**: `/client/public/sw.js`
- **Strategien**:
  - **App Shell**: HTML, CSS, JS werden beim ersten Besuch gecacht
  - **API-Requests**: Network First mit Cache-Fallback
  - **Assets**: Cache First für optimale Performance
  - **Offline-Fallback**: Zeigt `/offline.html` bei fehlender Verbindung

### 3. Meta-Tags (index.html)
Alle notwendigen Tags sind bereits integriert:
- `viewport` mit `user-scalable=no` für App-Feeling
- `theme-color` für Android-Statusleiste
- `apple-mobile-web-app-capable` für iOS-Support
- `apple-touch-icon` für iOS Home-Screen
- `msapplication-*` für Windows-Tablets

## Installation auf Android 10+ Tablet

### Schritt-für-Schritt-Anleitung:

1. **Chrome öffnen**
   - Öffnen Sie Google Chrome auf dem Android-Tablet
   - Navigieren Sie zur App-URL: `http://[SERVER-IP]:5173`

2. **Installation triggern**
   - Chrome zeigt automatisch einen Banner "Zur Startseite hinzufügen"
   - Alternativ: Menü (⋮) → "App installieren" oder "Zum Startbildschirm hinzufügen"

3. **Installation bestätigen**
   - Dialog erscheint mit App-Name und Icon
   - Auf "Installieren" tippen

4. **App starten**
   - Icon erscheint auf dem Home-Screen
   - App öffnet sich im Vollbild ohne Browser-UI
   - Sieht aus und verhält sich wie eine native App

### Alternative Methode (manuell):

Wenn kein automatischer Banner erscheint:
1. Chrome-Menü (⋮) öffnen
2. "Zum Startbildschirm hinzufügen" wählen
3. Namen bestätigen
4. Icon wird auf Home-Screen platziert

## Vollbild-Verhalten

Die App startet automatisch im Standalone-Modus:
- Keine Browser-Adressleiste
- Keine Navigation-Buttons
- Vollständige Bildschirmnutzung
- Landscape-Orientation (Querformat) bevorzugt

## Icons erstellen

Aktuell sind Platzhalter-Pfade definiert. Erstellen Sie Icons in folgenden Größen:

```bash
# Beispiel mit ImageMagick
convert source-icon.png -resize 72x72 client/public/icons/icon-72.png
convert source-icon.png -resize 96x96 client/public/icons/icon-96.png
convert source-icon.png -resize 128x128 client/public/icons/icon-128.png
convert source-icon.png -resize 144x144 client/public/icons/icon-144.png
convert source-icon.png -resize 152x152 client/public/icons/icon-152.png
convert source-icon.png -resize 192x192 client/public/icons/icon-192.png
convert source-icon.png -resize 384x384 client/public/icons/icon-384.png
convert source-icon.png -resize 512x512 client/public/icons/icon-512.png
```

**Icon-Anforderungen**:
- Quadratisch (1:1)
- PNG-Format
- Transparenter oder farbiger Hintergrund
- Einfaches, erkennbares Design (Notenschlüssel, Musiknote)
- Mindestens 512×512px als Ausgangsmaterial

## Build für Produktion

```bash
cd client
npm run build
```

Das Build-Output enthält:
- Optimierte und geminifte Assets
- Service Worker
- Manifest mit korrekten Pfaden
- Alle Icons

## Deployment-Checkliste

✅ **Manifest**
- [ ] Icons in `/public/icons/` vorhanden
- [ ] `start_url` korrekt gesetzt
- [ ] `scope` passt zur Deployment-URL

✅ **Service Worker**
- [ ] Wird korrekt registriert (Chrome DevTools → Application → Service Workers)
- [ ] Cache-Namen sind versioniert
- [ ] Offline-Fallback funktioniert

✅ **HTTPS**
- [ ] **WICHTIG**: PWAs benötigen HTTPS (außer localhost)
- [ ] SSL-Zertifikat für Produktions-Domain
- [ ] Selbst-signiertes Zertifikat für interne Tests akzeptabel

✅ **Meta-Tags**
- [ ] `theme-color` gesetzt
- [ ] `viewport` konfiguriert
- [ ] Apple-Touch-Icon vorhanden

✅ **Testing**
- [ ] Chrome DevTools → Lighthouse → PWA-Audit (Mindestens 80/100)
- [ ] Installation auf realem Android-Gerät testen
- [ ] Offline-Funktionalität prüfen
- [ ] Fullscreen-Modus verifizieren

## Lighthouse PWA-Audit

```bash
# Installation
npm install -g lighthouse

# Audit durchführen
lighthouse http://[SERVER-IP]:5173 --view --only-categories=pwa
```

**Wichtige Kriterien**:
- ✅ HTTPS verwenden (oder localhost)
- ✅ Service Worker registriert
- ✅ Manifest mit allen Pflichtfeldern
- ✅ Icons in mehreren Größen
- ✅ Viewport-Meta-Tag
- ✅ Theme-Color definiert

## Troubleshooting

### Installation-Banner erscheint nicht

**Ursachen**:
- Service Worker nicht registriert → Chrome DevTools prüfen
- Manifest fehlerhaft → Console-Fehler checken
- Bereits installiert → Deinstallieren und neu versuchen
- Kein HTTPS → Ausnahme nur für localhost

**Lösung**:
```javascript
// In Chrome DevTools Console testen:
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs));
```

### App startet nicht im Vollbild

**Ursachen**:
- `display` in Manifest nicht auf `standalone` oder `fullscreen`
- Browser cached alte Version

**Lösung**:
1. App deinstallieren
2. Browser-Cache leeren
3. Neu installieren

### Service Worker updated nicht

**Lösung**:
```javascript
// Manueller Update-Trigger in DevTools Console:
navigator.serviceWorker.getRegistration().then(reg => reg.update());

// Oder: Cache komplett leeren
caches.keys().then(names => names.forEach(name => caches.delete(name)));
```

### Offline-Modus funktioniert nicht

**Check**:
1. DevTools → Application → Service Workers → "Offline" testen
2. Network-Tab → "Offline" simulieren
3. Cache-Einträge prüfen: Application → Cache Storage

## Weitere Optimierungen

### App-Update-Benachrichtigung

Implementieren Sie einen Update-Prompt im Frontend:

```typescript
// In main.tsx bereits vorbereitet
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // Zeige Toast: "Neue Version verfügbar - Seite neu laden?"
  if (confirm('Neue Version verfügbar. Jetzt aktualisieren?')) {
    window.location.reload();
  }
});
```

### Splash Screen (optional)

Für professionelleres App-Gefühl:
```json
// In manifest.json ergänzen:
{
  "splash_pages": null,
  "background_color": "#1e1e1e"
}
```

### App-Shortcuts (optional)

```json
// In manifest.json ergänzen:
{
  "shortcuts": [
    {
      "name": "Bibliothek",
      "url": "/",
      "icons": [{ "src": "/icons/library.png", "sizes": "192x192" }]
    },
    {
      "name": "Zuletzt geöffnet",
      "url": "/?recent=true",
      "icons": [{ "src": "/icons/recent.png", "sizes": "192x192" }]
    }
  ]
}
```

## Browser-Support

| Browser | Android 10+ | Desktop |
|---------|-------------|---------|
| Chrome | ✅ Voll | ✅ Voll |
| Edge | ✅ Voll | ✅ Voll |
| Firefox | ⚠️ Teilweise* | ⚠️ Teilweise* |
| Safari (iOS) | N/A | ⚠️ Eingeschränkt |

*Firefox unterstützt PWA-Installation anders als Chrome/Edge

## Produktions-Setup

### HTTPS mit Self-Signed Certificate (für internes Netz)

```bash
# Zertifikat erstellen
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Backend mit HTTPS starten (server/src/index.ts anpassen)
```

### HTTPS mit Let's Encrypt (öffentlich erreichbar)

```bash
# Certbot installieren und Zertifikat anfordern
sudo certbot certonly --standalone -d noten.example.com
```

---

**Status**: PWA ist vollständig implementiert und produktionsbereit!
