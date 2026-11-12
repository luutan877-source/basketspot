'use strict';
/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const vnd = n => n.toLocaleString('vi-VN') + 'đ';
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtD = s => s.split('-').reverse().join('/');
const slotLbl = h => `${pad(h)}:00 – ${pad(h + 1)}:00`;
const S = { date: iso(new Date()), time: 'any', area: 'all', court: null, slots: [] };
const ICON = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
};
const I = n => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;
let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2600); };

/* Court artwork: SVG sân bóng rổ nhìn từ trên xuống, mỗi "viewBox" là một góc ảnh khác nhau */
function art(c, v = 0) {
  const vb = ['0 0 400 240', '10 55 220 140', '170 15 230 210', '0 70 180 110'][v], id = `g${c.id}${v}`;
  return `<svg class="art" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${c.name}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.c[0]}"/><stop offset="1" stop-color="${c.c[1]}"/></linearGradient></defs><rect width="400" height="240" fill="url(#${id})"/><rect width="400" height="240" fill="url(#pl)"/><g stroke="rgba(255,255,255,.6)" stroke-width="2" fill="none"><rect x="12" y="12" width="376" height="216"/><path d="M200 12v216"/><circle cx="200" cy="120" r="30"/><rect x="12" y="75" width="95" height="90"/><rect x="293" y="75" width="95" height="90"/><path d="M12 30a150 150 0 010 180M388 30a150 150 0 000 180"/><circle cx="107" cy="120" r="26" stroke-dasharray="4 4"/><circle cx="293" cy="120" r="26" stroke-dasharray="4 4"/></g><g fill="#fff"><circle cx="28" cy="120" r="5"/><circle cx="372" cy="120" r="5"/></g></svg>`;
}

/* ---------- global UI ---------- */
$$('[data-i]').forEach(e => e.innerHTML = I(e.dataset.i));
addEventListener('load', () => setTimeout(() => $('#loader').classList.add('off'), 500));
addEventListener('scroll', () => {
  $('#nav').classList.toggle('sc', scrollY > 30);
  $('.hero-court').style.setProperty('--sy', Math.min(scrollY, 800) * .15 + 'px');
}, { passive: true });
$('#burger').onclick = () => $('#nav').classList.toggle('open');
$('#links').onclick = () => $('#nav').classList.remove('open');
document.addEventListener('pointermove', e => {
  const c = e.target.closest?.('.card'); if (!c) return;
  const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
});
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
const reveal = () => $$('.rv:not(.in)').forEach(e => io.observe(e));
$('#hero').addEventListener('pointermove', e => {
  const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
  $('#vis').style.transform = `translate(${x * 26}px,${y * 20}px)`; $('.hero-court').style.setProperty('--px', x * -30 + 'px');
});

/* particles (ember) – tạm dừng khi hero ra khỏi màn hình */
(() => {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const cv = $('#fx'), x = cv.getContext('2d'); let w, h, on = true, P = [];
  const mk = () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + .4, v: Math.random() * .5 + .15, a: Math.random() * .6 + .2 });
  const rs = () => { w = cv.width = cv.offsetWidth; h = cv.height = cv.offsetHeight; P = Array.from({ length: Math.min(50, w / 25 | 0) }, mk); };
  rs(); addEventListener('resize', rs);
  new IntersectionObserver(e => on = e[0].isIntersecting).observe(cv);
  (function f() {
    if (on) { x.clearRect(0, 0, w, h); for (const p of P) { p.y -= p.v; p.x += Math.sin(p.y / 40) * .3; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; } x.fillStyle = `rgba(255,155,84,${p.a})`; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); } }
    requestAnimationFrame(f);
  })();
})();

/* ---------- Home: search + featured courts ---------- */
$('#s-area').innerHTML = '<option value="all">All areas</option>' + [...new Set(COURTS.map(c => c.area))].map(a => `<option>${a}</option>`).join('');
const sd = $('#s-date'); sd.value = S.date; sd.min = S.date;

