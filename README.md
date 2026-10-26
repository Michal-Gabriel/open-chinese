# 🐲 DuoChinese

A small, dependency-free re-creation of the Duolingo lesson experience, built as a
free **HSK 1 Mandarin Chinese** course.

**Play it: https://michal-gabriel.github.io/duochinese/**

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
* **Duolingo-style game layer** — a lesson path with locked nodes and crowns, five
  hearts that regenerate one per 20 minutes, XP, a day streak, a progress bar that
  grows when you get something wrong (missed items are re-queued), and an
  end-of-lesson XP / time / accuracy screen.
* **Audio** from the browser's own speech synthesis (`zh-CN`). If the device has no
  Chinese voice, the listening exercises are automatically swapped for reading ones.
* Homophones are handled: 他/她 and 坐/做 are never offered against each other in a
  listening or pinyin question, where they would be impossible to tell apart.
* **Keyboard**: `1`–`9` pick an option, `Enter` checks / continues, `Backspace`
  removes the last word tile.

Progress is kept in `localStorage`, so it is per-browser; the Reset button in the
header clears it.

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
