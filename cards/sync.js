/* Flashcards — cloud state, layered on the shared OpenChinese account.
 *
 * The Supabase client and the session live in ../shared/auth.js, which every
 * section shares. This file owns only what is specific to cards: handing the
 * server a list of reviews and adopting the answer it merges.
 *
 * The contract app.js speaks:
 *   cards:remote  {cards, uid}
 *
 * Why push the whole deck rather than a dirty list: the server keeps the
 * fresher of the two reviews and ignores everything older (see merge_cards in
 * supabase/schema.sql), so a full push is idempotent and needs no bookkeeping
 * that could itself go stale. At a hundred and fifty words that is a payload
 * of a few kilobytes; a deck large enough for this to matter would want a
 * dirty list and a reason to trust it.
 */

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent('cards:' + name, { detail: detail }));
}

function toRemote(cards) {
  const out = [];
  for (const [word, c] of Object.entries(cards || {})) {
    if (!c || !c.reviewedAt || !c.due) continue;
    out.push({
      word: word,
      reps: c.reps | 0,
      lapses: c.lapses | 0,
      ease: Number(c.ease) || 2.5,
      interval_days: c.interval | 0,
      due: c.due,
      reviewed_at: c.reviewedAt,
    });
  }
  return out;
}

function fromRemote(rows) {
  const cards = {};
  for (const row of rows || []) {
    cards[row.word] = {
      reps: row.reps | 0,
      lapses: row.lapses | 0,
      ease: Number(row.ease) || 2.5,
      interval: row.interval_days | 0,
      due: row.due,
      reviewedAt: row.reviewed_at,
    };
  }
  return cards;
}

async function push(cards) {
  const auth = window.OpenChineseAuth;
  if (!auth) return null;
  const payload = toRemote(cards);
  try {
    /* Nothing reviewed yet and no account: do not mint one. An account is
       created the moment there is something worth saving, not before. */
    const { data: current } = await auth.client().auth.getSession();
    if (!payload.length && !(current && current.session)) return null;

    const session = await auth.ensureSession();
    if (!session) return null;
    auth.setStatus('syncing');

    const { data, error } = await auth.client().rpc('merge_cards', { p_cards: payload });
    if (error) {
      console.warn('OpenChinese: cards not saved —', error.message);
      auth.setStatus('error');
      return null;
    }
    auth.setStatus('saved');
    const merged = fromRemote(Array.isArray(data) ? data : []);
    emit('remote', { cards: merged, uid: session.user.id });
    return merged;
  } catch (e) {
    auth.setStatus('error');      // offline, paused project, blocked CDN — all the same here
    return null;
  }
}

/* Drop the cloud copy (used by Reset progress). */
async function forget() {
  const auth = window.OpenChineseAuth;
  if (!auth) return;
  try {
    const { data } = await auth.client().auth.getSession();
    const uid = data && data.session && data.session.user && data.session.user.id;
    if (uid) await auth.client().from('card_state').delete().eq('user_id', uid);
  } catch (e) {}
}

function publish() {
  const auth = window.OpenChineseAuth;
  if (!auth) return;
  window.CardSync = {
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
  if (window.CardSync) window.CardSync.user = (e.detail || {}).user;
  /* Signing in can hand us a different account than the one we have been
     writing to, so ask the server what it holds for this one. */
  if (window.CardSync) {
    try {
      const raw = JSON.parse(localStorage.getItem('openchinese.cards.v1') || '{}');
      push(raw.cards || {});
    } catch (err) { push({}); }
  }
});

window.addEventListener('oc:status', e => {
  if (window.CardSync) window.CardSync.status = (e.detail || {}).status;
});

publish();      // in case auth.js finished before this module ran
