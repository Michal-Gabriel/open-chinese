/* Gamified Lessons — a small Duolingo-style engine for Mandarin. */
(function () {
'use strict';

/* ======================= state ======================= */

const KEY = 'duochinese.v2';   // v1 had different lesson ids
const MAX_CROWNS = 3;

const defaults = () => ({
  xp: 0, streak: 0, lastDay: null,
  progress: {},                          // lessonId -> crowns
  cloudUid: null,                        // which account this copy belongs to, if any
  nudged: false,                         // have we offered cloud saving yet
  totalLessons: 0,
});

let S = load();

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
function today() { return new Date().toISOString().slice(0, 10); }
function daysBetween(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); }

/* ======================= cloud sync (optional) =======================
   sync.js sets window.DuoSync when a backend is configured and reachable.
   Everything below is written so that its absence changes nothing: no
   backend, no network, blocked CDN or a paused project all degrade to the
   local-storage-only app this has always been. */

function syncNow() {
  const sync = window.DuoSync;
  if (!sync) return;
  try { sync.push(S); } catch (e) {}
}

/* The server merges and hands back the authoritative row (see
   supabase/schema.sql); the client never merges, so the two can't drift. */
window.addEventListener('duo:remote', e => {
  const d = e.detail || {};
  if (!d.state) return;
  S.xp = d.state.xp;
  S.streak = d.state.streak;
  S.lastDay = d.state.lastDay;
  S.progress = d.state.progress || {};
  S.cloudUid = d.uid || S.cloudUid;
  save();
  if (screen === 'path') render();       // never yank the screen out mid-lesson
});

window.addEventListener('duo:auth', e => {
  const u = (e.detail || {}).user;
  // Someone else used this browser: adopt their account's state rather than
  // merging this machine's leftovers into it.
  if (u && S.cloudUid && S.cloudUid !== u.id) { S = defaults(); save(); }
  if (u) syncNow();
  if (screen === 'path') render();
});

// Status only moves a dot — repaint it in place, so the path keeps its scroll.
window.addEventListener('duo:status', e => {
  const dot = document.querySelector('.auth .dot');
  if (dot) dot.className = 'dot ' + ((e.detail || {}).status || 'idle');
});

// Catch anything earned just before the tab goes away — but never mint an
// account merely because a tab was hidden.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && window.DuoSync && window.DuoSync.user) syncNow();
});

function bumpStreak() {
  const d = today();
  if (S.lastDay === d) return;
  S.streak = (S.lastDay && daysBetween(S.lastDay, d) === 1) ? S.streak + 1 : 1;
  S.lastDay = d;
}

/* ======================= audio ======================= */

let zhVoice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices() || [];
  zhVoice = vs.find(v => /^zh[-_]?(CN|Hans)?/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}
function audioOk() {
  if (!('speechSynthesis' in window)) return false;
  const vs = speechSynthesis.getVoices();
  if (!vs || !vs.length) return true;          // not loaded yet — assume it works
  return vs.some(v => /^zh/i.test(v.lang));
}
function speak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/[。！？、，]/g, ' '));
    u.lang = 'zh-CN';
    if (zhVoice) u.voice = zhVoice;
    u.rate = 0.8;
    speechSynthesis.speak(u);
  } catch (e) {}
}

let actx = null;
function tone(freqs, dur) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const t0 = actx.currentTime + i * dur * 0.6;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(t0); o.stop(t0 + dur + 0.02);
    });
  } catch (e) {}
}
const dingOK = () => tone([660, 990], 0.16);
const dingNo = () => tone([200, 150], 0.22);

/* ======================= helpers ======================= */

const ALL_WORDS = Array.from(WORD_INDEX.values());
const rand = n => Math.floor(Math.random() * n);
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(a, n) { return shuffle(a).slice(0, n); }
function distractorWords(exclude, n) {
  const pool = ALL_WORDS.filter(w => !exclude.includes(w[0]) && !exclude.includes(w[2]));
  return pick(pool, n);
}
/* 他/她 and 坐/做 are homophones: as distractors they make a listening or a
   pinyin question impossible to answer, so sound-alikes are filtered out. */
