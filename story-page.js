const STORY_PUNCTUATION = new Set(["。", "，", "！", "？", "：", "；", "“", "”", "（", "）", "《", "》", "、"]);
const AUDIO_CACHE_BUSTER = "2026-04-11";
const COMMON_VOCAB = [
  { key: "我", pinyin: "wǒ", english: "I / me", level: "HSK1" },
  { key: "你", pinyin: "nǐ", english: "you", level: "HSK1" },
  { key: "他", pinyin: "tā", english: "he / him", level: "HSK1" },
  { key: "她", pinyin: "tā", english: "she / her", level: "HSK1" },
  { key: "我们", pinyin: "wǒmen", english: "we / us", level: "HSK1" },
  { key: "你们", pinyin: "nǐmen", english: "you all", level: "HSK1" },
  { key: "他们", pinyin: "tāmen", english: "they / them", level: "HSK1" },
  { key: "妈妈", pinyin: "māma", english: "mom", level: "HSK1" },
  { key: "奶奶", pinyin: "nǎinai", english: "grandma", level: "HSK1" },
  { key: "爸爸", pinyin: "bàba", english: "dad", level: "HSK1" },
  { key: "朋友", pinyin: "péngyou", english: "friend", level: "HSK1" },
  { key: "今天", pinyin: "jīn tiān", english: "today", level: "HSK1" },
  { key: "明天", pinyin: "míng tiān", english: "tomorrow", level: "HSK1" },
  { key: "早上", pinyin: "zǎoshang", english: "morning", level: "HSK1" },
  { key: "下午", pinyin: "xiàwǔ", english: "afternoon", level: "HSK1" },
  { key: "晚上", pinyin: "wǎnshang", english: "evening / night", level: "HSK1" },
  { key: "中午", pinyin: "zhōngwǔ", english: "noon", level: "HSK1" },
  { key: "学校", pinyin: "xuéxiào", english: "school", level: "HSK1" },
  { key: "城市", pinyin: "chéngshì", english: "city", level: "HSK4" },
  { key: "市场", pinyin: "shìchǎng", english: "market", level: "HSK4" },
  { key: "四川", pinyin: "Sìchuān", english: "Sichuan", level: "HSK4" },
  { key: "车上", pinyin: "chē shàng", english: "on the bus / in the vehicle", level: "HSK1" },
  { key: "车", pinyin: "chē", english: "vehicle / car", level: "HSK1" },
  { key: "人", pinyin: "rén", english: "person / people", level: "HSK1" },
  { key: "很多人", pinyin: "hěn duō rén", english: "many people", level: "HSK1" },
  { key: "很多", pinyin: "hěn duō", english: "many", level: "HSK1" },
  { key: "多", pinyin: "duō", english: "many / much", level: "HSK1" },
  { key: "大", pinyin: "dà", english: "big / large", level: "HSK1" },
  { key: "小", pinyin: "xiǎo", english: "small", level: "HSK1" },
  { key: "长", pinyin: "cháng", english: "long", level: "HSK1" },
  { key: "上", pinyin: "shàng", english: "on / up", level: "HSK1" },
  { key: "下", pinyin: "xià", english: "down / below", level: "HSK1" },
  { key: "里", pinyin: "lǐ", english: "inside", level: "HSK1" },
  { key: "在", pinyin: "zài", english: "at / in", level: "HSK1" },
  { key: "有", pinyin: "yǒu", english: "have / there is", level: "HSK1" },
  { key: "是", pinyin: "shì", english: "to be", level: "HSK1" },
  { key: "了", pinyin: "le", english: "particle indicating change", level: "HSK1" },
  { key: "的", pinyin: "de", english: "possessive particle", level: "HSK1" },
  { key: "吗", pinyin: "ma", english: "question particle", level: "HSK1" },
  { key: "吧", pinyin: "ba", english: "softening particle", level: "HSK1" },
  { key: "呢", pinyin: "ne", english: "sentence particle", level: "HSK1" },
  { key: "呀", pinyin: "ya", english: "sentence particle", level: "HSK1" },
  { key: "啊", pinyin: "a", english: "sentence particle", level: "HSK1" },
  { key: "一", pinyin: "yī", english: "one", level: "HSK1" },
  { key: "一个", pinyin: "yí ge", english: "one / a", level: "HSK1" },
  { key: "一些", pinyin: "yìxiē", english: "some", level: "HSK1" },
  { key: "一点", pinyin: "yìdiǎn", english: "a little", level: "HSK1" },
  { key: "一点儿", pinyin: "yìdiǎnr", english: "a little", level: "HSK1" },
  { key: "很", pinyin: "hěn", english: "very", level: "HSK1" },
  { key: "也", pinyin: "yě", english: "also / too", level: "HSK1" },
  { key: "都", pinyin: "dōu", english: "all / both", level: "HSK1" },
  { key: "不", pinyin: "bù", english: "not", level: "HSK1" },
  { key: "还", pinyin: "hái", english: "still / also", level: "HSK2" },
  { key: "再", pinyin: "zài", english: "again", level: "HSK2" },
  { key: "就", pinyin: "jiù", english: "then / just", level: "HSK1" },
  { key: "会", pinyin: "huì", english: "will / can", level: "HSK1" },
  { key: "和", pinyin: "hé", english: "and / with", level: "HSK1" },
  { key: "对", pinyin: "duì", english: "right / correct", level: "HSK1" },
  { key: "因为", pinyin: "yīnwèi", english: "because", level: "HSK2" },
  { key: "现在", pinyin: "xiànzài", english: "now", level: "HSK1" },
  { key: "以后", pinyin: "yǐhòu", english: "after / later", level: "HSK3" },
  { key: "然后", pinyin: "ránhòu", english: "then", level: "HSK4" },
  { key: "时间", pinyin: "shíjiān", english: "time", level: "HSK1" },
  { key: "路", pinyin: "lù", english: "road", level: "HSK1" },
  { key: "路边", pinyin: "lù biān", english: "roadside", level: "HSK1" },
  { key: "路上", pinyin: "lù shang", english: "on the road", level: "HSK1" },
  { key: "门口", pinyin: "ménkǒu", english: "doorway", level: "HSK1" },
  { key: "家", pinyin: "jiā", english: "home / house", level: "HSK1" },
  { key: "家里", pinyin: "jiā li", english: "inside the home", level: "HSK1" },
  { key: "里面", pinyin: "lǐmiàn", english: "inside", level: "HSK1" },
  { key: "外面", pinyin: "wàimiàn", english: "outside", level: "HSK1" },
  { key: "山", pinyin: "shān", english: "mountain", level: "HSK1" },
  { key: "水", pinyin: "shuǐ", english: "water", level: "HSK1" },
  { key: "天气", pinyin: "tiānqì", english: "weather", level: "HSK1" },
  { key: "热", pinyin: "rè", english: "hot", level: "HSK1" },
  { key: "忙", pinyin: "máng", english: "busy", level: "HSK1" },
  { key: "累", pinyin: "lèi", english: "tired", level: "HSK1" },
  { key: "高兴", pinyin: "gāoxìng", english: "happy", level: "HSK1" },
  { key: "开心", pinyin: "kāixīn", english: "happy", level: "HSK1" },
  { key: "好", pinyin: "hǎo", english: "good / okay", level: "HSK1" },
  { key: "难忘", pinyin: "nánwàng", english: "unforgettable", level: "HSK4" },
  { key: "喜欢", pinyin: "xǐhuan", english: "like", level: "HSK1" },
  { key: "学习", pinyin: "xuéxí", english: "study / learn", level: "HSK1" },
  { key: "中文", pinyin: "Zhōngwén", english: "Chinese language", level: "HSK1" },
  { key: "英文", pinyin: "Yīngwén", english: "English language", level: "HSK1" },
  { key: "书", pinyin: "shū", english: "book", level: "HSK1" },
  { key: "看书", pinyin: "kàn shū", english: "read books", level: "HSK1" },
  { key: "写字", pinyin: "xiě zì", english: "write characters", level: "HSK1" },
  { key: "电视", pinyin: "diànshì", english: "TV", level: "HSK1" },
  { key: "电影", pinyin: "diànyǐng", english: "movie", level: "HSK1" },
  { key: "电话", pinyin: "diànhuà", english: "phone", level: "HSK1" },
  { key: "手机", pinyin: "shǒujī", english: "mobile phone", level: "HSK2" },
  { key: "钱", pinyin: "qián", english: "money", level: "HSK1" },
  { key: "水果", pinyin: "shuǐguǒ", english: "fruit", level: "HSK1" },
  { key: "饭", pinyin: "fàn", english: "meal / rice", level: "HSK1" },
  { key: "菜", pinyin: "cài", english: "vegetables / dish", level: "HSK1" },
  { key: "米饭", pinyin: "mǐfàn", english: "rice / meal", level: "HSK1" },
  { key: "汤", pinyin: "tāng", english: "soup", level: "HSK1" },
  { key: "喝", pinyin: "hē", english: "drink", level: "HSK1" },
  { key: "吃", pinyin: "chī", english: "eat", level: "HSK1" },
  { key: "买", pinyin: "mǎi", english: "buy", level: "HSK1" },
  { key: "卖", pinyin: "mài", english: "sell", level: "HSK2" },
  { key: "拿", pinyin: "ná", english: "take / carry", level: "HSK1" },
  { key: "帮", pinyin: "bāng", english: "help", level: "HSK1" },
  { key: "看", pinyin: "kàn", english: "look / see / watch", level: "HSK1" },
  { key: "说", pinyin: "shuō", english: "say / speak", level: "HSK1" },
  { key: "问", pinyin: "wèn", english: "ask", level: "HSK1" },
  { key: "见", pinyin: "jiàn", english: "see / meet", level: "HSK1" },
  { key: "去", pinyin: "qù", english: "go", level: "HSK1" },
  { key: "来", pinyin: "lái", english: "come", level: "HSK1" },
  { key: "到", pinyin: "dào", english: "arrive / reach", level: "HSK1" },
  { key: "走", pinyin: "zǒu", english: "walk / leave", level: "HSK1" },
  { key: "跑", pinyin: "pǎo", english: "run", level: "HSK1" },
  { key: "做", pinyin: "zuò", english: "do / make", level: "HSK1" },
  { key: "想", pinyin: "xiǎng", english: "think / want / miss", level: "HSK1" },
  { key: "看见", pinyin: "kànjiàn", english: "see", level: "HSK1" },
  { key: "说话", pinyin: "shuōhuà", english: "talk", level: "HSK2" },
  { key: "休息", pinyin: "xiūxi", english: "rest", level: "HSK2" },
  { key: "听", pinyin: "tīng", english: "listen / hear", level: "HSK1" },
  { key: "一起", pinyin: "yìqǐ", english: "together", level: "HSK2" },
  { key: "一会儿", pinyin: "yí huìr", english: "a little while", level: "HSK3" },
  { key: "一下", pinyin: "yíxià", english: "a moment", level: "HSK1" },
  { key: "很多东西", pinyin: "hěn duō dōngxi", english: "many things", level: "HSK2" },
  { key: "有的人", pinyin: "yǒu de rén", english: "some people", level: "HSK2" },
  { key: "觉得", pinyin: "juéde", english: "feel / think", level: "HSK2" },
  { key: "旁边", pinyin: "pángbiān", english: "beside", level: "HSK1" },
  { key: "可以", pinyin: "kěyǐ", english: "can / may", level: "HSK1" },
  { key: "这", pinyin: "zhè", english: "this", level: "HSK1" },
  { key: "那", pinyin: "nà", english: "that", level: "HSK1" },
  { key: "先", pinyin: "xiān", english: "first", level: "HSK1" },
  { key: "但", pinyin: "dàn", english: "but", level: "HSK1" },
  { key: "要", pinyin: "yào", english: "want / need / will", level: "HSK1" },
  { key: "对了", pinyin: "duì le", english: "right / by the way", level: "HSK1" },
];

