/* Flashcards — the scheduler, kept apart from the screens so that it can be
   reasoned about (and tested) on its own.
 *
 * SM-2, trimmed to what a beginner's deck actually needs: three answers
 * instead of four, and whole days instead of minutes. The ease factor is the
 * part worth keeping — it is what makes a word you keep failing come back
 * sooner than a word you have never missed, which a fixed ladder cannot do.
 *
 * A card is: { reps, lapses, ease, interval, due, reviewedAt }
 *   interval  whole days until the next showing; 0 means "again today"
 *   due       ISO date (YYYY-MM-DD)
 *   reviewedAt ISO timestamp — the only field the server merges on, because
 *              the freshest review wins rather than the largest value.
 */

const EASE_START = 2.5;
const EASE_FLOOR = 1.3;

/* The first two successful intervals are fixed. Multiplying from 0 would put
   a brand-new word a month away after two good answers, which feels right to
   the algorithm and wrong to the person. */
const FIRST_INTERVAL = 1;
const SECOND_INTERVAL = 3;

export const GRADES = ['again', 'good', 'easy'];

export function today(now) {
  return new Date(now || Date.now()).toISOString().slice(0, 10);
}

export function addDays(isoDate, days) {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function newCard(now) {
  return {
    reps: 0,
    lapses: 0,
    ease: EASE_START,
    interval: 0,
    due: today(now),
    reviewedAt: null,
  };
}

/* The whole scheduler. Returns a new card rather than mutating the old one,
   so a caller can show "next time: 6 days" before committing to it. */
export function grade(card, answer, now) {
  const at = new Date(now || Date.now());
  const day = today(at.getTime());
  const c = card || newCard(at.getTime());
  let { reps, lapses, ease, interval } = c;

  if (answer === 'again') {
    /* Forgetting is the one case that must move backwards: the word returns
       today, and its ease drops so that it keeps coming back sooner than its
       neighbours until it sticks. */
    lapses += 1;
    reps = 0;
    ease = Math.max(EASE_FLOOR, ease - 0.2);
    interval = 0;
  } else {
    reps += 1;
    if (answer === 'easy') ease += 0.15;
    if (reps === 1) interval = FIRST_INTERVAL;
    else if (reps === 2) interval = SECOND_INTERVAL;
    else interval = Math.round(interval * ease) || FIRST_INTERVAL;
    if (answer === 'easy') interval = Math.max(interval + 1, Math.round(interval * 1.3));
  }

  return {
    reps,
    lapses,
    ease: Math.round(ease * 100) / 100,
    interval,
    due: addDays(day, interval),
    reviewedAt: at.toISOString(),
  };
}

/* "How well do you know it" — the thing the person actually asked to see.
   Derived from the interval rather than stored, so it can never disagree with
   the schedule. */
export const STRENGTHS = [
  { id: 'new', label: 'New', min: null },
  { id: 'learning', label: 'Learning', min: 0 },
  { id: 'familiar', label: 'Familiar', min: 1 },
  { id: 'known', label: 'Known', min: 7 },
  { id: 'mastered', label: 'Mastered', min: 30 },
];

export function strengthOf(card) {
  if (!card || !card.reviewedAt) return 'new';
  if (card.interval >= 30) return 'mastered';
  if (card.interval >= 7) return 'known';
  if (card.interval >= 1) return 'familiar';
  return 'learning';
}

/* A session is everything due today, plus a ration of words never seen. The
   cap exists so that a first visit does not hand someone 150 new characters
   and a reason to leave. */
export function buildQueue(words, cards, opts) {
  const o = opts || {};
  const day = today(o.now);
  const newPerDay = o.newPerDay == null ? 10 : o.newPerDay;
  const maxSession = o.maxSession == null ? 40 : o.maxSession;
  const introducedToday = o.introducedToday || 0;

  const due = [];
  const fresh = [];
  for (const w of words) {
    const c = cards[w];
    if (!c || !c.reviewedAt) fresh.push(w);
    else if (c.due <= day) due.push(w);
  }

  /* Oldest due first: a word that has been waiting a week matters more than
     one that came due this morning. */
  due.sort((a, b) => (cards[a].due < cards[b].due ? -1 : cards[a].due > cards[b].due ? 1 : 0));

  const room = Math.max(0, newPerDay - introducedToday);
  return due.concat(fresh.slice(0, room)).slice(0, maxSession);
}

export function countDue(words, cards, now) {
  const day = today(now);
  let due = 0;
  let fresh = 0;
  for (const w of words) {
    const c = cards[w];
    if (!c || !c.reviewedAt) fresh += 1;
    else if (c.due <= day) due += 1;
  }
  return { due, fresh };
}
