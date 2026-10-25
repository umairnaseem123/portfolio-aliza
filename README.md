# Alizah Fatima – Full-stack Portfolio

Node.js + Express backend, vanilla JS frontend (no build step).

## Run locally
1. Install Node.js 18 or newer.
2. `npm install`
3. `ADMIN_KEY=your-long-secret npm start`  (Windows PowerShell: `$env:ADMIN_KEY="your-long-secret"; npm start`)
4. Open http://localhost:3000

## How it works
- `data/profile.json` – all your content. Edit this file to update the site (no code changes).
- `GET /api/profile` – serves the content to the page.
- `POST /api/contact` – validates and saves contact messages to `data/messages.json` (rate-limited, spam honeypot).
- `GET /api/messages` – read messages with header `x-admin-key`. Or open `/admin.html`.
- `public/` – frontend (index.html, style.css, app.js, assets/).

## Deploy
Any Node host works (Render, Railway, Fly.io, a VPS). Set `ADMIN_KEY` as an environment variable.
Note: on free hosts the file system may reset, so for permanent messages swap `messages.json` for a database (e.g. SQLite or MongoDB) or add email sending.
