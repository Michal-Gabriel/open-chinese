const toggles = document.querySelectorAll("[data-toggle]");
const root = document.body;
const words = document.querySelectorAll(".word");
const meaningHanzi = document.querySelector("#meaning-hanzi");
const meaningPinyin = document.querySelector("#meaning-pinyin");
const meaningEnglish = document.querySelector("#meaning-english");
const meaningLevel = document.querySelector("#meaning-level");
const playStoryButton = document.querySelector("#play-story");
const stopStoryButton = document.querySelector("#stop-story");
const speedSelect = document.querySelector("#story-speed");
const audioStatus = document.querySelector("#audio-status");
const phraseCards = document.querySelectorAll(".reader-content .phrase-card");

const fallbackCsv = `key,hanzi,pinyin,english,level
我家,我家,wǒ jiā,my family / my home,HSK1
有,有,yǒu,to have,HSK1
四口人,四口人,sì kǒu rén,four people in a family,HSK1
我叫李明,我叫李明,wǒ jiào lǐ míng,my name is Li Ming,HSK1
我是,我是,wǒ shì,I am,HSK1
我,我,wǒ,I / me,HSK1
学生,学生,xué sheng,student,HSK1
今年,今年,jīn nián,this year,HSK1
十岁,十岁,shí suì,ten years old,HSK1
在,在,zài,to be at / in,HSK1
北京,北京,běi jīng,Beijing,HSK1
爸爸,爸爸,bà ba,dad,HSK1
是,是,shì,to be,HSK1
老师,老师,lǎo shī,teacher,HSK1
妈妈,妈妈,mā ma,mom,HSK1
朋友,朋友,péng you,friend,HSK1
她,她,tā,she,HSK1
喜欢,喜欢,xǐ huan,to like,HSK1
汉语,汉语,hàn yǔ,Chinese language,HSK1
今天,今天,jīn tiān,today,HSK1
星期一,星期一,xīng qī yī,Monday,HSK1
上午,上午,shàng wǔ,morning,HSK1
我和朋友,我和朋友,wǒ hé péng you,my friend and I,HSK1
去,去,qù,to go,HSK1
学校,学校,xué xiào,school,HSK1
说,说,shuō,to say / speak,HSK1
你好,你好,nǐ hǎo,hello,HSK1
我说,我说,wǒ shuō,I say,HSK1
老师好,老师好,lǎo shī hǎo,hello teacher,HSK1
中午,中午,zhōng wǔ,noon,HSK1
我们,我们,wǒ men,we / us,HSK1
喝水,喝水,hē shuǐ,drink water,HSK1
吃米饭,吃米饭,chī mǐ fàn,eat rice / eat a meal,HSK1
看书,看书,kàn shū,read books,HSK1
回家,回家,huí jiā,go home,HSK1
爸爸妈妈,爸爸妈妈,bà ba mā ma,dad and mom,HSK1
都,都,dōu,both / all,HSK1
在家,在家,zài jiā,at home,HSK1
很高兴,很高兴,hěn gāo xìng,very happy,HSK1`;

let lexicon = {};
let currentAudio = null;
let storyQueue = [];
let storyIndex = 0;
let readingTimers = [];

function applyToggle(name, checked) {
  root.classList.toggle(`hide-${name}`, !checked);
}

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/);
  const [, ...dataRows] = rows;

  return dataRows.reduce((acc, row) => {
    const [key, hanzi, pinyin, english, level] = row.split(",");
    if (!key) return acc;

    acc[key] = {
      hanzi,
      pinyin,
      english,
      level,
    };

    return acc;
  }, {});
}

async function loadLexicon() {
  try {
    const response = await fetch("./data/story1-vocabulary.csv");

    if (!response.ok) {
      throw new Error("Could not load story1 vocabulary.");
    }

    const csv = await response.text();
    lexicon = parseCsv(csv);
  } catch (error) {
    lexicon = parseCsv(fallbackCsv);
  }
}

function updateMeaning(word) {
  const key = word.dataset.key || word.textContent.trim();
  const entry = lexicon[key];
  if (!entry) return;

  words.forEach((item) => item.classList.remove("selected"));
  word.classList.add("selected");

  meaningHanzi.textContent = entry.hanzi;
  meaningPinyin.textContent = entry.pinyin;
  meaningEnglish.textContent = entry.english;
  meaningLevel.textContent = entry.level;
}

function bindInteractions() {
  toggles.forEach((toggle) => {
    applyToggle(toggle.dataset.toggle, toggle.checked);

    toggle.addEventListener("change", () => {
      applyToggle(toggle.dataset.toggle, toggle.checked);
    });
  });

  words.forEach((word) => {
    word.addEventListener("mouseenter", () => updateMeaning(word));
    word.addEventListener("focus", () => updateMeaning(word));
  });
}

