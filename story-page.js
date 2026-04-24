const STORY_PUNCTUATION = new Set(["。", "，", "！", "？", "：", "；", "“", "”", "（", "）", "《", "》", "、", "…", "."]);
const AUDIO_CACHE_BUSTER = "2026-04-24";
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
  { key: "什么", pinyin: "shénme", english: "what", level: "HSK1" },
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
  { key: "知道", pinyin: "zhīdao", english: "know", level: "HSK1" },
  { key: "今年", pinyin: "jīnnián", english: "this year", level: "HSK2" },
  { key: "已经", pinyin: "yǐjīng", english: "already", level: "HSK2" },
  { key: "退休", pinyin: "tuìxiū", english: "retire / retired", level: "HSK2" },
  { key: "陈先生", pinyin: "Chén xiānsheng", english: "Mr. Chen", level: "HSK2" },
  { key: "六十五岁", pinyin: "liùshíwǔ suì", english: "sixty-five years old", level: "HSK2" },
  { key: "老胡同", pinyin: "lǎo hútòng", english: "old hutong", level: "HSK2" },
  { key: "旧书市场", pinyin: "jiùshū shìchǎng", english: "used-book market", level: "HSK2" },
  { key: "很喜欢", pinyin: "hěn xǐhuan", english: "really like", level: "HSK2" },
  { key: "买书", pinyin: "mǎi shū", english: "buy books", level: "HSK2" },
  { key: "书名", pinyin: "shūmíng", english: "title", level: "HSK2" },
  { key: "有意思", pinyin: "yǒu yìsi", english: "interesting", level: "HSK2" },
  { key: "回到家", pinyin: "huídào jiā", english: "go home", level: "HSK2" },
  { key: "打开书", pinyin: "dǎkāi shū", english: "open the book", level: "HSK2" },
  { key: "掉出来", pinyin: "diào chūlái", english: "fall out", level: "HSK2" },
  { key: "黑白", pinyin: "hēibái", english: "black-and-white", level: "HSK2" },
  { key: "一家人", pinyin: "yì jiārén", english: "a family", level: "HSK2" },
  { key: "房子前面", pinyin: "fángzi qiánmiàn", english: "in front of a house", level: "HSK2" },
  { key: "仔细", pinyin: "zǐxì", english: "carefully", level: "HSK2" },
  { key: "熟悉", pinyin: "shúxī", english: "familiar", level: "HSK2" },
  { key: "窗户旁边", pinyin: "chuānghu pángbiān", english: "by the window", level: "HSK2" },
  { key: "想了很久", pinyin: "xiǎng le hěn jiǔ", english: "thought for a long time", level: "HSK2" },
  { key: "明白", pinyin: "míngbai", english: "understand", level: "HSK2" },
  { key: "再次", pinyin: "zàicì", english: "again", level: "HSK2" },
  { key: "眼镜", pinyin: "yǎnjìng", english: "glasses", level: "HSK2" },
  { key: "王大爷", pinyin: "Wáng Dàyé", english: "Uncle Wang", level: "HSK2" },
  { key: "李奶奶", pinyin: "Lǐ Nǎinai", english: "Grandma Li", level: "HSK2" },
  { key: "爸爸妈妈", pinyin: "bàba māma", english: "parents", level: "HSK2" },
  { key: "兄弟", pinyin: "xiōngdì", english: "brother", level: "HSK2" },
  { key: "电话", pinyin: "diànhuà", english: "phone call", level: "HSK2" },
  { key: "手机", pinyin: "shǒujī", english: "mobile phone", level: "HSK2" },
  { key: "图书馆员", pinyin: "túshūguǎnyuán", english: "librarian", level: "HSK2" },
  { key: "旧档案", pinyin: "jiù dàng'àn", english: "old archives", level: "HSK2" },
  { key: "户籍资料", pinyin: "hùjí zīliào", english: "household registration records", level: "HSK2" },
  { key: "电脑", pinyin: "diànnǎo", english: "computer", level: "HSK2" },
  { key: "地址", pinyin: "dìzhǐ", english: "address", level: "HSK2" },
  { key: "职业", pinyin: "zhíyè", english: "occupation", level: "HSK2" },
  { key: "广州", pinyin: "Guǎngzhōu", english: "Guangzhou", level: "HSK2" },
  { key: "电子邮件", pinyin: "diànzǐ yóujiàn", english: "email", level: "HSK2" },
  { key: "健在", pinyin: "jiànzài", english: "still alive", level: "HSK2" },
  { key: "头发全白", pinyin: "tóufa quán bái", english: "completely white hair", level: "HSK2" },
  { key: "还是", pinyin: "háishi", english: "still", level: "HSK2" },
  { key: "社区网站", pinyin: "shèqū wǎngzhàn", english: "community website", level: "HSK2" },
  { key: "老师", pinyin: "lǎoshī", english: "teacher", level: "HSK2" },
  { key: "教育", pinyin: "jiàoyù", english: "education", level: "HSK2" },
  { key: "奉献", pinyin: "fèngxiàn", english: "devote", level: "HSK2" },
  { key: "女儿", pinyin: "nǚ'ér", english: "daughter", level: "HSK2" },
  { key: "下落", pinyin: "xiàluò", english: "whereabouts", level: "HSK2" },
  { key: "哥哥", pinyin: "gēge", english: "older brother", level: "HSK2" },
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
  { key: "为什么", pinyin: "wèishénme", english: "why", level: "HSK1" },
  { key: "认识", pinyin: "rènshi", english: "know / recognize", level: "HSK2" },
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
  { key: "教师", pinyin: "jiàoshī", english: "teacher", level: "HSK2" },
  { key: "叔叔", pinyin: "shūshu", english: "uncle", level: "HSK1" },
];

