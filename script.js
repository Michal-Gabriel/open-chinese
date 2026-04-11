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
const storyId = document.body.dataset.storyId || "story1";
const AUDIO_CACHE_BUSTER = "2026-04-11";

const storyFallbackCsv = {
 story1: `key,hanzi,pinyin,english,level
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
下午,下午,xià wǔ,afternoon,HSK1
我和朋友,我和朋友,wǒ hé péng you,my friend and I,HSK1
去,去,qù,to go,HSK1
学校,学校,xué xiào,school,HSK1
看见,看见,kàn jiàn,to see,HSK1
谢谢,谢谢,xiè xie,thanks,HSK1
高兴,高兴,gāo xìng,happy,HSK1
说,说,shuō,to say / speak,HSK1
你好,你好,nǐ hǎo,hello,HSK1
我说,我说,wǒ shuō,I say,HSK1
老师好,老师好,lǎo shī hǎo,hello teacher,HSK1
中午,中午,zhōng wǔ,noon,HSK1
我们,我们,wǒ men,we / us,HSK1
也,也,yě,also,HSK1
喝水,喝水,hē shuǐ,drink water,HSK1
吃米饭,吃米饭,chī mǐ fàn,eat rice / eat a meal,HSK1
看书,看书,kàn shū,read books,HSK1
回家,回家,huí jiā,go home,HSK1
爸爸妈妈,爸爸妈妈,bà ba mā ma,dad and mom,HSK1
都,都,dōu,both / all,HSK1
在家,在家,zài jiā,at home,HSK1
很,很,hěn,very,HSK1
很高兴,很高兴,hěn gāo xìng,very happy,HSK1`,
 story2: `key,hanzi,pinyin,english,level
今天,今天,jīn tiān,today,HSK1
星期一,星期一,xīng qī yī,Monday,HSK1
上午,上午,shàng wǔ,morning,HSK1
我,我,wǒ,I / me,HSK1
去,去,qù,to go,HSK1
学校,学校,xué xiào,school,HSK1
里,里,lǐ,inside,HSK1
有,有,yǒu,to have,HSK1
是,是,shì,to be,HSK1
学生,学生,xué sheng,student,HSK1
老师,老师,lǎo shī,teacher,HSK1
在,在,zài,to be at / in,HSK1
和,和,hé,and / with,HSK1
同学,同学,tóng xué,classmate,HSK1
看,看,kàn,to look / read,HSK1
书,书,shū,book,HSK1
朋友,朋友,péng you,friend,HSK1
看见,看见,kàn jiàn,to see,HSK1
对,对,duì,to / toward,HSK1
说,说,shuō,to say / speak,HSK1
你好,你好,nǐ hǎo,hello,HSK1
谢谢,谢谢,xiè xie,thanks,HSK1
不客气,不客气,bú kè qi,you're welcome,HSK1
下午,下午,xià wǔ,afternoon,HSK1
打电话,打电话,dǎ diàn huà,call by phone,HSK1
给,给,gěi,to / give,HSK1
妈妈,妈妈,mā ma,mom,HSK1
高兴,高兴,gāo xìng,happy,HSK1
晚上,晚上,wǎn shang,evening,HSK1
电视,电视,diàn shì,television,HSK1
电影,电影,diàn yǐng,movie,HSK1
明天,明天,míng tiān,tomorrow,HSK1
还,还,hái,still / also,HSK1
爸爸,爸爸,bà ba,dad,HSK1
家,家,jiā,home,HSK1
我们,我们,wǒ men,we / us,HSK1
都,都,dōu,all,HSK1
很,很,hěn,very,HSK1
回家,回家,huí jiā,go home,HSK1
也,也,yě,also,HSK1`,
 story3: `key,hanzi,pinyin,english,level
今天,今天,jīn tiān,today,HSK1
星期一,星期一,xīng qī yī,Monday,HSK1
是,是,shì,to be,HSK1
爸爸,爸爸,bà ba,dad,HSK1
妈妈,妈妈,mā ma,mom,HSK1
去,去,qù,to go,HSK1
在,在,zài,to be at / in,HSK1
商店,商店,shāng diàn,shop,HSK1
买,买,mǎi,to buy,HSK1
苹果,苹果,píng guǒ,apple,HSK1
和,和,hé,and / with,HSK1
水果,水果,shuǐ guǒ,fruit,HSK1
我,我,wǒ,I / me,HSK1
有,有,yǒu,to have,HSK1
杯子,杯子,bēi zi,cup,HSK1
我们,我们,wǒ men,we / us,HSK1
钱,钱,qián,money,HSK1
叫,叫,jiào,to call,HSK1
给,给,gěi,to / give,HSK1
出租车,出租车,chū zū chē,taxi,HSK1
饭馆,饭馆,fàn guǎn,restaurant,HSK1
里,里,lǐ,inside,HSK1
菜,菜,cài,dish / vegetables,HSK1
米饭,米饭,mǐ fàn,rice,HSK1
吃,吃,chī,to eat,HSK1
喝,喝,hē,to drink,HSK1
水,水,shuǐ,water,HSK1
看见,看见,kàn jiàn,to see,HSK1
朋友,朋友,péng you,friend,HSK1
说,说,shuō,to say / speak,HSK1
你好,你好,nǐ hǎo,hello,HSK1
谢谢,谢谢,xiè xie,thanks,HSK1
都,都,dōu,all,HSK1
很,很,hěn,very,HSK1
高兴,高兴,gāo xìng,happy,HSK1
回家,回家,huí jiā,go home,HSK1
家,家,jiā,home,HSK1
喜欢,喜欢,xǐ huan,to like,HSK1
也,也,yě,also,HSK1`,
};

