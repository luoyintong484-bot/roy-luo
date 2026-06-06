import { getDb } from "./queries/connection";
import { artists, readings, artistSchedules, payments } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // ======== ARTISTS: Kpop + 内娱 + 日娱 + 解散团体solo ========
  const artistData = [
    // ===== 少女时代 (Girls' Generation) =====
    { name: "金泰妍", stageName: "泰妍", groupName: "少女时代", birthDate: "1989-03-09", zodiacSign: "双鱼座", baziDayPillar: "戊辰", starMansion: "昴宿", avatar: "/idols/taeyeon.jpg" },
    { name: "李顺圭", stageName: "Sunny", groupName: "少女时代", birthDate: "1989-05-15", zodiacSign: "金牛座", baziDayPillar: "庚午", starMansion: "毕宿", avatar: "/idols/sunny.jpg" },
    { name: "黄美英", stageName: "Tiffany", groupName: "少女时代", birthDate: "1989-08-01", zodiacSign: "狮子座", baziDayPillar: "辛未", starMansion: "觜宿", avatar: "/idols/tiffany.jpg" },
    { name: "金孝渊", stageName: "孝渊", groupName: "少女时代", birthDate: "1989-09-22", zodiacSign: "处女座", baziDayPillar: "壬申", starMansion: "参宿", avatar: "/idols/hyoyeon.jpg" },
    { name: "权俞利", stageName: "Yuri", groupName: "少女时代", birthDate: "1989-12-05", zodiacSign: "射手座", baziDayPillar: "癸亥", starMansion: "斗宿", avatar: "/idols/yuri.jpg" },
    { name: "崔秀英", stageName: "秀英", groupName: "少女时代", birthDate: "1990-02-10", zodiacSign: "水瓶座", baziDayPillar: "丙午", starMansion: "牛宿", avatar: "/idols/sooyoung.jpg" },
    { name: "林允儿", stageName: "允儿", groupName: "少女时代", birthDate: "1990-05-30", zodiacSign: "双子座", baziDayPillar: "乙丑", starMansion: "女宿", avatar: "/idols/yoona.jpg" },
    { name: "徐珠贤", stageName: "徐贤", groupName: "少女时代", birthDate: "1991-06-28", zodiacSign: "巨蟹座", baziDayPillar: "己巳", starMansion: "虚宿", avatar: "/idols/seohyun.jpg" },

    // ===== EXO =====
    { name: "金珉锡", stageName: "Xiumin", groupName: "EXO", birthDate: "1990-03-26", zodiacSign: "白羊座", baziDayPillar: "庚申", starMansion: "昴宿", avatar: "/idols/xiumin.jpg" },
    { name: "金俊勉", stageName: "Suho", groupName: "EXO", birthDate: "1991-05-22", zodiacSign: "双子座", baziDayPillar: "壬辰", starMansion: "毕宿", avatar: "/idols/suho.jpg" },
    { name: "张艺兴", stageName: "Lay", groupName: "EXO", birthDate: "1991-10-07", zodiacSign: "天秤座", baziDayPillar: "庚戌", starMansion: "角宿", avatar: "/idols/lay.jpg" },
    { name: "边伯贤", stageName: "Baekhyun", groupName: "EXO", birthDate: "1992-05-06", zodiacSign: "金牛座", baziDayPillar: "壬子", starMansion: "亢宿", avatar: "/idols/baekhyun.jpg" },
    { name: "金钟大", stageName: "Chen", groupName: "EXO", birthDate: "1992-09-21", zodiacSign: "处女座", baziDayPillar: "庚子", starMansion: "氐宿", avatar: "/idols/chen.jpg" },
    { name: "朴灿烈", stageName: "Chanyeol", groupName: "EXO", birthDate: "1992-11-27", zodiacSign: "射手座", baziDayPillar: "丁卯", starMansion: "房宿", avatar: "/idols/chanyeol.jpg" },
    { name: "都敬秀", stageName: "D.O.", groupName: "EXO", birthDate: "1993-01-12", zodiacSign: "摩羯座", baziDayPillar: "癸酉", starMansion: "心宿", avatar: "/idols/do.jpg" },
    { name: "金钟仁", stageName: "Kai", groupName: "EXO", birthDate: "1994-01-14", zodiacSign: "摩羯座", baziDayPillar: "乙亥", starMansion: "尾宿", avatar: "/idols/kai.jpg" },
    { name: "吴世勋", stageName: "Sehun", groupName: "EXO", birthDate: "1994-04-12", zodiacSign: "白羊座", baziDayPillar: "戊寅", starMansion: "箕宿", avatar: "/idols/sehun.jpg" },

    // ===== BLACKPINK =====
    { name: "金智秀", stageName: "Jisoo", groupName: "BLACKPINK", birthDate: "1995-01-03", zodiacSign: "摩羯座", baziDayPillar: "甲子", starMansion: "斗宿", avatar: "/idols/jisoo.jpg" },
    { name: "金珍妮", stageName: "Jennie", groupName: "BLACKPINK", birthDate: "1996-01-16", zodiacSign: "摩羯座", baziDayPillar: "壬子", starMansion: "牛宿", avatar: "/idols/jennie.jpg" },
    { name: "朴彩英", stageName: "Rosé", groupName: "BLACKPINK", birthDate: "1997-02-11", zodiacSign: "水瓶座", baziDayPillar: "甲申", starMansion: "女宿", avatar: "/idols/rose.jpg" },
    { name: "Lalisa", stageName: "Lisa", groupName: "BLACKPINK", birthDate: "1997-03-27", zodiacSign: "白羊座", baziDayPillar: "戊辰", starMansion: "虚宿", avatar: "/idols/lisa.jpg" },

    // ===== BTS =====
    { name: "金南俊", stageName: "RM", groupName: "BTS", birthDate: "1994-09-12", zodiacSign: "处女座", baziDayPillar: "辛亥", starMansion: "角宿", avatar: "/idols/rm.jpg" },
    { name: "金硕珍", stageName: "Jin", groupName: "BTS", birthDate: "1992-12-04", zodiacSign: "射手座", baziDayPillar: "戊午", starMansion: "亢宿", avatar: "/idols/jin.jpg" },
    { name: "闵玧其", stageName: "Suga", groupName: "BTS", birthDate: "1993-03-09", zodiacSign: "双鱼座", baziDayPillar: "己丑", starMansion: "氐宿", avatar: "/idols/suga.jpg" },
    { name: "郑号锡", stageName: "J-Hope", groupName: "BTS", birthDate: "1994-02-18", zodiacSign: "水瓶座", baziDayPillar: "乙亥", starMansion: "房宿", avatar: "/idols/jhope.jpg" },
    { name: "朴智旻", stageName: "Jimin", groupName: "BTS", birthDate: "1995-10-13", zodiacSign: "天秤座", baziDayPillar: "丁未", starMansion: "心宿", avatar: "/idols/jimin.jpg" },
    { name: "金泰亨", stageName: "V", groupName: "BTS", birthDate: "1995-12-30", zodiacSign: "摩羯座", baziDayPillar: "乙丑", starMansion: "尾宿", avatar: "/idols/v.jpg" },
    { name: "田柾国", stageName: "Jungkook", groupName: "BTS", birthDate: "1997-09-01", zodiacSign: "处女座", baziDayPillar: "丙午", starMansion: "箕宿", avatar: "/idols/jungkook.jpg" },

    // ===== IVE =====
    { name: "安兪真", stageName: "Yujin", groupName: "IVE", birthDate: "2003-09-01", zodiacSign: "处女座", baziDayPillar: "丙子", starMansion: "角宿", avatar: "/idols/yujin.jpg" },
    { name: "金秋天", stageName: "Gaeul", groupName: "IVE", birthDate: "2002-09-24", zodiacSign: "天秤座", baziDayPillar: "乙酉", starMansion: "亢宿", avatar: "/idols/gaeul.jpg" },
    { name: "张员瑛", stageName: "Wonyoung", groupName: "IVE", birthDate: "2004-08-31", zodiacSign: "处女座", baziDayPillar: "癸巳", starMansion: "氐宿", avatar: "/idols/wonyoung.jpg" },
    { name: "金志垣", stageName: "Liz", groupName: "IVE", birthDate: "2004-11-21", zodiacSign: "天蝎座", baziDayPillar: "壬辰", starMansion: "房宿", avatar: "/idols/liz.jpg" },
    { name: "直井怜", stageName: "Rei", groupName: "IVE", birthDate: "2004-02-03", zodiacSign: "水瓶座", baziDayPillar: "辛巳", starMansion: "心宿", avatar: "/idols/rei.jpg" },
    { name: "李贤瑞", stageName: "Leeseo", groupName: "IVE", birthDate: "2007-02-21", zodiacSign: "双鱼座", baziDayPillar: "丙戌", starMansion: "尾宿", avatar: "/idols/leeseo.jpg" },

    // ===== NewJeans =====
    { name: "金玟池", stageName: "Minji", groupName: "NewJeans", birthDate: "2004-05-07", zodiacSign: "金牛座", baziDayPillar: "甲寅", starMansion: "角宿", avatar: "/idols/minji.jpg" },
    { name: "范玉欣", stageName: "Hanni", groupName: "NewJeans", birthDate: "2004-10-06", zodiacSign: "天秤座", baziDayPillar: "丙辰", starMansion: "亢宿", avatar: "/idols/hanni.jpg" },
    { name: "牟智慧", stageName: "Danielle", groupName: "NewJeans", birthDate: "2005-04-11", zodiacSign: "白羊座", baziDayPillar: "乙丑", starMansion: "氐宿", avatar: "/idols/danielle.jpg" },
    { name: "姜海粼", stageName: "Haerin", groupName: "NewJeans", birthDate: "2006-05-15", zodiacSign: "金牛座", baziDayPillar: "庚戌", starMansion: "房宿", avatar: "/idols/haerin.jpg" },
    { name: "李惠仁", stageName: "Hyein", groupName: "NewJeans", birthDate: "2008-04-21", zodiacSign: "金牛座", baziDayPillar: "辛酉", starMansion: "心宿", avatar: "/idols/hyein.jpg" },

    // ===== LE SSERAFIM =====
    { name: "金采源", stageName: "Chaewon", groupName: "LE SSERAFIM", birthDate: "2000-08-01", zodiacSign: "狮子座", baziDayPillar: "庚寅", starMansion: "尾宿", avatar: "/idols/chaewon.jpg" },
    { name: "宫脇咲良", stageName: "Sakura", groupName: "LE SSERAFIM", birthDate: "1998-03-19", zodiacSign: "双鱼座", baziDayPillar: "乙丑", starMansion: "箕宿", avatar: "/idols/sakura.jpg" },
    { name: "许允真", stageName: "Yunjin", groupName: "LE SSERAFIM", birthDate: "2001-10-08", zodiacSign: "天秤座", baziDayPillar: "甲辰", starMansion: "斗宿", avatar: "/idols/yunjin.jpg" },
    { name: "中村一叶", stageName: "Kazuha", groupName: "LE SSERAFIM", birthDate: "2003-08-09", zodiacSign: "狮子座", baziDayPillar: "壬午", starMansion: "牛宿", avatar: "/idols/kazuha.jpg" },
    { name: "洪恩採", stageName: "Eunchae", groupName: "LE SSERAFIM", birthDate: "2006-11-10", zodiacSign: "天蝎座", baziDayPillar: "癸酉", starMansion: "女宿", avatar: "/idols/eunchae.jpg" },

    // ===== (G)I-DLE =====
    { name: "曺薇娟", stageName: "Miyeon", groupName: "(G)I-DLE", birthDate: "1997-01-31", zodiacSign: "水瓶座", baziDayPillar: "癸酉", starMansion: "虚宿", avatar: "/idols/miyeon.jpg" },
    { name: "Minnie", stageName: "Minnie", groupName: "(G)I-DLE", birthDate: "1997-10-23", zodiacSign: "天秤座", baziDayPillar: "戊戌", starMansion: "危宿", avatar: "/idols/minnie.jpg" },
    { name: "田小娟", stageName: "Soyeon", groupName: "(G)I-DLE", birthDate: "1998-08-26", zodiacSign: "处女座", baziDayPillar: "乙巳", starMansion: "室宿", avatar: "/idols/soyeon.jpg" },
    { name: "宋雨琦", stageName: "Yuqi", groupName: "(G)I-DLE", birthDate: "1999-09-23", zodiacSign: "天秤座", baziDayPillar: "壬申", starMansion: "壁宿", avatar: "/idols/yuqi.jpg" },
    { name: "叶舒华", stageName: "Shuhua", groupName: "(G)I-DLE", birthDate: "2000-01-06", zodiacSign: "摩羯座", baziDayPillar: "丁丑", starMansion: "奎宿", avatar: "/idols/shuhua.jpg" },

    // ===== ILLIT =====
    { name: "卢玧我", stageName: "Yunah", groupName: "ILLIT", birthDate: "2004-01-15", zodiacSign: "摩羯座", baziDayPillar: "壬午", starMansion: "参宿", avatar: "/idols/yunah.jpg" },
    { name: "朴敏珠", stageName: "Minju", groupName: "ILLIT", birthDate: "2004-05-11", zodiacSign: "金牛座", baziDayPillar: "戊辰", starMansion: "井宿", avatar: "/idols/minju-illit.jpg" },
    { name: "境萌花", stageName: "Moka", groupName: "ILLIT", birthDate: "2004-10-08", zodiacSign: "天秤座", baziDayPillar: "丙申", starMansion: "鬼宿", avatar: "/idols/moka.jpg" },
    { name: "李沅禧", stageName: "Wonhee", groupName: "ILLIT", birthDate: "2007-06-26", zodiacSign: "巨蟹座", baziDayPillar: "丁亥", starMansion: "柳宿", avatar: "/idols/wonhee.jpg" },
    { name: "外园彩羽", stageName: "Iroha", groupName: "ILLIT", birthDate: "2008-02-04", zodiacSign: "水瓶座", baziDayPillar: "乙丑", starMansion: "星宿", avatar: "/idols/iroha.jpg" },

    // ===== BABYMONSTER =====
    { name: "河井瑠花", stageName: "Ruka", groupName: "BABYMONSTER", birthDate: "2002-03-20", zodiacSign: "双鱼座", baziDayPillar: "丙戌", starMansion: "张宿", avatar: "/idols/ruka.jpg" },
    { name: "Pharita", stageName: "Pharita", groupName: "BABYMONSTER", birthDate: "2005-08-26", zodiacSign: "处女座", baziDayPillar: "癸未", starMansion: "翼宿", avatar: "/idols/pharita.jpg" },
    { name: "榎并杏纱", stageName: "Asa", groupName: "BABYMONSTER", birthDate: "2006-04-17", zodiacSign: "白羊座", baziDayPillar: "壬子", starMansion: "轸宿", avatar: "/idols/asa.jpg" },
    { name: "郑雅譞", stageName: "Ahyeon", groupName: "BABYMONSTER", birthDate: "2007-04-11", zodiacSign: "白羊座", baziDayPillar: "乙亥", starMansion: "角宿", avatar: "/idols/ahyeon.jpg" },
    { name: "申厦蓝", stageName: "Rami", groupName: "BABYMONSTER", birthDate: "2007-10-17", zodiacSign: "天秤座", baziDayPillar: "癸巳", starMansion: "亢宿", avatar: "/idols/rami.jpg" },
    { name: "李茶仁", stageName: "Rora", groupName: "BABYMONSTER", birthDate: "2008-08-14", zodiacSign: "狮子座", baziDayPillar: "辛巳", starMansion: "氐宿", avatar: "/idols/rora.jpg" },
    { name: "Chiquita", stageName: "Chiquita", groupName: "BABYMONSTER", birthDate: "2009-02-17", zodiacSign: "水瓶座", baziDayPillar: "戊午", starMansion: "房宿", avatar: "/idols/chiquita.jpg" },

    // ===== 内娱 =====
    { name: "鞠婧祎", stageName: "Kiku", groupName: "SNH48", birthDate: "1994-06-18", zodiacSign: "双子座", baziDayPillar: "乙亥", starMansion: "心宿", avatar: "/idols/kiku.jpg" },
    { name: "虞书欣", stageName: "Esther", groupName: "THE9", birthDate: "1995-12-18", zodiacSign: "射手座", baziDayPillar: "癸丑", starMansion: "尾宿", avatar: "/idols/esther.jpg" },
    { name: "赵露思", stageName: "Rosy", groupName: "个人", birthDate: "1998-11-09", zodiacSign: "天蝎座", baziDayPillar: "庚午", starMansion: "箕宿", avatar: "/idols/rosy.jpg" },
    { name: "白鹿", stageName: "BaiLu", groupName: "个人", birthDate: "1994-09-23", zodiacSign: "天秤座", baziDayPillar: "壬戌", starMansion: "斗宿", avatar: "/idols/bailu.jpg" },
    { name: "迪丽热巴", stageName: "Dilraba", groupName: "个人", birthDate: "1992-06-03", zodiacSign: "双子座", baziDayPillar: "庚午", starMansion: "牛宿", avatar: "/idols/dilraba.jpg" },
    { name: "杨超越", stageName: "YangChaoyue", groupName: "火箭少女101", birthDate: "1998-07-31", zodiacSign: "狮子座", baziDayPillar: "己卯", starMansion: "女宿", avatar: "/idols/chaoyue.jpg" },

    // ===== aespa =====
    { name: "柳智敏", stageName: "Karina", groupName: "aespa", birthDate: "2000-04-11", zodiacSign: "白羊座", baziDayPillar: "戊戌", starMansion: "角宿", avatar: "/idols/karina.jpg" },
    { name: "内永枝利", stageName: "Giselle", groupName: "aespa", birthDate: "2000-10-30", zodiacSign: "天蝎座", baziDayPillar: "辛酉", starMansion: "亢宿", avatar: "/idols/giselle.jpg" },
    { name: "金旼炡", stageName: "Winter", groupName: "aespa", birthDate: "2001-01-01", zodiacSign: "摩羯座", baziDayPillar: "癸亥", starMansion: "氐宿", avatar: "/idols/winter.jpg" },
    { name: "宁艺卓", stageName: "Ningning", groupName: "aespa", birthDate: "2002-10-23", zodiacSign: "天秤座", baziDayPillar: "甲子", starMansion: "房宿", avatar: "/idols/ningning.jpg" },

    // ===== ITZY =====
    { name: "黄礼志", stageName: "Yeji", groupName: "ITZY", birthDate: "2000-05-26", zodiacSign: "双子座", baziDayPillar: "甲申", starMansion: "心宿", avatar: "/idols/yeji.jpg" },
    { name: "崔智秀", stageName: "Lia", groupName: "ITZY", birthDate: "2000-07-21", zodiacSign: "巨蟹座", baziDayPillar: "戊寅", starMansion: "尾宿", avatar: "/idols/lia.jpg" },
    { name: "申留真", stageName: "Ryujin", groupName: "ITZY", birthDate: "2001-04-17", zodiacSign: "白羊座", baziDayPillar: "庚戌", starMansion: "箕宿", avatar: "/idols/ryujin.jpg" },
    { name: "李彩领", stageName: "Chaeryeong", groupName: "ITZY", birthDate: "2001-06-05", zodiacSign: "双子座", baziDayPillar: "己亥", starMansion: "斗宿", avatar: "/idols/chaeryeong.jpg" },
    { name: "申有娜", stageName: "Yuna", groupName: "ITZY", birthDate: "2003-12-09", zodiacSign: "射手座", baziDayPillar: "丙辰", starMansion: "牛宿", avatar: "/idols/yuna.jpg" },

    // ===== LE SSERAFIM =====
    { name: "金采源", stageName: "Chaewon", groupName: "LE SSERAFIM", birthDate: "2000-08-01", zodiacSign: "狮子座", baziDayPillar: "庚寅", starMansion: "女宿", avatar: "/idols/chaewon.jpg" },
    { name: "宫脇咲良", stageName: "Sakura", groupName: "LE SSERAFIM", birthDate: "1998-03-19", zodiacSign: "双鱼座", baziDayPillar: "乙丑", starMansion: "虚宿", avatar: "/idols/sakura.jpg" },
    { name: "许允真", stageName: "Yunjin", groupName: "LE SSERAFIM", birthDate: "2001-10-08", zodiacSign: "天秤座", baziDayPillar: "甲辰", starMansion: "危宿", avatar: "/idols/yunjin.jpg" },
    { name: "中村一叶", stageName: "Kazuha", groupName: "LE SSERAFIM", birthDate: "2003-08-09", zodiacSign: "狮子座", baziDayPillar: "壬午", starMansion: "室宿", avatar: "/idols/kazuha.jpg" },
    { name: "洪恩採", stageName: "Eunchae", groupName: "LE SSERAFIM", birthDate: "2006-11-10", zodiacSign: "天蝎座", baziDayPillar: "丁卯", starMansion: "壁宿", avatar: "/idols/eunchae.jpg" },

    // ===== (G)I-DLE =====
    { name: "曺薇娟", stageName: "Miyeon", groupName: "(G)I-DLE", birthDate: "1997-01-31", zodiacSign: "水瓶座", baziDayPillar: "癸酉", starMansion: "奎宿", avatar: "/idols/miyeon.jpg" },
    { name: "Minnie", stageName: "Minnie", groupName: "(G)I-DLE", birthDate: "1997-10-23", zodiacSign: "天秤座", baziDayPillar: "戊戌", starMansion: "娄宿", avatar: "/idols/minnie.jpg" },
    { name: "田小娟", stageName: "Soyeon", groupName: "(G)I-DLE", birthDate: "1998-08-26", zodiacSign: "处女座", baziDayPillar: "乙巳", starMansion: "胃宿", avatar: "/idols/soyeon.jpg" },
    { name: "宋雨琦", stageName: "Yuqi", groupName: "(G)I-DLE", birthDate: "1999-09-23", zodiacSign: "天秤座", baziDayPillar: "辛卯", starMansion: "昴宿", avatar: "/idols/yuqi.jpg" },
    { name: "叶舒华", stageName: "Shuhua", groupName: "(G)I-DLE", birthDate: "2000-01-06", zodiacSign: "摩羯座", baziDayPillar: "壬戌", starMansion: "毕宿", avatar: "/idols/shuhua.jpg" },

    // ===== TWICE =====
    { name: "林娜琏", stageName: "Nayeon", groupName: "TWICE", birthDate: "1995-09-22", zodiacSign: "处女座", baziDayPillar: "丙辰", starMansion: "井宿", avatar: "/idols/nayeon.jpg" },
    { name: "俞定延", stageName: "Jeongyeon", groupName: "TWICE", birthDate: "1996-11-01", zodiacSign: "天蝎座", baziDayPillar: "壬寅", starMansion: "鬼宿", avatar: "/idols/jeongyeon.jpg" },
    { name: "平井桃", stageName: "Momo", groupName: "TWICE", birthDate: "1996-11-09", zodiacSign: "天蝎座", baziDayPillar: "庚戌", starMansion: "柳宿", avatar: "/idols/momo.jpg" },
    { name: "凑崎纱夏", stageName: "Sana", groupName: "TWICE", birthDate: "1996-12-29", zodiacSign: "摩羯座", baziDayPillar: "庚子", starMansion: "星宿", avatar: "/idols/sana.jpg" },
    { name: "朴志效", stageName: "Jihyo", groupName: "TWICE", birthDate: "1997-02-01", zodiacSign: "水瓶座", baziDayPillar: "甲戌", starMansion: "张宿", avatar: "/idols/jihyo.jpg" },
    { name: "名井南", stageName: "Mina", groupName: "TWICE", birthDate: "1997-03-24", zodiacSign: "白羊座", baziDayPillar: "丙寅", starMansion: "翼宿", avatar: "/idols/mina.jpg" },
    { name: "金多贤", stageName: "Dahyun", groupName: "TWICE", birthDate: "1998-05-28", zodiacSign: "双子座", baziDayPillar: "乙酉", starMansion: "轸宿", avatar: "/idols/dahyun.jpg" },
    { name: "孙彩瑛", stageName: "Chaeyoung", groupName: "TWICE", birthDate: "1999-04-23", zodiacSign: "金牛座", baziDayPillar: "己亥", starMansion: "角宿", avatar: "/idols/chaeyoung.jpg" },
    { name: "周子瑜", stageName: "Tzuyu", groupName: "TWICE", birthDate: "1999-06-14", zodiacSign: "双子座", baziDayPillar: "壬午", starMansion: "亢宿", avatar: "/idols/tzuyu.jpg" },

    // ===== R1SE (内娱 - 解散团体solo) =====
    { name: "周震南", stageName: "VIN", groupName: "R1SE", birthDate: "2000-06-21", zodiacSign: "双子座", baziDayPillar: "庚午", starMansion: "井宿", avatar: "/idols/zzn.jpg" },
    { name: "何洛洛", stageName: "Luoluo", groupName: "R1SE", birthDate: "2001-05-04", zodiacSign: "金牛座", baziDayPillar: "丙寅", starMansion: "鬼宿", avatar: "/idols/hll.jpg" },
    { name: "焉栩嘉", stageName: "YanXuJia", groupName: "R1SE", birthDate: "2001-09-23", zodiacSign: "处女座", baziDayPillar: "辛巳", starMansion: "柳宿", avatar: "/idols/yxj.jpg" },
    { name: "夏之光", stageName: "X-Light", groupName: "R1SE", birthDate: "2000-01-04", zodiacSign: "摩羯座", baziDayPillar: "辛亥", starMansion: "星宿", avatar: "/idols/xzg.jpg" },
    { name: "姚琛", stageName: "YaoChen", groupName: "R1SE", birthDate: "1998-03-23", zodiacSign: "白羊座", baziDayPillar: "己巳", starMansion: "张宿", avatar: "/idols/yc.jpg" },
    { name: "翟潇闻", stageName: "ZhaiXiaoWen", groupName: "R1SE", birthDate: "1999-05-28", zodiacSign: "双子座", baziDayPillar: "庚辰", starMansion: "翼宿", avatar: "/idols/zxw.jpg" },
    { name: "张颜齐", stageName: "ZhangYanQi", groupName: "R1SE", birthDate: "1998-07-02", zodiacSign: "巨蟹座", baziDayPillar: "庚戌", starMansion: "轸宿", avatar: "/idols/zyq.jpg" },
    { name: "刘也", stageName: "LiuYe", groupName: "R1SE", birthDate: "1993-11-15", zodiacSign: "天蝎座", baziDayPillar: "丙午", starMansion: "角宿", avatar: "/idols/ly.jpg" },
    { name: "任豪", stageName: "RenHao", groupName: "R1SE", birthDate: "1995-07-17", zodiacSign: "巨蟹座", baziDayPillar: "己卯", starMansion: "亢宿", avatar: "/idols/rh.jpg" },
    { name: "赵磊", stageName: "ZhaoLei", groupName: "R1SE", birthDate: "1999-01-01", zodiacSign: "摩羯座", baziDayPillar: "癸丑", starMansion: "氐宿", avatar: "/idols/zl.jpg" },
    { name: "赵让", stageName: "ZhaoRang", groupName: "R1SE", birthDate: "2001-04-24", zodiacSign: "金牛座", baziDayPillar: "丁巳", starMansion: "房宿", avatar: "/idols/zr.jpg" },

    // ===== 日娱: 乃木坂46 =====
    { name: "斋藤飞鸟", stageName: "Asuka", groupName: "乃木坂46", birthDate: "1998-08-10", zodiacSign: "狮子座", baziDayPillar: "己丑", starMansion: "昴宿", avatar: "/idols/asuka.jpg" },
    { name: "山下美月", stageName: "Mizuki", groupName: "乃木坂46", birthDate: "1999-07-26", zodiacSign: "狮子座", baziDayPillar: "癸卯", starMansion: "毕宿", avatar: "/idols/mizuki.jpg" },
    { name: "与田祐希", stageName: "Yuki", groupName: "乃木坂46", birthDate: "2000-05-05", zodiacSign: "金牛座", baziDayPillar: "壬子", starMansion: "觜宿", avatar: "/idols/yuki.jpg" },

    // ===== 日娱: 日向坂46 =====
    { name: "小坂菜绪", stageName: "Nao", groupName: "日向坂46", birthDate: "2002-09-07", zodiacSign: "处女座", baziDayPillar: "辛巳", starMansion: "参宿", avatar: "/idols/nao.jpg" },
    { name: "齐藤京子", stageName: "Kyoko", groupName: "日向坂46", birthDate: "1997-09-05", zodiacSign: "处女座", baziDayPillar: "庚戌", starMansion: "井宿", avatar: "/idols/kyoko.jpg" },

    // ===== 日娱: 樱坂46 =====
    { name: "森田光", stageName: "Hikaru", groupName: "樱坂46", birthDate: "2001-07-10", zodiacSign: "巨蟹座", baziDayPillar: "甲辰", starMansion: "斗宿", avatar: "/idols/hikaru.jpg" },

    // ===== 内娱: INTO1 (解散团体solo) =====
    { name: "刘宇", stageName: "LiuYu", groupName: "INTO1", birthDate: "2000-08-24", zodiacSign: "处女座", baziDayPillar: "甲寅", starMansion: "角宿", avatar: "/idols/liuyu.jpg" },
    { name: "赞多", stageName: "Santa", groupName: "INTO1", birthDate: "1998-03-11", zodiacSign: "双鱼座", baziDayPillar: "丁巳", starMansion: "亢宿", avatar: "/idols/santa.jpg" },
    { name: "米卡", stageName: "Mika", groupName: "INTO1", birthDate: "1998-12-21", zodiacSign: "射手座", baziDayPillar: "壬子", starMansion: "氐宿", avatar: "/idols/mika.jpg" },
    { name: "高卿尘", stageName: "Nine", groupName: "INTO1", birthDate: "1995-07-11", zodiacSign: "巨蟹座", baziDayPillar: "癸卯", starMansion: "房宿", avatar: "/idols/nine.jpg" },
    { name: "林墨", stageName: "LinMo", groupName: "INTO1", birthDate: "2002-01-06", zodiacSign: "摩羯座", baziDayPillar: "癸亥", starMansion: "心宿", avatar: "/idols/linmo.jpg" },
    { name: "伯远", stageName: "Boyuan", groupName: "INTO1", birthDate: "1993-02-11", zodiacSign: "水瓶座", baziDayPillar: "甲子", starMansion: "尾宿", avatar: "/idols/boyuan.jpg" },
    { name: "张嘉元", stageName: "ZhangJiayuan", groupName: "INTO1", birthDate: "2003-01-08", zodiacSign: "摩羯座", baziDayPillar: "乙未", starMansion: "箕宿", avatar: "/idols/zhangjy.jpg" },
    { name: "尹浩宇", stageName: "Patrick", groupName: "INTO1", birthDate: "2003-10-20", zodiacSign: "天秤座", baziDayPillar: "丙寅", starMansion: "斗宿", avatar: "/idols/patrick.jpg" },
    { name: "周柯宇", stageName: "Daniel", groupName: "INTO1", birthDate: "2002-05-17", zodiacSign: "金牛座", baziDayPillar: "甲子", starMansion: "牛宿", avatar: "/idols/daniel.jpg" },
    { name: "刘彰", stageName: "AK", groupName: "INTO1", birthDate: "1999-12-18", zodiacSign: "射手座", baziDayPillar: "甲寅", starMansion: "女宿", avatar: "/idols/ak.jpg" },

    // ===== 内娱: THE9 (解散团体solo) =====
    { name: "刘雨昕", stageName: "XIN", groupName: "THE9", birthDate: "1997-04-20", zodiacSign: "金牛座", baziDayPillar: "壬辰", starMansion: "虚宿", avatar: "/idols/xin.jpg" },
    { name: "虞书欣", stageName: "Esther", groupName: "THE9", birthDate: "1995-12-18", zodiacSign: "射手座", baziDayPillar: "癸丑", starMansion: "危宿", avatar: "/idols/esther.jpg" },
    { name: "许佳琪", stageName: "Kiki", groupName: "THE9", birthDate: "1995-08-27", zodiacSign: "处女座", baziDayPillar: "庚寅", starMansion: "室宿", avatar: "/idols/kiki.jpg" },
    { name: "喻言", stageName: "Yuyan", groupName: "THE9", birthDate: "1997-05-26", zodiacSign: "双子座", baziDayPillar: "戊辰", starMansion: "壁宿", avatar: "/idols/yuyan.jpg" },
    { name: "谢可寅", stageName: "Shaking", groupName: "THE9", birthDate: "1997-01-04", zodiacSign: "摩羯座", baziDayPillar: "丁未", starMansion: "奎宿", avatar: "/idols/shaking.jpg" },
    { name: "安崎", stageName: "Anqi", groupName: "THE9", birthDate: "1996-05-13", zodiacSign: "金牛座", baziDayPillar: "庚戌", starMansion: "娄宿", avatar: "/idols/anqi.jpg" },
    { name: "赵小棠", stageName: "Xiaotang", groupName: "THE9", birthDate: "1997-04-02", zodiacSign: "白羊座", baziDayPillar: "甲戌", starMansion: "胃宿", avatar: "/idols/xiaotang.jpg" },
    { name: "孔雪儿", stageName: "Snow", groupName: "THE9", birthDate: "1996-04-30", zodiacSign: "金牛座", baziDayPillar: "丁酉", starMansion: "昴宿", avatar: "/idols/snow.jpg" },
    { name: "陆柯燃", stageName: "K", groupName: "THE9", birthDate: "1995-11-07", zodiacSign: "天蝎座", baziDayPillar: "壬申", starMansion: "毕宿", avatar: "/idols/k.jpg" },

    // ===== 内娱: SNH48 (现役) =====
    { name: "沈梦瑶", stageName: "ShenMengYao", groupName: "SNH48", birthDate: "1995-08-14", zodiacSign: "狮子座", baziDayPillar: "戊寅", starMansion: "井宿", avatar: "/idols/smy.jpg" },
    { name: "袁一琦", stageName: "YuanYiqi", groupName: "SNH48", birthDate: "2000-03-19", zodiacSign: "双鱼座", baziDayPillar: "丙子", starMansion: "鬼宿", avatar: "/idols/yyq.jpg" },
    { name: "王奕", stageName: "WangYi", groupName: "SNH48", birthDate: "2001-06-06", zodiacSign: "双子座", baziDayPillar: "庚子", starMansion: "柳宿", avatar: "/idols/wy.jpg" },
    { name: "周诗雨", stageName: "ZhouShiyu", groupName: "SNH48", birthDate: "1998-04-11", zodiacSign: "白羊座", baziDayPillar: "戊子", starMansion: "星宿", avatar: "/idols/zsy.jpg" },
    { name: "郑丹妮", stageName: "ZhengDanni", groupName: "SNH48", birthDate: "2001-01-26", zodiacSign: "水瓶座", baziDayPillar: "癸巳", starMansion: "张宿", avatar: "/idols/zdn.jpg" },

    // ===== 内娱: TFBOYS (个人发展) =====
    { name: "王俊凯", stageName: "Karry", groupName: "TFBOYS", birthDate: "1999-09-21", zodiacSign: "处女座", baziDayPillar: "丙寅", starMansion: "角宿", avatar: "/idols/karry.jpg" },
    { name: "王源", stageName: "Roy", groupName: "TFBOYS", birthDate: "2000-11-08", zodiacSign: "天蝎座", baziDayPillar: "庚午", starMansion: "亢宿", avatar: "/idols/roy.jpg" },
    { name: "易烊千玺", stageName: "Jackson", groupName: "TFBOYS", birthDate: "2000-11-28", zodiacSign: "射手座", baziDayPillar: "庚寅", starMansion: "氐宿", avatar: "/idols/jackson.jpg" },

    // ===== 日娱: 櫻坂46 =====
    { name: "山崎天", stageName: "Ten", groupName: "櫻坂46", birthDate: "2005-09-28", zodiacSign: "天秤座", baziDayPillar: "甲申", starMansion: "斗宿", avatar: "/idols/ten.jpg" },

    // ===== 日娱: JO1 =====
    { name: "豆原一成", stageName: "Mame", groupName: "JO1", birthDate: "2001-05-30", zodiacSign: "双子座", baziDayPillar: "壬戌", starMansion: "箕宿", avatar: "/idols/mame.jpg" },
    { name: "川西拓実", stageName: "Takumi", groupName: "JO1", birthDate: "1999-06-23", zodiacSign: "巨蟹座", baziDayPillar: "丙午", starMansion: "井宿", avatar: "/idols/takumi.jpg" },

    // ===== Stray Kids =====
    { name: "方灿", stageName: "Bang Chan", groupName: "Stray Kids", birthDate: "1997-10-03", zodiacSign: "天秤座", baziDayPillar: "戊寅", starMansion: "角宿", avatar: "/idols/bangchan.jpg" },
    { name: "李旻浩", stageName: "Lee Know", groupName: "Stray Kids", birthDate: "1998-10-25", zodiacSign: "天蝎座", baziDayPillar: "乙巳", starMansion: "亢宿", avatar: "/idols/leeknow.jpg" },
    { name: "黄铉辰", stageName: "Hyunjin", groupName: "Stray Kids", birthDate: "2000-03-20", zodiacSign: "双鱼座", baziDayPillar: "丁丑", starMansion: "氐宿", avatar: "/idols/hyunjin.jpg" },
    { name: "韩知城", stageName: "Han", groupName: "Stray Kids", birthDate: "2000-09-14", zodiacSign: "处女座", baziDayPillar: "癸酉", starMansion: "房宿", avatar: "/idols/han.jpg" },
    { name: "李龙馥", stageName: "Felix", groupName: "Stray Kids", birthDate: "2000-09-15", zodiacSign: "处女座", baziDayPillar: "甲戌", starMansion: "心宿", avatar: "/idols/felix.jpg" },
    { name: "金昇玟", stageName: "Seungmin", groupName: "Stray Kids", birthDate: "2000-09-22", zodiacSign: "处女座", baziDayPillar: "辛巳", starMansion: "尾宿", avatar: "/idols/seungmin.jpg" },
    { name: "梁精寅", stageName: "I.N", groupName: "Stray Kids", birthDate: "2001-02-08", zodiacSign: "水瓶座", baziDayPillar: "壬子", starMansion: "箕宿", avatar: "/idols/in.jpg" },

    // ===== NCT 127 / NCT DREAM / WayV =====
    { name: "文泰一", stageName: "Taeil", groupName: "NCT 127", birthDate: "1994-06-14", zodiacSign: "双子座", baziDayPillar: "辛巳", starMansion: "井宿", avatar: "/idols/taeil.jpg" },
    { name: "徐英浩", stageName: "Johnny", groupName: "NCT 127", birthDate: "1995-02-09", zodiacSign: "水瓶座", baziDayPillar: "辛未", starMansion: "鬼宿", avatar: "/idols/johnny.jpg" },
    { name: "李泰容", stageName: "Taeyong", groupName: "NCT 127", birthDate: "1995-07-01", zodiacSign: "巨蟹座", baziDayPillar: "癸巳", starMansion: "柳宿", avatar: "/idols/taeyong.jpg" },
    { name: "中本悠太", stageName: "Yuta", groupName: "NCT 127", birthDate: "1995-10-26", zodiacSign: "天蝎座", baziDayPillar: "庚申", starMansion: "星宿", avatar: "/idols/yuta.jpg" },
    { name: "金道英", stageName: "Doyoung", groupName: "NCT 127", birthDate: "1996-02-01", zodiacSign: "水瓶座", baziDayPillar: "戊辰", starMansion: "张宿", avatar: "/idols/doyoung.jpg" },
    { name: "李永钦", stageName: "Ten", groupName: "WayV", birthDate: "1996-02-27", zodiacSign: "双鱼座", baziDayPillar: "甲子", starMansion: "翼宿", avatar: "/idols/tenwayv.jpg" },
    { name: "郑在玹", stageName: "Jaehyun", groupName: "NCT 127", birthDate: "1997-02-14", zodiacSign: "水瓶座", baziDayPillar: "丁亥", starMansion: "轸宿", avatar: "/idols/jaehyun.jpg" },
    { name: "董思成", stageName: "Winwin", groupName: "WayV", birthDate: "1997-10-28", zodiacSign: "天蝎座", baziDayPillar: "癸卯", starMansion: "角宿", avatar: "/idols/winwin.jpg" },
    { name: "金廷祐", stageName: "Jungwoo", groupName: "NCT 127", birthDate: "1998-02-19", zodiacSign: "双鱼座", baziDayPillar: "丙申", starMansion: "亢宿", avatar: "/idols/jungwoo.jpg" },
    { name: "李马克", stageName: "Mark", groupName: "NCT 127", birthDate: "1999-08-02", zodiacSign: "狮子座", baziDayPillar: "丙子", starMansion: "氐宿", avatar: "/idols/mark.jpg" },
    { name: "黄冠亨", stageName: "Hendery", groupName: "WayV", birthDate: "1999-09-28", zodiacSign: "天秤座", baziDayPillar: "辛酉", starMansion: "房宿", avatar: "/idols/hendery.jpg" },
    { name: "李帝努", stageName: "Jeno", groupName: "NCT DREAM", birthDate: "2000-04-23", zodiacSign: "金牛座", baziDayPillar: "庚子", starMansion: "心宿", avatar: "/idols/jeno.jpg" },
    { name: "李东赫", stageName: "Haechan", groupName: "NCT DREAM", birthDate: "2000-06-06", zodiacSign: "双子座", baziDayPillar: "甲午", starMansion: "尾宿", avatar: "/idols/haechan.jpg" },
    { name: "罗渽民", stageName: "Jaemin", groupName: "NCT DREAM", birthDate: "2000-08-13", zodiacSign: "狮子座", baziDayPillar: "壬午", starMansion: "箕宿", avatar: "/idols/jaemin.jpg" },
    { name: "刘扬扬", stageName: "Yangyang", groupName: "WayV", birthDate: "2000-10-10", zodiacSign: "天秤座", baziDayPillar: "庚午", starMansion: "斗宿", avatar: "/idols/yangyang.jpg" },
    { name: "钟辰乐", stageName: "Chenle", groupName: "NCT DREAM", birthDate: "2001-11-22", zodiacSign: "射手座", baziDayPillar: "乙巳", starMansion: "牛宿", avatar: "/idols/chenle.jpg" },
    { name: "朴志晟", stageName: "Jisung", groupName: "NCT DREAM", birthDate: "2002-02-05", zodiacSign: "水瓶座", baziDayPillar: "癸卯", starMansion: "女宿", avatar: "/idols/pjs.jpg" },

    // ===== ENHYPEN =====
    { name: "李羲承", stageName: "Heeseung", groupName: "ENHYPEN", birthDate: "2001-10-15", zodiacSign: "天秤座", baziDayPillar: "辛亥", starMansion: "角宿", avatar: "/idols/heeseung.jpg" },
    { name: "朴综星", stageName: "Jay", groupName: "ENHYPEN", birthDate: "2002-04-20", zodiacSign: "金牛座", baziDayPillar: "戊午", starMansion: "亢宿", avatar: "/idols/jay.jpg" },
    { name: "沈载伦", stageName: "Jake", groupName: "ENHYPEN", birthDate: "2002-11-15", zodiacSign: "天蝎座", baziDayPillar: "丙辰", starMansion: "氐宿", avatar: "/idols/jake.jpg" },
    { name: "朴成训", stageName: "Sunghoon", groupName: "ENHYPEN", birthDate: "2002-12-08", zodiacSign: "射手座", baziDayPillar: "己酉", starMansion: "房宿", avatar: "/idols/sunghoon.jpg" },
    { name: "金善禹", stageName: "Sunoo", groupName: "ENHYPEN", birthDate: "2003-06-24", zodiacSign: "巨蟹座", baziDayPillar: "戊申", starMansion: "心宿", avatar: "/idols/sunoo.jpg" },
    { name: "梁祯元", stageName: "Jungwon", groupName: "ENHYPEN", birthDate: "2004-02-09", zodiacSign: "水瓶座", baziDayPillar: "乙酉", starMansion: "尾宿", avatar: "/idols/jungwon.jpg" },
    { name: "西村力", stageName: "NI-KI", groupName: "ENHYPEN", birthDate: "2005-12-09", zodiacSign: "射手座", baziDayPillar: "丁卯", starMansion: "箕宿", avatar: "/idols/niki.jpg" },

    // ===== NewJeans =====
    { name: "Minji", stageName: "Minji", groupName: "NewJeans", birthDate: "2004-05-07", zodiacSign: "金牛座", baziDayPillar: "甲寅", starMansion: "角宿", avatar: "/idols/minji.jpg" },
    { name: "Hanni", stageName: "Hanni", groupName: "NewJeans", birthDate: "2004-10-06", zodiacSign: "天秤座", baziDayPillar: "丁亥", starMansion: "亢宿", avatar: "/idols/hanni.jpg" },
    { name: "Danielle", stageName: "Danielle", groupName: "NewJeans", birthDate: "2005-04-11", zodiacSign: "白羊座", baziDayPillar: "甲子", starMansion: "氐宿", avatar: "/idols/danielle.jpg" },
    { name: "Haerin", stageName: "Haerin", groupName: "NewJeans", birthDate: "2006-05-15", zodiacSign: "金牛座", baziDayPillar: "庚戌", starMasion: "房宿", avatar: "/idols/haerin.jpg" },
    { name: "Hyein", stageName: "Hyein", groupName: "NewJeans", birthDate: "2008-04-21", zodiacSign: "金牛座", baziDayPillar: "壬辰", starMansion: "心宿", avatar: "/idols/hyein.jpg" },

    // ===== SEVENTEEN =====
    { name: "崔胜澈", stageName: "S.Coups", groupName: "SEVENTEEN", birthDate: "1995-08-08", zodiacSign: "狮子座", baziDayPillar: "辛未", starMansion: "角宿", avatar: "/idols/scoups.jpg" },
    { name: "尹净汉", stageName: "Jeonghan", groupName: "SEVENTEEN", birthDate: "1995-10-04", zodiacSign: "天秤座", baziDayPillar: "戊戌", starMansion: "亢宿", avatar: "/idols/jeonghan.jpg" },
    { name: "洪知秀", stageName: "Joshua", groupName: "SEVENTEEN", birthDate: "1995-12-30", zodiacSign: "摩羯座", baziDayPillar: "乙丑", starMansion: "氐宿", avatar: "/idols/joshua.jpg" },
    { name: "文俊辉", stageName: "Jun", groupName: "SEVENTEEN", birthDate: "1996-06-10", zodiacSign: "双子座", baziDayPillar: "戊寅", starMansion: "房宿", avatar: "/idols/jun.jpg" },
    { name: "权顺荣", stageName: "Hoshi", groupName: "SEVENTEEN", birthDate: "1996-06-15", zodiacSign: "双子座", baziDayPillar: "癸未", starMansion: "心宿", avatar: "/idols/hoshi.jpg" },
    { name: "全圆佑", stageName: "Wonwoo", groupName: "SEVENTEEN", birthDate: "1996-07-17", zodiacSign: "巨蟹座", baziDayPillar: "乙卯", starMansion: "尾宿", avatar: "/idols/wonwoo.jpg" },
    { name: "李知勋", stageName: "Woozi", groupName: "SEVENTEEN", birthDate: "1996-11-22", zodiacSign: "射手座", baziDayPillar: "癸亥", starMansion: "箕宿", avatar: "/idols/woozi.jpg" },
    { name: "徐明浩", stageName: "The8", groupName: "SEVENTEEN", birthDate: "1997-11-07", zodiacSign: "天蝎座", baziDayPillar: "癸丑", starMansion: "斗宿", avatar: "/idols/the8.jpg" },
    { name: "金珉奎", stageName: "Mingyu", groupName: "SEVENTEEN", birthDate: "1997-04-06", zodiacSign: "白羊座", baziDayPillar: "戊寅", starMansion: "牛宿", avatar: "/idols/mingyu.jpg" },
    { name: "李硕珉", stageName: "DK", groupName: "SEVENTEEN", birthDate: "1997-02-18", zodiacSign: "水瓶座", baziDayPillar: "辛卯", starMansion: "女宿", avatar: "/idols/dk.jpg" },
    { name: "夫胜宽", stageName: "Seungkwan", groupName: "SEVENTEEN", birthDate: "1998-01-16", zodiacSign: "摩羯座", baziDayPillar: "癸酉", starMansion: "虚宿", avatar: "/idols/seungkwan.jpg" },
    { name: "崔韩率", stageName: "Vernon", groupName: "SEVENTEEN", birthDate: "1998-02-18", zodiacSign: "水瓶座", baziDayPillar: "丙申", starMansion: "危宿", avatar: "/idols/vernon.jpg" },
    { name: "李灿", stageName: "Dino", groupName: "SEVENTEEN", birthDate: "1999-02-11", zodiacSign: "水瓶座", baziDayPillar: "甲午", starMansion: "室宿", avatar: "/idols/dino.jpg" },
  ];

  // Clear existing data and insert fresh
  await db.delete(artists);
  await db.insert(artists).values(artistData);
  console.log(`Inserted ${artistData.length} artists`);

  // Count groups
  const groups = new Set(artistData.map(a => a.groupName));
  console.log(`Across ${groups.size} groups: ${[...groups].join(", ")}`);

  console.log("Seed complete!");
}

seed().catch(console.error);
