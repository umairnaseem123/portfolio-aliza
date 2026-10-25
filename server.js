const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const DATA = path.join(__dirname, 'data');
const MSG = path.join(DATA, 'messages.json');

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/profile', (req, res) => res.sendFile(path.join(DATA, 'profile.json')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many messages. Please try again later.' } });

app.post('/api/contact', limiter, (req, res) => {
  const { name = '', email = '', message = '', website = '' } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot: silently drop bots
  const n = String(name).trim(), e = String(email).trim(), m = String(message).trim();
  if (n.length < 2 || n.length > 80) return res.status(400).json({ error: 'Please enter your name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 120) return res.status(400).json({ error: 'Please enter a valid email.' });
  if (m.length < 10 || m.length > 2000) return res.status(400).json({ error: 'Message must be 10 to 2000 characters.' });
  let list = [];
  try { list = JSON.parse(fs.readFileSync(MSG, 'utf8')); } catch (_) {}
  list.unshift({ id: Date.now().toString(36), name: n, email: e, message: m, at: new Date().toISOString() });
  fs.writeFileSync(MSG, JSON.stringify(list, null, 2));
  res.json({ ok: true });
});

app.get('/api/messages', (req, res) => {
  if (!ADMIN_KEY || req.get('x-admin-key') !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorised' });
  try { res.json(JSON.parse(fs.readFileSync(MSG, 'utf8'))); } catch (_) { res.json([]); }
});

app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
