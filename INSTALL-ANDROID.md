# DS-Sheet - Android Installation (PWA)

## Voraussetzungen
- Android 10 oder höher
- Google Chrome Browser (vorinstalliert auf den meisten Android-Geräten)
- Verbindung zum Server im gleichen Netzwerk

## Installation - Schritt für Schritt

### 1. Server-URL herausfinden

Auf dem Server (wo DS-Sheet läuft):
```bash
# IP-Adresse des Servers ermitteln
hostname -I
# Oder auf Windows:
ipconfig
```

Notieren Sie die IP-Adresse, z.B. `192.168.1.100`

### 2. Chrome auf Android öffnen

1. Öffnen Sie **Google Chrome** auf Ihrem Android-Tablet
2. Geben Sie in die Adressleiste ein: `http://[SERVER-IP]:5173`
   - Beispiel: `http://192.168.1.100:5173`

### 3. PWA installieren - Methode A (Automatischer Banner)

Wenn die Seite lädt:
1. Am unteren Bildschirmrand erscheint ein Banner: **"DS-Sheet zur Startseite hinzufügen"**
2. Tippen Sie auf **"Installieren"** oder **"Hinzufügen"**
3. Bestätigen Sie im Dialog
4. ✅ Fertig! Das DS-Sheet-Icon erscheint auf dem Home-Screen

### 4. PWA installieren - Methode B (Manuell)

Falls kein Banner erscheint:
1. Tippen Sie auf das **Menü-Symbol** (⋮) oben rechts in Chrome
2. Wählen Sie **"App installieren"** oder **"Zum Startbildschirm hinzufügen"**
3. Geben Sie optional einen Namen ein (Standard: "DS-Sheet")
4. Tippen Sie auf **"Hinzufügen"**
5. Bestätigen Sie "Zum Startbildschirm hinzufügen"
6. ✅ Fertig! Das Icon erscheint auf dem Home-Screen

### 5. App starten

1. Finden Sie das **DS-Sheet-Icon** auf Ihrem Home-Screen
2. Tippen Sie darauf
3. Die App öffnet sich **im Vollbild** (ohne Browser-UI)
4. Sieht aus und verhält sich wie eine native App!

## Verwendung

### Navigation im Viewer
- **Tap links**: Vorherige Seite
- **Tap rechts**: Nächste Seite
- **Buttons unten**: "Zurück", "Vorherige Seite", "Nächste Seite"

### Vollbild
- Die App startet automatisch im Vollbild (Querformat)
- Zum Beenden: Zurück-Taste drücken

### Offline-Funktionalität
- Bereits geladene Noten sind offline verfügbar (gecacht)
- Neue Noten benötigen Internetverbindung

## Troubleshooting

### Installation-Banner erscheint nicht

**Mögliche Ursachen:**
- Seite bereits installiert → Deinstallieren Sie die App zuerst
- Keine HTTPS-Verbindung (nur HTTP) → Normal bei lokalem Netzwerk
- Service Worker nicht registriert → Seite neu laden (F5)

**Lösung:** Nutzen Sie Methode B (Manuell über Chrome-Menü)

### App öffnet sich nicht im Vollbild

**Lösung:**
1. App deinstallieren: Lange auf Icon drücken → "Deinstallieren"
2. Chrome-Cache leeren: Einstellungen → Apps → Chrome → Speicher → Cache leeren
3. Neu installieren (siehe oben)

### "Offline - keine Verbindung" wird angezeigt

**Ursache:** Server nicht erreichbar oder Netzwerkverbindung unterbrochen

**Lösung:**
1. Prüfen Sie WLAN-Verbindung
2. Prüfen Sie Server-IP (evtl. geändert?)
3. Versuchen Sie, die URL im Chrome-Browser zu öffnen

### Icon zeigt nicht das richtige Logo

**Ursache:** Icons wurden noch nicht erstellt oder sind nicht im Projekt

**Lösung:** Administrator muss Icons hinzufügen (siehe Entwickler-Dokumentation)

## App aktualisieren

Die PWA aktualisiert sich automatisch:
1. Wenn Sie die App öffnen, prüft sie auf Updates
2. Neue Version wird im Hintergrund geladen
3. Beim nächsten App-Start wird die neue Version verwendet

**Manuelles Update erzwingen:**
1. Öffnen Sie Chrome
2. Gehen Sie zu: `chrome://serviceworker-internals`
3. Finden Sie DS-Sheet in der Liste
4. Klicken Sie auf "Unregister"
5. App neu öffnen

## App deinstallieren

### Methode 1: Direkt vom Home-Screen
1. Drücken Sie **lange** auf das DS-Sheet-Icon
2. Wählen Sie **"Deinstallieren"** oder **"Entfernen"**
3. Bestätigen Sie

### Methode 2: Über Chrome
1. Öffnen Sie Chrome
2. Gehen Sie zu: `chrome://apps`
3. Finden Sie DS-Sheet
4. Klicken Sie auf die drei Punkte → "Aus Chrome entfernen"

### Methode 3: Über Android-Einstellungen
1. Einstellungen → Apps
2. Suchen Sie "DS-Sheet"
3. Tippen Sie auf "Deinstallieren"

## Optimale Einstellungen für Musiker

### Display-Einstellungen
```
Einstellungen → Display
- Helligkeit: Automatisch (für verschiedene Lichtverhältnisse)
- Bildschirm-Timeout: 10 Minuten (damit Screen nicht ausgeht)
- Blaulichtfilter: Aus (für bessere PDF-Lesbarkeit)
```

### Nicht-Stören-Modus während Konzerten
```
Einstellungen → Töne & Vibration → Nicht stören
- Während Proben/Konzerten aktivieren
- Verhindert störende Benachrichtigungen
```

### WLAN-Verbindung beibehalten
```
Einstellungen → WLAN → Erweitert
- "WLAN im Standby aktiviert lassen": AN
- Verhindert Verbindungsabbrüche während längerer Nutzung
```

## Systemanforderungen

✅ **Unterstützt:**
- Android 10, 11, 12, 13, 14, 15
- Tablets ab 8 Zoll (empfohlen: 10 Zoll für Noten)
- Chrome Browser 90+

⚠️ **Eingeschränkt:**
- Ältere Android-Versionen (<10): Eventuell keine PWA-Installation möglich
- Firefox Mobile: PWA-Installation funktioniert anders
- Samsung Internet: Funktioniert, aber andere Installations-UI

❌ **Nicht unterstützt:**
- iOS/iPadOS: PWA-Funktionalität in Safari eingeschränkt (siehe separate Anleitung falls benötigt)

## Tipps für beste Performance

1. **Querformat verwenden**: App ist für Querformat optimiert
2. **Gute WLAN-Verbindung**: 5 GHz WLAN bevorzugen für schnelleres PDF-Laden
3. **Regelmäßig neustarten**: Bei längerer Nutzung App einmal schließen und neu öffnen
4. **Cache nicht zu groß werden lassen**: Bei Speicherproblemen Chrome-Cache leeren

## Support

Bei Problemen:
1. Prüfen Sie diese Anleitung
2. Kontaktieren Sie Ihren Administrator
3. Dokumentation: Siehe `PWA-SETUP.md` im Projekt

---

**Status**: Installationsanleitung für Android (PWA) ✅
**Zielgruppe**: End-User (Musiker)
**Schwierigkeit**: Einfach - keine technischen Kenntnisse erforderlich