function card(c) {
  const n = freeCount(c, S.date, RANGES[S.time]), st = n >= 6 ? ['ok', 'Available'] : n >= 3 ? ['mid', 'Filling fast'] : ['low', 'Almost full'];
  return `<article class="card rv"><a class="media" href="#/court/${c.id}">${art(c)}<span class="tag">${c.type}</span><span class="st ${st[0]}">${st[1]}</span></a>
  <div class="body"><h3>${c.name}</h3><p class="addr">${I('pin')}${c.addr}</p>
  <div class="row"><b>${vnd(c.price)}<small> /hour</small></b><span class="free">${n} slots free</span></div>
  <div class="acts"><a class="btn ghost sm" href="#/court/${c.id}">View Details</a><a class="btn sm" href="#/court/${c.id}/book">Book Now</a></div></div></article>`;
}
function renderGrid() {
  const list = COURTS.filter(c => (S.area === 'all' || c.area === S.area) && freeCount(c, S.date, RANGES[S.time]) > 0);
  $('#grid').innerHTML = list.length ? list.map(card).join('') : '<div class="empty">No courts available for this search. Try another date or time.</div>';
  $('#count').textContent = `${list.length} court${list.length === 1 ? '' : 's'} available on ${fmtD(S.date)}`;
  reveal();
}
$('#search').onsubmit = e => {
  e.preventDefault();
  S.area = $('#s-area').value; S.date = sd.value || S.date; S.time = $('#s-time').value;
  const b = e.submitter; b.classList.add('load');
  setTimeout(() => { b.classList.remove('load'); renderGrid(); $('#courts').scrollIntoView(); toast(`${$$('#grid .card').length} courts match your search`); }, 600);
};

/* ---------- Court detail ---------- */
function courtView(id, scrollToSlots) {
  const c = COURTS.find(x => x.id === +id); if (!c) { location.hash = '#/'; return; }
  if (S.court?.id !== c.id) { S.court = c; S.slots = []; }
  const ds = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
  if (!ds.some(d => iso(d) === S.date)) S.date = iso(ds[0]);
  $('#view-court').innerHTML = `<div class="wrap detail"><div class="dl">
    <a class="back" href="#courts">${I('arrow')}Back to courts</a>
    <div class="gmain" id="gm">${art(c, 0)}</div>
    <div class="thumbs">${[0, 1, 2, 3].map(v => `<button class="th${v ? '' : ' on'}" data-v="${v}" aria-label="Photo ${v + 1}">${art(c, v)}</button>`).join('')}</div>
    <h1>${c.name}</h1>
    <div class="meta"><span>${I('pin')}${c.addr}</span><span class="pill">${c.type}</span><span class="pill">${vnd(c.price)} / hour</span></div>
    <p>${c.desc}</p>
    <div class="feats">${c.feat.map(f => `<span>${I('check')}${f}</span>`).join('')}</div>
    <h2 id="pick">Choose date & time</h2>
    <div class="dates" id="dates">${ds.map(d => `<button class="dt${iso(d) === S.date ? ' on' : ''}" data-d="${iso(d)}"><small>${d.toLocaleDateString('en-GB', { weekday: 'short' })}</small><b>${pad(d.getDate())}</b><small>${d.toLocaleDateString('en-GB', { month: 'short' })}</small></button>`).join('')}</div>
    <div class="legend"><span><i class="dot"></i>Available</span><span><i class="dot bad"></i>Booked</span><span><i class="dot sel"></i>Selected</span></div>
    <div class="slots" id="slots"></div></div>
    <aside class="glass sum" id="sum"></aside></div>`;
  $$('.th').forEach(b => b.onclick = () => { $$('.th').forEach(x => x.classList.remove('on')); b.classList.add('on'); const g = $('#gm'); g.style.opacity = 0; setTimeout(() => { g.innerHTML = art(c, +b.dataset.v); g.style.opacity = 1; }, 200); });
  $$('.dt').forEach(b => b.onclick = () => { $$('.dt').forEach(x => x.classList.remove('on')); b.classList.add('on'); S.date = b.dataset.d; S.slots = []; drawSlots(); });
  $('#slots').onclick = e => {
    const b = e.target.closest('.slot'); if (!b || b.disabled) return; const h = +b.dataset.h, i = S.slots.indexOf(h);
    i < 0 ? S.slots.push(h) : S.slots.splice(i, 1);
    b.className = 'slot ' + (i < 0 ? 'sel' : 'ok'); b.querySelector('span').textContent = i < 0 ? 'Selected' : 'Available'; drawSum();
  };
  drawSlots(); if (scrollToSlots) setTimeout(() => $('#pick').scrollIntoView(), 80);
}
function drawSlots() {
  const c = S.court;
  $('#slots').innerHTML = HOURS.map(h => { const b = booked(c, S.date, h); return `<button class="slot ${b ? 'bad' : 'ok'}" data-h="${h}" ${b ? 'disabled' : ''}><b>${slotLbl(h)}</b><span>${b ? 'Booked' : 'Available'}</span></button>`; }).join('');
  drawSum();
}
function drawSum() {
  const c = S.court, hs = [...S.slots].sort((a, b) => a - b), total = hs.length * c.price;
  $('#sum').innerHTML = `<h3>Your booking</h3><dl><dt>Court</dt><dd>${c.name}</dd><dt>Date</dt><dd>${fmtD(S.date)}</dd><dt>Slots</dt><dd class="chips">${hs.length ? hs.map(h => `<i>${pad(h)}:00</i>`).join('') : '–'}</dd><dt>Total hours</dt><dd>${hs.length} h</dd><dt>Price</dt><dd>${vnd(c.price)} / h</dd></dl>
  <div class="total"><span>Total</span><b>${vnd(total)}</b></div><button class="btn" id="go" ${hs.length ? '' : 'disabled'}>Continue to Booking${I('arrow')}</button>`;
  $('#go').onclick = () => { location.hash = '#/booking'; };
}