function soundAlikeSafe(w, n) {
  const pool = shuffle(ALL_WORDS.filter(x => x[0] !== w[0] && x[2] !== w[2]));
  const out = [], taken = [w[1]];
  for (const x of pool) {
    if (taken.includes(x[1])) continue;          // also keeps two distractors apart
    taken.push(x[1]); out.push(x);
    if (out.length === n) break;
  }
  return out;
}
const EN_FILLER = ['very', 'not', 'good', 'tea', 'friend', 'teacher', 'buy', 'want', 'where',
  'today', 'money', 'school', 'eat', 'drink', 'hello', 'name', 'this', 'that', 'three', 'home',
  'book', 'water', 'cat', 'dog', 'hot', 'cold', 'big', 'small', 'happy', 'doctor', 'who',
  'know', 'study', 'write', 'see', 'come', 'return', 'shop', 'apple', 'rice'];

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function on(node, fn) { node.addEventListener('click', fn); return node; }

/* ======================= challenge generation ======================= */

function cSelectMeaning(w) {                       // hanzi -> English meaning
  const opts = shuffle([w].concat(distractorWords([w[0]], 2))).map(x => x[2]);
  return { t: 'meaning', hz: w[0], py: w[1], q: 'What does this mean?', options: opts, answer: opts.indexOf(w[2]) };
}
function cSelectHanzi(w) {                         // English -> hanzi tile
  const opts = shuffle([w].concat(distractorWords([w[0]], 2)));
  return { t: 'hanzi', q: 'Which one of these is “' + w[2] + '”?', options: opts, answer: opts.indexOf(w) };
}
function cAudio(w) {                               // listen -> pick hanzi
  const opts = shuffle([w].concat(soundAlikeSafe(w, 2)));
  return { t: 'audio', q: 'Tap what you hear', hz: w[0], options: opts, answer: opts.indexOf(w) };
}
function cPinyin(w) {                              // hanzi -> pinyin
  const opts = shuffle([w].concat(soundAlikeSafe(w, 2))).map(x => x[1]);
  return { t: 'pinyin', hz: w[0], q: 'How is this pronounced?', options: opts, answer: opts.indexOf(w[1]) };
}
function cPairs(words) {
  return { t: 'pairs', q: 'Tap the matching pairs', items: pick(words, Math.min(5, words.length)) };
}
function cBuildZh(s, listen) {                     // English (or audio) -> build hanzi
  const answer = s[3];
  const extra = distractorWords(answer, 3).map(w => w[0]);
  return {
    t: 'build', dir: listen ? 'listen' : 'en2zh',
    q: listen ? 'Tap what you hear' : 'Write this in Chinese',
    sent: s, answer: answer, bank: shuffle(answer.concat(extra)),
  };
}
function cBuildEn(s) {                             // hanzi -> build English
  const answer = s[2].split(' ');
  const extra = pick(EN_FILLER.filter(w => !answer.includes(w)), 3);
  return { t: 'build', dir: 'zh2en', q: 'Translate this sentence', sent: s, answer: answer, bank: shuffle(answer.concat(extra)) };
}

function generate(lesson, crowns) {
  const words = lesson.words, sents = lesson.sentences;
  const out = [];

  if (crowns === 0) {
    // first pass: meet every word before using it
    words.forEach(w => out.push(cSelectMeaning(w)));
    if (words.length >= 4) out.push(cPairs(words));
    sents.forEach((s, i) => out.push(i % 2 ? cBuildEn(s) : cBuildZh(s, false)));
    words.slice(0, 3).forEach(w => out.push(cAudio(w)));
  } else {
    if (words.length >= 4) out.push(cPairs(words));
    pick(words, Math.min(4, words.length)).forEach((w, i) => {
      out.push(i % 3 === 0 ? cPinyin(w) : i % 3 === 1 ? cAudio(w) : cSelectHanzi(w));
    });
    shuffle(sents).forEach((s, i) => out.push(i % 3 === 0 ? cBuildEn(s) : cBuildZh(s, i % 3 === 2)));
  }

  // keep sessions short and varied; on a first pass the intros stay up front
  let list;
  if (crowns === 0) {
    const intro = out.filter(c => c.t === 'meaning');
    const rest = out.filter(c => c.t !== 'meaning');
    const pairs = rest.filter(c => c.t === 'pairs');
    list = intro.concat(pairs, shuffle(rest.filter(c => c.t !== 'pairs')));
  } else {
    const pairs = out.filter(c => c.t === 'pairs');
    list = pairs.concat(shuffle(out.filter(c => c.t !== 'pairs')));
  }
  list = list.slice(0, 14);

  // no Chinese voice on this device? swap listening tasks for readable ones
  if (!audioOk()) {
    list = list.map(c => {
      if (c.t === 'audio') return cSelectHanzi(WORD_INDEX.get(c.hz));
      if (c.t === 'build' && c.dir === 'listen') {
        return Object.assign({}, c, { dir: 'en2zh', q: 'Write this in Chinese' });
      }
      return c;
    });
  }
  return list;
}