function setAudioStatus(message) {
  if (audioStatus) {
    audioStatus.textContent = message;
  }
}

function getPlaybackRate() {
  if (!speedSelect) return 0.75;

  const rate = Number.parseFloat(speedSelect.value);
  return Number.isFinite(rate) ? rate : 0.75;
}

function clearReadingHighlight() {
  words.forEach((word) => word.classList.remove("reading"));
  phraseCards.forEach((card) => card.classList.remove("reading"));
}

function clearReadingTimers() {
  readingTimers.forEach((timerId) => window.clearTimeout(timerId));
  readingTimers = [];
}

function stopStoryPlayback() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  storyQueue = [];
  storyIndex = 0;
  clearReadingTimers();
  clearReadingHighlight();

  if (playStoryButton) playStoryButton.disabled = false;
  if (stopStoryButton) stopStoryButton.disabled = true;

  setAudioStatus("Ready to listen");
}

function buildStoryQueue() {
  return Array.from(phraseCards).map((card, index) => ({
    card,
    audioSrc: `./audio/story1/${String(index + 1).padStart(3, "0")}.mp3`,
    words: Array.from(card.querySelectorAll(".word")),
  }));
}

function getWordWeight(word) {
  const pinyin = word.dataset.pinyin?.trim();
  if (pinyin) {
    return Math.max(pinyin.split(/\s+/).length, 1);
  }

  const text = word.dataset.key || word.textContent.trim();
  return Math.max(text.length, 1);
}

function highlightWord(word, card) {
  clearReadingHighlight();
  card.classList.add("reading");
  word.classList.add("reading");
  updateMeaning(word);
}

function scheduleWordHighlights(item, durationSeconds) {
  clearReadingTimers();

  if (!item.words.length) return;

  const effectiveDurationMs = Math.max((durationSeconds * 1000) / getPlaybackRate(), 300);
  const totalWeight = item.words.reduce((sum, word) => sum + getWordWeight(word), 0);

  let elapsedWeight = 0;
  item.words.forEach((word) => {
    const startMs = totalWeight === 0 ? 0 : (elapsedWeight / totalWeight) * effectiveDurationMs;
    const timerId = window.setTimeout(() => {
      if (currentAudio) {
        highlightWord(word, item.card);
      }
    }, Math.max(0, startMs));

    readingTimers.push(timerId);
    elapsedWeight += getWordWeight(word);
  });
}

function playQueueItem(index) {
  if (index >= storyQueue.length) {
    currentAudio = null;
    clearReadingTimers();
    clearReadingHighlight();

    if (playStoryButton) playStoryButton.disabled = false;
    if (stopStoryButton) stopStoryButton.disabled = true;

    setAudioStatus("Finished");
    return;
  }

  storyIndex = index;
  const item = storyQueue[index];

  clearReadingTimers();
  clearReadingHighlight();
  const firstWord = item.words[0];
  if (firstWord) {
    highlightWord(firstWord, item.card);
  }

  const audio = new Audio(item.audioSrc);
  audio.playbackRate = getPlaybackRate();

  audio.onplay = () => {
    currentAudio = audio;
    scheduleWordHighlights(item, Number.isFinite(audio.duration) ? audio.duration : 1);
    if (playStoryButton) playStoryButton.disabled = true;
    if (stopStoryButton) stopStoryButton.disabled = false;
    setAudioStatus(`Playing sentence ${index + 1} of ${storyQueue.length}`);
  };

  audio.onended = () => {
    clearReadingTimers();
    playQueueItem(index + 1);
  };

  audio.onerror = () => {
    currentAudio = null;
    clearReadingTimers();
    clearReadingHighlight();
    if (playStoryButton) playStoryButton.disabled = false;
    if (stopStoryButton) stopStoryButton.disabled = true;
    setAudioStatus("Playback failed");
  };

  audio.play().catch(() => {
    currentAudio = null;
    clearReadingTimers();
    clearReadingHighlight();
    if (playStoryButton) playStoryButton.disabled = false;
    if (stopStoryButton) stopStoryButton.disabled = true;
    setAudioStatus("Playback failed");
  });
}

function playStory() {
  storyQueue = buildStoryQueue();
  if (!storyQueue.length) {
    setAudioStatus("Story text is not available");
    return;
  }

  stopStoryPlayback();
  storyQueue = buildStoryQueue();
  playQueueItem(0);
}

function bindAudioControls() {
  if (!playStoryButton || !stopStoryButton) return;

  stopStoryButton.disabled = true;

  playStoryButton.addEventListener("click", playStory);
  stopStoryButton.addEventListener("click", stopStoryPlayback);
}

async function init() {
  await loadLexicon();
  bindInteractions();
  bindAudioControls();
}

init();
