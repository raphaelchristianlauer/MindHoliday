# Drug XP Tracker – Setup Guide

## Projektstruktur

```
drugxp/
├── index.html        ← Haupt-HTML (App Shell)
├── manifest.json     ← PWA-Manifest (Icon, Name, Farben)
├── sw.js             ← Service Worker (Offline + Push)
├── css/
│   └── style.css     ← Komplettes Styling (mobile-first, dark mode)
├── js/
│   └── app.js        ← Gesamte App-Logik
└── icons/
    ├── icon-192.png  ← App-Icon (musst du selbst erstellen)
    └── icon-512.png  ← App-Icon groß
```

---

## Schritt 1 – Lokal testen

Du brauchst einen lokalen Server (kein einfaches file:// wegen Service Worker).

**Option A – mit VS Code:**
1. Extension "Live Server" installieren
2. Rechtsklick auf index.html → "Open with Live Server"

**Option B – mit Node.js:**
```bash
npx serve .
```
→ Öffne http://localhost:3000

**Option C – mit Python:**
```bash
python3 -m http.server 8080
```
→ Öffne http://localhost:8080

---

## Schritt 2 – Icons erstellen

Erstelle zwei quadratische Icons:
- `icons/icon-192.png` (192×192 px)
- `icons/icon-512.png` (512×512 px)

Einfach mit Figma, Canva oder einem beliebigen Bildeditor.
Tipp: Ein grüner Hintergrund (#1D9E75) mit einem 🌿 Emoji als Bild reicht fürs Erste.

---

## Schritt 3 – Auf Vercel deployen (kostenlos)

1. GitHub-Account erstellen (falls noch nicht vorhanden)
2. Neues Repository erstellen, alle Dateien hochladen
3. vercel.com aufrufen → "Import Project" → GitHub-Repo wählen
4. Deploy klicken → fertig!

Deine App ist dann unter `dein-name.vercel.app` erreichbar.

---

## Schritt 4 – Auf dem Handy installieren

**Android (Chrome):**
- Öffne die URL im Chrome Browser
- Tippe auf die 3 Punkte (Menü) → "Zum Startbildschirm hinzufügen"

**iPhone (Safari):**
- Öffne die URL in Safari (nicht Chrome!)
- Tippe auf das Teilen-Symbol → "Zum Home-Bildschirm"

---

## Schritt 5 – Supabase Backend (für echtes Multiplayer)

Aktuell speichert die App alles lokal (localStorage).
Für das echte Leaderboard und Freundesliste:

1. Account auf supabase.com erstellen
2. Neues Projekt anlegen
3. Folgende Tabellen erstellen:

```sql
-- Spieler
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  code text unique not null,
  xp integer default 0,
  created_at timestamptz default now()
);

-- Sessions
create table sessions (
  id bigserial primary key,
  user_id uuid references users(id),
  drug text,
  strain text,
  amount float,
  unit text,
  intensity int,
  wellbeing int,
  moods text[],
  note text,
  xp int,
  created_at timestamptz default now()
);

-- Freundschaften
create table friendships (
  id bigserial primary key,
  user_id uuid references users(id),
  friend_id uuid references users(id),
  created_at timestamptz default now()
);

-- Badges
create table badges (
  id bigserial primary key,
  user_id uuid references users(id),
  badge_id text,
  unlocked_at timestamptz default now()
);
```

4. Den Supabase-URL und anon-key in `js/app.js` eintragen:

```js
const SUPABASE_URL = 'https://DEIN-PROJEKT.supabase.co';
const SUPABASE_KEY = 'dein-anon-key';
```

---

## Push-Benachrichtigungen aktivieren

Für echte Push-Notifications (wenn jemand dich überholt etc.)
wird ein Push-Server benötigt. Einfachste Option: Supabase Edge Functions.

Die nötige Logik ist bereits im Service Worker (`sw.js`) vorbereitet.

---

## Tech Stack Zusammenfassung

| Was | Womit | Kosten |
|-----|-------|--------|
| Frontend | Vanilla HTML/CSS/JS | kostenlos |
| PWA | manifest.json + Service Worker | kostenlos |
| Hosting | Vercel | kostenlos |
| Datenbank | Supabase (PostgreSQL) | kostenlos bis 500 MB |
| Auth | Supabase Auth | kostenlos |
| Realtime | Supabase Realtime | kostenlos |
| Push | Web Push API + Supabase Functions | kostenlos |

**Gesamt: 0€/Monat** für normalen Betrieb.