const EXTRA_VOCAB = [
  { key: "照片", pinyin: "zhàopiàn", english: "photo", level: "HSK2" },
  { key: "椅子", pinyin: "yǐzi", english: "chair", level: "HSK2" },
  { key: "北京", pinyin: "Běijīng", english: "Beijing", level: "HSK2" },
  { key: "胡同", pinyin: "hútòng", english: "hutong", level: "HSK2" },
  { key: "看着", pinyin: "kànzhe", english: "looking at", level: "HSK2" },
  { key: "突然", pinyin: "tūrán", english: "suddenly", level: "HSK2" },
  { key: "房子", pinyin: "fángzi", english: "house", level: "HSK2" },
  { key: "男孩", pinyin: "nánhái", english: "boy", level: "HSK2" },
  { key: "很好", pinyin: "hěn hǎo", english: "very good", level: "HSK2" },
  { key: "附近", pinyin: "fùjìn", english: "nearby", level: "HSK2" },
  { key: "开始", pinyin: "kāishǐ", english: "start", level: "HSK2" },
  { key: "颜色", pinyin: "yánsè", english: "color", level: "HSK2" },
  { key: "自己", pinyin: "zìjǐ", english: "self / oneself", level: "HSK2" },
  { key: "后面", pinyin: "hòumiàn", english: "back / behind", level: "HSK2" },
  { key: "清楚", pinyin: "qīngchu", english: "clear", level: "HSK2" },
  { key: "第二天", pinyin: "dì èr tiān", english: "the next day", level: "HSK2" },
  { key: "以前", pinyin: "yǐqián", english: "before / previously", level: "HSK2" },
  { key: "点头", pinyin: "diǎntóu", english: "nod", level: "HSK2" },
  { key: "眼睛", pinyin: "yǎnjing", english: "eyes", level: "HSK2" },
  { key: "没事", pinyin: "méi shì", english: "it's okay", level: "HSK2" },
  { key: "轻轻地", pinyin: "qīngqīngde", english: "gently", level: "HSK2" },
  { key: "弟弟", pinyin: "dìdi", english: "younger brother", level: "HSK2" },
  { key: "终于", pinyin: "zhōngyú", english: "finally", level: "HSK2" },
  { key: "生活", pinyin: "shēnghuó", english: "life", level: "HSK2" },
  { key: "快乐", pinyin: "kuàilè", english: "happy", level: "HSK2" },
  { key: "星期六", pinyin: "xīngqīliù", english: "Saturday", level: "HSK2" },
  { key: "很有意思", pinyin: "hěn yǒu yìsi", english: "very interesting", level: "HSK2" },
  { key: "捡起", pinyin: "jiǎnqǐ", english: "pick up", level: "HSK2" },
  { key: "两个孩子", pinyin: "liǎng ge háizi", english: "two children", level: "HSK2" },
  { key: "看起来", pinyin: "kàn qǐlái", english: "look like / seem", level: "HSK2" },
  { key: "红色", pinyin: "hóngsè", english: "red", level: "HSK2" },
  { key: "什么地方", pinyin: "shénme dìfang", english: "what place", level: "HSK2" },
  { key: "站起", pinyin: "zhàn qǐ", english: "stand up", level: "HSK2" },
  { key: "不一样", pinyin: "bù yíyàng", english: "different", level: "HSK2" },
  { key: "什么字", pinyin: "shénme zì", english: "what characters", level: "HSK2" },
  { key: "翻过", pinyin: "fān guò", english: "turn over", level: "HSK2" },
  { key: "春天", pinyin: "chūntiān", english: "spring", level: "HSK2" },
  { key: "孩子们", pinyin: "háizimen", english: "children", level: "HSK2" },
  { key: "女孩", pinyin: "nǚhái", english: "girl", level: "HSK2" },
  { key: "笑得", pinyin: "xiào de", english: "smiling", level: "HSK2" },
  { key: "很开心", pinyin: "hěn kāixīn", english: "very happy", level: "HSK2" },
  { key: "奇怪", pinyin: "qíguài", english: "strange", level: "HSK2" },
  { key: "感觉", pinyin: "gǎnjué", english: "feel", level: "HSK2" },
  { key: "决定", pinyin: "juédìng", english: "decide", level: "HSK2" },
  { key: "老邻居", pinyin: "lǎo línjū", english: "old neighbor", level: "HSK2" },
  { key: "事情", pinyin: "shìqing", english: "matter / thing", level: "HSK2" },
  { key: "出现", pinyin: "chūxiàn", english: "appear", level: "HSK2" },
  { key: "慢慢地", pinyin: "mànmàn de", english: "slowly", level: "HSK2" },
  { key: "告诉", pinyin: "gàosu", english: "tell", level: "HSK2" },
  { key: "发现", pinyin: "fāxiàn", english: "discover", level: "HSK2" },
  { key: "院子", pinyin: "yuànzi", english: "courtyard", level: "HSK2" },
  { key: "记性", pinyin: "jìxing", english: "memory", level: "HSK2" },
  { key: "进门", pinyin: "jìnmén", english: "enter", level: "HSK2" },
  { key: "故事", pinyin: "gùshì", english: "story", level: "HSK2" },
  { key: "怎么", pinyin: "zěnme", english: "how", level: "HSK2" },
  { key: "安静", pinyin: "ānjìng", english: "quiet", level: "HSK2" },
  { key: "南方", pinyin: "nánfāng", english: "south", level: "HSK2" },
  { key: "深吸", pinyin: "shēn xī", english: "take a deep breath", level: "HSK2" },
  { key: "口气", pinyin: "kǒuqì", english: "breath", level: "HSK2" },
  { key: "信息", pinyin: "xìnxī", english: "information", level: "HSK2" },
  { key: "年轻", pinyin: "niánqīng", english: "young", level: "HSK2" },
  { key: "查找", pinyin: "cházhǎo", english: "search", level: "HSK2" },
  { key: "很高兴", pinyin: "hěn gāoxìng", english: "very happy", level: "HSK2" },
  { key: "打开", pinyin: "dǎkāi", english: "open", level: "HSK2" },
  { key: "写着", pinyin: "xiězhe", english: "written", level: "HSK2" },
  { key: "短信", pinyin: "duǎnxìn", english: "text message", level: "HSK2" },
  { key: "名单", pinyin: "míngdān", english: "list", level: "HSK2" },
  { key: "工作", pinyin: "gōngzuò", english: "work", level: "HSK2" },
  { key: "又开始", pinyin: "yòu kāishǐ", english: "start again", level: "HSK2" },
  { key: "紧张", pinyin: "jǐnzhāng", english: "nervous", level: "HSK2" },
  { key: "发生", pinyin: "fāshēng", english: "happen", level: "HSK2" },
  { key: "继续查", pinyin: "jìxù chá", english: "keep searching", level: "HSK2" },
  { key: "三个星期", pinyin: "sān ge xīngqī", english: "three weeks", level: "HSK2" },
  { key: "网站", pinyin: "wǎngzhàn", english: "website", level: "HSK2" },
  { key: "联系方式", pinyin: "liánxì fāngshì", english: "contact info", level: "HSK2" },
  { key: "文章", pinyin: "wénzhāng", english: "article", level: "HSK2" },
  { key: "作者", pinyin: "zuòzhě", english: "author", level: "HSK2" },
  { key: "情况", pinyin: "qíngkuàng", english: "situation", level: "HSK2" },
  { key: "回信", pinyin: "huíxìn", english: "reply", level: "HSK2" },
  { key: "眼泪", pinyin: "yǎnlèi", english: "tears", level: "HSK2" },
  { key: "应该", pinyin: "yīnggāi", english: "should", level: "HSK2" },
  { key: "窗外", pinyin: "chuāngwài", english: "outside the window", level: "HSK2" },
];

