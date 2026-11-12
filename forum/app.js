/* Forum — one page: the thread list, with every thread opening in place.
 *
 * There is no per-thread URL yet, on purpose: a second page would need
 * routing, a share link worth sharing, and a story about what happens when a
 * thread is deleted out from under one. This version answers the question it
 * was asked — let signed-in people start threads and answer each other — and
 * leaves room for the rest.
 *
 * Trust: every piece of text that comes back from the server was typed by
 * somebody else, so it only ever reaches the page through textContent. There
 * is no innerHTML in this file and there should not be one.
 *
 * Reading needs no account. Posting needs a REAL one: the site mints a silent
 * guest account for saving progress, and the policies in supabase/schema.sql
 * refuse it here, so the UI must not offer a box that the database will
 * reject.
 */

const app = document.getElementById('app');

const state = {
  threads: null,        // null = not loaded yet
  error: null,
  openId: null,         // which thread is expanded
  replies: {},          // threadId -> rows
  busy: false,
  composing: false,
  booted: false,       // has auth.js finished deciding whether there is a backend
};

/* ---------- small helpers ---------- */

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function on(node, fn) { node.addEventListener('click', fn); return node; }

function auth() { return window.OpenChineseAuth || null; }

/* Someone who signed in with Google. A guest account is not one, and neither
   is nobody at all. Mirrors is_named_user() in the schema. */
function poster() {
  const a = auth();
  const u = a && a.user;
  return u && !u.anonymous ? u : null;
}

/* Google gives us a full name for most people and an email address for the
   rest. The forum is public, so an address never becomes the byline. */
function bylineFor(user) {
  const raw = String(user.name || '').trim();
  if (!raw) return 'Anonymous';
  return (raw.includes('@') ? raw.split('@')[0] : raw).slice(0, 60);
}

const MINUTE = 60e3, HOUR = 60 * MINUTE, DAY = 24 * HOUR;