/* ======================= app shell ======================= */

const app = document.getElementById('app');
let screen = 'path';
let ses = null;                                     // active lesson session

function clear() { app.innerHTML = ''; }
function render() {
  clear();
  if (screen === 'path') return renderPath();
  if (screen === 'lesson') return renderLesson();
  if (screen === 'done') return renderDone();
}

/* ---------- path ---------- */

/* Every lesson is open from the start — jump straight to whichever one you
   want to try. Lessons you have not touched yet are drawn faded, so the path
   still shows how far you have got. The bubble points at the next one to do. */
function currentLesson() {
  return ALL_LESSONS.find(l => !S.progress[l.id])
      || ALL_LESSONS.find(l => (S.progress[l.id] || 0) < MAX_CROWNS)
      || null;
}

function renderPath() {
  const top = el('div', 'top');
  const mk = (cls, icon, val) => {
    const s = el('div', 'stat ' + cls);
    s.appendChild(el('span', 'icon', icon));
    s.appendChild(el('span', val === '∞' ? 'inf' : null, val));
    return s;
  };
  top.appendChild(mk('fire', '🔥', S.streak));
  top.appendChild(mk('gem', '💎', S.xp));
  top.appendChild(mk('heart', '❤️', '∞'));
  top.appendChild(el('div', 'spacer'));
  const home = el('a', 'home-link', '← OpenChinese');
  home.href = '../';
  home.title = 'Back to OpenChinese';
  top.appendChild(home);
  top.appendChild(authControl());
  const reset = on(el('button', null, 'Reset'), () => {
    if (!confirm('Reset all progress?')) return;
    if (window.DuoSync) { try { window.DuoSync.forget(); } catch (e) {} }
    S = defaults(); save(); render();
  });
  reset.style.cssText = 'color:var(--grey);font-size:12px;text-transform:uppercase;letter-spacing:.6px';
  top.appendChild(reset);
  app.appendChild(top);

  const hero = el('div', 'hero');
  hero.appendChild(el('h1', null, '🐲 Gamified Lessons'));
  const doneCount = Object.values(S.progress).filter(v => v > 0).length;
  hero.appendChild(el('p', null, doneCount
    ? doneCount + ' of ' + ALL_LESSONS.length + ' lessons started · keep going!'
    : 'The complete HSK 1 vocabulary — 150 words, 39 lessons. Free, forever.'));
  app.appendChild(hero);

  const path = el('div', 'path');
  const cur = currentLesson();

  COURSE.forEach(u => {
    const head = el('div', 'unit-head');
    head.style.background = u.color;
    head.appendChild(el('div', 'u-ic', u.icon));
    const box = el('div');
    box.appendChild(el('h2', null, u.title));
    box.appendChild(el('p', null, u.subtitle));
    head.appendChild(box);
    path.appendChild(head);

    const nodes = el('div', 'nodes');
    u.lessons.forEach((l, i) => {
      const row = el('div', 'node-row');
      // gentle zig-zag, like a trail
      const offs = [0, 46, 70, 46, 0, -46, -70, -46];
      row.style.transform = 'translateX(' + offs[i % offs.length] + 'px)';

      const wrap = el('div', 'node-wrap');
      const crowns = S.progress[l.id] || 0;
      const full = crowns >= MAX_CROWNS;

      const btn = el('button', 'node' + (crowns ? ' done' : ' fresh'));
      btn.textContent = full ? '👑' : l.review ? '🏆' : '★';
      btn.style.background = full ? '#FFC800' : u.color;
      btn.style.boxShadow = '0 7px 0 ' + (full ? '#E0A900' : shade(u.color));
      btn.title = l.title;
      on(btn, () => startLesson(l.id));
      wrap.appendChild(btn);

      if (crowns > 0) wrap.appendChild(el('div', 'crowns', '👑' + crowns));
      wrap.appendChild(el('div', 'lbl', l.title));
      if (cur && cur.id === l.id) wrap.appendChild(el('div', 'start-bubble', crowns ? 'Practice' : 'Start'));

      row.appendChild(wrap);
      nodes.appendChild(row);
    });
    path.appendChild(nodes);
  });

  app.appendChild(path);
}

