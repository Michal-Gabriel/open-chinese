const toggles = document.querySelectorAll("[data-toggle]");
const root = document.body;
const words = document.querySelectorAll(".word");
const meaningHanzi = document.querySelector("#meaning-hanzi");
const meaningPinyin = document.querySelector("#meaning-pinyin");
const meaningEnglish = document.querySelector("#meaning-english");
const meaningLevel = document.querySelector("#meaning-level");

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

async function init() {
  await loadLexicon();
  bindInteractions();
}

init();
