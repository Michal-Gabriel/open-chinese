/* OpenChinese — the one account, shared by Voice Stories and Gamified Lessons.
 *
 * Both sections are served from the same origin (michal-gabriel.github.io), so
 * a session established anywhere on the site is already visible everywhere
 * else. This module owns the single Supabase client; sections layer their own
 * data on top of it (see lessons/sync.js).
 *
 * Everything is best-effort. With the constants below left empty, or if the
 * CDN is blocked, the network is down or the project is paused, this module
 * goes quiet: window.OpenChineseAuth is never defined, and every page keeps
 * working exactly as it would with no backend at all.
 *
 * Events on window:
 *   oc:auth    {user}    signed in / out, and once on boot
 *   oc:status  {status}  off | idle | syncing | saved | error
 */

/* ---- connection ----------------------------------------------------------
   Both values are PUBLIC by design: they ship in the page source, and the
   row-level security in supabase/schema.sql is what protects the data. The
   anon key is not a secret; the service_role key is, and never belongs here.

   They live here rather than in a config file on purpose: a separate file
   carries its own cache entry, so pasting new credentials without bumping
   that file's ?v= would leave the browser using a cached empty config and
   sign-in would silently never switch on. One file, one cache key.
   REMEMBER: bump ?v= on auth.js wherever it is loaded when these change.   */

const SUPABASE_URL = 'https://fooejvrgiipplnznwbez.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QacOFPhMzcGXdeV61vCrFA_fGkNXFOD';

const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/+esm';

let sb = null;
let status = 'off';

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent('oc:' + name, { detail: detail }));
}

function setStatus(s) {
  if (s === status) return;
  status = s;
  if (window.OpenChineseAuth) window.OpenChineseAuth.status = s;
  emit('status', { status: s });
}

function describe(u) {
  if (!u) return null;
  const m = u.user_metadata || {};
  /* When a guest account is UPGRADED by linking Google, Supabase leaves the
     provider's profile in identities[].identity_data and does not merge it
     into user_metadata the way a fresh sign-in does. Reading only
     user_metadata left us falling back to the raw email with no avatar. */
  const link = (u.identities || [])
    .map(i => i.identity_data || {})
    .find(d => d.full_name || d.name || d.avatar_url || d.picture) || {};
  return {
    id: u.id,
    anonymous: !!u.is_anonymous,
    name: m.full_name || m.name || link.full_name || link.name
       || m.email || link.email || u.email || null,
    avatar: m.avatar_url || m.picture || link.avatar_url || link.picture || null,
  };
}

/* The OAuth round trip comes back with ?code=… in the address bar; the SDK has
   consumed it by now, so drop it rather than leave it on screen. */
function tidyUrl() {
  if (!/[?&](code|error|error_description)=/.test(location.search)) return;
  const q = new URLSearchParams(location.search);
  ['code', 'error', 'error_description', 'state'].forEach(k => q.delete(k));
  const s = q.toString();
  history.replaceState({}, '', location.pathname + (s ? '?' + s : '') + location.hash);
}

async function boot() {
  const url = (SUPABASE_URL || '').trim();
  const key = (SUPABASE_ANON_KEY || '').trim();
  if (!/^https:\/\/.+/.test(url) || key.length < 20) return;   // not configured yet

  let createClient;
  try {
    ({ createClient } = await import(CDN));
  } catch (e) {
    console.warn('OpenChinese: accounts unavailable (CDN blocked) — running offline.');
    return;
  }

  sb = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
  });

  window.OpenChineseAuth = {
    status: 'idle',
    user: null,
    client: () => sb,
    signIn: signIn,
    signOut: signOut,
    ensureSession: ensureSession,
    setStatus: setStatus,
  };
  setStatus('idle');

  sb.auth.onAuthStateChange((_event, session) => {
    const u = describe(session && session.user);
    window.OpenChineseAuth.user = u;
    emit('auth', { user: u });
  });

  const { data } = await sb.auth.getSession();
  const u = describe(data && data.session && data.session.user);
  window.OpenChineseAuth.user = u;
  emit('auth', { user: u });

  tidyUrl();
}

/* ---- auth ----------------------------------------------------------------
   An account is only created once a section has something worth saving, via
   ensureSession(). Signing in with Google from a guest account LINKS to it,
   keeping the same user id, so progress carries over with nothing to merge. */

async function signIn() {
  if (!sb) return;
  const redirectTo = location.origin + location.pathname;
  try {
    const { data } = await sb.auth.getSession();
    const user = data && data.session && data.session.user;
    if (user && user.is_anonymous) {
      const { error } = await sb.auth.linkIdentity({ provider: 'google', options: { redirectTo } });
      if (!error) return;
      console.warn('OpenChinese: linkIdentity failed, signing in instead —', error.message);
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

/* Returns a session, minting a guest account on first real need. */
async function ensureSession() {
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  if (data && data.session) return data.session;
  const res = await sb.auth.signInAnonymously();
  if (res.error) { setStatus('error'); return null; }
  return res.data.session;
}

boot();
