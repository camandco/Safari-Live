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
  .sx-nav{position:sticky;top:0;z-index:60;background:#2A1A10;color:#FFF1DC;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;display:flex;align-items:center;gap:8px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.25)}
  .sx-brand{font-family:"DM Serif Display",Georgia,serif;font-size:18px;color:#F6C46B;margin-right:auto;white-space:nowrap}
  .sx-tabs{display:flex;gap:4px;background:rgba(255,255,255,.08);border-radius:12px;padding:3px}
  .sx-tabs a{color:#FFE9CC;text-decoration:none;font-size:14px;font-weight:600;padding:7px 12px;border-radius:9px;white-space:nowrap}
  .sx-tabs a.on{background:#E0892F;color:#2A1A10}
  .sx-user{border:0;background:#E8B53C;color:#2A1A10;font-weight:700;font-size:13px;border-radius:20px;padding:7px 11px;cursor:pointer;white-space:nowrap}
  .sx-menu{position:absolute;right:10px;top:calc(100% + 6px);background:#FFFBF3;color:#3E2723;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.3);min-width:180px;overflow:hidden}
  .sx-menu[hidden]{display:none}
  .sx-menu button{display:block;width:100%;text-align:left;border:0;background:none;padding:12px 14px;font-size:15px;color:inherit;cursor:pointer}
  .sx-menu button+button{border-top:1px solid #E2D3B5}
  @media (max-width:520px){.sx-brand{font-size:0}.sx-brand::before{content:"🦒";font-size:20px}.sx-tabs a{padding:7px 10px;font-size:13px}}
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
  nav.appendChild(el('div', 'sx-brand', 'Safari Live'));
  const tabs = el('div', 'sx-tabs');
  [['dashboard', './', 'Dashboard'], ['tick', 'tick.html', 'Log sightings']].forEach(([id, href, label]) => {
    const a = el('a', page === id ? 'on' : '', label); a.href = href; tabs.appendChild(a);
  });
  nav.appendChild(tabs);
  const user = el('button', 'sx-user', '…'); user.type = 'button';
  const menu = el('div', 'sx-menu'); menu.hidden = true;
  const sw = el('button', null, 'Switch person'); const out = el('button', null, 'Log out');
  menu.append(sw, out);
  nav.append(user, menu);
  document.body.prepend(nav);
  user.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; };
  document.addEventListener('click', () => { menu.hidden = true; });
  sw.onclick = () => { menu.hidden = true; showNames(); };
  out.onclick = () => { menu.hidden = true; ls.del('me'); ls.del('code'); ls.del('authHash'); showPassword(); };
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
  function refresh() { user.textContent = ls.get('me', '') || 'Sign in'; }

  window.SafariAuth = { me: () => ls.get('me', ''), code: () => ls.get('code', ''), switchUser: showNames };
  refresh();
  if (ls.get('authHash', '') !== PASS_HASH || !ls.get('code', '')) showPassword();
  else if (!ls.get('me', '')) showNames();
})();