/* ---------- Booking ---------- */
function bookingView() {
  const c = S.court, hs = [...S.slots].sort((a, b) => a - b), total = hs.length * c.price;
  $('#view-booking').innerHTML = `<div class="wrap book"><a class="back" href="#/court/${c.id}">${I('arrow')}Change time</a><h2>Confirm your booking</h2>
  <div class="bgrid"><form id="bf" class="glass" novalidate><h3>Player details</h3>
    <label>Full name<input name="n" placeholder="Nguyễn Văn A" autocomplete="name"><span class="err"></span></label>
    <label>Phone number<input name="p" type="tel" placeholder="0900 000 000" autocomplete="tel"><span class="err"></span></label>
    <label>Email (optional)<input name="e" type="email" placeholder="you@email.com" autocomplete="email"><span class="err"></span></label>
    <button class="btn" id="cf">Confirm Booking</button></form>
  <aside class="glass sum"><h3>${c.name}</h3><dl><dt>Date</dt><dd>${fmtD(S.date)}</dd><dt>Slots</dt><dd class="chips">${hs.map(h => `<i>${slotLbl(h)}</i>`).join('')}</dd><dt>Total hours</dt><dd>${hs.length} h</dd><dt>Unit price</dt><dd>${vnd(c.price)} / h</dd></dl>
  <div class="total"><span>Total</span><b>${vnd(total)}</b></div></aside></div></div>`;
  $('#bf').onsubmit = e => {
    e.preventDefault(); const f = e.target; let ok = true;
    const chk = (el, bad, msg) => { el.classList.toggle('bad', bad); el.nextElementSibling.textContent = bad ? msg : ''; if (bad) ok = false; };
    chk(f.n, f.n.value.trim().length < 2, 'Please enter your name');
    chk(f.p, !/^(\+84|0)\d{9,10}$/.test(f.p.value.replace(/\s/g, '')), 'Enter a valid phone number');
    chk(f.e, f.e.value && !/^\S+@\S+\.\S+$/.test(f.e.value), 'Invalid email');
    if (!ok) return;
    $('#cf').classList.add('load'); $('#cf').textContent = 'Processing…';
    setTimeout(() => success(f.n.value.trim(), hs, total), 1400);
  };
}
function success(name, hs, total) {
  const c = S.court, code = 'BS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  hs.forEach(h => TAKEN.add(`${c.id}|${S.date}|${h}`));
  $('#view-booking').innerHTML = `<div class="wrap"><div class="glass done"><div class="chk"><svg width="44" height="44" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></div>
  <h2>Booking confirmed</h2><p style="color:var(--mu)">See you on court, ${name}.</p><div class="code">${code}</div>
  <dl><dt>Court</dt><dd>${c.name}</dd><dt>Date</dt><dd>${fmtD(S.date)}</dd><dt>Time</dt><dd>${hs.map(h => pad(h) + ':00').join(', ')}</dd><dt>Total</dt><dd>${vnd(total)}</dd></dl>
  <div class="acts"><a class="btn" href="#/">Back to Home</a><a class="btn ghost" href="#courts">Book another</a></div></div></div>`;
  S.slots = []; renderGrid();
}

/* ---------- Router ---------- */
function route() {
  const h = location.hash, m = h.match(/^#\/court\/(\d+)(\/book)?/); let v = 'home';
  if (m) { v = 'court'; } else if (h === '#/booking') { if (!S.court || !S.slots.length) { location.hash = '#/'; return; } v = 'booking'; }
  $$('.view').forEach(e => e.classList.toggle('on', e.id === 'view-' + v));
  document.body.dataset.v = v; $('#nav').classList.remove('open');
  if (v === 'court') { courtView(m[1], !!m[2]); if (!m[2]) scrollTo(0, 0); }
  else if (v === 'booking') { bookingView(); scrollTo(0, 0); }
  else { renderGrid(); const t = h.length > 2 ? $(h) : null; requestAnimationFrame(() => t ? t.scrollIntoView() : scrollTo(0, 0)); }
}
addEventListener('hashchange', route);
renderGrid(); route(); reveal();
