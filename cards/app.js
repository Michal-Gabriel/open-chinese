/* Flashcards — screens and state.
 *
 * The deck is the HSK 1 vocabulary the lessons already teach, read from the
 * global that ../lessons/course.js defines. That file is the one place the
 * syllabus lives, and copying 150 words here to avoid a global would be the
 * worse trade: the copy drifts, the global does not.
 *
 * Everything works with no account at all — the state lives in localStorage
 * and the cloud is an optional mirror, the same bargain the rest of the site
 * makes. cards/sync.js publishes window.CardSync when a backend answers.
 */

import { buildQueue, countDue, grade, newCard, strengthOf, STRENGTHS, today } from './srs.js?v=22';

const KEY = 'openchinese.cards.v1';

const defaults = () => ({
  cards: {},          // hanzi -> { reps, lapses, ease, interval, due, reviewedAt }
  introduced: {},     // YYYY-MM-DD -> how many new words were started that day
  reviewed: {},       // YYYY-MM-DD -> how many answers were given that day
  cloudUid: null,
});

let S = load();
let deck = [];
let session = null;
let screen = 'home';

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && typeof raw === 'object') return Object.assign(defaults(), raw);
  } catch (e) { /* corrupt or blocked storage — start fresh */ }
  return defaults();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
}

/* ---------------------- the deck ---------------------- */

function readDeck() {
  /* eslint-disable no-undef */
  if (typeof WORD_INDEX === 'undefined') return [];
  return Array.from(WORD_INDEX.values()).map(w => ({ hanzi: w[0], pinyin: w[1], english: w[2] }));
  /* eslint-enable no-undef */
}

const words = () => deck.map(d => d.hanzi);

/* ---------------------- audio ----------------------
   The lessons were recorded sentence by sentence and word by word; the
   manifest maps text to a file, so the cards get a real voice for free. */

let clips = null;
fetch('../lessons/audio/index.json')
  .then(r => (r.ok ? r.json() : null))
  .then(m => { if (m) clips = new Map(Object.entries(m)); })
  .catch(() => {});

let playing = null;
function say(text) {
  const file = clips && clips.get(text);
  if (file) {
    try {
      if (playing) { playing.pause(); playing.currentTime = 0; }
      playing = new Audio('../lessons/audio/' + file);
      playing.play().catch(() => speakSynth(text));
      return;
    } catch (e) { /* fall through */ }
  }
  speakSynth(text);
}

