/* DuoChinese — optional cloud progress.
 *
 * Everything here is best-effort. If the config is empty, the CDN is blocked,
 * the project is paused or the network is down, this module goes quiet and
 * app.js carries on with localStorage exactly as it always has. app.js only
 * ever talks to `window.DuoSync` if it exists, and never waits on it.
 *
 * Talks to app.js through three events:
 *   duo:auth    {user}   signed in / out
 *   duo:remote  {state}  the server's merged state, to adopt wholesale
 *   duo:status  {status} off | idle | syncing | saved | error
 */

/* ---- connection ----------------------------------------------------------
   Both values are PUBLIC by design: they ship in the page source, and the
   row-level security in supabase/schema.sql is what actually protects the
   data. The anon key is not a secret. The service_role key IS, and must
   never appear here.

   Leave them empty to run with no backend at all — this module stays inert
   and the app is the localStorage-only one it has always been.

   They live here rather than in a config.js on purpose: a separate file would
   carry its own cache entry, so pasting new credentials without bumping that
   file's ?v= would leave the browser happily using a cached empty config and
   sync would silently never switch on. One file, one cache key.
   REMEMBER: bump the ?v= on sync.js in index.html whenever these change.     */

const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

const SB_VERSION = '2.117.3';
const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@' + SB_VERSION + '/+esm';

let sb = null;
let status = 'off';

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent('duo:' + name, { detail: detail }));
}
function setStatus(s) {
  if (s === status) return;
  status = s;
  if (window.DuoSync) window.DuoSync.status = s;
  emit('status', { status: s });
}

/* ---- shape translation ---------------------------------------------------
   app.js keeps camelCase in localStorage; the table is snake_case.          */

function toRemote(S) {
  return {
    p_xp: S.xp | 0,
    p_streak: S.streak | 0,
    p_last_day: S.lastDay || null,
    p_progress: S.progress || {},
  };
}
function fromRemote(row) {
  return {
    xp: row.xp | 0,
    streak: row.streak | 0,
    lastDay: row.last_day || null,
    progress: row.progress || {},
  };
}
function describe(u) {
  if (!u) return null;
  const m = u.user_metadata || {};
  return {
    id: u.id,
    anonymous: !!u.is_anonymous,
    name: m.full_name || m.name || m.email || u.email || null,
    avatar: m.avatar_url || m.picture || null,
  };
}

/* ---- boot ---------------------------------------------------------------- */

async function boot() {
  const url = (SUPABASE_URL || '').trim();
  const key = (SUPABASE_ANON_KEY || '').trim();
  if (!/^https:\/\/.+/.test(url) || key.length < 20) return;   // not configured yet

  let createClient;
  try {
    ({ createClient } = await import(CDN));
  } catch (e) {
    console.warn('DuoChinese: cloud sync unavailable (CDN blocked) — playing offline.');
    return;                                   // app.js never knew; nothing breaks
  }

  sb = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
  });

  window.DuoSync = {
    status: 'idle',
    user: null,
    signIn: signIn,
    signOut: signOut,
    push: push,
    forget: forget,
  };
  setStatus('idle');

  sb.auth.onAuthStateChange((_event, session) => {
    const u = describe(session && session.user);
    window.DuoSync.user = u;
    emit('auth', { user: u });
  });

  const { data } = await sb.auth.getSession();
  const u = describe(data && data.session && data.session.user);
  window.DuoSync.user = u;
  emit('auth', { user: u });

  tidyUrl();
}

/* The OAuth round trip comes back with ?code=… in the address bar; the SDK has
   already consumed it by now, so drop it rather than leave it on screen. */
function tidyUrl() {
  if (!/[?&](code|error|error_description)=/.test(location.search)) return;
  const q = new URLSearchParams(location.search);
  ['code', 'error', 'error_description', 'state'].forEach(k => q.delete(k));
  const s = q.toString();
  history.replaceState({}, '', location.pathname + (s ? '?' + s : '') + location.hash);
}

/* ---- auth ---------------------------------------------------------------- */

/* An account is only created once there is something worth saving — see push().
   Signing in with Google from an anonymous account LINKS to it, which keeps the
   same user id, so the guest's progress carries over with nothing to merge. */
async function signIn() {
  if (!sb) return;
  const redirectTo = location.origin + location.pathname;
  try {
    const { data } = await sb.auth.getSession();
    const user = data && data.session && data.session.user;
    if (user && user.is_anonymous) {
      const { error } = await sb.auth.linkIdentity({ provider: 'google', options: { redirectTo } });
      if (!error) return;
      // Already-linked or manual linking disabled: fall through to a plain sign-in.
      console.warn('DuoChinese: linkIdentity failed, signing in instead —', error.message);
    }
    await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  } catch (e) {
    setStatus('error');
  }
}

async function signOut() {
  if (!sb) return;
  try { await sb.auth.signOut(); } catch (e) {}
  setStatus('idle');
}

/* Delete the cloud copy (used by Reset). */
async function forget() {
  if (!sb) return;
  try {
    const { data } = await sb.auth.getSession();
    const uid = data && data.session && data.session.user && data.session.user.id;
    if (uid) await sb.from('profiles').delete().eq('id', uid);
  } catch (e) {}
}

/* ---- push ----------------------------------------------------------------
   Hands local state to the server, which merges it (greatest-wins, see
   schema.sql) and returns the authoritative row. Because the merge is
   idempotent and order-independent, a retry after a failure is harmless and
   two devices can push in any order without losing a lesson.                */

async function push(S) {
  if (!sb) return null;
  try {
    let { data: sess } = await sb.auth.getSession();
    if (!sess || !sess.session) {
      // first thing worth saving — mint the guest account now, not on page load
      const { data, error } = await sb.auth.signInAnonymously();
      if (error) { setStatus('error'); return null; }
      sess = { session: data.session };
    }
    setStatus('syncing');
    const { data, error } = await sb.rpc('merge_progress', toRemote(S));
    if (error) {
      console.warn('DuoChinese: progress not saved to the cloud —', error.message);
      setStatus('error');
      return null;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) { setStatus('error'); return null; }
    setStatus('saved');
    const state = fromRemote(row);
    emit('remote', { state: state, uid: sess.session.user.id });
    return state;
  } catch (e) {
    setStatus('error');                       // offline, paused project, blocked — all the same here
    return null;
  }
}

boot();
