const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ul = (a) => '<ul>' + a.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>';
const safe = (u) => (/^https?:\/\//i.test(u) ? esc(u) : '#');
const ICONS = ['<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', '<path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/><path d="m14 7 3 3"/>'];

fetch('/api/profile').then((r) => r.json()).then(render).catch(() => { $('aboutText').textContent = 'Could not load profile. Please refresh.'; });

function render(p) {
  const c = p.contact, wa = 'https://wa.me/' + c.tel.replace('+', '');
  window.__c = c;
  $('aboutText').innerHTML = [...p.about].map((t) => `<p>${esc(t)}</p>`).join('') + `<p>${esc(p.tagline)}</p>`;
  $('facts').innerHTML = `<dt>Based in</dt><dd>Karachi, Pakistan</dd><dt>Current roles</dt><dd>SEO Executive, WebSensePro<br>Office Executive, Adeeb Tech Lab</dd><dt>Languages</dt><dd>${p.languages.map((l) => `${esc(l[0])} (${esc(l[1])})`).join('<br>')}</dd><dt>Education</dt><dd>${p.education.map((e) => `${esc(e[0])}: ${esc(e[1])}`).join('<br>')}</dd>`;
  $('socials').innerHTML = `<a href="mailto:${esc(c.email)}">Email</a><a href="${wa}" rel="noopener">WhatsApp</a>` + (p.socials || []).map((s) => `<a href="${safe(s.url)}" rel="noopener" target="_blank">${esc(s.label)}</a>`).join('');
  $('jobs').innerHTML = p.experience.map((j) => `<article class="job rv"><span class="when">${esc(j.when)}</span><h3>${esc(j.role)}</h3><p class="co">${esc(j.co)}</p>${ul(j.pts)}</article>`).join('');
  $('svc').innerHTML = p.services.map((s, i) => `<div class="card rv"><div class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[i] || ICONS[0]}</svg></div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p>${ul(s.i)}</div>`).join('');
  const pr = p.projects || [];
  $('proj').innerHTML = pr.length ? pr.map((x) => `<article class="proj rv">${x.image ? `<img src="${esc(x.image)}" alt="${esc(x.title)}" loading="lazy">` : ''}<div class="pb"><small>${esc(x.category || '')}</small><h3>${esc(x.title)}</h3><p>${esc(x.overview || '')}</p>${x.contribution ? `<p><b>My contribution:</b> ${esc(x.contribution)}</p>` : ''}${x.results ? `<p><b>Results:</b> ${esc(x.results)}</p>` : ''}${x.link ? `<a class="btn sec" href="${safe(x.link)}" target="_blank" rel="noopener">View project</a>` : ''}</div></article>`).join('')
    : `<div class="empty rv"><h3>Case studies are being prepared</h3><p>I’m putting together real examples of my SEO, social media and ads work. Want to see relevant samples now? Just ask.</p><a class="btn pri" href="#contact">Request samples</a></div>`;
  $('certs').innerHTML = p.certificates.map((x, i) => `<button class="cert rv" type="button" data-i="${i}"><img src="${esc(x.img)}" alt="Certificate: ${esc(x.t)}" loading="lazy"><div><h3>${esc(x.t)}</h3><p>${esc(x.by)} · ${esc(x.when)}</p><p>No. ${esc(x.no)}</p><p class="hint">Click to preview</p></div></button>`).join('');
  $('skillGrid').innerHTML = p.skills.map((g) => `<div class="rv"><h3>${esc(g.t)}</h3><div class="tags">${g.i.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>`).join('');
  $('ways').innerHTML = `<a href="mailto:${esc(c.email)}"><small>Email</small><b>${esc(c.email)}</b></a><a href="${wa}" rel="noopener"><small>WhatsApp</small><b>${esc(c.phone)}</b></a><div><small>Location</small><b>${esc(c.location)}</b></div>`;
  $('certs').addEventListener('click', (e) => { const b = e.target.closest('.cert'); if (!b) return; const x = p.certificates[+b.dataset.i]; $('dimg').src = x.img; $('dimg').alt = 'Certificate: ' + x.t; $('dlg').showModal(); });
  motion();
}

function motion() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) els.forEach((n) => n.classList.add('in'));
  else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.1 }); els.forEach((n) => io.observe(n)); }
  const links = [...document.querySelectorAll('#menu a')];
  const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach((s) => so.observe(s));
}

const menu = $('menu'), burger = $('burger');
const setMenu = (o) => { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); };
burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
$('dx').addEventListener('click', () => $('dlg').close());
$('dlg').addEventListener('click', (e) => { if (e.target === $('dlg')) $('dlg').close(); });

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const s = $('status'), btn = e.target.querySelector('button');
  s.className = ''; s.textContent = 'Sending…'; btn.disabled = true;
  try {
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
    const d = await res.json();
    if (res.status === 503 && window.__c) {
      const f = Object.fromEntries(new FormData(e.target));
      location.href = `mailto:${window.__c.email}?subject=${encodeURIComponent('Portfolio message from ' + f.name)}&body=${encodeURIComponent(f.message + '\n\n' + f.name + ' (' + f.email + ')')}`;
      s.className = 'ok'; s.textContent = 'Opening your email app to send the message…'; btn.disabled = false; return;
    }
    if (!res.ok) throw new Error(d.error || 'Something went wrong.');
    s.className = 'ok'; s.textContent = 'Message sent. Thank you, I’ll reply soon.'; e.target.reset();
  } catch (err) { s.className = 'err'; s.textContent = err.message; }
  btn.disabled = false;
});