function speakSynth(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------------------- cloud ---------------------- */

function syncNow() {
  const sync = window.CardSync;
  if (!sync) return;
  try { sync.push(S.cards); } catch (e) {}
}

/* The server merges and hands back every card it holds; the client never
   merges, so the two cannot drift. A local card the server has not seen yet
   (an answer given while offline) is kept. */
window.addEventListener('cards:remote', e => {
  const d = e.detail || {};
  if (!d.cards) return;
  for (const [word, remote] of Object.entries(d.cards)) {
    const local = S.cards[word];
    if (!local || !local.reviewedAt || remote.reviewedAt >= local.reviewedAt) {
      S.cards[word] = remote;
    }
  }
  S.cloudUid = d.uid || S.cloudUid;
  save();
  if (screen === 'home') render();
});

/* ---------------------- small DOM helpers ---------------------- */

const app = document.getElementById('app');

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function on(node, fn) { node.addEventListener('click', fn); return node; }

function render() {
  app.innerHTML = '';
  if (screen === 'session') return renderSession();
  if (screen === 'browse') return renderBrowse();
  return renderHome();
}

/* ---------------------- home ---------------------- */

function strengthCounts() {
  const counts = {};
  for (const s of STRENGTHS) counts[s.id] = 0;
  for (const w of words()) counts[strengthOf(S.cards[w])] += 1;
  return counts;
}

function renderHome() {
  const day = today();
  const { due, fresh } = countDue(words(), S.cards);
  const introducedToday = S.introduced[day] || 0;
  const reviewedToday = S.reviewed[day] || 0;
  const counts = strengthCounts();
  const known = deck.length - counts.new;

  const head = el('header', 'cards-head');
  head.appendChild(el('h1', null, 'Flashcards'));
  head.appendChild(el('p', 'cards-sub', 'The HSK 1 vocabulary, scheduled so that each word comes back just before you would forget it.'));
  app.appendChild(head);

  /* the headline number: how much of the deck you actually know */
  const bar = el('div', 'strength-bar');
  for (const s of STRENGTHS) {
    if (!counts[s.id]) continue;
    const seg = el('span', 'seg seg-' + s.id);
    seg.style.flexGrow = String(counts[s.id]);
    seg.title = s.label + ': ' + counts[s.id];
    bar.appendChild(seg);
  }
  const summary = el('section', 'cards-panel');
  summary.appendChild(el('h2', null, known + ' of ' + deck.length + ' words started'));
  summary.appendChild(bar);

  const legend = el('ul', 'strength-legend');
  for (const s of STRENGTHS) {
    const li = el('li', null);
    li.appendChild(el('span', 'dot dot-' + s.id));
    li.appendChild(el('span', 'legend-label', s.label));
    li.appendChild(el('span', 'legend-count', String(counts[s.id])));
    legend.appendChild(li);
  }
  summary.appendChild(legend);
  app.appendChild(summary);

  const queue = buildQueue(words(), S.cards, { introducedToday });
  const action = el('section', 'cards-panel');
  const line = el('p', 'queue-line');
  line.appendChild(el('strong', null, String(due)));
  line.appendChild(el('span', null, due === 1 ? ' word due today' : ' words due today'));
  if (fresh) {
    const room = Math.max(0, 10 - introducedToday);
    line.appendChild(el('span', 'queue-sep', ' · '));
    line.appendChild(el('span', null, Math.min(room, fresh) + ' new to start'));
  }
  action.appendChild(line);

  if (queue.length) {
    action.appendChild(on(el('button', 'btn-primary', 'Review ' + queue.length + (queue.length === 1 ? ' card' : ' cards')), () => startSession(queue)));
  } else {
    action.appendChild(el('p', 'queue-done', reviewedToday
      ? 'Nothing left today. ' + reviewedToday + ' answered — come back tomorrow.'
      : 'Nothing due today.'));
  }
  if (reviewedToday) action.appendChild(el('p', 'queue-note', reviewedToday + ' answered today'));
  app.appendChild(action);

  const more = el('div', 'cards-actions');
  more.appendChild(on(el('button', 'btn-ghost', 'All words'), () => { screen = 'browse'; render(); }));
  more.appendChild(on(el('button', 'btn-ghost', 'Reset progress'), resetAll));
  app.appendChild(more);
}

function resetAll() {
  if (!confirm('Forget every card and start again?')) return;
  S = defaults();
  save();
  if (window.CardSync) { try { window.CardSync.forget(); } catch (e) {} }
  render();
}

/* ---------------------- browse ---------------------- */

function renderBrowse() {
  const head = el('header', 'cards-head');
  head.appendChild(on(el('button', 'btn-back', '← Back'), () => { screen = 'home'; render(); }));
  head.appendChild(el('h1', null, 'All words'));
  app.appendChild(head);

  const order = { learning: 0, familiar: 1, known: 2, mastered: 3, new: 4 };
  const rows = deck.slice().sort((a, b) => {
    const d = order[strengthOf(S.cards[a.hanzi])] - order[strengthOf(S.cards[b.hanzi])];
    return d || (a.pinyin < b.pinyin ? -1 : 1);
  });

  const list = el('ul', 'word-list');
  for (const w of rows) {
    const c = S.cards[w.hanzi];
    const st = strengthOf(c);
    const li = el('li', 'word-row');
    li.appendChild(on(el('button', 'word-hanzi', w.hanzi), () => say(w.hanzi)));
    const mid = el('div', 'word-text');
    mid.appendChild(el('span', 'word-pinyin', w.pinyin));
    mid.appendChild(el('span', 'word-english', w.english));
    li.appendChild(mid);
    const right = el('div', 'word-meta');
    right.appendChild(el('span', 'tag tag-' + st, STRENGTHS.find(s => s.id === st).label));
    if (c && c.reviewedAt) right.appendChild(el('span', 'word-due', 'due ' + c.due));
    li.appendChild(right);
    list.appendChild(li);
  }
  app.appendChild(list);
}

/* ---------------------- session ---------------------- */

function startSession(queue) {
  session = { queue: queue.slice(), i: 0, shown: false, answered: 0, again: 0 };
  screen = 'session';
  render();
}

function renderSession() {
  const word = session.queue[session.i];
  const entry = deck.find(d => d.hanzi === word);
  if (!entry) { finishSession(); return; }
  const card = S.cards[word];
  const isNew = !card || !card.reviewedAt;

  const top = el('div', 'session-top');
  top.appendChild(on(el('button', 'btn-close', '✕'), () => finishSession()));
  const prog = el('div', 'session-progress');
  const fill = el('span', 'session-fill');
  fill.style.width = Math.round((session.i / session.queue.length) * 100) + '%';
  prog.appendChild(fill);
  top.appendChild(prog);
  top.appendChild(el('span', 'session-count', session.i + 1 + ' / ' + session.queue.length));
  app.appendChild(top);

  const face = el('section', 'card-face');
  if (isNew) face.appendChild(el('span', 'card-flag', 'New word'));
  face.appendChild(on(el('div', 'card-hanzi', entry.hanzi), () => say(entry.hanzi)));

  if (session.shown) {
    face.appendChild(el('div', 'card-pinyin', entry.pinyin));
    face.appendChild(el('div', 'card-english', entry.english));
  } else {
    face.appendChild(el('div', 'card-hint', 'What does it mean?'));
  }
  face.appendChild(on(el('button', 'btn-sound', '🔊 Listen'), () => say(entry.hanzi)));
  app.appendChild(face);

  const foot = el('div', 'session-foot');
  if (!session.shown) {
    foot.appendChild(on(el('button', 'btn-primary', 'Show answer'), () => {
      session.shown = true;
      say(entry.hanzi);
      render();
    }));
  } else {
    foot.appendChild(gradeButton('again', 'Again', 'Did not know it'));
    foot.appendChild(gradeButton('good', 'Good', 'Knew it'));
    foot.appendChild(gradeButton('easy', 'Easy', 'Instantly'));
  }
  app.appendChild(foot);

  /* Space reveals, then 1/2/3 answer — the keys anyone who has used a
     flashcard app already expects. */
  app.appendChild(el('p', 'session-keys', session.shown ? '1 again · 2 good · 3 easy' : 'space to reveal'));
}

function gradeButton(answer, label, sub) {
  const word = session.queue[session.i];
  const next = grade(S.cards[word] || newCard(), answer);
  const b = el('button', 'btn-grade grade-' + answer);
  b.appendChild(el('span', 'grade-label', label));
  b.appendChild(el('span', 'grade-when', answer === 'again' ? 'today' : whenLabel(next.interval)));
  b.title = sub;
  return on(b, () => answer_(answer));
}

function whenLabel(days) {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 30) return days + ' days';
  const m = Math.round(days / 30);
  return m === 1 ? 'a month' : m + ' months';
}

