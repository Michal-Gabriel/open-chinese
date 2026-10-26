/* DuoChinese course data.
   word     : [hanzi, pinyin, english]
   sentence : [hanzi, pinyin, english, [hanzi tokens]]                      */

const COURSE = [
{
  id: 'u1', title: 'Basics 1', subtitle: 'Say hello', color: '#58CC02', icon: '👋',
  lessons: [
    { id: 'u1l1', title: 'Hello',
      words: [
        ['你', 'nǐ', 'you'],
        ['我', 'wǒ', 'I'],
        ['好', 'hǎo', 'good'],
        ['你好', 'nǐ hǎo', 'hello'],
      ],
      sentences: [
        ['你好！', 'nǐ hǎo', 'hello', ['你好']],
        ['我好。', 'wǒ hǎo', 'I am good', ['我', '好']],
        ['你好，我好。', 'nǐ hǎo, wǒ hǎo', 'hello I am good', ['你好', '我', '好']],
      ] },
    { id: 'u1l2', title: 'How are you',
      words: [
        ['是', 'shì', 'to be'],
        ['吗', 'ma', 'question word'],
        ['不', 'bù', 'not'],
        ['很', 'hěn', 'very'],
      ],
      sentences: [
        ['你好吗？', 'nǐ hǎo ma', 'how are you', ['你好', '吗']],
        ['我很好。', 'wǒ hěn hǎo', 'I am very good', ['我', '很', '好']],
        ['我不好。', 'wǒ bù hǎo', 'I am not good', ['我', '不', '好']],
        ['你是我。', 'nǐ shì wǒ', 'you are me', ['你', '是', '我']],
      ] },
    { id: 'u1l3', title: 'Thank you',
      words: [
        ['谢谢', 'xièxie', 'thank you'],
        ['再见', 'zàijiàn', 'goodbye'],
        ['请', 'qǐng', 'please'],
        ['对不起', 'duìbuqǐ', 'sorry'],
      ],
      sentences: [
        ['谢谢你！', 'xièxie nǐ', 'thank you', ['谢谢', '你']],
        ['再见！', 'zàijiàn', 'goodbye', ['再见']],
        ['对不起。', 'duìbuqǐ', 'I am sorry', ['对不起']],
        ['谢谢，再见！', 'xièxie, zàijiàn', 'thank you goodbye', ['谢谢', '再见']],
      ] },
    { id: 'u1l4', title: 'Review', review: true,
      words: [], sentences: [] },
  ],
},
{
  id: 'u2', title: 'People', subtitle: 'Who is who', color: '#1CB0F6', icon: '🧑',
  lessons: [
    { id: 'u2l1', title: 'He and she',
      words: [
        ['他', 'tā', 'he'],
        ['她', 'tā', 'she'],
        ['们', 'men', 'plural marker'],
        ['的', 'de', 'of'],
      ],
      sentences: [
        ['他很好。', 'tā hěn hǎo', 'he is very good', ['他', '很', '好']],
        ['她不好。', 'tā bù hǎo', 'she is not good', ['她', '不', '好']],
        ['我们好吗？', 'wǒmen hǎo ma', 'are we good', ['我们', '好', '吗']],
        ['他们是我的。', 'tāmen shì wǒ de', 'they are mine', ['他们', '是', '我', '的']],
      ] },
    { id: 'u2l2', title: 'Your name',
      words: [
        ['叫', 'jiào', 'to be called'],
        ['什么', 'shénme', 'what'],
        ['名字', 'míngzi', 'name'],
        ['我们', 'wǒmen', 'we'],
      ],
      sentences: [
        ['你叫什么名字？', 'nǐ jiào shénme míngzi', 'what is your name', ['你', '叫', '什么', '名字']],
        ['我叫小明。', 'wǒ jiào Xiǎomíng', 'my name is Xiaoming', ['我', '叫', '小明']],
        ['他叫什么？', 'tā jiào shénme', 'what is he called', ['他', '叫', '什么']],
        ['这是我的名字。', 'zhè shì wǒ de míngzi', 'this is my name', ['这', '是', '我', '的', '名字']],
      ] },
    { id: 'u2l3', title: 'Teacher, student',
      words: [
        ['老师', 'lǎoshī', 'teacher'],
        ['学生', 'xuésheng', 'student'],
        ['朋友', 'péngyou', 'friend'],
        ['这', 'zhè', 'this'],
      ],
      sentences: [
        ['我是学生。', 'wǒ shì xuésheng', 'I am a student', ['我', '是', '学生']],
        ['他是老师。', 'tā shì lǎoshī', 'he is a teacher', ['他', '是', '老师']],
        ['她是我的朋友。', 'tā shì wǒ de péngyou', 'she is my friend', ['她', '是', '我', '的', '朋友']],
        ['你是老师吗？', 'nǐ shì lǎoshī ma', 'are you a teacher', ['你', '是', '老师', '吗']],
      ] },
    { id: 'u2l4', title: 'Where from',
      words: [
        ['中国', 'Zhōngguó', 'China'],
        ['美国', 'Měiguó', 'America'],
        ['人', 'rén', 'person'],
        ['中国人', 'Zhōngguó rén', 'Chinese person'],
      ],
      sentences: [
        ['我是中国人。', 'wǒ shì Zhōngguó rén', 'I am Chinese', ['我', '是', '中国', '人']],
        ['他是美国人。', 'tā shì Měiguó rén', 'he is American', ['他', '是', '美国', '人']],
        ['你是中国人吗？', 'nǐ shì Zhōngguó rén ma', 'are you Chinese', ['你', '是', '中国', '人', '吗']],
        ['我的朋友是美国人。', 'wǒ de péngyou shì Měiguó rén', 'my friend is American', ['我', '的', '朋友', '是', '美国', '人']],
      ] },
    { id: 'u2l5', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u3', title: 'Food', subtitle: 'Eat and drink', color: '#FF9600', icon: '🍜',
  lessons: [
    { id: 'u3l1', title: 'Eat, drink',
      words: [
        ['吃', 'chī', 'to eat'],
        ['喝', 'hē', 'to drink'],
        ['水', 'shuǐ', 'water'],
        ['茶', 'chá', 'tea'],
      ],
      sentences: [
        ['我喝水。', 'wǒ hē shuǐ', 'I drink water', ['我', '喝', '水']],
        ['他喝茶。', 'tā hē chá', 'he drinks tea', ['他', '喝', '茶']],
        ['你吃吗？', 'nǐ chī ma', 'do you eat', ['你', '吃', '吗']],
        ['我不喝茶。', 'wǒ bù hē chá', 'I do not drink tea', ['我', '不', '喝', '茶']],
      ] },
    { id: 'u3l2', title: 'Rice and noodles',
      words: [
        ['米饭', 'mǐfàn', 'rice'],
        ['面条', 'miàntiáo', 'noodles'],
        ['肉', 'ròu', 'meat'],
        ['菜', 'cài', 'vegetables'],
      ],
      sentences: [
        ['我吃米饭。', 'wǒ chī mǐfàn', 'I eat rice', ['我', '吃', '米饭']],
        ['她吃面条。', 'tā chī miàntiáo', 'she eats noodles', ['她', '吃', '面条']],
        ['我不吃肉。', 'wǒ bù chī ròu', 'I do not eat meat', ['我', '不', '吃', '肉']],
        ['老师吃菜。', 'lǎoshī chī cài', 'the teacher eats vegetables', ['老师', '吃', '菜']],
      ] },
    { id: 'u3l3', title: 'I would like',
      words: [
        ['想', 'xiǎng', 'to want'],
        ['要', 'yào', 'to need'],
        ['咖啡', 'kāfēi', 'coffee'],
        ['牛奶', 'niúnǎi', 'milk'],
      ],
      sentences: [
        ['我想喝咖啡。', 'wǒ xiǎng hē kāfēi', 'I want to drink coffee', ['我', '想', '喝', '咖啡']],
        ['我要牛奶。', 'wǒ yào niúnǎi', 'I need milk', ['我', '要', '牛奶']],
        ['你想吃什么？', 'nǐ xiǎng chī shénme', 'what do you want to eat', ['你', '想', '吃', '什么']],
        ['他不想吃菜。', 'tā bù xiǎng chī cài', 'he does not want to eat vegetables', ['他', '不', '想', '吃', '菜']],
      ] },
    { id: 'u3l4', title: 'Delicious',
      words: [
        ['好吃', 'hǎochī', 'tasty'],
        ['饿', 'è', 'hungry'],
        ['渴', 'kě', 'thirsty'],
        ['太', 'tài', 'too'],
      ],
      sentences: [
        ['我很饿。', 'wǒ hěn è', 'I am very hungry', ['我', '很', '饿']],
        ['她很渴。', 'tā hěn kě', 'she is very thirsty', ['她', '很', '渴']],
        ['米饭很好吃。', 'mǐfàn hěn hǎochī', 'the rice is very tasty', ['米饭', '很', '好吃']],
        ['面条太好吃了。', 'miàntiáo tài hǎochī le', 'the noodles are too tasty', ['面条', '太', '好吃', '了']],
      ] },
    { id: 'u3l5', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u4', title: 'Numbers', subtitle: 'Count and tell time', color: '#CE82FF', icon: '🔢',
  lessons: [
    { id: 'u4l1', title: 'One to five',
      words: [
        ['一', 'yī', 'one'],
        ['二', 'èr', 'two'],
        ['三', 'sān', 'three'],
        ['四', 'sì', 'four'],
        ['五', 'wǔ', 'five'],
      ],
      sentences: [
        ['一、二、三。', 'yī èr sān', 'one two three', ['一', '二', '三']],
        ['我要三个。', 'wǒ yào sān ge', 'I need three', ['我', '要', '三', '个']],
        ['四个朋友。', 'sì ge péngyou', 'four friends', ['四', '个', '朋友']],
      ] },
    { id: 'u4l2', title: 'Six to ten',
      words: [
        ['六', 'liù', 'six'],
        ['七', 'qī', 'seven'],
        ['八', 'bā', 'eight'],
        ['九', 'jiǔ', 'nine'],
        ['十', 'shí', 'ten'],
      ],
      sentences: [
        ['八、九、十。', 'bā jiǔ shí', 'eight nine ten', ['八', '九', '十']],
        ['十个学生。', 'shí ge xuésheng', 'ten students', ['十', '个', '学生']],
        ['我要七个。', 'wǒ yào qī ge', 'I need seven', ['我', '要', '七', '个']],
      ] },
    { id: 'u4l3', title: 'How many',
      words: [
        ['几', 'jǐ', 'how many'],
        ['个', 'ge', 'measure word'],
        ['多少', 'duōshao', 'how much'],
        ['岁', 'suì', 'years old'],
      ],
      sentences: [
        ['你几岁？', 'nǐ jǐ suì', 'how old are you', ['你', '几', '岁']],
        ['我十岁。', 'wǒ shí suì', 'I am ten years old', ['我', '十', '岁']],
        ['你要几个？', 'nǐ yào jǐ ge', 'how many do you need', ['你', '要', '几', '个']],
        ['他有多少朋友？', 'tā yǒu duōshao péngyou', 'how many friends does he have', ['他', '有', '多少', '朋友']],
      ] },
    { id: 'u4l4', title: 'Today',
      words: [
        ['今天', 'jīntiān', 'today'],
        ['明天', 'míngtiān', 'tomorrow'],
        ['点', 'diǎn', "o'clock"],
        ['现在', 'xiànzài', 'now'],
      ],
      sentences: [
        ['现在几点？', 'xiànzài jǐ diǎn', 'what time is it now', ['现在', '几', '点']],
        ['现在三点。', 'xiànzài sān diǎn', 'it is three now', ['现在', '三', '点']],
        ['今天很好。', 'jīntiān hěn hǎo', 'today is very good', ['今天', '很', '好']],
        ['明天见！', 'míngtiān jiàn', 'see you tomorrow', ['明天', '见']],
      ] },
    { id: 'u4l5', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u5', title: 'Out and about', subtitle: 'Go and buy', color: '#FF4B4B', icon: '🏪',
  lessons: [
    { id: 'u5l1', title: 'Go home',
      words: [
        ['去', 'qù', 'to go'],
        ['学校', 'xuéxiào', 'school'],
        ['家', 'jiā', 'home'],
        ['在', 'zài', 'to be at'],
      ],
      sentences: [
        ['我去学校。', 'wǒ qù xuéxiào', 'I go to school', ['我', '去', '学校']],
        ['他在家。', 'tā zài jiā', 'he is at home', ['他', '在', '家']],
        ['明天我去你家。', 'míngtiān wǒ qù nǐ jiā', 'tomorrow I go to your home', ['明天', '我', '去', '你', '家']],
        ['老师在学校。', 'lǎoshī zài xuéxiào', 'the teacher is at school', ['老师', '在', '学校']],
      ] },
    { id: 'u5l2', title: 'Where',
      words: [
        ['哪儿', 'nǎr', 'where'],
        ['这儿', 'zhèr', 'here'],
        ['那儿', 'nàr', 'there'],
        ['商店', 'shāngdiàn', 'shop'],
      ],
      sentences: [
        ['你去哪儿？', 'nǐ qù nǎr', 'where are you going', ['你', '去', '哪儿']],
        ['我在这儿。', 'wǒ zài zhèr', 'I am here', ['我', '在', '这儿']],
        ['商店在那儿。', 'shāngdiàn zài nàr', 'the shop is there', ['商店', '在', '那儿']],
        ['他们去商店。', 'tāmen qù shāngdiàn', 'they go to the shop', ['他们', '去', '商店']],
      ] },
    { id: 'u5l3', title: 'How much',
      words: [
        ['买', 'mǎi', 'to buy'],
        ['钱', 'qián', 'money'],
        ['块', 'kuài', 'yuan'],
        ['有', 'yǒu', 'to have'],
      ],
      sentences: [
        ['这个多少钱？', 'zhège duōshao qián', 'how much is this', ['这个', '多少', '钱']],
        ['十块钱。', 'shí kuài qián', 'ten yuan', ['十', '块', '钱']],
        ['我想买茶。', 'wǒ xiǎng mǎi chá', 'I want to buy tea', ['我', '想', '买', '茶']],
        ['我没有钱。', 'wǒ méiyǒu qián', 'I have no money', ['我', '没有', '钱']],
      ] },
    { id: 'u5l4', title: 'Too expensive',
      words: [
        ['贵', 'guì', 'expensive'],
        ['便宜', 'piányi', 'cheap'],
        ['这个', 'zhège', 'this one'],
        ['那个', 'nàge', 'that one'],
      ],
      sentences: [
        ['太贵了！', 'tài guì le', 'too expensive', ['太', '贵', '了']],
        ['这个很便宜。', 'zhège hěn piányi', 'this one is very cheap', ['这个', '很', '便宜']],
        ['我要那个。', 'wǒ yào nàge', 'I need that one', ['我', '要', '那个']],
        ['那个商店很贵。', 'nàge shāngdiàn hěn guì', 'that shop is very expensive', ['那个', '商店', '很', '贵']],
      ] },
    { id: 'u5l5', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
];

/* Extra vocabulary that only shows up inside sentences — needed so the
   word banks and distractors can render pinyin / meanings for every token. */
const EXTRA_WORDS = [
  ['我们', 'wǒmen', 'we'],
  ['你们', 'nǐmen', 'you (plural)'],
  ['他们', 'tāmen', 'they'],
  ['小明', 'Xiǎomíng', 'Xiaoming'],
  ['了', 'le', 'change marker'],
  ['见', 'jiàn', 'to see'],
  ['没有', 'méiyǒu', 'to not have'],
];

/* ---- derived lookups ---------------------------------------------------- */

const ALL_LESSONS = COURSE.flatMap(u => u.lessons.map(l => ({ ...l, unit: u })));

const WORD_INDEX = (() => {
  const m = new Map();
  for (const w of EXTRA_WORDS) m.set(w[0], w);
  for (const u of COURSE) for (const l of u.lessons) for (const w of l.words) m.set(w[0], w);
  return m;
})();

/* Review lessons borrow everything taught earlier in their unit. */
for (const u of COURSE) {
  for (const l of u.lessons) {
    if (!l.review) continue;
    const prior = u.lessons.filter(x => !x.review);
    l.words = prior.flatMap(x => x.words);
    l.sentences = prior.flatMap(x => x.sentences);
  }
}

function lessonById(id) { return ALL_LESSONS.find(l => l.id === id); }
function pinyinOf(hz) { const w = WORD_INDEX.get(hz); return w ? w[1] : hz; }
function meaningOf(hz) { const w = WORD_INDEX.get(hz); return w ? w[2] : hz; }