const LEVEL_RANK = {
  HSK1: 1,
  HSK2: 2,
  HSK3: 3,
  HSK4: 4,
  HSK5: 5,
  HSK6: 6,
};

const LEVEL_HINTS = new Map(
  [
    ...COMMON_VOCAB,
    { key: "一天", pinyin: "yì tiān", english: "a day", level: "HSK1" },
    { key: "每天", pinyin: "měi tiān", english: "every day", level: "HSK1" },
    { key: "这些", pinyin: "zhè xiē", english: "these", level: "HSK1" },
    { key: "这个", pinyin: "zhè ge", english: "this", level: "HSK1" },
    { key: "每个", pinyin: "měi ge", english: "each / every", level: "HSK1" },
    { key: "东西", pinyin: "dōngxi", english: "things", level: "HSK1" },
    { key: "时候", pinyin: "shíhou", english: "time / moment", level: "HSK1" },
    { key: "这样", pinyin: "zhèyàng", english: "like this", level: "HSK1" },
    { key: "出去", pinyin: "chūqù", english: "go out", level: "HSK1" },
    { key: "真的", pinyin: "zhēn de", english: "really", level: "HSK1" },
    { key: "走走", pinyin: "zǒu zǒu", english: "take a walk", level: "HSK1" },
    { key: "几天", pinyin: "jǐ tiān", english: "a few days", level: "HSK1" },
    { key: "工作", pinyin: "gōngzuò", english: "work", level: "HSK1" },
    { key: "早饭", pinyin: "zǎofàn", english: "breakfast", level: "HSK1" },
    { key: "问题", pinyin: "wèntí", english: "question / problem", level: "HSK1" },
    { key: "一边", pinyin: "yìbiān", english: "while", level: "HSK1" },
    { key: "聊天", pinyin: "liáotiān", english: "chat", level: "HSK4" },
    { key: "重要", pinyin: "zhòngyào", english: "important", level: "HSK4" },
    { key: "不一样", pinyin: "bù yíyàng", english: "different", level: "HSK1" },
    { key: "干净", pinyin: "gānjìng", english: "clean", level: "HSK4" },
    { key: "舒服", pinyin: "shūfu", english: "comfortable", level: "HSK3" },
    { key: "简单", pinyin: "jiǎndān", english: "simple", level: "HSK4" },
    { key: "生活", pinyin: "shēnghuó", english: "life", level: "HSK4" },
    { key: "看起来", pinyin: "kàn qǐlái", english: "look like / seem", level: "HSK4" },
    { key: "不然", pinyin: "bùrán", english: "otherwise", level: "HSK4" },
    { key: "一直", pinyin: "yìzhí", english: "always / all the time", level: "HSK4" },
    { key: "有一天", pinyin: "yǒu yì tiān", english: "one day", level: "HSK2" },
    { key: "出去", pinyin: "chūqù", english: "go out", level: "HSK3" },
    { key: "走走", pinyin: "zǒu zǒu", english: "take a walk", level: "HSK3" },
    { key: "这样的", pinyin: "zhèyàng de", english: "this kind of", level: "HSK4" },
    { key: "真的很热", pinyin: "zhēn de hěn rè", english: "really hot", level: "HSK2" },
  ].map((entry) => [entry.key, entry.level]),
);