/* Sign-in control. Renders nothing at all when no backend is configured. */
function authControl() {
  const box = el('div', 'auth');
  const sync = window.DuoSync;
  if (!sync) return box;
  const u = sync.user;

  if (u && !u.anonymous) {
    const who = el('button', 'who');
    if (u.avatar) {
      const img = document.createElement('img');
      img.src = u.avatar; img.alt = ''; img.referrerPolicy = 'no-referrer';
      who.appendChild(img);
    }
    who.appendChild(el('span', null, String(u.name || 'Account').split('@')[0].split(' ')[0]));
    who.title = 'Signed in — progress saves to your account';
    on(who, () => {
      if (!confirm('Sign out? Your progress stays saved to your account.')) return;
      sync.signOut();
      S = defaults(); save(); render();
    });
    box.appendChild(who);
  } else {
    const b = on(el('button', 'signin', 'Sign in'), () => sync.signIn());
    b.title = 'Save your progress and pick it up on any device';
    box.appendChild(b);
  }
  box.appendChild(el('span', 'dot ' + (sync.status || 'idle')));
  return box;
}

function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.round(c * 0.78));
  return '#' + [f(n >> 16 & 255), f(n >> 8 & 255), f(n & 255)]
    .map(v => v.toString(16).padStart(2, '0')).join('');
}

/* ---------- session ---------- */

function startLesson(id) {
  const l = lessonById(id);
  const queue = generate(l, S.progress[id] || 0);
  if (!queue.length) return;                     // nothing to ask — don't open an empty lesson
  ses = {
    lesson: l,
    queue: queue,
    i: 0, right: 0, wrong: 0, state: 'answering',
    sel: null, built: [], used: {}, matched: 0, pairSel: null,
    startedAt: Date.now(),
  };
  screen = 'lesson';
  render();
}

function cur() { return ses.queue[ses.i]; }

function renderLesson() {
  const c = cur();
  const wrap = el('div', 'lesson');

  /* top bar */
  const top = el('div', 'lesson-top');
  top.appendChild(on(el('button', 'close', '✕'), () => {
    if (!confirm('Quit this lesson? Progress will be lost.')) return;
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    screen = 'path'; render();
  }));
  const bar = el('div', 'bar');
  const fill = el('i');
  fill.style.width = Math.round(ses.i / ses.queue.length * 100) + '%';
  bar.appendChild(fill);
  top.appendChild(bar);
  const h = el('div', 'hearts');
  h.appendChild(el('span', null, '❤️'));
  h.appendChild(el('span', 'inf', '∞'));
  top.appendChild(h);
  wrap.appendChild(top);

  /* stage */
  const stage = el('div', 'stage');
  stage.appendChild(el('h2', 'q', c.q));
  ({
    meaning: rMeaning, hanzi: rHanzi, audio: rAudio, pinyin: rPinyin,
    pairs: rPairs, build: rBuild,
  })[c.t](stage, c);
  wrap.appendChild(stage);

  /* footer */
  wrap.appendChild(renderFoot(c));
  app.appendChild(wrap);
}

function speakerBtn(text, big) {
  const b = el('button', 'speaker' + (big ? ' big' : ''), '🔊');
  on(b, () => speak(text));
  return b;
}

