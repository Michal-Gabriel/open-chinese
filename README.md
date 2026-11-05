# 汉 OpenChinese

An open, community-built place to learn Mandarin, in two halves:

**https://michal-gabriel.github.io/open-chinese/**

| Section | What it is |
| --- | --- |
| **[Voice Stories](stories/)** | 19 narrated stories (HSK 1–2) with pinyin, English, per-word glosses and sentence-by-sentence audio — 249 recorded sentences. |
| **[Gamified Lessons](lessons/)** | The complete HSK 1 vocabulary — all 150 words — as short lessons with matching, listening and sentence building. |

Both are plain static files: no framework, no build step, no dependencies. Open
`index.html` and it runs.

## Layout

```
index.html            the landing page
shared/               one account and one header, used by both sections
  auth.js             the single Supabase client (see "Accounts" below)
  nav.js / nav.css    home link + account control
  site.css            landing and grid styling
stories/              Voice Stories — reader, data and audio
  story.html          the shell; story-page.js renders everything
  stories-index.js    the story grid, built from data/stories.json
  data/*.json         19 stories, 249 sentences, vocab and pinyin fallbacks
  audio/storyN/       249 mp3, one per sentence
lessons/              Gamified Lessons
  audio/              284 mp3 — one per word and per sentence, with index.json
  course.js           the course content (words, pinyin, sentences)
  app.js              state, audio, exercise generation, every screen
  sync.js             lesson progress on top of the shared account
storyN.html           redirect stubs, so older story links keep working
supabase/             schema and its tests
scripts/              TTS generators for story and lesson audio
```

## Accounts

Optional, and shared by both sections — they are served from one origin, so a
session in one is already a session in the other. Point `shared/auth.js` at a
Supabase project and sign-in appears; leave the two constants empty and the
module never loads, with every page working exactly as it does without a
backend.

* **No account until there is something to save.** A guest account is created
  silently on the first finished lesson; signing in with Google then *links*
  it, so progress already earned comes along.
* **The server merges, and only ever forwards.** Pushes go through a Postgres
  function (`supabase/schema.sql`) that takes the greater of each value, so two
  devices can push in any order and no device can pull another backwards. The
  streak is the exception: it follows whichever side has the later activity
  date, because taking the maximum would resurrect a streak you had broken.

`supabase/schema.test.sql` runs the schema against a throwaway Postgres —
merge semantics, the streak edge case, row-level security between two users,
the keep-alive's write path, and a 300-batch fuzz asserting order-independence.
`.github/workflows/schema.yml` runs exactly these on every change to
`supabase/`, and applies `schema.sql` to the project only if they pass, so the
file and the database cannot drift apart. It needs one secret,
`SUPABASE_DB_URL`, and skips the apply with a warning until that is set. To run
the tests yourself:

```bash
docker run -d --name duo-pg -e POSTGRES_PASSWORD=test -e POSTGRES_DB=duo postgres:17-alpine
docker cp supabase/. duo-pg:/t/
docker exec -w /t duo-pg psql -U postgres -d duo -v ON_ERROR_STOP=1 -f schema.test.sql
```

Free Supabase projects pause after about a week of inactivity;
`.github/workflows/keepalive.yml` pings a heartbeat table every three days to
delay that. Read the caveats in that file — a mitigation, not a guarantee.

## Running locally

```bash
python3 -m http.server 8777
```

Then open <http://localhost:8777>.

## Adding a story

Add the story to `stories/data/stories.json` (and its vocab to
`story-vocab.json`), then generate the audio:

```bash
OPENAI_API_KEY=... node scripts/generate-story-audio.mjs
```

## Lesson audio

Every word and sentence in `lessons/course.js` has a recorded clip, named by a hash
of the text, with `lessons/audio/index.json` mapping one to the other. The lessons
used to speak through the browser's `speechSynthesis`, which has no Mandarin voice
on most of Windows, Android and Linux — and without one `app.js` turns every
listening exercise into a reading one, so those learners heard no Mandarin at all.
The clips remove that fork; the voice is still there as a fallback.

```bash
OPENAI_API_KEY=... node scripts/generate-lesson-audio.mjs     # same voice as the stories
node scripts/generate-lesson-audio.mjs --local                # macOS say, no key, no network
```

Only missing clips are generated, so adding a word costs one request; `--overwrite`
re-records everything, which is how to move the whole set to another voice.

Check what comes back before trusting it. One clip in this set came back at 21
seconds for three characters — the model had started improvising — and deleting
that file and re-running (without `--overwrite`, so only the gap is filled) gave a
1.5 second reading of the right line. A duration far past what the text can justify
is the cheap way to spot it.

The grid on `stories/` is rendered from that JSON, so no HTML needs editing.

Not affiliated with Duolingo — the lessons section is a study of how its
lesson loop is put together.
