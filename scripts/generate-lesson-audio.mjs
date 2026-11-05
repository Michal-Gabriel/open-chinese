/* Recorded audio for the lessons.
 *
 * The lessons used to speak through the browser's speechSynthesis, which has
 * no Mandarin voice on most of Windows, Android and Linux — and when there is
 * none, app.js quietly swaps every listening exercise for a reading one, so
 * those learners take a Mandarin course without hearing a word. These files
 * remove that fork: the audio is the same everywhere.
 *
 * Every word and every sentence in lessons/course.js gets one mp3, named by a
 * hash of the text so that re-running this only costs new or edited lines, and
 * lessons/audio/index.json maps the text to its file.
 *
 *   OPENAI_API_KEY=... node scripts/generate-lesson-audio.mjs
 *   OPENAI_API_KEY=... node scripts/generate-lesson-audio.mjs --overwrite
 *
 * With --local it speaks through macOS instead, which needs no key and no
 * network (say + ffmpeg, voice Tingting). That voice is not the one the
 * stories were recorded with, so the two halves of the site do not sound
 * alike; --overwrite with a key swaps the whole set over.
 *
 * Flags: --voice (default alloy, or Tingting with --local), --model,
 * --format, --rate (--local only, words per minute).
 */

import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const lessonsDir = path.join(rootDir, "lessons");
const audioDir = path.join(lessonsDir, "audio");

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : (process.argv[i + 1] ?? fallback);
}

/* course.js is a plain script, not a module — it defines COURSE and derives
   ALL_LESSONS from it. Evaluate it and take both. */
async function loadCourse() {
  const source = await readFile(path.join(lessonsDir, "course.js"), "utf8");
  return new Function(`${source}\nreturn { COURSE, ALL_LESSONS };`)();
}

function idFor(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 12);
}

/* Every string app.js can ask speak() for: the words, and the sentences it
   plays whole. Review lessons borrow from their unit, so iterating lessons
   would see the same text twice — a Set settles it. */
function collectTexts({ COURSE }) {
  const texts = new Set();
  for (const unit of COURSE) {
    for (const lesson of unit.lessons) {
      for (const word of lesson.words) texts.add(word[0]);
      for (const sentence of lesson.sentences) texts.add(sentence[0]);
    }
  }
  return [...texts];
}

async function speakLocally({ voice, format, text, rate, outputPath }) {
  const aiff = path.join(tmpdir(), `lesson-${idFor(text)}.aiff`);
  try {
    await run("say", ["-v", voice, "-r", String(rate), "-o", aiff, "--", text]);
    await run("ffmpeg", [
      "-loglevel", "error", "-y",
      "-i", aiff,
      "-codec:a", "libmp3lame", "-b:a", "128k", "-ac", "1", "-ar", "24000",
      outputPath,
    ]);
  } finally {
    await rm(aiff, { force: true });
  }
}

async function speak({ apiKey, model, voice, format, text }) {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      response_format: format,
      instructions: "Read the Mandarin Chinese clearly and a little slowly, as a teacher would for a beginner.",
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI audio generation failed: ${response.status} ${await response.text()}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const local = process.argv.includes("--local");
  const apiKey = process.env.OPENAI_API_KEY;
  const model = getArg("model", "gpt-4o-mini-tts");
  const voice = getArg("voice", local ? "Tingting" : "alloy");
  const format = getArg("format", "mp3");
  const rate = Number(getArg("rate", "150"));
  const overwrite = process.argv.includes("--overwrite");

  if (!local && !apiKey) {
    throw new Error("Missing OPENAI_API_KEY — or pass --local to speak through macOS.");
  }

  const course = await loadCourse();
  const texts = collectTexts(course);
  await mkdir(audioDir, { recursive: true });

  const manifest = {};
  let made = 0;
  let kept = 0;

  for (const text of texts) {
    const file = `${idFor(text)}.${format}`;
    manifest[text] = file;
    const outputPath = path.join(audioDir, file);

    if (!overwrite) {
      try {
        await access(outputPath);
        kept += 1;
        continue;
      } catch {
        /* not there yet */
      }
    }

    process.stdout.write(`${text}  -> ${file}\n`);
    if (local) {
      await speakLocally({ voice, format, text, rate, outputPath });
    } else {
      await writeFile(outputPath, await speak({ apiKey, model, voice, format, text }));
    }
    made += 1;
  }

  await writeFile(
    path.join(audioDir, "index.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(`\n${texts.length} clips (${local ? `macOS ${voice}` : `${model} ${voice}`}): ${made} generated, ${kept} already there.`);
  console.log(`Manifest: ${path.relative(rootDir, path.join(audioDir, "index.json"))}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
