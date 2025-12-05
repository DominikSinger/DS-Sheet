# Deployment und Infrastruktur

Vollständige Anleitung für On-Premise-Deployment des DS-Sheet-Systems.

## System-Übersicht

```
┌─────────────────────────────────────────────────────────┐
│                   Zentrale Dateiablage                  │
│    Windows: \\FILESERVER\Musiknoten                    │
│    Linux:   /srv/musiknoten                             │
└─────────────────────┬───────────────────────────────────┘
                      │ (Lese-/Schreibzugriff)
                      ▼
┌─────────────────────────────────────────────────────────┐
│              DS-Sheet Backend (Node.js)                 │
│              Port 3000 (HTTP/HTTPS)                     │
│    - REST API (/api/scores, /api/scores/:id/file)      │
│    - Dateiindexierung (SQLite)                          │
│    - Datei-Watcher (Auto-Rescan)                        │
└─────────────────────┬───────────────────────────────────┘
                      │ (HTTP(S) API)
                      ▼
┌─────────────────────────────────────────────────────────┐
│           DS-Sheet Frontend (React/Vite)                │
│              Port 5173 (Dev) / 80/443 (Prod)            │
│    - PWA für Browser/Tablets                            │
│    - Electron Desktop App                               │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Client-Geräte                         │
│    - Windows/macOS/Linux PCs (Browser/Electron)         │
│    - Android 10+ Tablets (Chrome/PWA)                   │
│    - iOS iPads (Safari/PWA - eingeschränkt)             │
└─────────────────────────────────────────────────────────┘
```

## 1. Zentrale Dateiablage konfigurieren

### Linux-Server

```bash
# Verzeichnis erstellen
sudo mkdir -p /srv/musiknoten
sudo chmod 755 /srv/musiknoten

# Service-User erstellen
sudo useradd -r -s /bin/false dssheet

# Berechtigungen setzen
sudo chown -R dssheet:dssheet /srv/musiknoten
sudo chmod -R 755 /srv/musiknoten

# Test: PDFs kopieren
sudo cp /pfad/zu/noten/*.pdf /srv/musiknoten/
```

**Struktur-Empfehlung**:
```
/srv/musiknoten/
├── Klassik/
│   ├── Bach/
│   │   └── BWV_1001_Sonata.pdf
│   └── Mozart/
│       └── KV_331_Sonate.pdf
├── Jazz/
│   ├── Real_Book_Vol1.pdf
│   └── Standards/
└── Pop/
    └── ...
```

### Windows-Server

```powershell
# Verzeichnis erstellen
New-Item -Path "C:\Musiknoten" -ItemType Directory

# Netzwerkfreigabe einrichten
New-SmbShare -Name "Musiknoten" -Path "C:\Musiknoten" -ReadAccess "Jeder"

# Oder über GUI:
# Rechtsklick auf Ordner → Eigenschaften → Freigabe → Erweiterte Freigabe
# \\FILESERVER\Musiknoten
```

**Service-User**:
```powershell
# Lokalen Service-User erstellen
net user dssheet "SecurePassword123!" /add
net localgroup Users dssheet /add

# Berechtigungen: Lesen + Auflisten
icacls C:\Musiknoten /grant dssheet:(OI)(CI)RX
```

### NAS (Synology/QNAP)

1. **Shared Folder** erstellen: `Musiknoten`
2. **Berechtigungen**: 
   - Gruppe erstellen: `dssheet-users`
   - Lese-Zugriff gewähren
3. **SMB/NFS** aktivieren
4. **Pfad**: `/volume1/Musiknoten` (Synology) oder `/share/Musiknoten` (QNAP)

## 2. Backend-Server aufsetzen

### 2.1 System-Voraussetzungen

- **OS**: Ubuntu 22.04 LTS / Debian 12 / Windows Server 2019+
- **Node.js**: v20 LTS
- **RAM**: Minimum 512 MB (empfohlen 2 GB)
- **Disk**: 1 GB + Platz für SQLite-DB

### 2.2 Installation (Linux)

```bash
# Node.js installieren (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Projekt deployen
sudo mkdir -p /opt/ds-sheet
sudo chown dssheet:dssheet /opt/ds-sheet

# Als dssheet-User
sudo -u dssheet bash
cd /opt/ds-sheet
git clone <REPO-URL> .
# Oder: Dateien per SCP/SFTP hochladen

# Dependencies installieren
cd server
npm ci --production

# Build (falls TypeScript)
npm run build
```

### 2.3 Konfiguration

