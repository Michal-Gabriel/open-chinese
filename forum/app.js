/* Forum — a thread list and a thread, both served by this one file.
 *
 * Each thread has an address of its own: forum/?t=<id>. A query parameter
 * rather than a path, because GitHub Pages serves static files with no
 * rewriting — forum/<id> would be a 404, and the usual workaround (a 404.html
 * that re-enters the app) turns every mistyped URL into a soft landing that
 * hides real mistakes. The parameter costs nothing and works everywhere.
 *
 * Rows in the list are real anchors carrying that href, so copy-link,
 * middle-click and open-in-new-tab behave the way they look like they should;
 * a plain left click is intercepted and handled with pushState instead, to
 * keep the threads already loaded.
 *
 * What a shared link cannot do yet: show a preview. Link previews are built
 * from meta tags in the HTML, and the HTML here is one static file that knows
 * nothing about any thread, so a link pasted into a chat shows the forum's
 * own title. Fixing that needs rendering at the server, which Pages does not
 * do.
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
  focusId: null,        // the thread in the address bar, if any
  focus: null,          // its row, once fetched
  missing: false,       // asked for a thread that is not there any more
  replies: {},          // threadId -> rows
  busy: false,
  composing: false,
  booted: false,       // has auth.js finished deciding whether there is a backend
  /* Files picked for the post being written, not yet uploaded. One list, not
     one per form: the composer lives on the list screen and the reply box on
     a thread, so only ever one of them is on screen. It sits in state rather
     than in the form's closure because every data load re-renders, and a
     screenshot that disappears while you are still typing is worse than no
     screenshots at all. */
  pending: [],         // [{ file, url }] — url is an object URL for the preview
  uploadError: null,
};

/* ---------- the address bar ----------
   One thread is in view when ?t= names it. Everything else about navigation
   follows from that: the list is simply the case where it does not. */

const PARAM = 't';

function idFromUrl() {
  const id = new URLSearchParams(location.search).get(PARAM);
  /* Only ever a uuid. Anything else came from a mangled link or someone
     poking at the URL, and sending it to the database would turn a typo into
     an error message. */
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '') ? id : null;
}

function hrefFor(id) { return '?' + PARAM + '=' + encodeURIComponent(id); }

function show(id, push) {
  if (push !== false) {
    history.pushState({}, '', id ? hrefFor(id) : location.pathname);
  }
  enter(id);
}

/* Adopt whatever the address bar now says — on boot, and on back/forward. */
function enter(id) {
  state.focusId = id;
  state.missing = false;
  state.composing = false;
  clearPending();
  if (!id) {
    state.focus = null;
    document.title = 'Forum — OpenChinese';
    render();
    if (state.threads == null && auth()) loadThreads();
    return;
  }
  /* The list may already hold it, in which case there is nothing to wait
     for; otherwise the thread is fetched on its own, which is what makes a
     pasted link work on a cold page. */
  const known = (state.threads || []).find(t => t.id === id);
  state.focus = known || null;
  /* The tab's name is part of the address: a bookmark or a back-button menu
     full of "Forum — OpenChinese" tells the reader nothing. */
  if (known) document.title = known.title + ' \u2014 Forum \u2014 OpenChinese';
  render();
  if (!known) loadThread(id);
  if (!state.replies[id]) loadReplies(id);
}

window.addEventListener('popstate', () => enter(idFromUrl()));

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

/* ---------- screenshots ----------
   A question about Thai is very often a question about something on a screen.
   The files go to Storage under the uploader's own uid, which is the whole of
   what the storage policy checks, and the post keeps only the paths. */

const BUCKET = 'forum-images';
const MAX_IMAGES = 4;                      // the constraint in schema.sql agrees
const MAX_BYTES = 5 * 1024 * 1024;         // and so does the bucket
const TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

function extensionOf(type) {
  return type === 'image/jpeg' ? 'jpg' : type.slice('image/'.length);
}

