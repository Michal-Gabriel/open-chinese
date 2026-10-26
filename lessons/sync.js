/* Gamified Lessons — cloud progress, layered on the shared OpenChinese account.
 *
 * The Supabase client and the session live in ../shared/auth.js, which both
 * sections of the site share. This file owns only what is specific to lessons:
 * pushing XP, streak and crowns, and adopting the server's merged answer.
 *
 * It keeps the duo:* event contract app.js already speaks, so app.js needs to
 * know nothing about where the account came from:
 *   duo:auth    {user}          duo:remote  {state, uid}
 *   duo:status  {status}
 */

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent('duo:' + name, { detail: detail }));
}

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

/* ---- push ----------------------------------------------------------------
   Hands local state to the server, which merges it (greatest-wins, see
   supabase/schema.sql) and returns the authoritative row. The merge is
   idempotent and order-independent, so a retry after a dropped connection is
   harmless and two devices can push in any order without losing a lesson.  */

async function push(S) {
  const auth = window.OpenChineseAuth;
  if (!auth) return null;
  try {
    const session = await auth.ensureSession();     // mints a guest account on first need
    if (!session) return null;
    auth.setStatus('syncing');
    const { data, error } = await auth.client().rpc('merge_progress', toRemote(S));
    if (error) {
      console.warn('OpenChinese: lesson progress not saved —', error.message);
      auth.setStatus('error');
      return null;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) { auth.setStatus('error'); return null; }
    auth.setStatus('saved');
    const state = fromRemote(row);
    emit('remote', { state: state, uid: session.user.id });
    return state;
  } catch (e) {
    auth.setStatus('error');            // offline, paused project, blocked — all the same here
    return null;
  }
}

/* Delete the cloud copy (used by Reset). */
async function forget() {
  const auth = window.OpenChineseAuth;
  if (!auth) return;
  try {
    const { data } = await auth.client().auth.getSession();
    const uid = data && data.session && data.session.user && data.session.user.id;
    if (uid) await auth.client().from('profiles').delete().eq('id', uid);
  } catch (e) {}
}

/* ---- bridge the shared account to the contract app.js speaks ------------- */

function publish() {
  const auth = window.OpenChineseAuth;
  if (!auth) return;
  window.DuoSync = {
    status: auth.status,
    user: auth.user,
    signIn: auth.signIn,
    signOut: auth.signOut,
    push: push,
    forget: forget,
  };
}

window.addEventListener('oc:auth', e => {
  publish();
  if (window.DuoSync) window.DuoSync.user = (e.detail || {}).user;
  emit('auth', { user: (e.detail || {}).user });
});

window.addEventListener('oc:status', e => {
  if (window.DuoSync) window.DuoSync.status = (e.detail || {}).status;
  emit('status', { status: (e.detail || {}).status });
});

publish();      // in case auth.js finished before this module ran
