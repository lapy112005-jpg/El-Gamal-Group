(() => {
const SITE = window.SITE;
const PHONE = SITE.whatsapp;
const { cats, items } = window.DATA;
const $ = s => document.querySelector(s);
const wa = (msg) => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
const fmt = n => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const catTitle = Object.fromEntries(cats.map(c => [c.id, c.title]));

const norm = s => String(s).toLowerCase()
  .replace(/[\u064B-\u065F\u0640]/g, '')
  .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s+/g, ' ').trim();
items.forEach((it, i) => { it.k = norm(it.n + ' ' + it.code); it.o = i; });

const st = { cat: 'all', q: '', sort: 'def', shown: 0, list: [] };
const STEP = 48;
const grid = $('#grid');

// links
const hello = 'أهلاً الجمل جروب، عايز أستفسر عن الأصناف والأسعار';
['#waTop', '#waHero', '#waFab'].forEach(s => $(s).href = wa(hello));
['#tgTop', '#tgFab'].forEach(s => $(s).href = SITE.telegram);

// contact section (data comes from config.js)
const ICONS = {
  phone: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.45 15.05L2 22l5.1-1.55A9.9 9.9 0 1 0 12.04 2Zm4.5 11.95c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.3-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7 1.55.67 2.15.73 2.93.62.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.47-.28Z"/></svg>',
  tg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21.4 3.6 2.9 10.7c-1.2.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.5c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8L22.9 5c.3-1.3-.5-1.8-1.5-1.4ZM9 13.5l9.6-6c.5-.3.9-.1.5.2l-7.8 7.1-.3 3.2L9 13.5Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};
const cards = [
  ...SITE.phones.map(p => ({ ic: 'phone', label: p.label, val: p.number, ltr: true, href: 'tel:' + p.number.replace(/\s+/g, '') })),
  { ic: 'wa', cls: 'wa', label: 'واتساب', val: SITE.whatsappShow, ltr: true, href: wa(hello), ext: true },
  { ic: 'tg', cls: 'tg', label: 'تليجرام', val: SITE.telegramShow, ltr: true, href: SITE.telegram, ext: true },
  { ic: 'mail', label: 'البريد الإلكتروني', val: SITE.email, ltr: true, href: 'mailto:' + SITE.email },
  { ic: 'pin', label: 'العنوان', val: SITE.address },
  { ic: 'clock', label: 'مواعيد العمل', val: SITE.hours }
];
$('#contactGrid').innerHTML = cards.map(c => {
  const inner = `<span class="c-ic ${c.cls || ''}">${ICONS[c.ic]}</span><span class="c-txt"><span class="c-label">${esc(c.label)}</span><span class="c-val${c.ltr ? ' ltr' : ''}">${esc(c.val)}</span></span>`;
  return c.href ? `<a class="c-card" href="${esc(c.href)}"${c.ext ? ' target="_blank" rel="noopener"' : ''}>${inner}</a>` : `<div class="c-card">${inner}</div>`;
}).join('');

// chips
const counts = { all: items.length };
items.forEach(i => counts[i.c] = (counts[i.c] || 0) + 1);
const chips = $('#chips');
[{ id: 'all', title: 'الكل' }, ...cats].forEach(c => {
  const b = document.createElement('button');
  b.className = 'chip'; b.role = 'tab'; b.dataset.id = c.id;
  b.innerHTML = `${c.title}<span>${fmt(counts[c.id])}</span>`;
  b.onclick = () => setCat(c.id);
  chips.appendChild(b);
});

function setCat(id) {
  st.cat = id;
  chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-selected', c.dataset.id === id));
  const active = chips.querySelector('[aria-selected="true"]');
  if (active) chips.scrollTo({ left: active.offsetLeft - chips.clientWidth / 2 + active.clientWidth / 2, behavior: 'smooth' });
  refresh();
}

function refresh() {
  const toks = norm(st.q).split(' ').filter(Boolean);
  let l = items.filter(it => (st.cat === 'all' || it.c === st.cat) && toks.every(t => it.k.includes(t)));
  if (st.sort === 'asc') l.sort((a, b) => a.p - b.p || a.o - b.o);
  else if (st.sort === 'desc') l.sort((a, b) => b.p - a.p || a.o - b.o);
  else if (st.sort === 'name') l.sort((a, b) => a.n.localeCompare(b.n, 'ar'));
  st.list = l; st.shown = 0; grid.innerHTML = '';
  $('#count').textContent = `${fmt(l.length)} صنف` + (toks.length ? ' مطابق للبحث' : '');
  $('#empty').hidden = l.length > 0;
  $('#waEmpty').href = wa(`أهلاً الجمل جروب، بسأل عن: ${st.q}`);
  more();
}

function more() {
  const part = st.list.slice(st.shown, st.shown + STEP);
  const frag = document.createDocumentFragment();
  part.forEach(it => {
    const el = document.createElement('article'); el.className = 'card';
    const ph = it.i
      ? `<button class="ph" data-img="${it.i}" data-cap="${esc(it.n)}" aria-label="تكبير صورة ${esc(it.n)}"><img src="${it.i}" alt="${esc(it.n)}" loading="lazy" decoding="async"></button>`
      : `<div class="ph none"><img src="logo.png" alt="" loading="lazy"></div>`;
    const msg = `أهلاً الجمل جروب، عايز أطلب: ${it.n}` + (it.code ? ` (كود: ${it.code})` : '') + ` - السعر ${fmt(it.p)} ج.م`;
    const wai = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.45 15.05L2 22l5.1-1.55A9.9 9.9 0 1 0 12.04 2Zm4.5 11.95c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.3-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7 1.55.67 2.15.73 2.93.62.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.47-.28Z"/></svg>';
    el.innerHTML = `${ph}<div class="info"><h3>${esc(it.n)}</h3><div class="code">${it.code ? esc(it.code) : ''}</div><div class="buy"><div class="price">${fmt(it.p)}<small>ج.م</small></div><a class="ask" target="_blank" rel="noopener" href="${wa(msg)}" aria-label="اطلب ${esc(it.n)} على واتساب">${wai}<span class="l">اطلب على واتساب</span><span class="s">اطلب</span></a></div></div>`;
    frag.appendChild(el);
  });
  grid.appendChild(frag); st.shown += part.length;
  $('#more').hidden = st.shown >= st.list.length;
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

$('#more').onclick = more;
$('#sort').onchange = e => { st.sort = e.target.value; refresh(); };

// search
const panel = $('#searchPanel'), btn = $('#searchBtn'), qi = $('#q');
function toggleSearch(open) {
  panel.hidden = !open; btn.setAttribute('aria-expanded', open);
  if (open) qi.focus();
}
btn.onclick = () => toggleSearch(panel.hidden);
$('#searchForm').onsubmit = e => { e.preventDefault(); toggleSearch(false); $('#catalog').scrollIntoView(); };
let t; qi.oninput = () => {
  clearTimeout(t); t = setTimeout(() => {
    st.q = qi.value;
    if (st.q.trim() && st.cat !== 'all') setCat('all'); else refresh();
    if (st.q.trim()) $('#catalog').scrollIntoView({ block: 'start' });
  }, 180);
};
$('#clearQ').onclick = () => { qi.value = ''; st.q = ''; refresh(); qi.focus(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { toggleSearch(false); btn.focus(); } });

// lightbox
const lb = $('#lb');
grid.addEventListener('click', e => {
  const b = e.target.closest('.ph[data-img]'); if (!b) return;
  $('#lbImg').src = b.dataset.img; $('#lbImg').alt = b.dataset.cap; $('#lbCap').textContent = b.dataset.cap; lb.showModal();
});
$('#lbClose').onclick = () => lb.close();
lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

setCat('all');
})();