const LEVEL_HINT_KEYS = Array.from(LEVEL_HINTS.keys()).sort((left, right) => right.length - left.length);

const OFFICIAL_HSK_LEVEL_OVERRIDES = new Map([
  ["睡觉", "HSK1"],
  ["说话", "HSK1"],
  ["学习", "HSK1"],
  ["时间", "HSK2"],
  ["路", "HSK2"],
  ["到", "HSK2"],
  ["手机", "HSK2"],
  ["休息", "HSK2"],
  ["忙", "HSK2"],
  ["累", "HSK2"],
  ["觉得", "HSK2"],
  ["可以", "HSK2"],
  ["旁边", "HSK2"],
  ["还", "HSK3"],
  ["再", "HSK3"],
  ["因为", "HSK3"],
  ["以后", "HSK3"],
  ["一起", "HSK3"],
  ["要", "HSK3"],
  ["走", "HSK3"],
  ["城市", "HSK3"],
  ["聊天", "HSK2"],
  ["市场", "HSK4"],
  ["干净", "HSK4"],
  ["简单", "HSK4"],
  ["生活", "HSK4"],
  ["看起来", "HSK4"],
  ["不然", "HSK4"],
  ["一直", "HSK4"],
  ["重要", "HSK4"],
  ["难忘", "HSK4"],
]);

