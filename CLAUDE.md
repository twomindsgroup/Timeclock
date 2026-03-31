# Deadline Signs Time Clock — Capacitor Project

## Overview
Android kiosk app for employee time tracking. Single-file HTML app wrapped in Capacitor for tablet deployment. Syncs to Google Sheets via Apps Script backend. Companion dashboard (`dashboard.html`) provides remote status viewing from any browser.

## Project Structure
```
deadline-signs-timeclock/
├── CLAUDE.md              ← you are here
├── www/
│   └── index.html         ← the kiosk app (single file, all JS/CSS inline)
├── android/               ← Capacitor Android project (auto-generated)
├── capacitor.config.json  ← Capacitor config
├── package.json
└── dashboard.html         ← remote status viewer (deployed to server, NOT in APK)
```

## Key Facts
- **App ID**: `com.deadlinesigns.timeclock`
- **App Name**: DS Time Clock
- **Capacitor webDir**: `www`
- **Target device**: Android tablet (kiosk mode)
- **Data storage**: localStorage for state, IndexedDB for photos
- **Backend**: Google Apps Script (POST for punches, GET for dashboard)
- **Default admin PIN**: `1234` (stored as SHA-256 hash)

## Build Commands

### Sync web assets to Android
```bash
npx cap sync android
```

### Build debug APK
```bash
cd android && ./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Build release APK
```bash
cd android && ./gradlew assembleRelease
```

### Full rebuild (sync + build)
```bash
npx cap sync android && cd android && ./gradlew assembleDebug
```

### Open in Android Studio (if needed)
```bash
npx cap open android
```

## Editing the App
The entire kiosk app is `www/index.html`. All CSS, HTML, and JS are in this single file. When editing:
- **Never create separate JS/CSS files** — everything stays in index.html
- **Always use `esc()` for any user-generated content** injected into innerHTML
- **Photos go in IndexedDB** via `PhotoDB.save(id, base64)` — never localStorage
- **PIN hashing**: use `await sha256(pin)` — compare against `settings.pinHash`
- **Test in browser first**: open `www/index.html` directly in Chrome before building APK
- **Capacitor plugins** use `window.Capacitor.Plugins` native bridge, NOT CDN imports

## Dashboard Deployment

### Server details
- **Host**: 148.113.187.163
- **SSH port**: 2222 (port 22 is blocked by OVH anti-DDoS)
- **SSH**: `ssh -p 2222 root@148.113.187.163`
- **SCP**: `scp -P 2222 dashboard.html root@148.113.187.163:/destination/path`
- **Plesk browser terminal**: `https://148.113.187.163:8443`

### Deploy dashboard to server
```bash
scp -P 2222 dashboard.html root@148.113.187.163:/var/www/vhosts/deadlinesigns.com/httpdocs/timeclock-dashboard.html
```
Accessible at: `https://deadlinesigns.com/timeclock-dashboard.html`

## Apps Script Backend
The backend (`Code.gs`) lives in Google Apps Script, NOT in this repo. It cannot be deployed via CLI — must be done through Google's browser UI.

### Endpoints
- **POST** `{scriptUrl}` — receives punch data, saves to Sheet, uploads photo to Drive
- **GET** `{scriptUrl}?action=today` — returns today's punches as JSON
- **GET** `{scriptUrl}?action=range&from=ISO&to=ISO` — returns punches in date range

### Sheet columns
`ID | Employee | Type | Type Label | Readable Time | Timestamp | Photo Taken | Photo URL`

## Capacitor Plugins
- `@capacitor/status-bar` — hides status bar in kiosk mode
- `@capacitor-community/keep-awake` — prevents screen sleep

## Common Tasks

### "Update the kiosk app and rebuild"
1. Edit `www/index.html`
2. `npx cap sync android && cd android && ./gradlew assembleDebug`
3. Transfer APK to tablet

### "Deploy dashboard update"
```bash
scp -P 2222 dashboard.html root@148.113.187.163:/var/www/vhosts/deadlinesigns.com/httpdocs/timeclock-dashboard.html
```

### "Add a new employee"
Done through the kiosk Admin panel (PIN → Employees tab → Add). No code change needed.

### "Change the default employees"
In `www/index.html`, find the `loadState()` function. Default list: `['Megan','Carlie','Noah']`

## Owner
**Kris** — Deadline Signs / Two Minds Group LLC, Concord NC
- Kris is super admin on all projects
- Never assign Kris terminal/coding tasks — produce complete files
- ADHD-friendly: keep responses concise, front-load key info
