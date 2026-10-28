/* OpenChinese — the account panel.
 *
 * Clicking your name in the header opens this instead of signing you straight
 * out. It lays out everything we actually hold about you, and signing out is
 * one of the things you can do from here rather than the only thing.
 *
 * Shared by both sections: Voice Stories and the lessons header both call
 * window.OpenChineseAccount.open().
 */

let open = false;

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function row(dl, label, value, mono) {
  const r = el('div', 'oc-row');
  r.appendChild(el('dt', null, label));
  r.appendChild(el('dd', mono ? 'oc-mono' : null, value));
  dl.appendChild(r);
  return r;
}

function when(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined,
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return String(iso); }
}

function day(d) {
  if (!d) return 'never';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString(undefined,
      { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return String(d); }
}

function close(backdrop) {
  open = false;
  backdrop.remove();
  document.removeEventListener('keydown', onKey);
}

let onKey = () => {};

async function openPanel() {
  const auth = window.OpenChineseAuth;
  if (!auth || open) return;
  open = true;

  const backdrop = el('div', 'oc-backdrop');
  const panel = el('div', 'oc-panel');
  backdrop.appendChild(panel);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(backdrop); });
  onKey = e => { if (e.key === 'Escape') close(backdrop); };
  document.addEventListener('keydown', onKey);

  const u = auth.user || {};
  const guest = !!u.anonymous;

  /* ---- who ---- */
  const head = el('div', 'oc-head');
  if (u.avatar) {
    const img = document.createElement('img');
    img.src = u.avatar; img.alt = ''; img.referrerPolicy = 'no-referrer';
    head.appendChild(img);
  } else {
    head.appendChild(el('div', 'oc-fallback', guest ? '👤' : (u.name || '?').trim().charAt(0).toUpperCase()));
  }
  const who = el('div');
  who.appendChild(el('h2', null, guest ? 'Guest account' : (u.name || 'Signed in')));
  who.appendChild(el('p', null, guest ? 'Not signed in — progress lives on this device only'
                                      : 'Signed in with Google'));
  head.appendChild(who);
  const x = el('button', 'oc-x', '✕');
  x.setAttribute('aria-label', 'Close');
  x.addEventListener('click', () => close(backdrop));
  head.appendChild(x);
  panel.appendChild(head);

  /* ---- what we store ---- */
  const store = el('div', 'oc-section');
  store.appendChild(el('h3', null, 'What we store'));
  const dl = el('dl');
  dl.style.margin = '0';
  store.appendChild(dl);
  const loading = el('p', 'oc-loading', 'Loading…');
  store.appendChild(loading);
  panel.appendChild(store);

  /* ---- account ---- */
  const acct = el('div', 'oc-section');
  acct.appendChild(el('h3', null, 'Account'));
  const dl2 = el('dl');
  dl2.style.margin = '0';
  acct.appendChild(dl2);
  panel.appendChild(acct);

  /* ---- actions ---- */
  const foot = el('div', 'oc-foot');
  if (guest) {
    const b = el('button', 'oc-signout', 'Sign in with Google to keep this');
    b.addEventListener('click', () => { close(backdrop); auth.signIn(); });
    foot.appendChild(b);
  } else {
    const b = el('button', 'oc-signout', 'Sign out');
    b.addEventListener('click', () => { close(backdrop); auth.signOut(); });
    foot.appendChild(b);
  }
  panel.appendChild(foot);

  document.body.appendChild(backdrop);

  /* ---- fill in the real numbers ---- */
  let rowData = null, sessionUser = null;
  try {
    const sb = auth.client();
    const res = await sb.from('profiles').select('*');
    rowData = (res.data || [])[0] || null;
    const s = await sb.auth.getSession();
    sessionUser = s.data && s.data.session && s.data.session.user;
  } catch (e) { /* offline or paused — fall back to the local copy below */ }

  let local = null;
  try { local = JSON.parse(localStorage.getItem('duochinese.v2') || 'null'); } catch (e) {}

  const d = rowData || local || {};
  const progress = (rowData ? rowData.progress : local && local.progress) || {};
  const lessons = Object.keys(progress).length;
  const crowns = Object.values(progress).reduce((a, b) => a + (+b || 0), 0);

  loading.remove();
  row(dl, 'XP', String(d.xp || 0));
  row(dl, 'Day streak', String(d.streak || 0));
  row(dl, 'Last practised', day(rowData ? rowData.last_day : (local && local.lastDay)));
  row(dl, 'Lessons started', String(lessons));
  row(dl, 'Crowns earned', String(crowns));
  if (rowData) row(dl, 'Last synced', when(rowData.updated_at));

  const note = el('p', 'oc-note');
  /* Name what is actually stored rather than counting rows: two of the lines
     above (lessons, crowns) are read off the same progress field. */
  note.textContent = rowData
    ? 'That is the lot: your XP, your streak, the day you last practised, and which lessons you have finished. It lives in one row in our database (EU region) and as a copy in this browser.'
    : 'Stored in this browser only — we could not reach the server just now, so nothing here has synced yet.';
  store.appendChild(note);

  const note2 = el('p', 'oc-note');
  note2.textContent = 'Voice Stories records nothing: no reading history, no bookmarks, no analytics.';
  store.appendChild(note2);

  row(dl2, 'Account ID', (u.id || '—'), true);
  if (!guest && sessionUser) {
    if (sessionUser.email) row(dl2, 'Email', sessionUser.email);
    row(dl2, 'Signed in with', (sessionUser.identities || []).map(i => i.provider).join(', ') || 'google');
    row(dl2, 'Created', when(sessionUser.created_at));
    row(dl2, 'Last sign-in', when(sessionUser.last_sign_in_at));
  }
  if (guest) {
    const g = el('p', 'oc-note');
    g.textContent = 'A guest account is created the first time you finish a lesson, so your progress survives a reload. Sign in with Google and this same account becomes permanent — nothing is lost in the swap.';
    acct.appendChild(g);
  }
}

window.OpenChineseAccount = { open: openPanel };