const EXTRA_CHAR_VOCAB = [
  { key: "个", english: "classifier", level: "HSK1" },
  { key: "坐", english: "sit", level: "HSK2" },
  { key: "地", english: "particle", level: "HSK1" },
  { key: "张", english: "classifier", level: "HSK1" },
  { key: "给", english: "give / to", level: "HSK1" },
  { key: "您", english: "you (polite)", level: "HSK2" },
  { key: "找", english: "find / look for", level: "HSK1" },
  { key: "旧", english: "old", level: "HSK1" },
  { key: "没", english: "not", level: "HSK1" },
  { key: "久", english: "long time", level: "HSK1" },
  { key: "从", english: "from", level: "HSK1" },
  { key: "哪", english: "which / where", level: "HSK1" },
  { key: "快", english: "fast", level: "HSK1" },
  { key: "点", english: "point / a little", level: "HSK1" },
  { key: "妈", english: "mom", level: "HSK1" },
  { key: "条", english: "classifier", level: "HSK1" },
  { key: "出", english: "out", level: "HSK1" },
  { key: "叫", english: "call / be called", level: "HSK1" },
  { key: "树", english: "tree", level: "HSK1" },
  { key: "门", english: "door", level: "HSK1" },
  { key: "谁", english: "who", level: "HSK1" },
  { key: "字", english: "character", level: "HSK1" },
  { key: "事", english: "thing / matter", level: "HSK1" },
  { key: "种", english: "kind / type", level: "HSK1" },
  { key: "面", english: "side / face", level: "HSK1" },
  { key: "题", english: "question / topic", level: "HSK2" },
  { key: "后", english: "after / behind", level: "HSK1" },
  { key: "真", english: "really", level: "HSK1" },
  { key: "打", english: "hit / call", level: "HSK1" },
  { key: "老", english: "old", level: "HSK1" },
  { key: "发", english: "send / hair", level: "HSK1" },
  { key: "篇", english: "piece / article", level: "HSK2" },
  { key: "念", english: "read aloud / miss", level: "HSK2" },
  { key: "放", english: "put / place", level: "HSK1" },
  { key: "每", english: "every", level: "HSK1" },
  { key: "天", english: "day / sky", level: "HSK1" },
  { key: "本", english: "book / classifier", level: "HSK1" },
  { key: "落", english: "fall", level: "HSK2" },
  { key: "站", english: "stand", level: "HSK1" },
  { key: "棵", english: "classifier", level: "HSK1" },
  { key: "像", english: "resemble", level: "HSK1" },
  { key: "变", english: "change", level: "HSK1" },
  { key: "样", english: "kind / sort", level: "HSK1" },
  { key: "行", english: "okay / line", level: "HSK1" },
  { key: "需", english: "need", level: "HSK2" },
  { key: "区", english: "district", level: "HSK2" },
  { key: "得", english: "particle / get", level: "HSK1" },
  { key: "早", english: "early", level: "HSK1" },
  { key: "少", english: "few / little", level: "HSK1" },
  { key: "完", english: "finish", level: "HSK1" },
  { key: "表", english: "express", level: "HSK2" },
  { key: "正", english: "just / exactly", level: "HSK1" },
  { key: "花", english: "flower", level: "HSK1" },
  { key: "担", english: "carry", level: "HSK2" },
  { key: "只", english: "only / classifier", level: "HSK1" },
  { key: "愣", english: "stunned", level: "HSK2" },
  { key: "响", english: "sound / ring", level: "HSK2" },
  { key: "边", english: "side", level: "HSK1" },
  { key: "记", english: "remember", level: "HSK1" },
  { key: "所", english: "place", level: "HSK2" },
  { key: "学", english: "study", level: "HSK1" },
  { key: "美", english: "beautiful", level: "HSK1" },
  { key: "亮", english: "bright", level: "HSK2" },
  { key: "话", english: "speech / words", level: "HSK1" },
  { key: "直", english: "straight / directly", level: "HSK2" },
  { key: "辈", english: "generation", level: "HSK2" },
  { key: "手", english: "hand", level: "HSK1" },
  { key: "暖", english: "warm", level: "HSK2" },
  { key: "陈", english: "Chen", level: "HSK2" },
  { key: "国", english: "country", level: "HSK2" },
  { key: "华", english: "China / Chinese", level: "HSK2" },
  { key: "建", english: "build", level: "HSK2" },
  { key: "马", english: "horse", level: "HSK1" },
  { key: "明", english: "bright", level: "HSK1" },
  { key: "海", english: "sea", level: "HSK1" },
  { key: "声", english: "sound", level: "HSK1" },
  { key: "住", english: "live / stay", level: "HSK1" },
  { key: "停", english: "stop", level: "HSK2" },
  { key: "抱", english: "hug", level: "HSK2" },
  { key: "爸", english: "dad", level: "HSK1" },
  { key: "房", english: "house / room", level: "HSK1" },
  { key: "前", english: "front", level: "HSK1" },
  { key: "才", english: "only / just", level: "HSK1" },
  { key: "年", english: "year", level: "HSK1" },
  { key: "来", english: "come", level: "HSK1" },
  { key: "去", english: "go", level: "HSK1" },
  { key: "到", english: "arrive / reach", level: "HSK1" },
  { key: "看", english: "look / see / watch", level: "HSK1" },
  { key: "说", english: "say / speak", level: "HSK1" },
  { key: "把", english: "ba particle", level: "HSK2" },
  { key: "过", english: "particle / over", level: "HSK1" },
  { key: "起", english: "up / rise", level: "HSK1" },
  { key: "跳", english: "jump", level: "HSK1" },
  { key: "姓", english: "surname", level: "HSK2" },
  { key: "更", english: "more", level: "HSK2" },
  { key: "许", english: "perhaps", level: "HSK2" },
  { key: "音", english: "sound", level: "HSK1" },
  { key: "写", english: "write", level: "HSK1" },
  { key: "太", english: "too / very", level: "HSK1" },
  { key: "四", english: "four", level: "HSK1" },
  { key: "情", english: "feeling", level: "HSK2" },
  { key: "最", english: "most", level: "HSK1" },
  { key: "件", english: "item / piece", level: "HSK2" },
  { key: "接", english: "answer / receive", level: "HSK2" },
  { key: "专", english: "special", level: "HSK2" },
  { key: "女", english: "female", level: "HSK1" },
  { key: "生", english: "person / life", level: "HSK1" },
  { key: "湿", english: "wet", level: "HSK2" },
  { key: "两", english: "two", level: "HSK1" },
  { key: "子", english: "child / suffix", level: "HSK1" },
  { key: "孩子", english: "child", level: "HSK1" },
  { key: "两个", english: "two", level: "HSK1" },
  { key: "声音", english: "sound / voice", level: "HSK1" },
  { key: "概", english: "about", level: "HSK2" },
  { key: "五", english: "five", level: "HSK1" },
  { key: "刘", english: "Liu", level: "HSK2" },
  { key: "十", english: "ten", level: "HSK1" },
  { key: "二", english: "two", level: "HSK1" },
  { key: "六", english: "six", level: "HSK1" },
  { key: "七", english: "seven", level: "HSK1" },
  { key: "八", english: "eight", level: "HSK1" },
  { key: "九", english: "nine", level: "HSK1" },
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
  ["什么", "HSK1"],
  ["认识", "HSK1"],
  ["时候", "HSK1"],
  ["现在", "HSK1"],
  ["学校", "HSK1"],
  ["为什么", "HSK3"],
  ["时间", "HSK2"],
  ["路", "HSK2"],
  ["到", "HSK2"],
  ["手机", "HSK3"],
  ["休息", "HSK3"],
  ["忙", "HSK3"],
  ["累", "HSK3"],
  ["觉得", "HSK3"],
  ["可以", "HSK3"],
  ["旁边", "HSK3"],
  ["还", "HSK4"],
  ["再", "HSK3"],
  ["因为", "HSK3"],
  ["以后", "HSK4"],
  ["一起", "HSK3"],
  ["要", "HSK3"],
  ["走", "HSK3"],
  ["城市", "HSK4"],
  ["聊天", "HSK4"],
  ["市场", "HSK4"],
  ["干净", "HSK4"],
  ["简单", "HSK4"],
  ["生活", "HSK4"],
  ["看起来", "HSK4"],
  ["不然", "HSK4"],
  ["一直", "HSK4"],
  ["重要", "HSK4"],
  ["难忘", "HSK4"],
  ["叔叔", "HSK4"],
  ["教师", "HSK5"],
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

function normalizeEnglish(value, fallback = "") {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return /[\u4e00-\u9fff]/.test(text) ? fallback : text;
}

function buildEnglishGloss(key, lexicon) {
  const entry = lexicon.byKey.get(key);
  return normalizeEnglish(entry?.english);
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

async function loadCharacterPinyin() {
  const response = await fetch("./data/hsk2-char-pinyin.json");
  if (!response.ok) {
    throw new Error("Could not load fallback pinyin data.");
  }
  return response.json();
}

function buildLexicon(vocab = [], priorKeys = new Set()) {
  const merged = new Map(
    [...COMMON_VOCAB, ...EXTRA_VOCAB, ...EXTRA_CHAR_VOCAB].map((entry) => [
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

    if (char === "." || char === "…") {
      let end = index + 1;
      while (end < sentenceText.length && sentenceText[end] === char) {
        end += 1;
      }
      segments.push({ type: "punctuation", text: sentenceText.slice(index, end) });
      index = end;
      continue;
    }

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

    if (/[\u4e00-\u9fff]/.test(char)) {
      let end = index + 1;

      while (end < sentenceText.length) {
        const nextChar = sentenceText[end];
        if (STORY_PUNCTUATION.has(nextChar) || /\s/.test(nextChar)) {
          break;
        }

        if (matchToken(sentenceText, end, lexicon.keys)) {
          break;
        }

        if (!/[\u4e00-\u9fff]/.test(nextChar)) {
          break;
        }

        end += 1;
      }

      segments.push({ type: "word", key: sentenceText.slice(index, end) });
      index = end;
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

      const classes = ["word", "underline"];
      if (entry?.isNewWord) {
        classes.push("new-word");
        classes.push(entry.newWordTone === "hsk1" ? "new-word-hsk1" : "new-word-hsk2plus");
      }

      const fallbackPinyin = buildFallbackPinyin(segment.key, window.__HSK2_CHAR_PINYIN || {});
      const pinyin = entry?.pinyin || fallbackPinyin;
      const english = buildEnglishGloss(segment.key, lexicon);
      const level = entry?.level || "";
      const key = entry?.key || segment.key;

      return `<span class="${classes.join(" ")}" data-pinyin="${escapeHtml(pinyin)}" data-tip="${escapeHtml(english)}" data-sentence-english="${escapeHtml(normalizeEnglish(sentence.english || ""))}" data-level="${escapeHtml(level)}" data-key="${escapeHtml(key)}">${escapeHtml(segment.key)}</span>`;
    })
    .join("");

  return `
    <div class="phrase-card" data-sentence-id="${escapeHtml(sentence.id)}">
      <div class="pinyin-line">${escapeHtml(buildSentencePinyin(sentence, lexicon))}</div>
      <div class="hanzi-line${isTitle ? " solo" : ""}">
        ${hanzi}
      </div>
      <div class="english-line">${escapeHtml(normalizeEnglish(sentence.english || ""))}</div>
    </div>
  `;
}

function buildFallbackPinyin(text, pinyinMap) {
  const chars = Array.from(String(text || ""));
  if (!chars.length) return "";

  return chars
    .map((char) => {
      if (char === "." || char === "…") return char;
      if (STORY_PUNCTUATION.has(char) || /\s/.test(char)) return char;
      return pinyinMap[char] || char;
    })
    .join(" ")
    .replace(/\s+([，。！？：；])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSentencePinyin(sentence, lexicon) {
  const provided = String(sentence.pinyin || "").trim();
  if (provided) {
    return provided;
  }

  const segments = tokenizeSentence(sentence.text || "", lexicon);
  if (!segments.length) {
    return "";
  }

  const parts = [];

  for (const segment of segments) {
    if (segment.type === "punctuation") {
      if (parts.length) {
        parts[parts.length - 1] += segment.text;
      } else {
        parts.push(segment.text);
      }
      continue;
    }

    if (segment.type === "text") {
      parts.push(segment.text);
      continue;
    }

    const entry = lexicon.byKey.get(segment.key);
    parts.push(entry?.pinyin || segment.key);
  }

  return parts
    .join(" ")
    .replace(/\s+([，。！？：；])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
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
    [...COMMON_VOCAB, ...EXTRA_VOCAB, ...EXTRA_CHAR_VOCAB].map((entry) => [
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
  const isChapterStory = Number.parseInt(storyNumber, 10) >= 11;
  const storyCount = stories.length;
  const nextStory = stories[storyIndex + 1] || null;
  const firstSentence = story.sentences[0];
  const remainingSentences = story.sentences.slice(1);
  const rows = chunk(remainingSentences, isChapterStory ? 1 : 3);
  const firstSentenceWord = tokenizeSentence(firstSentence.text, lexicon).find((segment) => segment.type === "word");
  const initialEntry = firstSentenceWord ? lexicon.byKey.get(firstSentenceWord.key) : lexicon.entries[0];
  const storyKeys = collectStoryKeys(story, tokenLexicon);
  const newWordCount = Array.from(storyKeys).filter((key) => !priorKeys.has(key)).length;
  const nextStoryLink = nextStory
    ? `<a class="story-next-button" href="./story.html?story=${escapeHtml(nextStory.slug || `story${nextStory.id}`)}">Read next story</a>`
    : "";
  const initialWordKey = firstSentenceWord ? firstSentenceWord.key : firstSentence.text;
  const initialEnglish = buildEnglishGloss(initialWordKey, lexicon);

  document.title = `${story.englishTitle} | Open Chinese Reader`;
  document.body.dataset.storyId = story.slug || `story${storyNumber}`;
  document.body.classList.toggle("chapter-story", isChapterStory);
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
            <span class="meaning-hanzi" id="meaning-hanzi">${escapeHtml(initialEntry?.key || initialWordKey)}</span>
            <span class="meaning-pinyin" id="meaning-pinyin">${escapeHtml(initialEntry?.pinyin || firstSentence.pinyin)}</span>
            <span class="meaning-english" id="meaning-english">${escapeHtml(initialEntry?.english || initialEnglish)}</span>
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
    const key = word.dataset.key || word.textContent.trim();
    const entry = lexicon.byKey.get(key) || {
      key,
      pinyin: word.dataset.pinyin || "",
      english: normalizeEnglish(word.dataset.tip || ""),
      level: word.dataset.level || "",
    };

    words.forEach((item) => item.classList.remove("selected"));
    word.classList.add("selected");

    meaningHanzi.textContent = entry.key;
    meaningPinyin.textContent = entry.pinyin;
    meaningEnglish.textContent = normalizeEnglish(entry.english);
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
    const [stories, vocabularyIndex, characterPinyin] = await Promise.all([
      loadStories(),
      loadVocabulary(),
      loadCharacterPinyin(),
    ]);
    const storyId = getStoryId();
    const story = stories.find((entry) => entry.slug === storyId || entry.id === storyId.replace("story", ""));

    if (!story) {
      throw new Error(`Unknown story: ${storyId}`);
    }

    stories.forEach((entry) => {
      entry.vocab = vocabularyIndex[entry.slug] || vocabularyIndex[entry.id] || [];
    });

    window.__HSK2_CHAR_PINYIN = characterPinyin;
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