function normalizeLevelLabel(level) {
  const value = String(level || "").replace(/\s+/g, "").toUpperCase();
  if (value === "HSK1" || value === "HSK2" || value === "HSK3" || value === "HSK4" || value === "HSK5" || value === "HSK6") {
    return value;
  }
  const match = value.match(/^HSK(\d)(?:-\d)?$/);
  if (match) {
    return `HSK${match[1]}`;
  }
  return "";
}

function higherLevel(left, right) {
  const leftRank = LEVEL_RANK[normalizeLevelLabel(left)] || 0;
  const rightRank = LEVEL_RANK[normalizeLevelLabel(right)] || 0;
  return leftRank >= rightRank ? normalizeLevelLabel(left) : normalizeLevelLabel(right);
}

function resolveOfficialLevel(key, level) {
  const official = normalizeLevelLabel(OFFICIAL_HSK_LEVEL_OVERRIDES.get(key));
  if (official) return official;

  const direct = normalizeLevelLabel(level);
  if (direct) return direct;

  return inferLevelForKey(key);
}

function inferLevelForKey(key) {
  const official = normalizeLevelLabel(OFFICIAL_HSK_LEVEL_OVERRIDES.get(key));
  if (official) return official;

  const direct = normalizeLevelLabel(LEVEL_HINTS.get(key));
  if (direct) return direct;

  const matchedLevels = [];
  let index = 0;

  while (index < key.length) {
    const matched = matchToken(key, index, LEVEL_HINT_KEYS);
    if (matched) {
      const level = normalizeLevelLabel(LEVEL_HINTS.get(matched));
      if (level) matchedLevels.push(level);
      index += matched.length;
      continue;
    }

    index += 1;
  }

  if (matchedLevels.length) {
    return matchedLevels.reduce((best, level) => higherLevel(best, level), matchedLevels[0]);
  }

  return "HSK3";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getStoryId() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("story") || "1";
  return raw.startsWith("story") ? raw : `story${raw}`;
}

async function loadStories() {
  const response = await fetch("./data/stories.json");
  if (!response.ok) {
    throw new Error("Could not load story data.");
  }
  return response.json();
}

async function loadVocabulary() {
  const response = await fetch("./data/story-vocab.json");
  if (!response.ok) {
    throw new Error("Could not load story vocabulary.");
  }
  return response.json();
}

function buildLexicon(vocab = [], priorKeys = new Set()) {
  const merged = new Map(
    COMMON_VOCAB.map((entry) => [
      entry.key,
      {
        ...entry,
        isNewWord: !priorKeys.has(entry.key),
        level: resolveOfficialLevel(entry.key, entry.level),
        newWordTone: resolveOfficialLevel(entry.key, entry.level) === "HSK1" ? "hsk1" : "hsk2plus",
      },
    ]),
  );
  for (const entry of vocab) {
    const level = resolveOfficialLevel(entry.key, entry.level);
    merged.set(entry.key, {
      ...entry,
      level,
      isNewWord: !priorKeys.has(entry.key),
      newWordTone: level === "HSK1" ? "hsk1" : "hsk2plus",
    });
  }

  const entries = Array.from(merged.values());
  const byKey = new Map(entries.map((entry) => [entry.key, entry]));
  const keys = entries
    .map((entry) => entry.key)
    .sort((left, right) => right.length - left.length);

  return { entries, byKey, keys };
}

function matchToken(text, start, keys) {
  for (const key of keys) {
    if (text.startsWith(key, start)) {
      return key;
    }
  }
  return null;
}

function tokenizeSentence(sentenceText, lexicon) {
  const segments = [];
  let index = 0;

  while (index < sentenceText.length) {
    const char = sentenceText[index];

    if (STORY_PUNCTUATION.has(char)) {
      segments.push({ type: "punctuation", text: char });
      index += 1;
      continue;
    }

    const matched = matchToken(sentenceText, index, lexicon.keys);
    if (matched) {
      segments.push({ type: "word", key: matched });
      index += matched.length;
      continue;
    }

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    segments.push({ type: "text", text: char });
    index += 1;
  }

  return segments;
}

function renderSentence(sentence, story, lexicon, isTitle = false) {
  const segments = tokenizeSentence(sentence.text, lexicon);
  const hanzi = segments
    .map((segment) => {
      if (segment.type === "punctuation") {
        return `<span class="punctuation">${escapeHtml(segment.text)}</span>`;
      }

      if (segment.type === "text") {
        return escapeHtml(segment.text);
      }

      const entry = lexicon.byKey.get(segment.key);
      if (!entry) {
        return escapeHtml(segment.key);
      }

      const classes = ["word", "underline"];
      if (entry.isNewWord) {
        classes.push("new-word");
        classes.push(entry.newWordTone === "hsk1" ? "new-word-hsk1" : "new-word-hsk2plus");
      }
      return `<span class="${classes.join(" ")}" data-pinyin="${escapeHtml(entry.pinyin)}" data-tip="${escapeHtml(entry.english)}" data-level="${escapeHtml(entry.level)}" data-key="${escapeHtml(entry.key)}">${escapeHtml(entry.key)}</span>`;
    })
    .join("");

  return `
    <div class="phrase-card" data-sentence-id="${escapeHtml(sentence.id)}">
      <div class="pinyin-line">${escapeHtml(sentence.pinyin)}</div>
      <div class="hanzi-line${isTitle ? " solo" : ""}">
        ${hanzi}
      </div>
      <div class="english-line">${escapeHtml(sentence.english)}</div>
    </div>
  `;
}