let lexicon = {};
let currentAudio = null;
let storyQueue = [];
let storyIndex = 0;
let playbackTimers = [];

function applyToggle(name, checked) {
  root.classList.toggle(`hide-${name}`, !checked);
}

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/);
  const [, ...dataRows] = rows;

  return dataRows.reduce((acc, row) => {
    const [key, hanzi, pinyin, english, level] = row.split(",");
    if (!key) return acc;

    acc[key] = { hanzi, pinyin, english, level };
    return acc;
  }, {});
}

async function loadLexicon() {
  try {
    const response = await fetch(`./data/${storyId}-vocabulary.csv`);

    if (!response.ok) {
      throw new Error(`Could not load ${storyId} vocabulary.`);
    }

    const csv = await response.text();
    lexicon = parseCsv(csv);
  } catch (error) {
    lexicon = {};
  }
}

function updateMeaning(word) {
  const key = word.dataset.key || word.textContent.trim();
  const entry = lexicon[key] || {
    hanzi: word.dataset.key || word.textContent.trim(),
    pinyin: word.dataset.pinyin || "",
    english: word.dataset.tip || "",
    level: word.dataset.level || "",
  };

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
  if (!speedSelect) return 1;

  const rate = Number.parseFloat(speedSelect.value);
  return Number.isFinite(rate) ? rate : 1;
}

function clearReadingHighlight() {
  words.forEach((word) => word.classList.remove("reading"));
  phraseCards.forEach((card) => card.classList.remove("reading"));
}

function stopStoryPlayback() {
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
  storyIndex = 0;
  clearReadingHighlight();

  if (playStoryButton) playStoryButton.disabled = false;
  if (stopStoryButton) stopStoryButton.disabled = true;

  setAudioStatus("Ready to listen");
}

function buildStoryQueue() {
  return Array.from(phraseCards).map((card, index) => ({
    card,
    audioSrc: `./audio/${storyId}/${String(card.dataset.sentenceId || index + 1).padStart(3, "0")}.mp3?v=${AUDIO_CACHE_BUSTER}`,
    words: Array.from(card.querySelectorAll(".word")),
  }));
}