function optionList(stage, c, labels, cols) {
  const box = el('div', 'opts' + (cols ? ' cols' : ''));
  labels.forEach((lab, i) => {
    const o = el('button', 'opt');
    o.appendChild(el('span', 'num', String(i + 1)));
    if (typeof lab === 'string') {
      o.appendChild(el('span', null, lab));
    } else {
      const t = el('span');
      t.appendChild(el('span', 'o-hz', lab[0]));
      t.appendChild(el('span', 'o-py', ' ' + lab[1]));
      o.appendChild(t);
    }
    if (ses.state === 'checked') {
      if (i === c.answer) o.classList.add('ok');
      else if (i === ses.sel) o.classList.add('bad');
    } else if (ses.sel === i) o.classList.add('sel');
    on(o, () => {
      if (ses.state === 'checked') return;
      ses.sel = i;
      if (c.t === 'audio' || c.t === 'hanzi') speak(typeof lab === 'string' ? lab : lab[0]);
      render();
    });
    box.appendChild(o);
  });
  stage.appendChild(box);
}

function rMeaning(stage, c) {
  stage.appendChild(el('div', 'big-hz', c.hz));
  stage.appendChild(el('div', 'big-py', c.py));
  const sp = speakerBtn(c.hz); sp.style.margin = '0 auto 22px';
  stage.appendChild(sp);
  optionList(stage, c, c.options);
}
function rHanzi(stage, c) {
  optionList(stage, c, c.options.map(w => [w[0], w[1]]), true);
}
function rAudio(stage, c) {
  stage.appendChild(speakerBtn(c.hz, true));
  optionList(stage, c, c.options.map(w => [w[0], w[1]]), true);
  if (ses.state === 'answering') speakOnce(c.hz);
}
function rPinyin(stage, c) {
  stage.appendChild(el('div', 'big-hz', c.hz));
  const sp = speakerBtn(c.hz); sp.style.margin = '8px auto 22px';
  stage.appendChild(sp);
  optionList(stage, c, c.options, true);
}

let lastSpoken = null;
function speakOnce(text) {
  const tag = ses.i + ':' + text;
  if (lastSpoken === tag) return;
  lastSpoken = tag;
  setTimeout(() => speak(text), 350);
}

function rPairs(stage, c) {
  const grid = el('div', 'pairs');
  if (!ses.pairLeft) {
    ses.pairLeft = shuffle(c.items);
    ses.pairRight = shuffle(c.items);
    ses.gone = {};
  }
  const col = (items, side) => {
    const box = el('div');
    box.style.cssText = 'display:flex;flex-direction:column;gap:12px';
    items.forEach(w => {
      const b = el('button', 'pair' + (ses.gone[w[0]] ? ' gone' : ''));
      b.setAttribute('aria-label', side === 'L' ? w[0] + ' ' + w[1] : w[2]);
      if (side === 'L') {
        b.appendChild(el('div', null, w[0]));
        b.appendChild(el('div', 'p-py', w[1]));
      } else {
        b.appendChild(el('div', null, w[2]));
      }
      if (ses.pairSel && ses.pairSel.side === side && ses.pairSel.hz === w[0]) b.classList.add('sel');
      on(b, () => {
        if (ses.gone[w[0]]) return;
        if (side === 'L') speak(w[0]);
        if (!ses.pairSel || ses.pairSel.side === side) { ses.pairSel = { side: side, hz: w[0] }; return render(); }
        if (ses.pairSel.hz === w[0]) {
          ses.gone[w[0]] = true; ses.pairSel = null; ses.matched++;
          dingOK();
          if (ses.matched >= c.items.length) {
            ses.state = 'checked'; ses.ok = true; ses.right++;
            advanceTimer = setTimeout(() => { advanceTimer = null; next(); }, 400);
          }
          return render();
        }
        // mismatch
        dingNo();
        ses.pairSel = null;
        ses.pairMiss = (ses.pairMiss || 0) + 1;
        render();
      });
      box.appendChild(b);
    });
    return box;
  };
  grid.appendChild(col(ses.pairLeft, 'L'));
  grid.appendChild(col(ses.pairRight, 'R'));
  stage.appendChild(grid);
  stage.appendChild(el('div', 'hint', 'Match each character to its meaning.'));
}