function ago(iso) {
  const then = Date.parse(iso);
  if (!then) return '';
  const d = Date.now() - then;
  if (d < MINUTE) return 'just now';
  if (d < HOUR) return Math.round(d / MINUTE) + 'm ago';
  if (d < DAY) return Math.round(d / HOUR) + 'h ago';
  if (d < 7 * DAY) return Math.round(d / DAY) + 'd ago';
  return new Date(then).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/* Posts are plain text. Keep the paragraph breaks the writer typed and drop
   the rest, rather than pretending to support Markdown and getting it wrong. */
function paragraphs(into, text) {
  String(text || '').split(/\n{2,}/).forEach(block => {
    const p = el('p', 'post-text');
    block.split('\n').forEach((line, i) => {
      if (i) p.appendChild(document.createElement('br'));
      p.appendChild(document.createTextNode(line));
    });
    into.appendChild(p);
  });
}

/* ---------- data ---------- */

async function loadThreads() {
  const a = auth();
  if (!a) { state.error = 'offline'; return render(); }
  try {
    const { data, error } = await a.client()
      .from('forum_thread')
      .select('id, author_id, author_name, title, body, created_at, last_activity, forum_reply(count)')
      .order('last_activity', { ascending: false })
      .limit(100);
    if (error) throw error;
    state.threads = data || [];
    state.error = null;
  } catch (e) {
    state.error = e.message || 'could not load';
  }
  render();
}

async function loadReplies(threadId) {
  const a = auth();
  if (!a) return;
  try {
    const { data, error } = await a.client()
      .from('forum_reply')
      .select('id, author_id, author_name, body, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    state.replies[threadId] = data || [];
  } catch (e) {
    state.replies[threadId] = [];
  }
  render();
}

/* The count PostgREST embeds comes back as [{count: n}]. */
function replyCount(t) {
  const c = t.forum_reply;
  if (Array.isArray(c)) return (c[0] && c[0].count) || 0;
  return (c && c.count) || 0;
}

async function postThread(title, body) {
  const a = auth(), u = poster();
  if (!a || !u) return 'You need to be signed in to post.';
  const { data, error } = await a.client()
    .from('forum_thread')
    .insert({ author_id: u.id, author_name: bylineFor(u), title: title, body: body })
    .select('id')
    .single();
  if (error) return error.message;
  state.openId = data && data.id;
  await loadThreads();
  return null;
}

async function postReply(threadId, body) {
  const a = auth(), u = poster();
  if (!a || !u) return 'You need to be signed in to reply.';
  const { error } = await a.client()
    .from('forum_reply')
    .insert({ thread_id: threadId, author_id: u.id, author_name: bylineFor(u), body: body });
  if (error) return error.message;
  await loadReplies(threadId);
  await loadThreads();
  return null;
}

async function remove(table, id, threadId) {
  const a = auth();
  if (!a) return;
  const { error } = await a.client().from(table).delete().eq('id', id);
  if (error) return;
  if (table === 'forum_reply') await loadReplies(threadId);
  await loadThreads();
}

/* ---------- screens ---------- */

function head() {
  const box = el('header', 'forum-head');
  box.appendChild(el('span', 'eyebrow', '论坛'));
  box.appendChild(el('h1', null, 'Forum'));
  box.appendChild(el('p', 'forum-sub',
    'Questions, corrections and things you have noticed. Anyone can read; ' +
    'signing in with Google lets you start a thread or answer one.'));
  return box;
}

/* The composer, or the reason there isn't one. */
function composer() {
  const a = auth();
  const box = el('section', 'composer');

  if (!a) {
    /* Before auth.js has booted we do not yet know whether there is a backend
       at all, and saying "unreachable" during that half-second is a lie that
       lands on the first paint. Say nothing until we know. */
    box.appendChild(el('p', 'notice', state.booted
      ? 'The forum needs the accounts backend, which is not reachable right now. ' +
        'Everything else on the site still works.'
      : 'Loading\u2026'));
    return box;
  }

  const u = poster();
  if (!u) {
    const row = el('div', 'signin-row');
    row.appendChild(el('p', 'notice',
      a.user && a.user.anonymous
        ? 'You are signed in as a guest, which saves your progress but has no name to post under. Sign in with Google to join the conversation.'
        : 'Sign in with Google to start a thread or answer one.'));
    row.appendChild(on(el('button', 'btn-primary', 'Sign in with Google'), () => a.signIn()));
    box.appendChild(row);
    return box;
  }

  if (!state.composing) {
    box.appendChild(on(el('button', 'btn-primary', 'Start a thread'), () => {
      state.composing = true; render();
    }));
    return box;
  }

  const form = el('form', 'thread-form');
  const title = el('input', 'field');
  title.type = 'text';
  title.placeholder = 'What is your question?';
  title.maxLength = 140;
  title.required = true;
  const body = el('textarea', 'field area');
  body.placeholder = 'Say a little more — what you tried, what confused you.';
  body.maxLength = 8000;
  body.rows = 5;
  body.required = true;

  const err = el('p', 'form-error');
  err.hidden = true;

  const actions = el('div', 'form-actions');
  const send = el('button', 'btn-primary', 'Post');
  send.type = 'submit';
  const cancel = on(el('button', 'btn-ghost', 'Cancel'), () => { state.composing = false; render(); });
  cancel.type = 'button';
  actions.appendChild(send);
  actions.appendChild(cancel);

  form.appendChild(title);
  form.appendChild(body);
  form.appendChild(err);
  form.appendChild(actions);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.busy) return;
    const t = title.value.trim(), b = body.value.trim();
    if (t.length < 3) { err.textContent = 'Give the thread a title of at least three characters.'; err.hidden = false; return; }
    if (!b) { err.textContent = 'Write something in the body.'; err.hidden = false; return; }
    state.busy = true; send.disabled = true; send.textContent = 'Posting…';
    const problem = await postThread(t, b);
    state.busy = false;
    if (problem) {
      err.textContent = problem; err.hidden = false;
      send.disabled = false; send.textContent = 'Post';
      return;
    }
    state.composing = false;
    render();
  });

  box.appendChild(form);
  return box;
}

function byline(name, iso) {
  const line = el('p', 'byline');
  line.appendChild(el('span', 'byline-name', name || 'Anonymous'));
  line.appendChild(el('span', 'byline-sep', '·'));
  line.appendChild(el('time', null, ago(iso)));
  return line;
}

function deleteButton(table, id, threadId, label) {
  const b = on(el('button', 'btn-text', label), async () => {
    if (!confirm('Delete this for good?')) return;
    await remove(table, id, threadId);
  });
  b.type = 'button';
  return b;
}