async function hasPlayableAudio() {
  const queue = buildStoryQueue();
  const firstItem = queue[0];
  if (!firstItem) return false;

  try {
    const response = await fetch(firstItem.audioSrc, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

function buildWordQueue() {
  return Array.from(phraseCards)
    .flatMap((card, sentenceIndex) =>
      Array.from(card.querySelectorAll(".word")).map((word, wordIndex) => ({
        card,
        word,
        sentenceIndex,
        wordIndex,
      })),
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

function highlightWord(word, card) {
  clearReadingHighlight();
  card.classList.add("reading");
  word.classList.add("reading");
  updateMeaning(word);
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

function runSyntheticPlayback() {
  const queue = buildWordQueue();

  if (!queue.length) {
    setAudioStatus("Story text is not available");
    return;
  }

  if (playStoryButton) playStoryButton.disabled = true;
  if (stopStoryButton) stopStoryButton.disabled = false;

  let cursor = 0;

  const step = () => {
    if (cursor >= queue.length) {
      clearReadingHighlight();
      if (playStoryButton) playStoryButton.disabled = false;
      if (stopStoryButton) stopStoryButton.disabled = true;
      setAudioStatus("Finished");
      return;
    }

    const item = queue[cursor];
    highlightWord(item.word, item.card);
    setAudioStatus(`Reading word ${cursor + 1} of ${queue.length}`);

    const rate = getPlaybackRate();
    const text = item.word.dataset.key || item.word.textContent.trim();
    const baseDuration = Math.max(260, text.length * 140);
    const duration = Math.max(160, baseDuration / rate);
    cursor += 1;
    playbackTimers.push(window.setTimeout(step, duration));
  };

  step();
}

function playQueueItem(index) {
  if (index >= storyQueue.length) {
    currentAudio = null;
    clearReadingHighlight();

    if (playStoryButton) playStoryButton.disabled = false;
    if (stopStoryButton) stopStoryButton.disabled = true;

    setAudioStatus("Finished");
    return;
  }

  storyIndex = index;
  const item = storyQueue[index];

  clearReadingHighlight();
  const firstWord = item.words[0];
  if (firstWord) {
    highlightWord(firstWord, item.card);
  }

  const audio = new Audio(item.audioSrc);
  audio.playbackRate = getPlaybackRate();

  audio.onplay = () => {
    currentAudio = audio;
    updatePlaybackWord(item, audio.currentTime, audio.duration);
    if (playStoryButton) playStoryButton.disabled = true;
    if (stopStoryButton) stopStoryButton.disabled = false;
    setAudioStatus(`Playing sentence ${index + 1} of ${storyQueue.length}`);
  };

  audio.ontimeupdate = () => {
    if (currentAudio !== audio) return;
    updatePlaybackWord(item, audio.currentTime, audio.duration);
  };

  audio.onended = () => {
    playQueueItem(index + 1);
  };

  audio.onerror = () => {
    currentAudio = null;
    clearReadingHighlight();
    if (playStoryButton) playStoryButton.disabled = false;
    if (stopStoryButton) stopStoryButton.disabled = true;
    setAudioStatus("Playback failed");
  };

  audio.play().catch(() => {
    currentAudio = null;
    clearReadingHighlight();
    if (playStoryButton) playStoryButton.disabled = false;
    if (stopStoryButton) stopStoryButton.disabled = true;
    setAudioStatus("Playback failed");
  });
}

async function playStory() {
  storyQueue = buildStoryQueue();
  if (!storyQueue.length) {
    setAudioStatus("Story text is not available");
    return;
  }

  stopStoryPlayback();
  storyQueue = buildStoryQueue();

  const storyNumber = Number.parseInt((storyId.match(/\d+/)?.[0] || "1"), 10);
  const useSyntheticPlayback = Number.isFinite(storyNumber) && storyNumber >= 4 ? true : !(await hasPlayableAudio());

  if (useSyntheticPlayback) {
    runSyntheticPlayback();
    return;
  }

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