function rBuild(stage, c) {
  const s = c.sent;
  if (c.dir === 'listen') {
    stage.appendChild(speakerBtn(s[0], true));
    if (ses.state === 'answering') speakOnce(s[0]);
  } else if (c.dir === 'en2zh') {
    stage.appendChild(el('div', 'en-prompt', '“' + s[2] + '”'));
  } else {
    const p = el('div', 'prompt');
    p.appendChild(speakerBtn(s[0]));
    const b = el('div', 'bubble');
    b.appendChild(el('div', 'hz', s[0]));
    b.appendChild(el('div', 'py', s[1]));
    p.appendChild(b);
    stage.appendChild(p);
    speakOnce(s[0]);
  }

  const slots = el('div', 'slots');
  const line = el('div', 'slot-line');
  ses.built.forEach((tok, idx) => {
    const t = el('button', 'tile');
    t.appendChild(document.createTextNode(tok.text));
    if (c.dir !== 'zh2en') t.appendChild(el('span', 't-py', pinyinOf(tok.text)));
    on(t, () => {
      if (ses.state === 'checked') return;
      ses.built.splice(idx, 1);
      delete ses.used[tok.key];
      render();
    });
    line.appendChild(t);
  });
  slots.appendChild(line);
  stage.appendChild(slots);

  const bank = el('div', 'bank');
  c.bank.forEach((tok, idx) => {
    const key = idx + ':' + tok;
    const t = el('button', 'tile' + (ses.used[key] ? ' used' : ''));
    t.appendChild(document.createTextNode(tok));
    if (c.dir !== 'zh2en') t.appendChild(el('span', 't-py', pinyinOf(tok)));
    on(t, () => {
      if (ses.state === 'checked' || ses.used[key]) return;
      ses.used[key] = true;
      ses.built.push({ text: tok, key: key });
      if (c.dir !== 'zh2en') speak(tok);
      render();
    });
    bank.appendChild(t);
  });
  stage.appendChild(bank);
}

/* ---------- footer, checking ---------- */

function answerReady(c) {
  if (c.t === 'build') return ses.built.length > 0;
  if (c.t === 'pairs') return false;
  return ses.sel !== null;
}

function renderFoot(c) {
  const foot = el('div', 'foot' + (ses.state === 'checked' ? (ses.ok ? ' ok' : ' bad') : ''));
  const inner = el('div', 'foot-in');

  if (ses.state === 'checked') {
    const v = el('div', 'verdict');
    v.appendChild(el('div', 'v-ic', ses.ok ? '✓' : '✕'));
    const txt = el('div');
    txt.appendChild(el('h3', null, ses.ok ? nice() : 'Correct solution:'));
    txt.appendChild(el('p', null, ses.ok ? solutionLine(c) : solutionLine(c)));
    v.appendChild(txt);
    inner.appendChild(v);
    const b = on(el('button', 'btn' + (ses.ok ? '' : ' red'), 'Continue'), next);
    inner.appendChild(b);
  } else {
    inner.appendChild(el('div', 'verdict'));
    const b = el('button', 'btn', c.t === 'pairs' ? 'Match them all' : 'Check');
    b.disabled = !answerReady(c);
    on(b, check);
    inner.appendChild(b);
  }
  foot.appendChild(inner);
  return foot;
}

const PRAISE = ['Nice!', 'Good job!', 'Excellent!', 'You got it!', 'Correct!', '对了!'];
function nice() { return PRAISE[rand(PRAISE.length)]; }

function solutionLine(c) {
  if (c.t === 'build') {
    if (c.dir === 'zh2en') return c.answer.join(' ');
    return c.answer.join('') + '  ·  ' + c.sent[1];
  }
  if (c.t === 'meaning') return c.options[c.answer];
  if (c.t === 'pinyin') return c.hz + '  ·  ' + c.options[c.answer];
  if (c.t === 'pairs') return 'All matched';
  const w = c.options[c.answer];
  return w[0] + '  ·  ' + w[1] + '  ·  ' + w[2];
}

function check() {
  const c = cur();
  let ok;
  if (c.t === 'build') {
    const got = ses.built.map(t => t.text);
    ok = got.length === c.answer.length && got.every((t, i) => t.toLowerCase() === c.answer[i].toLowerCase());
  } else {
    ok = ses.sel === c.answer;
  }
  ses.ok = ok;
  ses.state = 'checked';
  if (ok) { ses.right++; dingOK(); if (c.t !== 'pairs') speakTarget(c); }
  else { ses.wrong++; dingNo(); }
  render();
}