function publicUrl(path) {
  const a = auth();
  if (!a) return '';
  return a.client().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/* Add what was picked, pasted or dropped. Says what it refused and why rather
   than silently keeping four of the six files you dragged in. */
function addFiles(list) {
  const files = Array.from(list || []);
  let refused = null;
  for (const f of files) {
    if (state.pending.length >= MAX_IMAGES) { refused = 'Four images is the limit.'; break; }
    if (!TYPES.includes(f.type)) { refused = 'Only PNG, JPEG, GIF and WebP images.'; continue; }
    if (f.size > MAX_BYTES) { refused = f.name + ' is over 5 MB.'; continue; }
    state.pending.push({ file: f, url: URL.createObjectURL(f) });
  }
  state.uploadError = refused;
  render();
}

function dropPending(i) {
  const p = state.pending[i];
  if (p) URL.revokeObjectURL(p.url);
  state.pending.splice(i, 1);
  render();
}

function clearPending() {
  state.pending.forEach(p => URL.revokeObjectURL(p.url));
  state.pending = [];
  state.uploadError = null;
}

/* Upload at submit rather than at pick, so abandoning a half-written post
   leaves nothing behind in the bucket. Returns the paths, or throws. */
async function uploadPending() {
  const a = auth(), u = poster();
  if (!a || !u || !state.pending.length) return [];
  const paths = [];
  for (const p of state.pending) {
    const path = u.id + '/' + crypto.randomUUID() + '.' + extensionOf(p.file.type);
    const { error } = await a.client().storage.from(BUCKET)
      .upload(path, p.file, { contentType: p.file.type, upsert: false });
    if (error) {
      /* Nothing half-posted: drop whatever did go up before giving in. */
      if (paths.length) await a.client().storage.from(BUCKET).remove(paths);
      throw new Error('Could not upload ' + p.file.name + ': ' + error.message);
    }
    paths.push(path);
  }
  return paths;
}

/* The picker, the previews, and the paste and drop handlers for a textarea.
   Pasting is the one that matters: a screenshot is on the clipboard, not on
   disk, and asking someone to save it to a file first is asking them not to
   bother. */
function attachments(area) {
  const box = el('div', 'attach');

  const bar = el('div', 'attach-bar');
  const pick = el('label', 'btn-ghost attach-pick', 'Add an image');
  const input = el('input', 'attach-input');
  input.type = 'file';
  input.accept = TYPES.join(',');
  input.multiple = true;
  input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
  pick.appendChild(input);
  bar.appendChild(pick);
  bar.appendChild(el('span', 'attach-hint', 'or paste a screenshot · up to four, 5 MB each'));
  box.appendChild(bar);

  if (state.uploadError) box.appendChild(el('p', 'form-error', state.uploadError));

  if (state.pending.length) {
    const strip = el('div', 'attach-strip');
    state.pending.forEach((p, i) => {
      const cell = el('div', 'attach-thumb');
      const img = document.createElement('img');
      img.src = p.url;
      img.alt = p.file.name;
      cell.appendChild(img);
      const x = on(el('button', 'attach-drop', '✕'), () => dropPending(i));
      x.type = 'button';
      x.title = 'Remove ' + p.file.name;
      cell.appendChild(x);
      strip.appendChild(cell);
    });
    box.appendChild(strip);
  }

  area.addEventListener('paste', e => {
    const files = Array.from((e.clipboardData && e.clipboardData.files) || []);
    if (!files.length) return;
    e.preventDefault();
    addFiles(files);
  });
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dropping'); });
  area.addEventListener('dragleave', () => area.classList.remove('dropping'));
  area.addEventListener('drop', e => {
    const files = (e.dataTransfer && e.dataTransfer.files) || [];
    area.classList.remove('dropping');
    if (!files.length) return;
    e.preventDefault();
    addFiles(files);
  });

  return box;
}

/* Images on a posted thread or reply. A link around each one, so a detail
   nobody can read at this size is one click from full size. */
function postImages(into, paths) {
  if (!paths || !paths.length) return;
  const grid = el('div', 'post-images');
  paths.forEach(path => {
    const url = publicUrl(path);
    const a = el('a', 'post-image');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Image posted with this message';
    img.loading = 'lazy';
    a.appendChild(img);
    grid.appendChild(a);
  });
  into.appendChild(grid);
}

/* ---------- data ---------- */

async function loadThreads() {
  const a = auth();
  if (!a) { state.error = 'offline'; return render(); }
  try {
    const { data, error } = await a.client()
      .from('forum_thread')
      .select('id, author_id, author_name, title, body, images, created_at, last_activity, forum_reply(count)')
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

/* One thread, fetched by id. Used when a link is opened cold, so the page
   has something to show before (or without) the whole list. */
async function loadThread(id) {
  const a = auth();
  if (!a) return;
  try {
    const { data, error } = await a.client()
      .from('forum_thread')
      .select('id, author_id, author_name, title, body, images, created_at, last_activity, forum_reply(count)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) { state.missing = true; state.focus = null; }
    else { state.focus = data; document.title = data.title + ' — Forum — OpenChinese'; }
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
      .select('id, author_id, author_name, body, images, created_at')
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

async function postThread(title, body, images) {
  const a = auth(), u = poster();
  if (!a || !u) return 'You need to be signed in to post.';
  const { data, error } = await a.client()
    .from('forum_thread')
    .insert({ author_id: u.id, author_name: bylineFor(u), title: title, body: body, images: images })
    .select('id')
    .single();
  /* The files are already in the bucket at this point, so a refused insert
     has to take them back out — otherwise every failed post leaves litter
     nothing will ever reference. */
  if (error) { await discard(images); return error.message; }
  await loadThreads();
  if (data && data.id) show(data.id);
  return null;
}

async function postReply(threadId, body, images) {
  const a = auth(), u = poster();
  if (!a || !u) return 'You need to be signed in to reply.';
  const { error } = await a.client()
    .from('forum_reply')
    .insert({ thread_id: threadId, author_id: u.id, author_name: bylineFor(u), body: body, images: images });
  if (error) { await discard(images); return error.message; }
  await loadReplies(threadId);
  await loadThreads();
  return null;
}

/* Storage knows nothing about the rows that point at it, so every path has
   to be swept up by hand. Best-effort on purpose: a file that outlives its
   post is litter, while a post that refuses to delete because its image is
   already gone would be a wall. */
async function discard(paths) {
  const a = auth();
  if (!a || !paths || !paths.length) return;
  try { await a.client().storage.from(BUCKET).remove(paths); } catch (e) {}
}

async function remove(table, id, threadId) {
  const a = auth();
  if (!a) return;

  /* Collected before the delete: afterwards the rows that named these files
     are gone and there is nothing left to read the paths off. A thread takes
     its replies with it in SQL, so it takes their images too. */
  const files = [];
  if (table === 'forum_reply') {
    const r = (state.replies[threadId] || []).find(x => x.id === id);
    if (r) files.push(...(r.images || []));
  } else {
    const t = (state.focus && state.focus.id === id ? state.focus : null)
          || (state.threads || []).find(x => x.id === id);
    if (t) files.push(...(t.images || []));
    (state.replies[id] || []).forEach(r => files.push(...(r.images || [])));
  }

  const { error } = await a.client().from(table).delete().eq('id', id);
  if (error) return;
  await discard(files);

  if (table === 'forum_reply') {
    await loadReplies(threadId);
    await loadThreads();
    return;
  }
  /* The thread just deleted is the one on screen, so there is nowhere to
     stay: go back to the list rather than leaving its address in the bar. */
  delete state.replies[id];
  await loadThreads();
  show(null);
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
      state.composing = true; clearPending(); render();
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
  const cancel = on(el('button', 'btn-ghost', 'Cancel'), () => { state.composing = false; clearPending(); render(); });
  cancel.type = 'button';
  actions.appendChild(send);
  actions.appendChild(cancel);

  form.appendChild(title);
  form.appendChild(body);
  form.appendChild(attachments(body));
  form.appendChild(err);
  form.appendChild(actions);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.busy) return;
    const t = title.value.trim(), b = body.value.trim();
    if (t.length < 3) { err.textContent = 'Give the thread a title of at least three characters.'; err.hidden = false; return; }
    if (!b) { err.textContent = 'Write something in the body.'; err.hidden = false; return; }
    state.busy = true; send.disabled = true;
    send.textContent = state.pending.length ? 'Uploading…' : 'Posting…';
    let problem = null;
    try {
      const images = await uploadPending();
      send.textContent = 'Posting…';
      problem = await postThread(t, b, images);
    } catch (e) {
      problem = e.message;
    }
    state.busy = false;
    if (problem) {
      err.textContent = problem; err.hidden = false;
      send.disabled = false; send.textContent = 'Post';
      return;
    }
    state.composing = false;
    clearPending();
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

/* A row in the list. An anchor, not a button: the whole point of this change
   is that a thread has an address, and an address you cannot copy out of the
   context menu is only half of one. */
function threadRow(t) {
  const card = el('article', 'thread');

  const link = el('a', 'thread-head');
  link.href = hrefFor(t.id);
  link.addEventListener('click', e => {
    /* Leave the modified clicks alone — they mean "new tab", "new window",
       "download", and the browser does them better than we would. */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    show(t.id);
  });

  const n = replyCount(t);
  const count = el('span', 'thread-count');
  count.appendChild(el('strong', null, String(n)));
  count.appendChild(el('span', 'thread-count-label', n === 1 ? 'reply' : 'replies'));
  link.appendChild(count);

  const mid = el('span', 'thread-mid');
  mid.appendChild(el('span', 'thread-title', t.title));
  mid.appendChild(byline(t.author_name, t.last_activity || t.created_at));
  link.appendChild(mid);

  card.appendChild(link);
  return card;
}

/* One thread, on its own. */
function threadView(t) {
  const card = el('article', 'thread thread--open');
  const u = poster();

  const top = el('div', 'thread-body');
  top.appendChild(el('h2', 'thread-title thread-title--full', t.title));
  top.appendChild(byline(t.author_name, t.created_at));
  paragraphs(top, t.body);
  postImages(top, t.images);
  if (u && u.id === t.author_id) {
    top.appendChild(deleteButton('forum_thread', t.id, null, 'Delete thread'));
  }
  card.appendChild(top);

  const rows = state.replies[t.id];
  if (!rows) {
    card.appendChild(el('p', 'notice', 'Loading replies…'));
  } else if (rows.length) {
    const list = el('div', 'replies');
    rows.forEach(r => {
      const item = el('div', 'reply');
      item.appendChild(byline(r.author_name, r.created_at));
      paragraphs(item, r.body);
      postImages(item, r.images);
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

/* The way back, which doubles as the thread view's only chrome. */
function backLink() {
  const a = el('a', 'back-link', '← All threads');
  a.href = location.pathname;
  a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    show(null);
  });
  return a;
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
  form.appendChild(attachments(body));
  form.appendChild(err);
  form.appendChild(send);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.busy) return;
    const b = body.value.trim();
    if (!b) { err.textContent = 'Write something first.'; err.hidden = false; return; }
    state.busy = true; send.disabled = true;
    send.textContent = state.pending.length ? 'Uploading…' : 'Posting…';
    let problem = null;
    try {
      const images = await uploadPending();
      send.textContent = 'Posting…';
      problem = await postReply(t.id, b, images);
    } catch (e) {
      problem = e.message;
    }
    state.busy = false;
    if (problem) {
      err.textContent = problem; err.hidden = false;
      send.disabled = false; send.textContent = 'Reply';
      return;
    }
    clearPending();
    render();
  });

  return form;
}

function render() {
  app.textContent = '';

  if (state.focusId) return renderThread();

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
  state.threads.forEach(t => list.appendChild(threadRow(t)));
  app.appendChild(list);
}

function renderThread() {
  app.appendChild(backLink());

  if (state.missing) {
    app.appendChild(el('p', 'empty',
      'That thread is not here any more. Its author may have deleted it.'));
    return;
  }
  if (state.error && state.error !== 'offline') {
    app.appendChild(el('p', 'notice', 'Could not load the thread: ' + state.error));
    return;
  }
  if (!state.focus) {
    app.appendChild(el('p', 'notice', 'Loading…'));
    return;
  }
  app.appendChild(threadView(state.focus));
}

/* auth.js may finish before or after this module runs, so handle both. */
window.addEventListener('oc:auth', () => {
  state.booted = true;
  if (state.focusId && !state.focus && !state.missing) enter(state.focusId);
  else if (state.threads == null) loadThreads();
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

state.focusId = idFromUrl();
render();
if (auth()) { state.booted = true; enter(state.focusId); }
