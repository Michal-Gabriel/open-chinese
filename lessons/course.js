/* DuoChinese — the complete HSK 1 syllabus (150 words), and nothing outside it.
   word     : [hanzi, pinyin, english]
   sentence : [hanzi, pinyin, english, [hanzi tokens]]
   Every token below is itself an HSK 1 word, and every sentence only uses
   words introduced in its own lesson or an earlier one.                      */

const COURSE = [
{
  id: 'u1', title: 'Greetings', subtitle: 'Say hello', color: '#58CC02', icon: '👋',
  lessons: [
    { id: 'u1l1', title: 'Hello',
      words: [
        ['你', 'nǐ', 'you'],
        ['我', 'wǒ', 'I'],
        ['好', 'hǎo', 'good'],
        ['很', 'hěn', 'very'],
        ['吗', 'ma', 'question word'],
      ],
      sentences: [
        ['你好！', 'nǐ hǎo', 'hello', ['你', '好']],
        ['我很好。', 'wǒ hěn hǎo', 'I am very good', ['我', '很', '好']],
        ['你好吗？', 'nǐ hǎo ma', 'how are you', ['你', '好', '吗']],
      ] },
    { id: 'u1l2', title: 'And you',
      words: [
        ['是', 'shì', 'to be'],
        ['不', 'bù', 'not'],
        ['呢', 'ne', 'and (particle)'],
        ['喂', 'wèi', 'hello (on the phone)'],
        ['怎么样', 'zěnmeyàng', 'how about'],
      ],
      sentences: [
        ['我不好。', 'wǒ bù hǎo', 'I am not good', ['我', '不', '好']],
        ['你呢？', 'nǐ ne', 'and you', ['你', '呢']],
        ['喂，你好吗？', 'wèi, nǐ hǎo ma', 'hello how are you', ['喂', '你', '好', '吗']],
        ['你怎么样？', 'nǐ zěnmeyàng', 'how are you doing', ['你', '怎么样']],
      ] },
    { id: 'u1l3', title: 'Thank you',
      words: [
        ['请', 'qǐng', 'please'],
        ['谢谢', 'xièxie', 'thank you'],
        ['不客气', 'bù kèqi', 'you are welcome'],
        ['对不起', 'duìbuqǐ', 'sorry'],
        ['没关系', 'méi guānxi', 'it does not matter'],
        ['再见', 'zàijiàn', 'goodbye'],
      ],
      sentences: [
        ['谢谢你！', 'xièxie nǐ', 'thank you', ['谢谢', '你']],
        ['不客气。', 'bù kèqi', 'you are welcome', ['不客气']],
        ['对不起！', 'duìbuqǐ', 'I am sorry', ['对不起']],
        ['没关系，再见！', 'méi guānxi, zàijiàn', 'it does not matter goodbye', ['没关系', '再见']],
      ] },
    { id: 'u1l4', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u2', title: 'People', subtitle: 'Who is who', color: '#1CB0F6', icon: '🧑',
  lessons: [
    { id: 'u2l1', title: 'He and she',
      words: [
        ['他', 'tā', 'he'],
        ['她', 'tā', 'she'],
        ['我们', 'wǒmen', 'we'],
        ['的', 'de', 'of'],
        ['人', 'rén', 'person'],
      ],
      sentences: [
        ['他很好。', 'tā hěn hǎo', 'he is very good', ['他', '很', '好']],
        ['她不好。', 'tā bù hǎo', 'she is not good', ['她', '不', '好']],
        ['我们很好。', 'wǒmen hěn hǎo', 'we are very good', ['我们', '很', '好']],
        ['她呢？', 'tā ne', 'and her', ['她', '呢']],
      ] },
    { id: 'u2l2', title: 'Your name',
      words: [
        ['叫', 'jiào', 'to be called'],
        ['名字', 'míngzi', 'name'],
        ['什么', 'shénme', 'what'],
        ['谁', 'shéi', 'who'],
        ['认识', 'rènshi', 'to know'],
      ],
      sentences: [
        ['你叫什么名字？', 'nǐ jiào shénme míngzi', 'what is your name', ['你', '叫', '什么', '名字']],
        ['他是谁？', 'tā shì shéi', 'who is he', ['他', '是', '谁']],
        ['我认识她。', 'wǒ rènshi tā', 'I know her', ['我', '认识', '她']],
        ['你认识他吗？', 'nǐ rènshi tā ma', 'do you know him', ['你', '认识', '他', '吗']],
      ] },
    { id: 'u2l3', title: 'Teacher, student',
      words: [
        ['朋友', 'péngyou', 'friend'],
        ['老师', 'lǎoshī', 'teacher'],
        ['学生', 'xuésheng', 'student'],
        ['同学', 'tóngxué', 'classmate'],
        ['医生', 'yīshēng', 'doctor'],
      ],
      sentences: [
        ['我是学生。', 'wǒ shì xuésheng', 'I am a student', ['我', '是', '学生']],
        ['他是老师。', 'tā shì lǎoshī', 'he is a teacher', ['他', '是', '老师']],
        ['她是我的朋友。', 'tā shì wǒ de péngyou', 'she is my friend', ['她', '是', '我', '的', '朋友']],
        ['我的同学是医生。', 'wǒ de tóngxué shì yīshēng', 'my classmate is a doctor', ['我', '的', '同学', '是', '医生']],
      ] },
    { id: 'u2l4', title: 'Where from',
      words: [
        ['先生', 'xiānsheng', 'sir'],
        ['小姐', 'xiǎojiě', 'miss'],
        ['中国', 'Zhōngguó', 'China'],
        ['汉语', 'Hànyǔ', 'Chinese language'],
        ['北京', 'Běijīng', 'Beijing'],
      ],
      sentences: [
        ['他是中国人。', 'tā shì Zhōngguó rén', 'he is Chinese', ['他', '是', '中国', '人']],
        ['先生，你好！', 'xiānsheng, nǐ hǎo', 'hello sir', ['先生', '你', '好']],
        ['她是北京人。', 'tā shì Běijīng rén', 'she is from Beijing', ['她', '是', '北京', '人']],
        ['他的汉语很好。', 'tā de Hànyǔ hěn hǎo', 'his Chinese is very good', ['他', '的', '汉语', '很', '好']],
        ['小姐，你是老师吗？', 'xiǎojiě, nǐ shì lǎoshī ma', 'miss are you a teacher', ['小姐', '你', '是', '老师', '吗']],
      ] },
    { id: 'u2l5', title: 'Family',
      words: [
        ['爸爸', 'bàba', 'dad'],
        ['妈妈', 'māma', 'mom'],
        ['儿子', 'érzi', 'son'],
        ['女儿', 'nǚér', 'daughter'],
      ],
      sentences: [
        ['他是我爸爸。', 'tā shì wǒ bàba', 'he is my dad', ['他', '是', '我', '爸爸']],
        ['她是我妈妈。', 'tā shì wǒ māma', 'she is my mom', ['她', '是', '我', '妈妈']],
        ['我的儿子是学生。', 'wǒ de érzi shì xuésheng', 'my son is a student', ['我', '的', '儿子', '是', '学生']],
        ['她的女儿是医生。', 'tā de nǚér shì yīshēng', 'her daughter is a doctor', ['她', '的', '女儿', '是', '医生']],
      ] },
    { id: 'u2l6', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u3', title: 'Numbers', subtitle: 'One to ten', color: '#CE82FF', icon: '🔢',
  lessons: [
    { id: 'u3l1', title: 'One to five',
      words: [
        ['一', 'yī', 'one'],
        ['二', 'èr', 'two'],
        ['三', 'sān', 'three'],
        ['四', 'sì', 'four'],
        ['五', 'wǔ', 'five'],
      ],
      sentences: [
        ['一、二、三。', 'yī èr sān', 'one two three', ['一', '二', '三']],
        ['三、四、五。', 'sān sì wǔ', 'three four five', ['三', '四', '五']],
      ] },
    { id: 'u3l2', title: 'Six to ten',
      words: [
        ['六', 'liù', 'six'],
        ['七', 'qī', 'seven'],
        ['八', 'bā', 'eight'],
        ['九', 'jiǔ', 'nine'],
        ['十', 'shí', 'ten'],
      ],
      sentences: [
        ['六、七、八。', 'liù qī bā', 'six seven eight', ['六', '七', '八']],
        ['八、九、十。', 'bā jiǔ shí', 'eight nine ten', ['八', '九', '十']],
      ] },
    { id: 'u3l3', title: 'How many',
      words: [
        ['几', 'jǐ', 'how many'],
        ['多少', 'duōshao', 'how much'],
        ['个', 'gè', 'measure word'],
        ['岁', 'suì', 'years old'],
        ['有', 'yǒu', 'to have'],
      ],
      sentences: [
        ['你几岁？', 'nǐ jǐ suì', 'how old are you', ['你', '几', '岁']],
        ['我十岁。', 'wǒ shí suì', 'I am ten years old', ['我', '十', '岁']],
        ['我有三个朋友。', 'wǒ yǒu sān ge péngyou', 'I have three friends', ['我', '有', '三', '个', '朋友']],
        ['你有多少个同学？', 'nǐ yǒu duōshao ge tóngxué', 'how many classmates do you have', ['你', '有', '多少', '个', '同学']],
      ] },
    { id: 'u3l4', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u4', title: 'Time', subtitle: 'Days and hours', color: '#FF9600', icon: '⏰',
  lessons: [
    { id: 'u4l1', title: 'What time',
      words: [
        ['点', 'diǎn', "o'clock"],
        ['分钟', 'fēnzhōng', 'minute'],
        ['现在', 'xiànzài', 'now'],
        ['时候', 'shíhou', 'time'],
        ['号', 'hào', 'date'],
      ],
      sentences: [
        ['现在几点？', 'xiànzài jǐ diǎn', 'what time is it now', ['现在', '几', '点']],
        ['现在三点。', 'xiànzài sān diǎn', 'it is three now', ['现在', '三', '点']],
        ['五分钟。', 'wǔ fēnzhōng', 'five minutes', ['五', '分钟']],
        ['什么时候？', 'shénme shíhou', 'when', ['什么', '时候']],
      ] },
    { id: 'u4l2', title: 'Today',
      words: [
        ['今天', 'jīntiān', 'today'],
        ['明天', 'míngtiān', 'tomorrow'],
        ['昨天', 'zuótiān', 'yesterday'],
        ['月', 'yuè', 'month'],
        ['年', 'nián', 'year'],
      ],
      sentences: [
        ['今天几号？', 'jīntiān jǐ hào', 'what is the date today', ['今天', '几', '号']],
        ['今天八号。', 'jīntiān bā hào', 'today is the eighth', ['今天', '八', '号']],
        ['昨天我很好。', 'zuótiān wǒ hěn hǎo', 'yesterday I was very good', ['昨天', '我', '很', '好']],
        ['一月一号。', 'yī yuè yī hào', 'the first of January', ['一', '月', '一', '号']],
        ['明天我十岁。', 'míngtiān wǒ shí suì', 'tomorrow I am ten years old', ['明天', '我', '十', '岁']],
      ] },
    { id: 'u4l3', title: 'Days of the week',
      words: [
        ['星期', 'xīngqī', 'week'],
        ['上午', 'shàngwǔ', 'morning'],
        ['中午', 'zhōngwǔ', 'noon'],
        ['下午', 'xiàwǔ', 'afternoon'],
        ['怎么', 'zěnme', 'how'],
      ],
      sentences: [
        ['今天星期几？', 'jīntiān xīngqī jǐ', 'what day is it today', ['今天', '星期', '几']],
        ['今天星期三。', 'jīntiān xīngqī sān', 'today is Wednesday', ['今天', '星期', '三']],
        ['明天上午三点。', 'míngtiān shàngwǔ sān diǎn', 'tomorrow morning at three', ['明天', '上午', '三', '点']],
        ['下午四点。', 'xiàwǔ sì diǎn', 'four in the afternoon', ['下午', '四', '点']],
      ] },
    { id: 'u4l4', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u5', title: 'Going places', subtitle: 'Here and there', color: '#FF4B4B', icon: '🚕',
  lessons: [
    { id: 'u5l1', title: 'Come and go',
      words: [
        ['去', 'qù', 'to go'],
        ['来', 'lái', 'to come'],
        ['回', 'huí', 'to return'],
        ['坐', 'zuò', 'to sit'],
        ['在', 'zài', 'to be at'],
      ],
      sentences: [
        ['我去北京。', 'wǒ qù Běijīng', 'I go to Beijing', ['我', '去', '北京']],
        ['老师来。', 'lǎoshī lái', 'the teacher comes', ['老师', '来']],
        ['我们回中国。', 'wǒmen huí Zhōngguó', 'we return to China', ['我们', '回', '中国']],
        ['请坐！', 'qǐng zuò', 'please sit down', ['请', '坐']],
        ['我在北京。', 'wǒ zài Běijīng', 'I am in Beijing', ['我', '在', '北京']],
      ] },
    { id: 'u5l2', title: 'This and that',
      words: [
        ['这', 'zhè', 'this'],
        ['那', 'nà', 'that'],
        ['哪', 'nǎ', 'which'],
        ['哪儿', 'nǎr', 'where'],
        ['些', 'xiē', 'some'],
      ],
      sentences: [
        ['你去哪儿？', 'nǐ qù nǎr', 'where are you going', ['你', '去', '哪儿']],
        ['他在哪儿？', 'tā zài nǎr', 'where is he', ['他', '在', '哪儿']],
        ['这是我的朋友。', 'zhè shì wǒ de péngyou', 'this is my friend', ['这', '是', '我', '的', '朋友']],
        ['那是谁？', 'nà shì shéi', 'who is that', ['那', '是', '谁']],
        ['哪个人是老师？', 'nǎ ge rén shì lǎoshī', 'which person is the teacher', ['哪', '个', '人', '是', '老师']],
        ['这些人是学生。', 'zhèxiē rén shì xuésheng', 'these people are students', ['这', '些', '人', '是', '学生']],
      ] },
    { id: 'u5l3', title: 'Taxi and plane',
      words: [
        ['开', 'kāi', 'to drive'],
        ['出租车', 'chūzūchē', 'taxi'],
        ['飞机', 'fēijī', 'airplane'],
        ['前面', 'qiánmiàn', 'in front'],
        ['后面', 'hòumiàn', 'behind'],
      ],
      sentences: [
        ['我坐出租车。', 'wǒ zuò chūzūchē', 'I take a taxi', ['我', '坐', '出租车']],
        ['他坐飞机回北京。', 'tā zuò fēijī huí Běijīng', 'he flies back to Beijing', ['他', '坐', '飞机', '回', '北京']],
        ['我在前面。', 'wǒ zài qiánmiàn', 'I am in front', ['我', '在', '前面']],
        ['老师在后面。', 'lǎoshī zài hòumiàn', 'the teacher is behind', ['老师', '在', '后面']],
        ['我开出租车。', 'wǒ kāi chūzūchē', 'I drive a taxi', ['我', '开', '出租车']],
      ] },
    { id: 'u5l4', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u6', title: 'Food', subtitle: 'Eat, drink, buy', color: '#2B9AC9', icon: '🍜',
  lessons: [
    { id: 'u6l1', title: 'Eat and drink',
      words: [
        ['吃', 'chī', 'to eat'],
        ['喝', 'hē', 'to drink'],
        ['水', 'shuǐ', 'water'],
        ['茶', 'chá', 'tea'],
        ['杯子', 'bēizi', 'cup'],
      ],
      sentences: [
        ['我喝水。', 'wǒ hē shuǐ', 'I drink water', ['我', '喝', '水']],
        ['他喝茶。', 'tā hē chá', 'he drinks tea', ['他', '喝', '茶']],
        ['请喝茶。', 'qǐng hē chá', 'please drink tea', ['请', '喝', '茶']],
        ['一个杯子。', 'yī ge bēizi', 'one cup', ['一', '个', '杯子']],
        ['你吃吗？', 'nǐ chī ma', 'do you eat', ['你', '吃', '吗']],
      ] },
    { id: 'u6l2', title: 'Rice and fruit',
      words: [
        ['米饭', 'mǐfàn', 'rice'],
        ['菜', 'cài', 'dish'],
        ['苹果', 'píngguǒ', 'apple'],
        ['水果', 'shuǐguǒ', 'fruit'],
        ['东西', 'dōngxi', 'thing'],
      ],
      sentences: [
        ['我吃米饭。', 'wǒ chī mǐfàn', 'I eat rice', ['我', '吃', '米饭']],
        ['她吃苹果。', 'tā chī píngguǒ', 'she eats apples', ['她', '吃', '苹果']],
        ['我不吃水果。', 'wǒ bù chī shuǐguǒ', 'I do not eat fruit', ['我', '不', '吃', '水果']],
        ['我有一个苹果。', 'wǒ yǒu yī ge píngguǒ', 'I have one apple', ['我', '有', '一', '个', '苹果']],
        ['这个菜很好。', 'zhège cài hěn hǎo', 'this dish is very good', ['这', '个', '菜', '很', '好']],
      ] },
    { id: 'u6l3', title: 'How much',
      words: [
        ['买', 'mǎi', 'to buy'],
        ['钱', 'qián', 'money'],
        ['块', 'kuài', 'yuan'],
        ['商店', 'shāngdiàn', 'shop'],
        ['饭馆', 'fànguǎn', 'restaurant'],
      ],
      sentences: [
        ['我去商店买东西。', 'wǒ qù shāngdiàn mǎi dōngxi', 'I go to the shop to buy things', ['我', '去', '商店', '买', '东西']],
        ['这个多少钱？', 'zhège duōshao qián', 'how much is this', ['这', '个', '多少', '钱']],
        ['十块钱。', 'shí kuài qián', 'ten yuan', ['十', '块', '钱']],
        ['我们去饭馆吃米饭。', 'wǒmen qù fànguǎn chī mǐfàn', 'we go to the restaurant to eat rice', ['我们', '去', '饭馆', '吃', '米饭']],
        ['我在商店买水果。', 'wǒ zài shāngdiàn mǎi shuǐguǒ', 'I buy fruit at the shop', ['我', '在', '商店', '买', '水果']],
      ] },
    { id: 'u6l4', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u7', title: 'At home', subtitle: 'Rooms and things', color: '#A560E8', icon: '🏠',
  lessons: [
    { id: 'u7l1', title: 'Home',
      words: [
        ['家', 'jiā', 'home'],
        ['住', 'zhù', 'to live'],
        ['里', 'lǐ', 'inside'],
        ['上', 'shàng', 'on'],
        ['下', 'xià', 'under'],
      ],
      sentences: [
        ['我在家。', 'wǒ zài jiā', 'I am at home', ['我', '在', '家']],
        ['他住在北京。', 'tā zhù zài Běijīng', 'he lives in Beijing', ['他', '住', '在', '北京']],
        ['我回家。', 'wǒ huí jiā', 'I go home', ['我', '回', '家']],
        ['水在杯子里。', 'shuǐ zài bēizi lǐ', 'the water is in the cup', ['水', '在', '杯子', '里']],
        ['我下午回家。', 'wǒ xiàwǔ huí jiā', 'I go home in the afternoon', ['我', '下午', '回', '家']],
      ] },
    { id: 'u7l2', title: 'Table and chair',
      words: [
        ['桌子', 'zhuōzi', 'table'],
        ['椅子', 'yǐzi', 'chair'],
        ['书', 'shū', 'book'],
        ['字', 'zì', 'character'],
        ['本', 'běn', 'measure word for books'],
      ],
      sentences: [
        ['书在桌子上。', 'shū zài zhuōzi shàng', 'the book is on the table', ['书', '在', '桌子', '上']],
        ['我有三本书。', 'wǒ yǒu sān běn shū', 'I have three books', ['我', '有', '三', '本', '书']],
        ['这是我的椅子。', 'zhè shì wǒ de yǐzi', 'this is my chair', ['这', '是', '我', '的', '椅子']],
        ['这个字很好。', 'zhège zì hěn hǎo', 'this character is very good', ['这', '个', '字', '很', '好']],
      ] },
    { id: 'u7l3', title: 'Pets and screens',
      words: [
        ['电脑', 'diànnǎo', 'computer'],
        ['电视', 'diànshì', 'television'],
        ['电影', 'diànyǐng', 'movie'],
        ['衣服', 'yīfu', 'clothes'],
        ['狗', 'gǒu', 'dog'],
        ['猫', 'māo', 'cat'],
      ],
      sentences: [
        ['这是我的电脑。', 'zhè shì wǒ de diànnǎo', 'this is my computer', ['这', '是', '我', '的', '电脑']],
        ['那是你的衣服吗？', 'nà shì nǐ de yīfu ma', 'is that your clothing', ['那', '是', '你', '的', '衣服', '吗']],
        ['我的狗很好。', 'wǒ de gǒu hěn hǎo', 'my dog is very good', ['我', '的', '狗', '很', '好']],
        ['她的猫在椅子上。', 'tā de māo zài yǐzi shàng', 'her cat is on the chair', ['她', '的', '猫', '在', '椅子', '上']],
      ] },
    { id: 'u7l4', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u8', title: 'Doing things', subtitle: 'Verbs you need', color: '#00B894', icon: '✍️',
  lessons: [
    { id: 'u8l1', title: 'Look and listen',
      words: [
        ['看', 'kàn', 'to look'],
        ['看见', 'kànjiàn', 'to see'],
        ['听', 'tīng', 'to listen'],
        ['读', 'dú', 'to read'],
        ['写', 'xiě', 'to write'],
      ],
      sentences: [
        ['我看书。', 'wǒ kàn shū', 'I read a book', ['我', '看', '书']],
        ['我们看电影。', 'wǒmen kàn diànyǐng', 'we watch a movie', ['我们', '看', '电影']],
        ['我看见老师。', 'wǒ kànjiàn lǎoshī', 'I see the teacher', ['我', '看见', '老师']],
        ['他在家看电视。', 'tā zài jiā kàn diànshì', 'he watches television at home', ['他', '在', '家', '看', '电视']],
        ['我写字。', 'wǒ xiě zì', 'I write characters', ['我', '写', '字']],
        ['请听！', 'qǐng tīng', 'please listen', ['请', '听']],
        ['她读汉语书。', 'tā dú Hànyǔ shū', 'she reads Chinese books', ['她', '读', '汉语', '书']],
      ] },
    { id: 'u8l2', title: 'Study and sleep',
      words: [
        ['说话', 'shuōhuà', 'to speak'],
        ['学习', 'xuéxí', 'to study'],
        ['打电话', 'dǎ diànhuà', 'to make a phone call'],
        ['睡觉', 'shuìjiào', 'to sleep'],
        ['学校', 'xuéxiào', 'school'],
      ],
      sentences: [
        ['我学习汉语。', 'wǒ xuéxí Hànyǔ', 'I study Chinese', ['我', '学习', '汉语']],
        ['他在学校学习。', 'tā zài xuéxiào xuéxí', 'he studies at school', ['他', '在', '学校', '学习']],
        ['明天我打电话。', 'míngtiān wǒ dǎ diànhuà', 'tomorrow I make a phone call', ['明天', '我', '打电话']],
        ['他在睡觉。', 'tā zài shuìjiào', 'he is sleeping', ['他', '在', '睡觉']],
        ['老师在说话。', 'lǎoshī zài shuōhuà', 'the teacher is speaking', ['老师', '在', '说话']],
      ] },
    { id: 'u8l3', title: 'Want and like',
      words: [
        ['会', 'huì', 'can'],
        ['能', 'néng', 'to be able to'],
        ['想', 'xiǎng', 'to want'],
        ['喜欢', 'xǐhuan', 'to like'],
        ['爱', 'ài', 'to love'],
      ],
      sentences: [
        ['我会写字。', 'wǒ huì xiě zì', 'I can write characters', ['我', '会', '写', '字']],
        ['你能来吗？', 'nǐ néng lái ma', 'can you come', ['你', '能', '来', '吗']],
        ['我想喝茶。', 'wǒ xiǎng hē chá', 'I want to drink tea', ['我', '想', '喝', '茶']],
        ['我喜欢猫。', 'wǒ xǐhuan māo', 'I like cats', ['我', '喜欢', '猫']],
        ['我爱我的家。', 'wǒ ài wǒ de jiā', 'I love my home', ['我', '爱', '我', '的', '家']],
      ] },
    { id: 'u8l4', title: 'And, all, done',
      words: [
        ['没有', 'méiyǒu', 'to not have'],
        ['了', 'le', 'change marker'],
        ['和', 'hé', 'and'],
        ['都', 'dōu', 'all'],
      ],
      sentences: [
        ['我没有钱。', 'wǒ méiyǒu qián', 'I have no money', ['我', '没有', '钱']],
        ['我和他都是学生。', 'wǒ hé tā dōu shì xuésheng', 'he and I are both students', ['我', '和', '他', '都', '是', '学生']],
        ['他来了。', 'tā lái le', 'he has come', ['他', '来', '了']],
        ['我们都很好。', 'wǒmen dōu hěn hǎo', 'we are all very good', ['我们', '都', '很', '好']],
        ['我吃了三个苹果。', 'wǒ chī le sān ge píngguǒ', 'I ate three apples', ['我', '吃', '了', '三', '个', '苹果']],
      ] },
    { id: 'u8l5', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
{
  id: 'u9', title: 'Describing', subtitle: 'Big, small, hot, cold', color: '#E0459C', icon: '☀️',
  lessons: [
    { id: 'u9l1', title: 'Big and small',
      words: [
        ['大', 'dà', 'big'],
        ['小', 'xiǎo', 'small'],
        ['多', 'duō', 'many'],
        ['少', 'shǎo', 'few'],
        ['一点儿', 'yìdiǎnr', 'a little'],
      ],
      sentences: [
        ['我的家很大。', 'wǒ de jiā hěn dà', 'my home is very big', ['我', '的', '家', '很', '大']],
        ['这个杯子很小。', 'zhège bēizi hěn xiǎo', 'this cup is very small', ['这', '个', '杯子', '很', '小']],
        ['我的朋友很多。', 'wǒ de péngyou hěn duō', 'my friends are many', ['我', '的', '朋友', '很', '多']],
        ['我喝一点儿水。', 'wǒ hē yìdiǎnr shuǐ', 'I drink a little water', ['我', '喝', '一点儿', '水']],
        ['钱很少。', 'qián hěn shǎo', 'the money is very little', ['钱', '很', '少']],
      ] },
    { id: 'u9l2', title: 'Hot and cold',
      words: [
        ['冷', 'lěng', 'cold'],
        ['热', 'rè', 'hot'],
        ['天气', 'tiānqì', 'weather'],
        ['下雨', 'xiàyǔ', 'to rain'],
        ['太', 'tài', 'too'],
      ],
      sentences: [
        ['今天很冷。', 'jīntiān hěn lěng', 'today is very cold', ['今天', '很', '冷']],
        ['北京很热。', 'Běijīng hěn rè', 'Beijing is very hot', ['北京', '很', '热']],
        ['今天天气很好。', 'jīntiān tiānqì hěn hǎo', 'the weather is very good today', ['今天', '天气', '很', '好']],
        ['明天下雨。', 'míngtiān xiàyǔ', 'it rains tomorrow', ['明天', '下雨']],
        ['太热了！', 'tài rè le', 'too hot', ['太', '热', '了']],
      ] },
    { id: 'u9l3', title: 'Work and feelings',
      words: [
        ['高兴', 'gāoxìng', 'happy'],
        ['漂亮', 'piàoliang', 'pretty'],
        ['工作', 'gōngzuò', 'work'],
        ['做', 'zuò', 'to do'],
        ['医院', 'yīyuàn', 'hospital'],
      ],
      sentences: [
        ['我很高兴。', 'wǒ hěn gāoxìng', 'I am very happy', ['我', '很', '高兴']],
        ['她很漂亮。', 'tā hěn piàoliang', 'she is very pretty', ['她', '很', '漂亮']],
        ['我在医院工作。', 'wǒ zài yīyuàn gōngzuò', 'I work at the hospital', ['我', '在', '医院', '工作']],
        ['你做什么工作？', 'nǐ zuò shénme gōngzuò', 'what work do you do', ['你', '做', '什么', '工作']],
        ['医生在医院。', 'yīshēng zài yīyuàn', 'the doctor is at the hospital', ['医生', '在', '医院']],
      ] },
    { id: 'u9l4', title: 'Review', review: true, words: [], sentences: [] },
  ],
},
];

/* Every HSK 1 word is taught in a lesson above, so nothing extra is needed. */
const EXTRA_WORDS = [];

/* ---- derived lookups ---------------------------------------------------- */

const WORD_INDEX = (() => {
  const m = new Map();
  for (const w of EXTRA_WORDS) m.set(w[0], w);
  for (const u of COURSE) for (const l of u.lessons) for (const w of l.words) m.set(w[0], w);
  return m;
})();

/* Review lessons borrow everything taught earlier in their unit. This has to
   run before ALL_LESSONS is built, since that holds copies of the lessons. */
for (const u of COURSE) {
  for (const l of u.lessons) {
    if (!l.review) continue;
    const prior = u.lessons.filter(x => !x.review);
    l.words = prior.flatMap(x => x.words);
    l.sentences = prior.flatMap(x => x.sentences);
  }
}

const ALL_LESSONS = COURSE.flatMap(u => u.lessons.map(l => ({ ...l, unit: u })));

function lessonById(id) { return ALL_LESSONS.find(l => l.id === id); }
function pinyinOf(hz) { const w = WORD_INDEX.get(hz); return w ? w[1] : hz; }
function meaningOf(hz) { const w = WORD_INDEX.get(hz); return w ? w[2] : hz; }