function speakTarget(c) {
  if (c.t === 'build' && c.dir !== 'zh2en') speak(c.answer.join(''));
  else if (c.hz) speak(c.hz);
  else if (c.t === 'hanzi' || c.t === 'audio') speak(c.options[c.answer][0]);
}

let advanceTimer = null;                 // pairs auto-advance; see rPairs

function next() {
  if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
  if (!ses || screen !== 'lesson') return;   // already finished, or we left the lesson
  const c = cur();
  if (!ses.ok) ses.queue.push(c);          // wrong answers come back at the end
  ses.i++;
  ses.state = 'answering';
  ses.sel = null; ses.built = []; ses.used = {};
  ses.pairLeft = null; ses.pairRight = null; ses.pairSel = null; ses.matched = 0; ses.gone = {};

  if (ses.i >= ses.queue.length) return finish();
  render();
}

function finish() {
  if (ses.finished) return;              // never award the same lesson twice
  ses.finished = true;
  const id = ses.lesson.id;
  const perfect = ses.wrong === 0;
  ses.gainedXp = 10 + (perfect ? 5 : 0);
  S.xp += ses.gainedXp;
  S.progress[id] = Math.min(MAX_CROWNS, (S.progress[id] || 0) + 1);
  bumpStreak();
  save();
  syncNow();                             // a finished lesson is the first thing worth an account
  screen = 'done';
  tone([523, 659, 784, 1046], 0.18);
  render();
}

function renderDone() {
  const secs = Math.max(1, Math.round((Date.now() - ses.startedAt) / 1000));
  const acc = Math.round(ses.right / Math.max(1, ses.right + ses.wrong) * 100);
  const wrap = el('div', 'finish');
  const box = el('div');
  box.appendChild(el('div', 'trophy', ses.wrong === 0 ? '🏆' : '🎉'));
  box.appendChild(el('h1', null, ses.wrong === 0 ? 'Perfect lesson!' : 'Lesson complete!'));

  const cards = el('div', 'cards');
  const card = (cls, title, val) => {
    const c = el('div', 'card ' + cls);
    c.appendChild(el('h4', null, title));
    c.appendChild(el('div', null, val));
    return c;
  };
  cards.appendChild(card('', 'Total XP', ses.gainedXp));
  cards.appendChild(card('blue', 'Time', (secs < 60 ? secs + 's' : Math.floor(secs / 60) + 'm ' + (secs % 60) + 's')));
  cards.appendChild(card('red', 'Accuracy', acc + '%'));
  box.appendChild(cards);

  const sync = window.DuoSync;
  if (sync && (!sync.user || sync.user.anonymous) && !S.nudged) {
    S.nudged = true; save();
    const nudge = el('div', 'nudge');
    nudge.appendChild(el('span', null, 'Want this on your phone too? '));
    nudge.appendChild(on(el('button', 'link', 'Sign in'), () => sync.signIn()));
    nudge.appendChild(el('span', null, ' to keep your progress on any device.'));
    box.appendChild(nudge);
  }

  wrap.appendChild(box);
  app.appendChild(wrap);

  const foot = el('div', 'foot');
  const inner = el('div', 'foot-in');
  inner.appendChild(el('div', 'verdict'));
  inner.appendChild(on(el('button', 'btn', 'Continue'), () => { screen = 'path'; render(); }));
  foot.appendChild(inner);
  app.appendChild(foot);
}

/* ---------- keyboard ---------- */

document.addEventListener('keydown', e => {
  if (screen === 'done') {
    if (e.key === 'Enter') {
      e.preventDefault();
      const b = document.querySelector('.foot .btn');
      if (b) b.click();
    }
    return;
  }
  if (screen !== 'lesson' || !ses) return;
  const c = cur();
  if (e.key === 'Enter') {
    e.preventDefault();
    if (ses.state === 'checked') next();
    else if (answerReady(c)) check();
    return;
  }
  if (/^[1-9]$/.test(e.key) && ses.state === 'answering' && c.options) {
    const i = +e.key - 1;
    if (i < c.options.length) { ses.sel = i; render(); }
  }
  if (e.key === 'Backspace' && c.t === 'build' && ses.state === 'answering' && ses.built.length) {
    const tok = ses.built.pop(); delete ses.used[tok.key]; render();
  }
});

render();
})();
