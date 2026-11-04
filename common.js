// Shared menu and login for Safari Live and Safari Tick.
(function () {
  const PASS_HASH = 'ad2d3afc52205654b44082cb32f1636cfe0df9a7db7b11cd0712cd21078dc56d';
  const NAMES = ['Cam', 'Melissa', 'Keegan', 'Mark', 'Tracy'];
  const page = document.body.dataset.page || 'dashboard';
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  const css = `
  .sx-nav{position:sticky;top:0;z-index:60;background:#2A1A10;color:#FFF1DC;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;display:flex;align-items:center;gap:12px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.25)}
  .sx-burger{width:40px;height:40px;border:0;border-radius:10px;background:rgba(255,255,255,.1);display:grid;place-items:center;cursor:pointer;flex:none}
  .sx-burger span{display:block;width:20px;height:2px;background:#FFE9CC;border-radius:2px;box-shadow:0 -6px 0 #FFE9CC,0 6px 0 #FFE9CC}
  .sx-title{font-family:"DM Serif Display",Georgia,serif;font-size:19px;color:#F6C46B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sx-title small{font-family:Inter,sans-serif;font-size:13px;color:#C9B38A;margin-left:8px}
  .sx-shade{position:fixed;inset:0;z-index:90;background:rgba(20,12,6,.5);opacity:0;pointer-events:none;transition:opacity .25s}
  .sx-shade.open{opacity:1;pointer-events:auto}
  .sx-drawer{position:fixed;top:0;bottom:0;left:0;z-index:91;width:min(82vw,300px);background:#FFFBF3;color:#3E2723;transform:translateX(-102%);transition:transform .3s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:8px 0 30px rgba(0,0,0,.3)}
  .sx-drawer.open{transform:none}
  .sx-dhead{background:linear-gradient(180deg,#E0892F,#8C3B1E);color:#FFF8EC;padding:calc(22px + env(safe-area-inset-top)) 18px 18px}
  .sx-dhead .g{font-size:34px;line-height:1}
  .sx-dhead .t{font-family:"DM Serif Display",Georgia,serif;font-size:24px;margin-top:6px}
  .sx-dhead .u{font-size:13px;opacity:.9;margin-top:2px}
  .sx-links{padding:10px 8px;display:flex;flex-direction:column;gap:2px}
  .sx-links a,.sx-links button{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;background:none;color:inherit;text-decoration:none;font-size:16px;font-weight:600;padding:13px 12px;border-radius:10px;cursor:pointer;font-family:inherit}
  .sx-links a.on{background:#F3E4C8;color:#8C3B1E}
  .sx-links a:hover,.sx-links button:hover{background:#F4EBD9}
  .sx-links i{font-style:normal;width:24px;text-align:center;font-size:18px}
  .sx-sep{height:1px;background:#E2D3B5;margin:8px 12px}
  .sx-links button{font-weight:500;color:#7A6450}
  .sx-login{position:fixed;inset:0;z-index:100;background:linear-gradient(180deg,#F6C46B 0%,#E0892F 45%,#8C3B1E 100%);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .sx-login[hidden]{display:none}
  .sx-card{background:#FFFBF3;color:#3E2723;width:min(100%,420px);border-radius:20px;padding:24px 20px;box-shadow:0 20px 50px rgba(0,0,0,.35)}
  .sx-card h2{font-family:"DM Serif Display",Georgia,serif;font-weight:400;font-size:30px;margin:0;color:#2F4F2F}
  .sx-card p{margin:6px 0 14px;color:#7A6450;font-size:14px}
  .sx-in{width:100%;font-size:18px;padding:13px 14px;border-radius:12px;border:1px solid #E2D3B5;background:#F4EBD9;color:#3E2723;margin-bottom:12px}
  .sx-go{width:100%;border:0;border-radius:12px;padding:14px;font-size:16px;font-weight:700;background:#C8742B;color:#fff;cursor:pointer}
  .sx-names{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0 4px}
  .sx-names button{border:2px solid #E2D3B5;background:#F4EBD9;color:#3E2723;border-radius:12px;padding:16px 10px;font-size:17px;font-weight:600;cursor:pointer}
  .sx-names button:hover{border-color:#C8742B}
  .sx-err{color:#B3261E;font-size:14px;min-height:1.2em;margin:8px 0 0}
  .sx-giraffe{font-size:40px;line-height:1}`;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

  /* ---------- menu ---------- */
  const nav = el('nav', 'sx-nav');
  const burger = el('button', 'sx-burger'); burger.type = 'button'; burger.setAttribute('aria-label', 'Open menu'); burger.appendChild(el('span'));
  const title = el('div', 'sx-title', page === 'tick' ? 'Log sightings' : 'Safari Live');
  nav.append(burger, title);
  document.body.prepend(nav);
  const shade = el('div', 'sx-shade');
  const drawer = el('aside', 'sx-drawer'); drawer.setAttribute('aria-label', 'Menu');
  const head = el('div', 'sx-dhead'); const who = el('div', 'u');
  head.append(el('div', 'g', '🦒'), el('div', 't', 'Safari Live'), who);
  const links = el('div', 'sx-links');
  [['dashboard', './', '📊', 'Dashboard'], ['tick', 'tick.html', '✅', 'Log sightings']].forEach(([id, href, ic, label]) => {
    const a = el('a', page === id ? 'on' : ''); a.href = href; a.append(el('i', null, ic), label); links.appendChild(a);
  });
  links.appendChild(el('div', 'sx-sep'));
  const sw = el('button'); sw.type = 'button'; sw.append(el('i', null, '👤'), 'Switch person');
  const out = el('button'); out.type = 'button'; out.append(el('i', null, '🔒'), 'Log out');
  links.append(sw, out);
  drawer.append(head, links);
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
    card.append(el('div', 'sx-giraffe', '🦒'), el('h2', null, 'Safari Live'), el('p', null, 'Enter the trip password to come in.'));
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
    card.append(el('div', 'sx-giraffe', '🦒'), el('h2', null, 'Who are you?'), el('p', null, 'Everything you log on this phone is saved under your name.'));
    const grid = el('div', 'sx-names');
    NAMES.forEach((n) => { const b = el('button', null, n); b.type = 'button'; b.onclick = () => { ls.set('me', n); box.hidden = true; refresh(); window.dispatchEvent(new CustomEvent('safari-login', { detail: { me: n } })); }; grid.appendChild(b); });
    card.appendChild(grid);
    box.hidden = false;
  }
  function refresh() { const m = ls.get('me', ''); who.textContent = m ? `Signed in as ${m}` : 'Not signed in'; title.replaceChildren(page === 'tick' ? 'Log sightings' : 'Safari Live'); if (m) title.appendChild(el('small', null, m)); }

  window.SafariAuth = { me: () => ls.get('me', ''), code: () => ls.get('code', ''), switchUser: showNames };
  refresh();
  if (ls.get('authHash', '') !== PASS_HASH || !ls.get('code', '')) showPassword();
  else if (!ls.get('me', '')) showNames();
})();
