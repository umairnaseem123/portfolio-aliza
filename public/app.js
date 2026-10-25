const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ul = (a) => '<ul>' + a.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>';
const pairs = (a) => '<ul>' + a.map(([k, v]) => `<li>${esc(k)} <span>${esc(v)}</span></li>`).join('') + '</ul>';

fetch('/api/profile').then((r) => r.json()).then(render).catch(() => { $('tagline').textContent = 'Could not load profile. Please refresh.'; });

function render(p) {
  $('name').textContent = p.name;
  $('tagline').textContent = p.tagline;
  $('facts').innerHTML = `<dt>Current roles</dt><dd>SEO Executive, WebSensePro<br>Office Executive, Adeeb Tech Lab</dd><dt>Based in</dt><dd>Karachi, Pakistan</dd><dt>Languages</dt><dd>${p.languages.map((l) => esc(l[0])).join(', ')}</dd>`;
  $('aboutText').innerHTML = p.about.map((t) => `<p>${esc(t)}</p>`).join('');
  $('services').innerHTML = p.services.map((s) => `<div class="card rv"><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p>${ul(s.i)}</div>`).join('');
  $('jobs').innerHTML = p.experience.map((j) => `<div class="job rv"><div><div class="when">${esc(j.when)}</div><div class="co">${esc(j.co)}</div></div><div><h3>${esc(j.role)}</h3>${ul(j.pts)}</div></div>`).join('');
  $('certs').innerHTML = p.certificates.map((c) => `<div class="cert rv"><img src="${esc(c.img)}" alt="Certificate: ${esc(c.t)}" loading="lazy"><div><h3>${esc(c.t)}</h3><p class="co">${esc(c.by)} · ${esc(c.when)}</p><p>${esc(c.d)}</p><p class="co">Certificate no. ${esc(c.no)}</p></div></div>`).join('');
  $('skillGrid').innerHTML = p.skills.map((g) => `<div class="rv"><h3>${esc(g.t)}</h3>${ul(g.i)}</div>`).join('') + `<div class="rv"><h3>Languages</h3>${pairs(p.languages)}</div><div class="rv"><h3>Education</h3>${pairs(p.education)}</div>`;
  const c = p.contact;
  $('ways').innerHTML = `<div><small>Email</small><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div><div><small>Phone</small><a href="tel:${esc(c.tel)}">${esc(c.phone)}</a></div><div><small>WhatsApp</small><a href="https://wa.me/${esc(c.tel.replace('+', ''))}" rel="noopener">Send a message</a></div><div><small>Location</small>${esc(c.location)}</div>`;
  typeRoles(p.roles);
  reveal();
}

function typeRoles(roles) {
  const el = $('typed');
  if (reduce) { el.textContent = roles[0]; return; }
  let r = 0, i = 0, del = false;
  (function tick() {
    const w = roles[r];
    el.textContent = w.slice(0, i);
    if (!del && i === w.length) { del = true; return setTimeout(tick, 1600); }
    if (del && i === 0) { del = false; r = (r + 1) % roles.length; }
    i += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 80);
  })();
}

function reveal() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach((n) => io.observe(n));
}

addEventListener('scroll', () => {
  const h = document.documentElement;
  $('progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
}, { passive: true });

// Hero: interactive network that reacts to the pointer
(function network() {
  const cv = $('net'), ctx = cv.getContext('2d'), hero = $('hero');
  let w, h, pts = [], m = { x: -999, y: -999 };
  const dpr = Math.min(devicePixelRatio || 1, 2);
  function size() {
    w = hero.clientWidth; h = hero.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, (w * h) / 14000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy);
        if (d < 140) { p.x -= dx * .01; p.y -= dy * .01; }
      }
      ctx.fillStyle = 'rgba(226,183,101,.8)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fill();
    }
    for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) {
      const d = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
      if (d < 120) { ctx.strokeStyle = `rgba(185,195,218,${(1 - d / 120) * .35})`; ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke(); }
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top;
    $('glow').style.setProperty('--x', m.x + 'px'); $('glow').style.setProperty('--y', m.y + 'px');
  });
  hero.addEventListener('pointerleave', () => { m.x = m.y = -999; });
  addEventListener('resize', size);
  size(); frame();
})();

// Photo card tilt (pointer devices only)
(function tilt() {
  const t = $('tilt');
  if (reduce || !matchMedia('(hover:hover)').matches) return;
  t.addEventListener('pointermove', (e) => {
    const r = t.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    t.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  t.addEventListener('pointerleave', () => { t.style.transform = ''; });
})();

// Contact form -> POST /api/contact
$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const s = $('status'), btn = e.target.querySelector('button');
  s.className = ''; s.textContent = 'Sending…'; btn.disabled = true;
  try {
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || 'Something went wrong.');
    s.className = 'ok'; s.textContent = 'Message sent. Thank you, I’ll reply soon.'; e.target.reset();
  } catch (err) { s.className = 'err'; s.textContent = err.message; }
  btn.disabled = false;
});
