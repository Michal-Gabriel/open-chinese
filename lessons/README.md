# 🐲 Gamified Lessons

The gamified half of [OpenChinese](../README.md): a dependency-free re-creation of the
Duolingo lesson experience, as a free **HSK 1 Mandarin Chinese** course.

**Play it: https://michal-gabriel.github.io/open-chinese/lessons/**

## The course

The **complete HSK 1 vocabulary — all 150 words, and nothing outside it** — across
**9 units / 39 lessons**: greetings, people and family, numbers, time, getting
around, food and shopping, home, verbs, and describing things. Every unit ends with
a review lesson that pools everything taught before it.

The content is verified, not just written: a check script asserts that the course
teaches each of the 150 HSK 1 words exactly once, teaches nothing outside the list,
that every sentence token is itself an HSK 1 word with a known pinyin, and that no
sentence uses a word before the lesson that introduces it.

## The lesson loop

* **Six exercise types**, generated fresh on every run from the lesson's word and
  sentence pool:
  * meaning multiple choice (hanzi → English)
  * character multiple choice (English → hanzi)
  * pinyin multiple choice
  * listen-and-tap
  * tap-the-matching-pairs
  * build the sentence from a word bank, in both directions and by ear
* **Duolingo-style game layer** — a lesson path with crowns, XP, a
  day streak, a progress bar that grows when you get something wrong (missed items
  are re-queued until you get them right), and an end-of-lesson XP / time / accuracy
  screen. **Hearts are unlimited**: mistakes still cost you the perfect-lesson bonus
  and bring the item back, but they never end a lesson or lock you out.
* **Nothing is gated** — every lesson is open from the first visit, so you can jump
  straight to whichever one you want. Untouched lessons are drawn faded, so the path
  still shows how far you have got.
* **Audio** from the browser's own speech synthesis (`zh-CN`). If the device has no
  Chinese voice, the listening exercises are automatically swapped for reading ones.
* Homophones are handled: 他/她 and 坐/做 are never offered against each other in a
  listening or pinyin question, where they would be impossible to tell apart.
* **Keyboard**: `1`–`9` pick an option, `Enter` checks / continues, `Backspace`
  removes the last word tile.

## Accounts and cloud progress

Progress lives in `localStorage` by default, so it is per-browser. Point `sync.js` at a
Supabase project and it also syncs to an account:

* **No account until there is something to save.** Nobody is signed in on arrival; a guest
  account is created silently on your first finished lesson. Signing in with Google then
  *links* that guest account, so the progress you already earned comes with you.
* **The server merges, and only ever forwards.** Pushes go through a Postgres function
  (`supabase/schema.sql`) that takes the greater of each value, so two devices can push in
  any order, a retry after a dropped connection is harmless, and no device can pull another
  one's progress backwards. The one exception is the streak, which follows whichever side
  has the later activity date — taking the maximum would resurrect a streak you had broken.
* **It is entirely optional.** Leave the two constants at the top of `sync.js` empty and the
  module stays inert. If the CDN is blocked, the network is down or the project is paused,
  the app keeps playing on local storage and the header dot turns amber rather than
  pretending to save.

`supabase/schema.test.sql` runs the schema against a throwaway Postgres — merge semantics,
the streak edge case, row-level security between two users, and a 300-batch fuzz asserting
the merge is order-independent and never loses progress:

```bash
docker run -d --name duo-pg -e POSTGRES_PASSWORD=test -e POSTGRES_DB=duo postgres:17-alpine
docker cp supabase/. duo-pg:/t/
docker exec -w /t duo-pg psql -U postgres -d duo -v ON_ERROR_STOP=1 -f schema.test.sql
```

Free Supabase projects pause after about a week of inactivity;
`.github/workflows/keepalive.yml` pings a heartbeat table every three days to delay that.
Read the caveats in that file — it is a mitigation, not a guarantee.

The Reset button in the header clears both the local and the cloud copy.

## Running locally

```bash
python3 -m http.server 8777
```

Then open <http://localhost:8777>.

## Files

| File | What it is |
| --- | --- |
| `index.html` | the shell |
| `course.js` | all course content (words, pinyin, sentences, tokens) |
| `app.js` | state, audio, exercise generation and every screen |
| `styles.css` | the look |

Not affiliated with Duolingo — this is a study of how the lesson loop is put together.