function answer_(answer) {
  const day = today();
  const word = session.queue[session.i];
  const before = S.cards[word];
  const wasNew = !before || !before.reviewedAt;

  S.cards[word] = grade(before || newCard(), answer);
  if (wasNew) S.introduced[day] = (S.introduced[day] || 0) + 1;
  S.reviewed[day] = (S.reviewed[day] || 0) + 1;
  session.answered += 1;
  save();

  /* A word answered "again" comes back at the end of this sitting, not in a
     week: the point of the button is that you did not know it just now. */
  if (answer === 'again') {
    session.again += 1;
    session.queue.push(word);
  }

  session.i += 1;
  session.shown = false;
  if (session.i >= session.queue.length) return finishSession();
  render();
}

function finishSession() {
  const answered = session ? session.answered : 0;
  session = null;
  screen = 'home';
  syncNow();
  render();
  if (answered) {
    const note = el('p', 'session-done', answered + (answered === 1 ? ' card reviewed' : ' cards reviewed'));
    app.insertBefore(note, app.firstChild.nextSibling);
  }
}

document.addEventListener('keydown', e => {
  if (screen !== 'session' || !session) return;
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (!session.shown) { session.shown = true; render(); }
    return;
  }
  if (!session.shown) return;
  if (e.key === '1') answer_('again');
  if (e.key === '2') answer_('good');
  if (e.key === '3') answer_('easy');
});

/* ---------------------- boot ---------------------- */

deck = readDeck();
if (!deck.length) {
  app.appendChild(el('p', 'cards-error', 'Could not load the word list. Please reload the page.'));
} else {
  render();
  syncNow();          // pull whatever the account already holds
}