function chunk(array, size) {
  const result = [];
  for (let index = 0; index < array.length; index += size) {
    result.push(array.slice(index, index + size));
  }
  return result;
}

function getAudioSentenceNumber(storyId, sentenceIndex, sentenceId) {
  const numericId = Number.parseInt(String(sentenceId), 10);

  if (storyId === "story1" && Number.isFinite(numericId) && numericId >= 3) {
    return numericId + 1;
  }

  if (Number.isFinite(numericId)) {
    return numericId;
  }

  return sentenceIndex + 1;
}

function buildAudioSrc(storyId, sentenceId, sentenceIndex = 0) {
  const audioNumber = getAudioSentenceNumber(storyId, sentenceIndex, sentenceId);
  return `./audio/${storyId}/${String(audioNumber).padStart(3, "0")}.mp3?v=${AUDIO_CACHE_BUSTER}`;
}

function buildGlobalTokenLexicon(stories, vocabularyIndex) {
  const merged = new Map(
    COMMON_VOCAB.map((entry) => [
      entry.key,
      {
        ...entry,
        level: resolveOfficialLevel(entry.key, entry.level),
      },
    ]),
  );

  for (const story of stories) {
    for (const entry of vocabularyIndex[story.slug] || vocabularyIndex[story.id] || []) {
      if (!merged.has(entry.key)) {
        merged.set(entry.key, {
          ...entry,
          level: resolveOfficialLevel(entry.key, entry.level),
        });
      }
    }
  }

  const entries = Array.from(merged.values());
  const byKey = new Map(entries.map((entry) => [entry.key, entry]));
  const keys = entries
    .map((entry) => entry.key)
    .sort((left, right) => right.length - left.length);

  return { entries, byKey, keys };
}

function collectSeenKeys(stories, storyIndex, tokenLexicon) {
  const seen = new Set();

  for (const story of stories.slice(0, Math.max(0, storyIndex))) {
    for (const sentence of story.sentences || []) {
      for (const segment of tokenizeSentence(sentence.text, tokenLexicon)) {
        if (segment.type === "word") {
          seen.add(segment.key);
        }
      }
    }
  }

  return seen;
}

function collectStoryKeys(story, tokenLexicon) {
  const keys = new Set();

  for (const sentence of story.sentences || []) {
    for (const segment of tokenizeSentence(sentence.text, tokenLexicon)) {
      if (segment.type === "word") {
        keys.add(segment.key);
      }
    }
  }

  return keys;
}

function renderStoryPage(story, stories) {
  const storyIndex = stories.findIndex((entry) => entry.slug === story.slug);
  const vocabularyIndex = stories.reduce((acc, entry) => {
    acc[entry.slug] = entry.vocab || [];
    acc[entry.id] = entry.vocab || [];
    return acc;
  }, {});
  const tokenLexicon = buildGlobalTokenLexicon(stories, vocabularyIndex);
  const priorKeys = collectSeenKeys(stories, storyIndex, tokenLexicon);
  const lexicon = buildLexicon(story.vocab || [], priorKeys);
  const storyNumber = story.id;
  const storyCount = stories.length;
  const nextStory = stories[storyIndex + 1] || null;
  const firstSentence = story.sentences[0];
  const remainingSentences = story.sentences.slice(1);
  const rows = chunk(remainingSentences, 3);
  const firstSentenceWord = tokenizeSentence(firstSentence.text, lexicon).find((segment) => segment.type === "word");
  const initialEntry = firstSentenceWord ? lexicon.byKey.get(firstSentenceWord.key) : lexicon.entries[0];
  const storyKeys = collectStoryKeys(story, tokenLexicon);
  const newWordCount = Array.from(storyKeys).filter((key) => !priorKeys.has(key)).length;
  const nextStoryLink = nextStory
    ? `<a class="story-next-button" href="./story.html?story=${escapeHtml(nextStory.slug || `story${nextStory.id}`)}">Read next story</a>`
    : "";

  document.title = `${story.englishTitle} | Open Chinese Reader`;
  document.body.dataset.storyId = story.slug || `story${storyNumber}`;
  document.body.innerHTML = `
    <main class="reader-shell">
      <section class="info-panel">
        <div class="info-header">
          <span>Story name</span>
        </div>
        <p class="info-copy">${escapeHtml(story.englishTitle)}</p>
        <p class="story-meta">New words in this story: ${newWordCount}</p>
      </section>

      <section class="info-panel sticky-word-panel">
        <div class="info-header">
          <span>Word meaning</span>
        </div>
        <div class="word-meaning">
          <div class="meaning-main">
            <span class="meaning-hanzi" id="meaning-hanzi">${escapeHtml(initialEntry?.key || firstSentence.text)}</span>
            <span class="meaning-pinyin" id="meaning-pinyin">${escapeHtml(initialEntry?.pinyin || firstSentence.pinyin)}</span>
            <span class="meaning-english" id="meaning-english">${escapeHtml(initialEntry?.english || firstSentence.english)}</span>
          </div>
          <div class="meaning-side">
            <div class="meaning-level" id="meaning-level">${escapeHtml(initialEntry?.level || story.level)}</div>
            <div class="meaning-actions" aria-label="Story playback controls">
              <button class="meaning-button" id="meaning-play-story" type="button">Play</button>
              <button class="meaning-button meaning-button-secondary" id="meaning-pause-story" type="button">Pause</button>
            </div>
          </div>
        </div>
      </section>

      <section class="reader-panel">
        <div class="reader-toolbar">
          <div class="audio-controls" aria-label="Story audio controls">
            <button class="audio-button" id="play-story" type="button">Play story</button>
            <button class="audio-button audio-button-secondary" id="stop-story" type="button">Stop</button>
            <label class="speed-control" for="story-speed">
              <span>Speed</span>
              <select id="story-speed">
                <option value="0.5">x0.5</option>
                <option value="0.75">x0.75</option>
                <option value="1" selected>x1</option>
                <option value="1.25">x1.25</option>
                <option value="1.5">x1.5</option>
              </select>
            </label>
            <span class="audio-status" id="audio-status">Ready to listen</span>
          </div>
          <div class="display-switches" aria-label="Display controls">
            <label class="switch">
              <input type="checkbox" data-toggle="pinyin" checked />
              <span>Pinyin</span>
            </label>
            <label class="switch">
              <input type="checkbox" data-toggle="word-meaning" checked />
              <span>Word meaning</span>
            </label>
            <label class="switch">
              <input type="checkbox" data-toggle="english" checked />
              <span>English</span>
            </label>
          </div>
        </div>

        <div class="reader-content">
          <section class="title-block" data-story-audio>
            ${renderSentence(firstSentence, story, lexicon, true)}
          </section>

          <section class="lesson-sheet" aria-label="Chinese reader">
            ${rows
              .map(
                (row) => `
                  <article class="reader-row">
                    ${row.map((sentence) => renderSentence(sentence, story, lexicon)).join("")}
                  </article>
                `,
              )
              .join("")}
          </section>

          <div class="story-next-panel">
            ${nextStoryLink}
          </div>
        </div>
      </section>

      <footer class="story-footer">
        <p class="visit-counter visit-counter-story" aria-live="polite"><strong data-visit-count>0</strong></p>
      </footer>
    </main>
  `;

  window.OpenChineseVisits?.render?.();
  bindStoryInteractions(story.slug, story, lexicon);
}

