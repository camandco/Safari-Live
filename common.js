// Shared menu and login for Safari Live and Safari Tick.
(function () {
  const PASS_HASH = '998ad19e808bf5071db74ee711377d5b4b59e0381fb26f8667286747e1708139';
  const NAMES = ['Cam', 'Melissa', 'Keegan', 'Mark', 'Tracy'];
  const page = document.body.dataset.page || 'dashboard';
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  const IC = {
    dashboard: '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z"/>',
    tick: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l3 3 5-6.5"/>',
    comp: '<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    help: '<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM9 9h6M9 13h6"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.6-4 3.4-6 7-6s6.4 2 7 6"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  };
  const icon = (k) => { const s = document.createElement('span'); s.style.display = 'contents'; s.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`; return s.firstChild; };
  /* ---------- menu ---------- */
  const nav = el('nav', 'sx-nav');
  const burger = el('button', 'sx-burger'); burger.type = 'button'; burger.setAttribute('aria-label', 'Open menu'); burger.appendChild(el('span'));
  const title = el('div', 'sx-title', ({ tick: 'Log sightings', comp: 'Photo comp', help: 'How to use' })[page] || 'Safari Live');
  const off = el('span', 'sx-off', 'No signal'); const net = () => { off.hidden = navigator.onLine; }; addEventListener('online', net); addEventListener('offline', net); net();
  nav.append(burger, title, off);
  document.body.prepend(nav);
  const shade = el('div', 'sx-shade');
  const drawer = el('aside', 'sx-drawer'); drawer.setAttribute('aria-label', 'Menu');
  const head = el('div', 'sx-dhead'); const who = el('div', 'u');
  head.append(el('div', 't', 'Safari Live'), who);
  const links = el('div', 'sx-links');
  const ORIGINALS = ['Cam', 'Melissa', 'Keegan', 'Mark', 'Tracy'];
  const compLinks = [];
  [['dashboard', './', 'Dashboard'], ['tick', 'tick.html', 'Log sightings'], ['comp', 'comp.html', 'Photo comp'], ['help', 'help.html', 'How to use']].forEach(([id, href, label]) => {
    const a = el('a', page === id ? 'on' : ''); a.href = href; a.append(icon(id), label); if (page === id) a.setAttribute('aria-current', 'page'); links.appendChild(a);
    if (id === 'comp') compLinks.push(a);
  });
  links.appendChild(el('div', 'sx-sep'));
  const sw = el('button'); sw.type = 'button'; sw.append(icon('user'), 'Switch person');
  const out = el('button'); out.type = 'button'; out.append(icon('lock'), 'Log out');
  links.append(sw, out);
  drawer.append(head, links, el('div', 'sx-ver', 'Works without signal. Version 20.'));
  document.body.append(shade, drawer);
  const openMenu = (o) => { drawer.classList.toggle('open', o); shade.classList.toggle('open', o); };
  burger.onclick = () => openMenu(true); shade.onclick = () => openMenu(false);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') openMenu(false); });
  sw.onclick = () => { openMenu(false); showNames(); };
  out.onclick = () => { openMenu(false); ls.del('me'); ls.del('code'); ls.del('authHash'); showPassword(); };
  const navH = () => document.documentElement.style.setProperty('--navh', nav.offsetHeight + 'px');
  addEventListener('resize', navH); navH();

  /* ---------- login ---------- */
  const box = el('div', 'sx-login'); box.hidden = true;
  const card = el('div', 'sx-card'); box.appendChild(card); document.body.appendChild(box);

  async function hash(t) {
    if (!(window.crypto && crypto.subtle)) return null;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  function showPassword() {
    card.replaceChildren();
    card.append(el('h2', null, 'Safari Live'), el('p', null, 'Enter the trip password to come in.'));
    const inp = el('input', 'sx-in'); inp.type = 'password'; inp.placeholder = 'Trip password'; inp.autocapitalize = 'characters'; inp.autocomplete = 'current-password';
    const go = el('button', 'sx-go', 'Enter'); const err = el('p', 'sx-err');
    card.append(inp, go, err);
    const tryIt = async () => {
      const code = inp.value.trim().toUpperCase();
      if (!code) { err.textContent = 'Enter the password.'; return; }
      const h = await hash(code);
      if (h && h !== PASS_HASH) { err.textContent = 'That password is not right.'; inp.select(); return; }
      ls.set('code', code); ls.set('authHash', PASS_HASH); showNames();
    };
    go.onclick = tryIt; inp.onkeydown = (e) => { if (e.key === 'Enter') tryIt(); };
    box.hidden = false; setTimeout(() => inp.focus(), 50);
  }
  function showNames() {
    card.replaceChildren();
    card.append(el('h2', null, 'Who are you?'), el('p', null, 'Everything you log on this phone is saved under your name.'));
    const grid = el('div', 'sx-names');
    NAMES.forEach((n) => { const b = el('button', null, n); b.type = 'button'; b.onclick = () => { ls.set('me', n); box.hidden = true; refresh(); window.dispatchEvent(new CustomEvent('safari-login', { detail: { me: n } })); }; grid.appendChild(b); });
    card.appendChild(grid);
    box.hidden = false;
  }
  function refresh() { const m = ls.get('me', ''); compLinks.forEach((x) => { x.hidden = !ORIGINALS.includes(m); }); who.textContent = m ? `Signed in as ${m}` : 'Not signed in'; title.replaceChildren(({ tick: 'Log sightings', comp: 'Photo comp', help: 'How to use' })[page] || 'Safari Live'); if (m) title.appendChild(el('small', null, m)); }

  window.SafariAuth = { me: () => ls.get('me', ''), code: () => ls.get('code', ''), switchUser: showNames };
  refresh();
  if (ls.get('authHash', '') !== PASS_HASH || !ls.get('code', '')) showPassword();
  else if (!ls.get('me', '')) showNames();
})();
