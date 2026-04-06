const toggles = document.querySelectorAll("[data-toggle]");
const root = document.body;
const words = document.querySelectorAll(".word");
const meaningHanzi = document.querySelector("#meaning-hanzi");
const meaningPinyin = document.querySelector("#meaning-pinyin");
const meaningEnglish = document.querySelector("#meaning-english");
const meaningLevel = document.querySelector("#meaning-level");

const lexicon = {
  "我是": {
    pinyin: "wǒ shì",
    english: "I am",
    level: "HSK1",
  },
  "猫": {
    pinyin: "māo",
    english: "cat",
    level: "HSK1",
  },
  "我": {
    pinyin: "wǒ",
    english: "I / me",
    level: "HSK1",
  },
  "一岁了": {
    pinyin: "yí suì le",
    english: "one year old",
    level: "HSK2",
  },
  "我喜欢": {
    pinyin: "wǒ xǐ huan",
    english: "I like",
    level: "HSK1",
  },
  "吃": {
    pinyin: "chī",
    english: "to eat",
    level: "HSK1",
  },
  "东西": {
    pinyin: "dōng xi",
    english: '(a common "all-purpose" noun that can denote any object or objects in Chinese) / thing / stuff',
    level: "HSK1",
  },
  "也": {
    pinyin: "yě",
    english: "also / too",
    level: "HSK1",
  },
  "喜欢": {
    pinyin: "xǐ huan",
    english: "to like",
    level: "HSK1",
  },
  "睡觉": {
    pinyin: "shuì jiào",
    english: "to sleep",
    level: "HSK1",
  },
  "星期一": {
    pinyin: "xīng qī yī",
    english: "Monday",
    level: "HSK1",
  },
  "星期二": {
    pinyin: "xīng qī èr",
    english: "Tuesday",
    level: "HSK1",
  },
  "星期三": {
    pinyin: "xīng qī sān",
    english: "Wednesday",
    level: "HSK1",
  },
  "星期四": {
    pinyin: "xīng qī sì",
    english: "Thursday",
    level: "HSK1",
  },
  "我在": {
    pinyin: "wǒ zài",
    english: "I am at / I am in",
    level: "HSK1",
  },
  "商店": {
    pinyin: "shāng diàn",
    english: "shop / store",
    level: "HSK2",
  },
  "吃饭": {
    pinyin: "chī fàn",
    english: "to eat / have a meal",
    level: "HSK1",
  },
  "学校": {
    pinyin: "xué xiào",
    english: "school",
    level: "HSK1",
  },
  "没有": {
    pinyin: "méi yǒu",
    english: "do not have / there is not",
    level: "HSK1",
  },
  "饭": {
    pinyin: "fàn",
    english: "meal / food / rice",
    level: "HSK1",
  },
  "饭店": {
    pinyin: "fàn diàn",
    english: "restaurant / hotel",
    level: "HSK2",
  },
  "医院": {
    pinyin: "yī yuàn",
    english: "hospital",
    level: "HSK2",
  },
  "有时候": {
    pinyin: "yǒu shí hou",
    english: "sometimes",
    level: "HSK2",
  },
  "饭店和医院": {
    pinyin: "fàn diàn hé yī yuàn",
    english: "restaurant and hospital",
    level: "HSK3",
  },
  "都没有": {
    pinyin: "dōu méi yǒu",
    english: "none of them have / all do not have",
    level: "HSK2",
  },
  "我不能": {
    pinyin: "wǒ bù néng",
    english: "I cannot",
    level: "HSK2",
  },
};

function applyToggle(name, checked) {
  root.classList.toggle(`hide-${name}`, !checked);
}

function updateMeaning(word) {
  const entry = lexicon[word.textContent.trim()];
  if (!entry) return;

  words.forEach((item) => item.classList.remove("selected"));
  word.classList.add("selected");

  meaningHanzi.textContent = word.textContent.trim();
  meaningPinyin.textContent = entry.pinyin;
  meaningEnglish.textContent = entry.english;
  meaningLevel.textContent = entry.level;
}

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