function bindStoryInteractions(storyId, story, lexicon) {
  const root = document.body;
  const words = document.querySelectorAll(".word");
  const meaningHanzi = document.querySelector("#meaning-hanzi");
  const meaningPinyin = document.querySelector("#meaning-pinyin");
  const meaningEnglish = document.querySelector("#meaning-english");
  const meaningLevel = document.querySelector("#meaning-level");
  const meaningPlayButton = document.querySelector("#meaning-play-story");
  const meaningPauseButton = document.querySelector("#meaning-pause-story");
  const playStoryButton = document.querySelector("#play-story");
  const stopStoryButton = document.querySelector("#stop-story");
  const speedSelect = document.querySelector("#story-speed");
  const audioStatus = document.querySelector("#audio-status");
  const phraseCards = document.querySelectorAll(".reader-content .phrase-card");

  let currentAudio = null;
  let playbackTimers = [];
  let storyQueue = [];
  let audioQueueItems = [];
  let playbackIndex = 0;
  let audioQueueIndex = 0;
  let playbackTimerId = null;
  let playbackStepDuration = 0;
  let playbackStepStartedAt = 0;
  let playbackStepRemaining = 0;
  let playbackState = "idle";
  let playbackMode = null;

  function applyToggle(name, checked) {
    root.classList.toggle(`hide-${name}`, !checked);
  }

  function setAudioStatus(message) {
    if (audioStatus) audioStatus.textContent = message;
  }

  function getPlaybackRate() {
    const rate = Number.parseFloat(speedSelect?.value || "1");
    return Number.isFinite(rate) ? rate : 1;
  }

  function clearReadingHighlight() {
    words.forEach((word) => word.classList.remove("reading", "selected", "current-word"));
    phraseCards.forEach((card) => card.classList.remove("reading"));
  }

  function updateMeaning(word) {
    const entry = lexicon.byKey.get(word.dataset.key || word.textContent.trim());
    if (!entry) return;

    words.forEach((item) => item.classList.remove("selected"));
    word.classList.add("selected");

    meaningHanzi.textContent = entry.key;
    meaningPinyin.textContent = entry.pinyin;
    meaningEnglish.textContent = entry.english;
    meaningLevel.textContent = entry.level;
  }

  function syncMeaningControls() {
    const isPlaying = playbackState === "playing";
    const isPaused = playbackState === "paused";

    if (meaningPlayButton) {
      meaningPlayButton.disabled = isPlaying && !isPaused;
      meaningPlayButton.textContent = isPaused ? "Play" : "Play";
    }

    if (meaningPauseButton) {
      meaningPauseButton.disabled = !isPlaying;
    }
  }

  function resetSyntheticPlaybackState() {
    playbackIndex = 0;
    playbackTimerId = null;
    playbackStepDuration = 0;
    playbackStepStartedAt = 0;
    playbackStepRemaining = 0;
    playbackState = "idle";
    playbackMode = null;
    if (playStoryButton) playStoryButton.disabled = false;
    if (stopStoryButton) stopStoryButton.disabled = true;
    syncMeaningControls();
  }

  function highlightWord(word, card) {
    clearReadingHighlight();
    card.classList.add("reading");
    word.classList.add("reading");
    word.classList.add("current-word");
    updateMeaning(word);
    word.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }

  function buildWordQueue() {
    return Array.from(phraseCards).flatMap((card) =>
      Array.from(card.querySelectorAll(".word")).map((word) => ({ card, word })),
    );
  }

  function getWordWeight(word) {
    const pinyin = word.dataset.pinyin?.trim();
    if (pinyin) {
      return Math.max(pinyin.split(/\s+/).length, 1);
    }

    const text = word.dataset.key || word.textContent.trim();
    return Math.max(text.length, 1);
  }

  function updatePlaybackWord(item, currentTime, duration) {
    if (!item.words.length) return;

    if (!Number.isFinite(duration) || duration <= 0) {
      highlightWord(item.words[0], item.card);
      return;
    }

    const totalWeight = item.words.reduce((sum, word) => sum + getWordWeight(word), 0);
    const progressWeight = Math.min(Math.max(currentTime / duration, 0), 0.999999) * totalWeight;

    let elapsedWeight = 0;
    let activeWord = item.words[item.words.length - 1];

    for (const word of item.words) {
      elapsedWeight += getWordWeight(word);
      if (progressWeight < elapsedWeight) {
        activeWord = word;
        break;
      }
    }

    highlightWord(activeWord, item.card);
  }

  function stopStoryPlayback() {
    if (playbackTimerId) {
      clearTimeout(playbackTimerId);
      playbackTimerId = null;
    }

    if (currentAudio) {
      currentAudio.ontimeupdate = null;
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    playbackTimers.forEach((timer) => clearTimeout(timer));
    playbackTimers = [];
    storyQueue = [];
    audioQueueItems = [];
    audioQueueIndex = 0;
    clearReadingHighlight();
    resetSyntheticPlaybackState();
    setAudioStatus("Ready to listen");
  }

  function resetAudioPlaybackState() {
    if (playbackTimerId) {
      clearTimeout(playbackTimerId);
      playbackTimerId = null;
    }

    if (currentAudio) {
      currentAudio.ontimeupdate = null;
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    playbackTimers.forEach((timer) => clearTimeout(timer));
    playbackTimers = [];
    audioQueueItems = [];
    audioQueueIndex = 0;
    clearReadingHighlight();
    playbackIndex = 0;
    playbackStepDuration = 0;
    playbackStepStartedAt = 0;
    playbackStepRemaining = 0;
    playbackState = "idle";
    playbackMode = null;
  }

  function startSyntheticPlaybackFromSentence(sentenceIndex = 0) {
    resetAudioPlaybackState();
    storyQueue = buildWordQueue();
    const targetCard = phraseCards[sentenceIndex];
    const targetIndex = targetCard
      ? storyQueue.findIndex((item) => item.card === targetCard)
      : 0;
    playbackIndex = Math.max(0, targetIndex);
    playbackMode = "synthetic";
    playbackState = "playing";
    if (playStoryButton) playStoryButton.disabled = true;
    if (stopStoryButton) playStoryButton.disabled = false;
    syncMeaningControls();
    setAudioStatus("Reading story");
    runSyntheticPlaybackStep();
  }

  function ensureStoryQueue() {
    if (!storyQueue.length) {
      storyQueue = buildWordQueue();
    }
    return storyQueue;
  }

  function finishSyntheticPlayback() {
    clearReadingHighlight();
    playbackTimerId = null;
    playbackState = "idle";
    playbackMode = null;
    playbackIndex = 0;
    playbackStepDuration = 0;
    playbackStepStartedAt = 0;
    playbackStepRemaining = 0;
    if (playStoryButton) playStoryButton.disabled = false;
    if (stopStoryButton) stopStoryButton.disabled = true;
    syncMeaningControls();
    setAudioStatus("Finished");
  }

  function scheduleNextSyntheticStep(delay) {
    if (playbackTimerId) {
      clearTimeout(playbackTimerId);
    }

    playbackStepStartedAt = Date.now();
    playbackStepDuration = delay;
    playbackStepRemaining = delay;
    playbackTimerId = window.setTimeout(() => {
      playbackTimerId = null;
      playbackIndex += 1;
      runSyntheticPlaybackStep();
    }, Math.max(0, delay));
  }

  function runSyntheticPlaybackStep() {
    const queue = ensureStoryQueue();
    if (!queue.length) {
      setAudioStatus("Story text is not available");
      return;
    }

    if (playbackIndex >= queue.length) {
      finishSyntheticPlayback();
      return;
    }

    const item = queue[playbackIndex];
    highlightWord(item.word, item.card);

    const key = item.word.dataset.key || item.word.textContent.trim();
    const duration = Math.max(850, (key.length || 1) * 320 / getPlaybackRate());

    playbackMode = "synthetic";
    playbackState = "playing";
    if (playStoryButton) playStoryButton.disabled = true;
    if (stopStoryButton) stopStoryButton.disabled = false;
    syncMeaningControls();
    setAudioStatus(`Reading word ${playbackIndex + 1} of ${queue.length}: ${key}`);

    scheduleNextSyntheticStep(duration);
  }

  function startSyntheticPlayback() {
    stopStoryPlayback();
    storyQueue = buildWordQueue();
    playbackIndex = 0;
    playbackMode = "synthetic";
    playbackState = "playing";
    setAudioStatus("Reading story");
    runSyntheticPlaybackStep();
  }

  function resumeSyntheticPlayback() {
    if (playbackState !== "paused") return;
    playbackMode = "synthetic";
    playbackState = "playing";
    if (playStoryButton) playStoryButton.disabled = true;
    if (stopStoryButton) stopStoryButton.disabled = false;
    syncMeaningControls();
    setAudioStatus("Reading story");
    scheduleNextSyntheticStep(Math.max(0, playbackStepRemaining || playbackStepDuration));
  }

  function pauseAudioPlayback() {
    if (currentAudio) {
      currentAudio.pause();
    }
    playbackState = "paused";
    if (playStoryButton) playStoryButton.disabled = false;
    if (stopStoryButton) stopStoryButton.disabled = false;
    syncMeaningControls();
    setAudioStatus("Paused");
  }

  function pauseSyntheticPlayback() {
    if (playbackMode === "audio") {
      pauseAudioPlayback();
      return;
    }

    if (playbackState !== "playing" || !playbackTimerId) return;

    const elapsed = Date.now() - playbackStepStartedAt;
    playbackStepRemaining = Math.max(120, playbackStepDuration - elapsed);
    clearTimeout(playbackTimerId);
    playbackTimerId = null;
    playbackState = "paused";
    if (playStoryButton) playStoryButton.disabled = false;
    if (stopStoryButton) stopStoryButton.disabled = false;
    syncMeaningControls();
    setAudioStatus("Paused");
  }

  async function hasPlayableAudio() {
    const firstSentence = phraseCards[0];
    if (!firstSentence) return false;

    const audioSrcWithCacheBuster = buildAudioSrc(storyId, 1, 0);
    try {
      const response = await fetch(audioSrcWithCacheBuster, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  function playAudioQueue() {
    audioQueueItems = Array.from(phraseCards).map((card, index) => ({
      card,
      audioSrc: buildAudioSrc(storyId, card.dataset.sentenceId || index + 1, index),
      words: Array.from(card.querySelectorAll(".word")),
    }));
    audioQueueIndex = 0;
    playbackMode = "audio";

    const playNext = () => {
      if (audioQueueIndex >= audioQueueItems.length) {
        clearReadingHighlight();
        if (playStoryButton) playStoryButton.disabled = false;
        if (stopStoryButton) stopStoryButton.disabled = true;
        playbackState = "idle";
        playbackMode = null;
        setAudioStatus("Finished");
        return;
      }

      const item = audioQueueItems[audioQueueIndex];

      const audio = currentAudio && playbackState === "paused" ? currentAudio : new Audio(item.audioSrc);
      audio.playbackRate = getPlaybackRate();
      currentAudio = audio;

      audio.onplay = () => {
        playbackMode = "audio";
        playbackState = "playing";
        if (playStoryButton) playStoryButton.disabled = true;
        if (stopStoryButton) stopStoryButton.disabled = false;
        syncMeaningControls();
        setAudioStatus(`Playing sentence ${audioQueueIndex + 1} of ${audioQueueItems.length}`);
        updatePlaybackWord(item, audio.currentTime, audio.duration);
      };

      audio.ontimeupdate = () => {
        if (currentAudio !== audio) return;
        updatePlaybackWord(item, audio.currentTime, audio.duration);
      };

      audio.onended = () => {
        currentAudio = null;
        audioQueueIndex += 1;
        playNext();
      };

      audio.onerror = () => {
        currentAudio = null;
        startSyntheticPlaybackFromSentence(audioQueueIndex);
      };

      audio.play().catch(() => {
        currentAudio = null;
        startSyntheticPlaybackFromSentence(audioQueueIndex);
      });
    };

    playNext();
  }

  async function playStory() {
    if (playbackState === "paused") {
      if (playbackMode === "audio" && currentAudio) {
        playbackState = "playing";
        if (playStoryButton) playStoryButton.disabled = true;
        if (stopStoryButton) stopStoryButton.disabled = false;
        syncMeaningControls();
        setAudioStatus("Reading story");
        await currentAudio.play();
        return;
      }

      resumeSyntheticPlayback();
      return;
    }

    stopStoryPlayback();

    if (await hasPlayableAudio()) {
      playAudioQueue();
      return;
    }

    startSyntheticPlayback();
  }

  document.querySelectorAll("[data-toggle]").forEach((toggle) => {
    applyToggle(toggle.dataset.toggle, toggle.checked);
    toggle.addEventListener("change", () => applyToggle(toggle.dataset.toggle, toggle.checked));
  });

  words.forEach((word) => {
    word.addEventListener("mouseenter", () => updateMeaning(word));
    word.addEventListener("focus", () => updateMeaning(word));
  });

  if (playStoryButton && stopStoryButton) {
    stopStoryButton.disabled = true;
    playStoryButton.addEventListener("click", playStory);
    stopStoryButton.addEventListener("click", stopStoryPlayback);
  }

  if (meaningPlayButton) {
    meaningPlayButton.addEventListener("click", playStory);
  }

  if (meaningPauseButton) {
    meaningPauseButton.addEventListener("click", pauseSyntheticPlayback);
  }

  syncMeaningControls();
}

async function init() {
  try {
    const [stories, vocabularyIndex] = await Promise.all([loadStories(), loadVocabulary()]);
    const storyId = getStoryId();
    const story = stories.find((entry) => entry.slug === storyId || entry.id === storyId.replace("story", ""));

    if (!story) {
      throw new Error(`Unknown story: ${storyId}`);
    }

    stories.forEach((entry) => {
      entry.vocab = vocabularyIndex[entry.slug] || vocabularyIndex[entry.id] || [];
    });

    renderStoryPage(story, stories);
  } catch (error) {
    document.body.innerHTML = `
      <main class="reader-shell">
        <section class="info-panel">
          <div class="info-header">
            <span>Story error</span>
          </div>
          <p class="info-copy">We could not load this story.</p>
          <p class="story-meta">${escapeHtml(error.message)}</p>
        </section>
      </main>
    `;
    window.OpenChineseVisits?.render?.();
  }
}

init();