```bash
# .env-Datei erstellen
cat > /opt/ds-sheet/server/.env << EOF
# Server-Konfiguration
PORT=3000
NODE_ENV=production

# Noten-Verzeichnis
NOTE_ROOT=/srv/musiknoten

# Oder Windows UNC-Pfad:
# NOTE_ROOT=\\\\FILESERVER\\Musiknoten

# Datenbank
DB_PATH=/opt/ds-sheet/server/data/scores.db

# Sicherheit (optional)
# BASIC_AUTH_USER=admin
# BASIC_AUTH_PASS=geheim123

# CORS (Frontend-URL)
CORS_ORIGIN=http://192.168.1.100:5173

# Logging
LOG_LEVEL=info
EOF

# Berechtigungen
chmod 600 /opt/ds-sheet/server/.env
```

### 2.4 Systemd-Service (Linux)

```bash
# Service-Unit erstellen
sudo cat > /etc/systemd/system/ds-sheet-backend.service << EOF
[Unit]
Description=DS-Sheet Backend API
After=network.target

[Service]
Type=simple
User=dssheet
Group=dssheet
WorkingDirectory=/opt/ds-sheet/server
Environment=NODE_ENV=production
EnvironmentFile=/opt/ds-sheet/server/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ds-sheet-backend

# Sicherheit
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/ds-sheet/server/data
ReadOnlyPaths=/srv/musiknoten

[Install]
WantedBy=multi-user.target
EOF

# Service aktivieren und starten
sudo systemctl daemon-reload
sudo systemctl enable ds-sheet-backend
sudo systemctl start ds-sheet-backend

# Status prüfen
sudo systemctl status ds-sheet-backend
sudo journalctl -u ds-sheet-backend -f
```

### 2.5 Windows-Dienst (NSSM)

```powershell
# NSSM herunterladen: https://nssm.cc/download
# Oder via Chocolatey:
choco install nssm

# Service installieren
nssm install DSSheetBackend "C:\Program Files\nodejs\node.exe"
nssm set DSSheetBackend AppDirectory "C:\DS-Sheet\server"
nssm set DSSheetBackend AppParameters "dist\index.js"
nssm set DSSheetBackend AppEnvironmentExtra "NODE_ENV=production"

# .env-Pfad setzen
nssm set DSSheetBackend AppEnvironmentExtra "ENV_FILE=C:\DS-Sheet\server\.env"

# Service starten
nssm start DSSheetBackend

# Automatischer Start
nssm set DSSheetBackend Start SERVICE_AUTO_START
```

### 2.6 Backend-Test

```bash
# Health-Check
curl http://localhost:3000/api/health

# Noten-Liste
curl http://localhost:3000/api/scores

# Spezifische Datei
curl http://localhost:3000/api/scores/1/file --output test.pdf
```

## 3. Frontend-Deployment

### 3.1 Build erstellen

```bash
cd client
npm ci
npm run build

# Output: client/dist/
# Enthält: index.html, assets/, manifest.json, sw.js
```

### 3.2 Option A: Statischer Webserver (Nginx)

```bash
# Nginx installieren
sudo apt-get install nginx

# Build-Dateien kopieren
sudo mkdir -p /var/www/ds-sheet
sudo cp -r client/dist/* /var/www/ds-sheet/
sudo chown -R www-data:www-data /var/www/ds-sheet

# Nginx-Konfiguration
sudo cat > /etc/nginx/sites-available/ds-sheet << 'EOF'
server {
    listen 80;
    server_name noten.local 192.168.1.100;
    root /var/www/ds-sheet;
    index index.html;

    # SPA-Routing: Alle Requests zu index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Service Worker muss korrekt gecacht werden
    location /sw.js {
        add_header Cache-Control "no-cache, must-revalidate";
        add_header Content-Type "application/javascript";
    }

    # Manifest
    location /manifest.json {
        add_header Cache-Control "no-cache";
        add_header Content-Type "application/json";
    }

    # Assets mit langem Cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API-Proxy zum Backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Für große PDF-Dateien
        proxy_buffering off;
        proxy_request_buffering off;
        client_max_body_size 100M;
    }

    # Kompression
    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;
}
EOF

# Aktivieren
sudo ln -s /etc/nginx/sites-available/ds-sheet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.3 Option B: HTTPS mit Self-Signed Certificate

```bash
# Zertifikat erstellen (1 Jahr gültig)
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/ds-sheet.key \
  -out /etc/nginx/ssl/ds-sheet.crt \
  -subj "/C=DE/ST=Bayern/L=Munich/O=DS-Sheet/CN=noten.local"

