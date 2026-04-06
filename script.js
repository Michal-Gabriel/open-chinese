const toggles = document.querySelectorAll("[data-toggle]");
const root = document.body;
const words = document.querySelectorAll(".word");
const meaningHanzi = document.querySelector("#meaning-hanzi");
const meaningPinyin = document.querySelector("#meaning-pinyin");
const meaningEnglish = document.querySelector("#meaning-english");
const meaningLevel = document.querySelector("#meaning-level");

const lexicon = {
  "我家": {
    pinyin: "wǒ jiā",
    english: "my family / my home",
    level: "HSK1 words",
  },
  "有": {
    pinyin: "yǒu",
    english: "to have",
    level: "HSK1",
  },
  "四口人": {
    pinyin: "sì kǒu rén",
    english: "four people in a family",
    level: "HSK1 words",
  },
  "我叫李明": {
    pinyin: "wǒ jiào lǐ míng",
    english: "my name is Li Ming",
    level: "HSK1 words + name",
  },
  "我是": {
    pinyin: "wǒ shì",
    english: "I am",
    level: "HSK1 words",
  },
  "我": {
    pinyin: "wǒ",
    english: "I / me",
    level: "HSK1",
  },
  "学生": {
    pinyin: "xué sheng",
    english: "student",
    level: "HSK1",
  },
  "今年": {
    pinyin: "jīn nián",
    english: "this year",
    level: "HSK1",
  },
  "十岁": {
    pinyin: "shí suì",
    english: "ten years old",
    level: "HSK1 words",
  },
  "在": {
    pinyin: "zài",
    english: "to be at / in",
    level: "HSK1",
  },
  "北京": {
    pinyin: "běi jīng",
    english: "Beijing",
    level: "HSK1",
  },
  "爸爸": {
    pinyin: "bà ba",
    english: "dad",
    level: "HSK1",
  },
  "是": {
    pinyin: "shì",
    english: "to be",
    level: "HSK1",
  },
  "老师": {
    pinyin: "lǎo shī",
    english: "teacher",
    level: "HSK1",
  },
  "妈妈": {
    pinyin: "mā ma",
    english: "mom",
    level: "HSK1",
  },
  "朋友": {
    pinyin: "péng you",
    english: "friend",
    level: "HSK1",
  },
  "她": {
    pinyin: "tā",
    english: "she",
    level: "HSK1",
  },
  "喜欢": {
    pinyin: "xǐ huan",
    english: "to like",
    level: "HSK1",
  },
  "汉语": {
    pinyin: "hàn yǔ",
    english: "Chinese language",
    level: "HSK1",
  },
  "今天": {
    pinyin: "jīn tiān",
    english: "today",
    level: "HSK1",
  },
  "星期一": {
    pinyin: "xīng qī yī",
    english: "Monday",
    level: "HSK1",
  },
  "上午": {
    pinyin: "shàng wǔ",
    english: "morning",
    level: "HSK1",
  },
  "我和朋友": {
    pinyin: "wǒ hé péng you",
    english: "my friend and I",
    level: "HSK1 words",
  },
  "去": {
    pinyin: "qù",
    english: "to go",
    level: "HSK1",
  },
  "学校": {
    pinyin: "xué xiào",
    english: "school",
    level: "HSK1",
  },
  "说": {
    pinyin: "shuō",
    english: "to say / speak",
    level: "HSK1",
  },
  "你好": {
    pinyin: "nǐ hǎo",
    english: "hello",
    level: "HSK1",
  },
  "我说": {
    pinyin: "wǒ shuō",
    english: "I say",
    level: "HSK1 words",
  },
  "老师好": {
    pinyin: "lǎo shī hǎo",
    english: "hello teacher",
    level: "HSK1 words",
  },
  "中午": {
    pinyin: "zhōng wǔ",
    english: "noon",
    level: "HSK1",
  },
  "我们": {
    pinyin: "wǒ men",
    english: "we / us",
    level: "HSK1",
  },
  "喝水": {
    pinyin: "hē shuǐ",
    english: "drink water",
    level: "HSK1 words",
  },
  "吃米饭": {
    pinyin: "chī mǐ fàn",
    english: "eat rice / eat a meal",
    level: "HSK1 words",
  },
  "看书": {
    pinyin: "kàn shū",
    english: "read books",
    level: "HSK1 words",
  },
  "回家": {
    pinyin: "huí jiā",
    english: "go home",
    level: "HSK1 words",
  },
  "爸爸妈妈": {
    pinyin: "bà ba mā ma",
    english: "dad and mom",
    level: "HSK1 words",
  },
  "都": {
    pinyin: "dōu",
    english: "both / all",
    level: "HSK1",
  },
  "在家": {
    pinyin: "zài jiā",
    english: "at home",
    level: "HSK1 words",
  },
  "很高兴": {
    pinyin: "hěn gāo xìng",
    english: "very happy",
    level: "HSK1 words",
  },
};

function applyToggle(name, checked) {
  root.classList.toggle(`hide-${name}`, !checked);
}

function updateMeaning(word) {
  const key = word.dataset.key || word.textContent.trim();
  const entry = lexicon[key];
  if (!entry) return;

  words.forEach((item) => item.classList.remove("selected"));
  word.classList.add("selected");

  meaningHanzi.textContent = key;
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
