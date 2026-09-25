import { transliterate } from "transliteration";

const LOCAL_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}\p{Script=Arabic}\p{Script=Cyrillic}]/u;

const STORE_NAMES = {
  qibao: "Qibao",
  shanghaiiapm: "Shanghai IAPM",
  wujiaochang: "Wujiaochang",
  nanjingeast: "Nanjing East Road",
  pudong: "Pudong",
  globalharbor: "Global Harbor",
  jingan: "Jing'an",
  hongkongplaza: "Hong Kong Plaza",
  kunming: "Kunming",
  sanlitun: "Sanlitun",
  livatbeijing: "Livat Beijing",
  chinacentralmall: "China Central Mall",
  chaoyangjoycity: "Chaoyang Joy City",
  wangfujing: "Wangfujing",
  xidanjoycity: "Xidan Joy City",
  mixcchengdu: "MixC Chengdu",
  taikoolichengdu: "Taikoo Li Chengdu",
  mixctianjin: "MixC Tianjin",
  tianjinjoycity: "Tianjin Joy City",
  riverside66tianjin: "Riverside 66 Tianjin",
  mixchefei: "MixC Hefei",
  parc66jinan: "Parc 66 Jinan",
  mixcqingdao: "MixC Qingdao",
  parccentral: "Parc Central",
  zhujiangnewtown: "Zhujiang New Town",
  uniwalkqianhai: "Uniwalk Qianhai",
  mixcshenzhen: "MixC Shenzhen",
  holidayplazashenzhen: "Holiday Plaza Shenzhen",
  mixcnanning: "MixC Nanning",
  xinjiekou: "Xinjiekou",
  xuanwulake: "Xuanwu Lake",
  wondercity: "Wonder City",
  center66wuxi: "Center 66 Wuxi",
  suzhou: "Suzhou",
  mixczhengzhou: "MixC Zhengzhou",
  tianyisquare: "Tianyi Square",
  mixchangzhou: "MixC Hangzhou",
  westlake: "West Lake",
  mixcwenzhou: "MixC Wenzhou",
  wuhan: "Wuhan",
  changsha: "Changsha",
  xiamenlifestylecenter: "Xiamen Lifestyle Center",
  tahoeplaza: "Tahoe Plaza",
  olympia66dalian: "Olympia 66 Dalian",
  zhongjiejoycity: "Zhongjie Joy City",
  mixcshenyang: "MixC Shenyang",
  jiefangbei: "Jiefangbei",
  mixcchongqing: "MixC Chongqing",
  paradisewalkchongqing: "Paradise Walk Chongqing",
  kyoto: "Kyoto",
  shinsaibashi: "Shinsaibashi",
  umeda: "Umeda",
  nagoyasakae: "Nagoya Sakae",
  ginza: "Ginza",
  marunouchi: "Marunouchi",
  shinjuku: "Shinjuku",
  shibuya: "Shibuya",
  omotesando: "Omotesando",
  kawasaki: "Kawasaki",
  fukuoka: "Fukuoka",
  hanam: "Hanam",
  garosugil: "Garosu-gil",
  gangnam: "Gangnam",
  myeongdong: "Myeongdong",
  yeouido: "Yeouido",
  jamsil: "Jamsil",
  hongdae: "Hongdae",
  xinyia13: "Xinyi A13",
  taipei101: "Taipei 101",
};

const PLACE_NAMES = {
  "上海": "Shanghai",
  "昆明": "Kunming",
  "北京": "Beijing",
  "成都": "Chengdu",
  "天津": "Tianjin",
  "合肥": "Hefei",
  "济南": "Jinan",
  "青岛": "Qingdao",
  "广州": "Guangzhou",
  "深圳": "Shenzhen",
  "南宁": "Nanning",
  "南京": "Nanjing",
  "无锡": "Wuxi",
  "苏州": "Suzhou",
  "郑州": "Zhengzhou",
  "宁波": "Ningbo",
  "杭州": "Hangzhou",
  "温州": "Wenzhou",
  "武汉": "Wuhan",
  "长沙": "Changsha",
  "厦门": "Xiamen",
  "福州": "Fuzhou",
  "大连": "Dalian",
  "沈阳": "Shenyang",
  "重庆": "Chongqing",
  "云南": "Yunnan",
  "四川": "Sichuan",
  "安徽": "Anhui",
  "山东": "Shandong",
  "广东": "Guangdong",
  "广西壮族自治区": "Guangxi Zhuang Autonomous Region",
  "江苏": "Jiangsu",
  "河南": "Henan",
  "浙江": "Zhejiang",
  "湖北": "Hubei",
  "湖南": "Hunan",
  "福建": "Fujian",
  "辽宁": "Liaoning",
  "京都市": "Kyoto",
  "大阪市": "Osaka",
  "名古屋市": "Nagoya",
  "中央区": "Tokyo",
  "千代田区": "Tokyo",
  "新宿区": "Tokyo",
  "渋谷区": "Tokyo",
  "川崎市": "Kawasaki",
  "福岡市": "Fukuoka",
  "京都府": "Kyoto Prefecture",
  "大阪府": "Osaka Prefecture",
  "愛知県": "Aichi Prefecture",
  "東京都": "Tokyo",
  "神奈川県": "Kanagawa Prefecture",
  "福岡県": "Fukuoka Prefecture",
  "경기": "Gyeonggi Province",
  "서울": "Seoul",
  "台北市": "Taipei",
  "กรุงเทพมหานคร": "Bangkok",
  Wien: "Vienna",
  Brussel: "Brussels",
  "Genève": "Geneva",
  "Zürich": "Zurich",
  "München": "Munich",
  Hannover: "Hanover",
  "Köln": "Cologne",
  Firenze: "Florence",
  Milano: "Milan",
  Roma: "Rome",
  Torino: "Turin",
  "Ciudad de México": "Mexico City",
  "Del. Cuajimalpa": "Cuajimalpa",
  "Den Haag": "The Hague",
  "Beşiktaş İstanbul": "Istanbul",
  "Kadıköy İstanbul": "Istanbul",
  "Üsküdar İstanbul": "Istanbul",
  "İstanbul": "Istanbul",
};

const COUNTRY_NAMES = {
  "Türkiye": "Turkey",
};

function cleanRomanized(value) {
  return transliterate(value)
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function englishDisplayText(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return PLACE_NAMES[text] ?? (LOCAL_SCRIPT.test(text) ? cleanRomanized(text) : text);
}

export function localizeStoreToEnglish(store) {
  const slug = String(store.sourceId ?? "").split("/").filter(Boolean).at(-1)?.toLowerCase();
  const country = COUNTRY_NAMES[store.country] ?? store.country;
  const name = STORE_NAMES[slug] ?? englishDisplayText(store.name);
  const streetAddress = englishDisplayText(store.streetAddress);
  const city = englishDisplayText(store.city);
  const state = englishDisplayText(store.state);
  return {
    ...store,
    name,
    streetAddress,
    city,
    state,
    country,
    fullAddress: [streetAddress, city, state, store.postalCode, country].filter(Boolean).join(", "),
  };
}

export function hasLocalScript(value) {
  return LOCAL_SCRIPT.test(String(value ?? ""));
}
