# 🐲 DuoChinese

A small, dependency-free re-creation of the Duolingo lesson experience, built as a
free **Mandarin Chinese** course.

**Play it: https://michal-gabriel.github.io/duochinese/**

## What's in it

* **5 units / 24 lessons** — greetings, people, food, numbers, getting around.
  Every unit ends with a review lesson that mixes everything taught before it.
* **Six exercise types**, generated fresh on every run from the lesson's word and
  sentence pool:
  * meaning multiple choice (hanzi → English)
  * character multiple choice (English → hanzi)
  * pinyin multiple choice
  * listen-and-tap
  * tap-the-matching-pairs
  * build the sentence from a word bank, in both directions and by ear
* **Duolingo-style game loop** — a lesson path with locked nodes and crowns, five
  hearts that regenerate one per 20 minutes, XP, a day streak, a progress bar that
  grows when you get something wrong (missed items are re-queued), and an
  end-of-lesson XP / time / accuracy screen.
* **Audio** from the browser's own speech synthesis (`zh-CN`). If the device has no
  Chinese voice, the listening exercises are automatically swapped for reading ones.
* **Keyboard**: `1`–`9` pick an option, `Enter` checks / continues, `Backspace`
  removes the last word tile.

Progress is kept in `localStorage`; there is no backend, no build step and no
dependencies — just three files.

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