function threadCard(t) {
  const open = state.openId === t.id;
  const card = el('article', 'thread' + (open ? ' thread--open' : ''));

  const header = on(el('button', 'thread-head'), () => {
    state.openId = open ? null : t.id;
    if (!open && !state.replies[t.id]) loadReplies(t.id);
    else render();
  });
  header.type = 'button';

  const n = replyCount(t);
  const count = el('span', 'thread-count');
  count.appendChild(el('strong', null, String(n)));
  count.appendChild(el('span', 'thread-count-label', n === 1 ? 'reply' : 'replies'));
  header.appendChild(count);

  const mid = el('span', 'thread-mid');
  mid.appendChild(el('span', 'thread-title', t.title));
  mid.appendChild(byline(t.author_name, t.last_activity || t.created_at));
  header.appendChild(mid);
  card.appendChild(header);

  if (!open) return card;

  const bodyBox = el('div', 'thread-body');
  paragraphs(bodyBox, t.body);
  const u = poster();
  if (u && u.id === t.author_id) {
    bodyBox.appendChild(deleteButton('forum_thread', t.id, null, 'Delete thread'));
  }
  card.appendChild(bodyBox);

  const rows = state.replies[t.id];
  if (!rows) {
    card.appendChild(el('p', 'notice', 'Loading replies…'));
  } else if (rows.length) {
    const list = el('div', 'replies');
    rows.forEach(r => {
      const item = el('div', 'reply');
      item.appendChild(byline(r.author_name, r.created_at));
      paragraphs(item, r.body);
      if (u && u.id === r.author_id) {
        item.appendChild(deleteButton('forum_reply', r.id, t.id, 'Delete'));
      }
      list.appendChild(item);
    });
    card.appendChild(list);
  }

  card.appendChild(replyForm(t));
  return card;
}

function replyForm(t) {
  const a = auth(), u = poster();
  if (!a) return el('p', 'notice', 'Replying needs the accounts backend.');
  if (!u) {
    const row = el('div', 'signin-row');
    row.appendChild(el('p', 'notice', 'Sign in with Google to answer this.'));
    row.appendChild(on(el('button', 'btn-ghost', 'Sign in'), () => a.signIn()));
    return row;
  }

  const form = el('form', 'reply-form');
  const body = el('textarea', 'field area');
  body.placeholder = 'Write a reply';
  body.rows = 3;
  body.maxLength = 8000;
  body.required = true;
  const err = el('p', 'form-error');
  err.hidden = true;
  const send = el('button', 'btn-primary', 'Reply');
  send.type = 'submit';

  form.appendChild(body);
  form.appendChild(err);
  form.appendChild(send);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.busy) return;
    const b = body.value.trim();
    if (!b) { err.textContent = 'Write something first.'; err.hidden = false; return; }
    state.busy = true; send.disabled = true; send.textContent = 'Posting…';
    const problem = await postReply(t.id, b);
    state.busy = false;
    if (problem) {
      err.textContent = problem; err.hidden = false;
      send.disabled = false; send.textContent = 'Reply';
    }
  });

  return form;
}

function render() {
  app.textContent = '';
  app.appendChild(head());
  app.appendChild(composer());

  if (state.error === 'offline') return;
  if (state.error) {
    app.appendChild(el('p', 'notice', 'Could not load the forum: ' + state.error));
    return;
  }
  if (state.threads == null) {
    app.appendChild(el('p', 'notice', 'Loading…'));
    return;
  }
  if (!state.threads.length) {
    app.appendChild(el('p', 'empty', 'No threads yet. The first one is yours to write.'));
    return;
  }

  const list = el('div', 'threads');
  state.threads.forEach(t => list.appendChild(threadCard(t)));
  app.appendChild(list);
}

/* auth.js may finish before or after this module runs, so handle both. */
window.addEventListener('oc:auth', () => {
  state.booted = true;
  if (state.threads == null) loadThreads();
  else render();
});

/* auth.js goes quiet when it is not configured or the CDN is blocked, so no
   oc:auth ever arrives. Without this the page would say "Loading…" for ever
   instead of explaining itself. */
setTimeout(() => {
  if (state.booted) return;
  state.booted = true;
  if (!auth()) render();
}, 6000);

render();
if (auth()) { state.booted = true; loadThreads(); }