# Nginx HTTPS-Config
sudo cat > /etc/nginx/sites-available/ds-sheet-https << 'EOF'
# HTTP → HTTPS Redirect
server {
    listen 80;
    server_name noten.local 192.168.1.100;
    return 301 https://$host$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name noten.local 192.168.1.100;
    root /var/www/ds-sheet;
    index index.html;

    # SSL-Zertifikate
    ssl_certificate /etc/nginx/ssl/ds-sheet.crt;
    ssl_certificate_key /etc/nginx/ssl/ds-sheet.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Rest wie oben...
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        # ... (wie oben)
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/ds-sheet-https /etc/nginx/sites-enabled/ds-sheet
sudo systemctl reload nginx
```

**Client-Zertifikat vertrauen**:
- **Windows**: Zertifikat herunterladen → Doppelklick → "Installieren" → "Vertrauenswürdige Stammzertifizierungsstellen"
- **Android**: Einstellungen → Sicherheit → Zertifikat installieren → CA-Zertifikat
- **macOS**: Keychain Access → Zertifikat importieren → "Immer vertrauen"

### 3.4 Option C: Let's Encrypt (öffentlich erreichbar)

```bash
# Certbot installieren
sudo apt-get install certbot python3-certbot-nginx

# Zertifikat anfordern
sudo certbot --nginx -d noten.example.com

# Auto-Renewal aktiviert sich automatisch
sudo systemctl status certbot.timer
```

## 4. Multi-Device-Zugriff

### 4.1 Netzwerk-Konfiguration

**Firewall (Linux)**:
```bash
# Backend-Port
sudo ufw allow 3000/tcp

# Frontend-Port (Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Status
sudo ufw status
```

**Firewall (Windows)**:
```powershell
# Regel erstellen
New-NetFirewallRule -DisplayName "DS-Sheet Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "DS-Sheet Frontend" -Direction Inbound -LocalPort 80,443 -Protocol TCP -Action Allow
```

### 4.2 DNS/Hostnamen (optional)

**Lokaler DNS-Eintrag** (Router/DHCP-Server):
```
192.168.1.100  noten.local
```

Oder **Hosts-Datei** auf Clients:
```bash
# Linux/macOS: /etc/hosts
# Windows: C:\Windows\System32\drivers\etc\hosts
192.168.1.100  noten.local
```

### 4.3 Concurrent Access

Das System unterstützt parallele Zugriffe:

✅ **Lesen**: Unbegrenzt viele Clients gleichzeitig
- Backend cached Metadaten in SQLite
- PDFs werden direkt aus dem Dateisystem gestreamt
- Keine Locks beim Lesen

⚠️ **Schreiben**: Keine Built-in-Kollisionserkennung
- Wenn Dateien während Sessions geändert werden:
  - Laufende Viewer: Zeigen alte Version (gecacht)
  - Neue Requests: Zeigen neue Version
  - Metadaten: Werden beim nächsten Scan aktualisiert

**Empfehlung**:
- Noten-Verzeichnis ist **Read-Only** für Clients
- Änderungen nur über dedizierten Admin-Zugang
- Automatischer Rescan bei Dateiänderungen (File Watcher aktiv)

## 5. Backup-Strategie

### 5.1 Noten-Verzeichnis

**Inkrementelles Backup (Linux)**:
```bash
#!/bin/bash
# backup-notes.sh

BACKUP_DIR="/backup/musiknoten"
SOURCE_DIR="/srv/musiknoten"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Rsync-Backup mit Hard-Links (Space-Efficient)
rsync -avz --link-dest="$BACKUP_DIR/latest" \
  "$SOURCE_DIR/" "$BACKUP_DIR/$DATE/"

# Symlink auf aktuellstes Backup
ln -snf "$BACKUP_DIR/$DATE" "$BACKUP_DIR/latest"

# Alte Backups löschen (älter als 30 Tage)
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;
```

**Cron-Job**:
```bash
# Täglich um 2 Uhr
0 2 * * * /opt/scripts/backup-notes.sh
```

**Windows-Backup**:
```powershell
# Shadow Copy (VSS) aktivieren
vssadmin create shadow /for=C:

# Oder: Windows Backup Tool
wbadmin start backup -backupTarget:E: -include:C:\Musiknoten -quiet
```

### 5.2 SQLite-Datenbank

```bash
#!/bin/bash
# backup-db.sh

DB_PATH="/opt/ds-sheet/server/data/scores.db"
BACKUP_DIR="/backup/ds-sheet-db"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# SQLite-Backup (atomic)
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/scores_$DATE.db'"

# Alte Backups löschen (30 Tage)
find "$BACKUP_DIR" -name "scores_*.db" -mtime +30 -delete
```

### 5.3 Versionierung

**Git/LFS ungeeignet** für große PDFs (langsam, bläht Repo auf)

**Alternativen**:
1. **Shadow Copies** (Windows Server)
2. **ZFS Snapshots** (Linux mit ZFS)
3. **BTRFS Snapshots** (Linux mit BTRFS)
4. **NAS-Snapshots** (Synology/QNAP integriert)

## 6. Monitoring und Logs

### 6.1 Backend-Logs

**Systemd Journald** (Linux):
```bash
# Live-Logs
sudo journalctl -u ds-sheet-backend -f

# Logs der letzten Stunde
sudo journalctl -u ds-sheet-backend --since "1 hour ago"

# Fehler-Logs
sudo journalctl -u ds-sheet-backend -p err
```

**Log-Rotation** konfigurieren:
```bash
# /etc/logrotate.d/ds-sheet
/var/log/ds-sheet/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

### 6.2 Nginx-Logs

```bash
# Access-Log
tail -f /var/log/nginx/access.log

# Error-Log
tail -f /var/log/nginx/error.log

# Statistiken
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10
```

### 6.3 Health-Monitoring

**Simple Health-Check-Script**:
```bash
#!/bin/bash
# check-health.sh

BACKEND_URL="http://localhost:3000/api/health"
FRONTEND_URL="http://localhost"

# Backend-Check
if curl -sf "$BACKEND_URL" > /dev/null; then
    echo "✅ Backend OK"
else
    echo "❌ Backend DOWN"
    # Optional: Restart-Service
    sudo systemctl restart ds-sheet-backend
fi

# Frontend-Check
if curl -sf "$FRONTEND_URL" > /dev/null; then
    echo "✅ Frontend OK"
else
    echo "❌ Frontend DOWN"
fi
```

**Cron-Job** (alle 5 Minuten):
```bash
*/5 * * * * /opt/scripts/check-health.sh >> /var/log/ds-sheet/health.log 2>&1
```

## 7. Sicherheit

### 7.1 Basis-Absicherung

**Internes Netz**: Keine Authentifizierung nötig (wenn nur lokal)

**Öffentlich erreichbar**: Basic Auth aktivieren

```bash
# In server/.env
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=SecurePassword123!
```

Backend-Middleware validiert dann alle Requests.

### 7.2 Advanced: OAuth/LDAP

Für Enterprise-Umgebungen:
```typescript
// server/src/middleware/auth.ts erweitern
import { authenticate } from 'ldap-authentication';

// LDAP-Check
const isValid = await authenticate({
  ldapOpts: { url: 'ldap://ad.company.local' },
  userDn: `uid=${username},ou=users,dc=company,dc=local`,
  userPassword: password,
});
```

### 7.3 Path-Traversal-Schutz

**Bereits implementiert** in `server/src/services/file.ts`:
```typescript
// Nur Zugriff innerhalb von NOTE_ROOT erlaubt
const absolutePath = path.resolve(NOTE_ROOT, relativePath);
if (!absolutePath.startsWith(NOTE_ROOT)) {
  throw new Error('Access denied');
}
```

### 7.4 CORS-Konfiguration

```bash
# In server/.env
CORS_ORIGIN=https://noten.local,https://192.168.1.100
```

Oder für Wildcard (nicht empfohlen):
```bash
CORS_ORIGIN=*
```

## 8. Performance-Optimierung

### 8.1 Backend

**SQLite-Tuning**:
```sql
-- In database.ts
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
```

**Caching**:
- Metadaten in SQLite (schneller Zugriff)
- PDF-Files nicht cachen (zu groß, direkt streamen)

### 8.2 Frontend

**Vite-Build-Optimierung**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'pdf-vendor': ['react-pdf'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

**Service Worker**:
- App-Shell wird gecacht (schneller Start)
- PDFs: Network-First (immer aktuell)

### 8.3 Netzwerk

**Nginx-Tuning**:
```nginx
# Große PDFs effizient streamen
sendfile on;
tcp_nopush on;
tcp_nodelay on;

# Keepalive
keepalive_timeout 65;
keepalive_requests 100;

# Worker
worker_processes auto;
worker_connections 1024;
```

## 9. Beispiel-Konfigurationen

### 9.1 Kleines Setup (Home-Studio)

```
1 Server (Raspberry Pi 4 / Mini-PC):
  - Backend (Port 3000)
  - Frontend (Nginx, Port 80)
  - NOTE_ROOT: /mnt/usb/noten (USB-Festplatte)

Clients:
  - 2 PCs (Browser)
  - 2 Tablets (PWA)
```

### 9.2 Mittleres Setup (Musikschule)

```
1 Server (Ubuntu Server 22.04):
  - Backend (Systemd-Service)
  - Frontend (Nginx mit HTTPS)
  - NOTE_ROOT: /srv/musiknoten

1 NAS (Synology):
  - Backup der Noten (täglich)
  - Zusätzliche Kopie wichtiger Stücke

Clients:
  - 10 PCs (Browser)
  - 5 Tablets (PWA)
  - 3 Laptops (Electron-App)
```

### 9.3 Großes Setup (Orchester)

```
1 Dedizierter Server (Windows Server 2022):
  - Backend (Windows-Dienst)
  - Frontend (IIS)
  - NOTE_ROOT: \\FILESERVER\Musiknoten

1 Fileserver (Windows Server):
  - Zentrale Ablage (RAID 5)
  - Shadow Copies aktiviert
  - Nightly Backup auf NAS

Load-Balancer (optional):
  - 2 Backend-Instanzen
  - Nginx-Proxy

Clients:
  - 50+ PCs (Browser)
  - 20 Tablets (PWA)
  - 10 Dirigenten-Laptops (Electron)
```

## 10. Troubleshooting

### Backend startet nicht

```bash
# Logs prüfen
sudo journalctl -u ds-sheet-backend -n 50

# Häufige Probleme:
# 1. NOTE_ROOT nicht erreichbar
ls -la /srv/musiknoten

# 2. Port bereits belegt
sudo netstat -tulpn | grep 3000

# 3. Berechtigungen
sudo -u dssheet ls /srv/musiknoten
```

### Frontend zeigt keine Noten

```bash
# API erreichbar?
curl http://localhost:3000/api/scores

# CORS-Fehler? (Browser DevTools Console)
# → CORS_ORIGIN in .env prüfen

# Nginx-Proxy korrekt?
curl http://localhost/api/scores
```

### PDFs werden nicht angezeigt

```bash
# Backend-Log prüfen (File-Service)
sudo journalctl -u ds-sheet-backend | grep "Serving file"

# Datei existiert?
ls -la /srv/musiknoten/path/to/file.pdf

# Berechtigungen?
sudo -u dssheet cat /srv/musiknoten/path/to/file.pdf > /dev/null
```

## 11. Checkliste Production-Ready

✅ **Backend**
- [ ] Node.js LTS installiert
- [ ] Dependencies mit `npm ci --production`
- [ ] `.env` konfiguriert und gesichert (chmod 600)
- [ ] NOTE_ROOT erreichbar und lesbar
- [ ] Systemd-Service / Windows-Dienst aktiv
- [ ] Auto-Start bei Boot aktiviert
- [ ] Logs rotieren korrekt

✅ **Frontend**
- [ ] Produktions-Build erstellt (`npm run build`)
- [ ] Webserver (Nginx/IIS) konfiguriert
- [ ] HTTPS aktiviert (zumindest self-signed)
- [ ] Service Worker registriert
- [ ] Manifest.json erreichbar
- [ ] Icons vorhanden

✅ **Infrastruktur**
- [ ] Firewall-Regeln gesetzt
- [ ] Backup-Jobs eingerichtet
- [ ] Health-Monitoring aktiv
- [ ] DNS/Hostnamen konfiguriert
- [ ] Clients können zugreifen

✅ **Sicherheit**
- [ ] Path-Traversal-Schutz aktiv
- [ ] CORS korrekt konfiguriert
- [ ] (Optional) Authentifizierung aktiv
- [ ] Logs überwacht

✅ **Testing**
- [ ] Backend-Health-Check OK
- [ ] API liefert Noten-Liste
- [ ] PDFs werden korrekt ausgeliefert
- [ ] Frontend lädt korrekt
- [ ] PWA-Installation funktioniert (Tablet)
- [ ] Fußpedal-Navigation funktioniert
- [ ] Multi-Device-Zugriff getestet

---

**Status**: Deployment-Dokumentation ist vollständig!

Das System ist produktionsbereit und kann sofort deployed werden.
