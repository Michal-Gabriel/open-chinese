import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function getArg(name, fallback = null) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

function usage() {
  console.log(`Usage:
  OPENAI_API_KEY=... node scripts/generate-story-audio.mjs --story story1
  OPENAI_API_KEY=... node scripts/generate-story-audio.mjs --all

Optional flags:
  --story story1
  --all
  --model gpt-4o-mini-tts
  --voice alloy
  --format mp3

Output:
  audio/<story>/<sentence-id>.<format>
`);
}

async function loadStory(story) {
  const filePath = path.join(rootDir, "data", "stories.json");
  const content = await readFile(filePath, "utf8");
  const stories = JSON.parse(content);
  const normalizedStory = story.startsWith("story") ? story : `story${story}`;
  const match = stories.find(
    (item) => item.slug === normalizedStory || item.id === normalizedStory.replace("story", ""),
  );

  if (!match) {
    throw new Error(`Could not find story data for ${story}.`);
  }

  return match;
}

async function loadAllStories() {
  const filePath = path.join(rootDir, "data", "stories.json");
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function generateAudio({ apiKey, model, voice, format, text }) {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      response_format: format,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI audio generation failed: ${response.status} ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  const story = getArg("story", null);
  const model = getArg("model", "gpt-4o-mini-tts");
  const voice = getArg("voice", "alloy");
  const format = getArg("format", "mp3");
  const overwrite = process.argv.includes("--overwrite");
  const generateAll = process.argv.includes("--all") || story === "all";

  if (process.argv.includes("--help")) {
    usage();
    return;
  }

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const stories = generateAll ? await loadAllStories() : [await loadStory(story || "story1")];

  for (const storyItem of stories) {
    const storySlug = storyItem.slug || `story${storyItem.id}`;
    const outputDir = path.join(rootDir, "audio", storySlug);
    const sentences = storyItem.sentences || [];

    await mkdir(outputDir, { recursive: true });

    for (const sentence of sentences) {
      const filename = `${sentence.id}.${format}`;
      const outputPath = path.join(outputDir, filename);

      if (!overwrite) {
        try {
          await access(outputPath);
          console.log(`Skipping ${storySlug}/${filename}, already exists.`);
          continue;
        } catch {
          // File does not exist yet, continue generation.
        }
      }

      console.log(`Generating ${storySlug}/${filename} ...`);

      const audio = await generateAudio({
        apiKey,
        model,
        voice,
        format,
        text: sentence.text,
      });

      await writeFile(outputPath, audio);
    }

    console.log(`Done. Audio files saved to ${path.relative(rootDir, outputDir)}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
