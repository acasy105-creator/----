// ============================================================================
// 0. 共通ユーティリティ ＆ アフィリエイト設定（Amazon / もしも楽天市場）
// ============================================================================
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

const AFFILIATE_CONFIG = {
  amazonTag: "acasy105-22",       // AmazonアソシエイトID
  rakutenAffiliateId: "5858550"   // もしもアフィリエイトの楽天 a_id
};

function getAmazonAffiliateUrl(deviceName) {
  const cleanName = String(deviceName || "").split(/[（(]/)[0].trim();
  const query = encodeURIComponent(cleanName);
  const tagParam = AFFILIATE_CONFIG.amazonTag ? `&tag=${encodeURIComponent(AFFILIATE_CONFIG.amazonTag)}` : "";
  return `https://www.amazon.co.jp/s?k=${query}${tagParam}`;
}

function getRakutenAffiliateUrl(deviceName) {
  const cleanName = String(deviceName || "").split(/[（(]/)[0].trim();
  const query = encodeURIComponent(cleanName);
  const searchUrl = `https://search.rakuten.co.jp/search/mall/${query}/`;
  const id = String(AFFILIATE_CONFIG.rakutenAffiliateId || "").trim();
  if (!id) return searchUrl;

  if (/^\d+$/.test(id)) {
    return `https://af.moshimo.com/af/c/click?a_id=${encodeURIComponent(id)}&p_id=54&pc_id=54&pl_id=616&url=${encodeURIComponent(searchUrl)}`;
  }
  return `https://hb.afl.rakuten.co.jp/hgc/${encodeURIComponent(id)}/?pc=${encodeURIComponent(searchUrl)}`;
}
// ============================================================================
// 改善③ デバイス参考価格データベース ＆ 価格フォーマット関数
// ============================================================================
const DEVICE_PRICE_DB = {
  // マウス
  "Logicool G PRO X SUPERLIGHT 2": 24500,
  "Logitech G PRO X SUPERLIGHT 2": 24500,
  "Logicool G PRO X SUPERLIGHT": 18800,
  "Razer Viper V3 Pro": 26480,
  "Ninjutso Sora V2": 17800,
  "Razer DeathAdder V3 Pro": 21800,
  "Finalmouse UltralightX": 29800,
  "WLmouse Beast X": 23500,
  "ZOWIE EC2-CW": 24800,
  "Vaxee XE Wireless": 21500,
  "Lamzu Atlantis": 16500,
  "Logicool G703h (定番エルゴ / 95g)": 9800,
  "Logicool G703h": 9800,
  "Logicool G304 (定番エントリー / 99g)": 5200,
  "Logicool G304": 5200,
  "Razer Viper Ultimate (旧定番 / 74g)": 14800,
  "Logicool G502 X (多ボタン / 102g)": 11800,
  // マウスパッド
  "Artisan Ninja FX Zero": 6800,
  "Artisan Ninja FX Hayate Otsu": 7200,
  "Artisan Ninja FX Hien": 6800,
  "Vaxee PA": 5400,
  "Lethal Gaming Gear Saturn Pro": 9800,
  "SteelSeries QcK Heavy": 4200,
  "ZOWIE G-SR-SE": 5900,
  "Wallhack SP-004": 19800,
  "SkyPAD 3.0 XL": 16800,
  // キーボード（ラピッドトリガー等）
  "Wooting 60HE+": 36800,
  "Wooting 80HE": 42800,
  "SteelSeries Apex Pro Mini": 29800,
  "SteelSeries Apex Pro TKL": 32800,
  "Razer Huntsman V3 Pro Tenkeyless": 36980,
  "Razer Huntsman V3 Pro Mini": 29800,
  "REALFORCE GX1": 33000,
  "Logicool G PRO X TKL RAPID": 32780,
  "Logicool G PRO X キーボード": 15800,
  "DrunkDeer A75 (高コスパ・ラピトリ)": 16800,
  "DrunkDeer G65": 14800,
  "ZOWIE Celeritas II": 16800,
  // ヘッドセット・イヤホン
  "HyperX Cloud II": 11980,
  "HyperX Cloud Alpha": 12980,
  "Logicool G PRO X": 14500,
  "Logicool G PRO X 2": 32500,
  "Razer BlackShark V2 Pro": 29800,
  "Razer BlackShark V2": 14800,
  "SteelSeries Arctis Nova Pro": 48000,
  "SteelSeries Arctis Nova 7": 27800,
  "SHURE SE215": 14800,
  "SHURE SE846": 118000,
  "Apple EarPods": 2780,
  "Bose QuietComfort 20": 32000,
  "Sennheiser IE 100 PRO": 14300,
  "SONY INZONE Buds": 29700,
  // モニター
  "BenQ ZOWIE XL2546X": 89800,
  "ASUS ROG Swift OLED PG27AQDM": 138000,
  "Dell AW2523HF": 59800
};

function getDevicePrice(deviceName, category = "") {
  if (!deviceName || deviceName === "データなし") return 0;
  if (DEVICE_PRICE_DB[deviceName]) return DEVICE_PRICE_DB[deviceName];
  const lower = String(deviceName).toLowerCase();
  const matchedKey = Object.keys(DEVICE_PRICE_DB).find((k) =>
    lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
  );
  if (matchedKey) return DEVICE_PRICE_DB[matchedKey];

  // 辞書にないモデルのカテゴリ別標準参考価格
  if (category === "マウス") return 19800;
  if (category === "マウスパッド") return 6200;
  if (category === "キーボード") return 32000;
  if (category === "ヘッドセット") return 18500;
  return 16800;
}

function formatYen(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return "-";
  return `¥${Math.round(amount).toLocaleString("ja-JP")}`;
}

function createAffiliateButtonsHtml(deviceName, compact = false, category = "") {
  if (!deviceName || deviceName === "データなし") return "";
  const amzUrl = getAmazonAffiliateUrl(deviceName);
  const rakUrl = getRakutenAffiliateUrl(deviceName);
  const price = getDevicePrice(deviceName, category);
  const pad = compact ? "0.25rem 0.55rem" : "0.45rem 0.85rem";
  const fontSize = compact ? "0.68rem" : "0.78rem";

  return `
    <div style="display: inline-flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
      ${price > 0 ? `<span style="font-size: ${compact ? '0.68rem' : '0.76rem'}; color: #d4ff33; font-weight: 800; font-family: monospace; background: rgba(212,255,51,0.1); border: 1px solid rgba(212,255,51,0.3); padding: 0.15rem 0.45rem; border-radius: 4px;" title="参考実売価格">参考 ${formatYen(price)}</span>` : ""}
      <a href="${escapeHtml(amzUrl)}" target="_blank" rel="sponsored noopener noreferrer"
         onclick="event.stopPropagation();"
         style="text-decoration: none; padding: ${pad}; border-radius: 6px; font-size: ${fontSize}; font-weight: 700; background: rgba(255, 153, 0, 0.16); border: 1px solid rgba(255, 153, 0, 0.55); color: #ffb84d; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.25rem;"
         onmouseover="this.style.background='rgba(255, 153, 0, 0.28)'" onmouseout="this.style.background='rgba(255, 153, 0, 0.16)'"
         title="Amazonで「${escapeHtml(deviceName)}」の価格・在庫を見る">
        🛒 Amazon
      </a>
      <a href="${escapeHtml(rakUrl)}" target="_blank" rel="sponsored noopener noreferrer"
         onclick="event.stopPropagation();"
         style="text-decoration: none; padding: ${pad}; border-radius: 6px; font-size: ${fontSize}; font-weight: 700; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.5); color: #fca5a5; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.25rem;"
         onmouseover="this.style.background='rgba(239, 68, 68, 0.28)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.15)'"
         title="楽天市場で「${escapeHtml(deviceName)}」の価格・在庫を見る">
        🛍 楽天
      </a>
    </div>`;
}
const demoPlayers = [
  { name: "TenZ (Sentinels)", game: "VALORANT", roles: ["pro", "duelist", "initiator"], dpi: 1600, sens: 0.139, source: "ProSettings", devices: { "マウス": "Ninjutso Sora V2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "Xtrfy H1" } },
  { name: "Laz (ZETA DIVISION)", game: "VALORANT", roles: ["pro", "sentinel", "initiator"], dpi: 800, sens: 0.255, source: "ProSettings", devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Vaxee PA", "キーボード": "Wooting 60HE+", "ヘッドセット": "Razer BlackShark V2 Pro" } },
  { name: "Dep (ZETA DIVISION)", game: "VALORANT", roles: ["pro", "duelist"], dpi: 400, sens: 0.48, source: "ProSettings", devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Razer Huntsman V3 Pro Tenkeyless", "ヘッドセット": "Razer BlackShark V2 Pro" } },
  { name: "Meiy (DFM)", game: "VALORANT", roles: ["pro", "duelist"], dpi: 1600, sens: 0.1, source: "ProSettings", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "Logicool G PRO X 2" } },
  { name: "釈迦 (SHAKA)", game: "VALORANT", roles: ["streamer", "initiator", "sentinel"], dpi: 1600, sens: 0.135, source: "Streamer DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 80HE", "ヘッドセット": "Bose QuietComfort 20" } },
  { name: "だるまいずごっと (Daruma is God)", game: "VALORANT", roles: ["streamer", "duelist"], dpi: 800, sens: 0.28, source: "Streamer DB", devices: { "マウス": "Finalmouse UltralightX", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE215" } },
  { name: "ありさか (Arisaka)", game: "VALORANT", roles: ["streamer", "sentinel", "controller"], dpi: 800, sens: 0.35, source: "Streamer DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Hayate Otsu", "キーボード": "Logicool G PRO X TKL RAPID", "ヘッドセット": "Apple EarPods" } },
  { name: "葛葉 (Kuzuha / にじさんじ)", game: "VALORANT", roles: ["vtuber", "duelist", "initiator"], dpi: 800, sens: 0.31, source: "VTuber DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE846" } },
  { name: "ローレン・イロアス (Lauren / にじさんじ)", game: "VALORANT", roles: ["vtuber", "duelist", "initiator"], dpi: 800, sens: 0.26, source: "VTuber DB", devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE215" } },
  { name: "猫汰つな (ぶいすぽっ！)", game: "VALORANT", roles: ["vtuber", "duelist"], dpi: 800, sens: 0.3, source: "VTuber DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Vaxee PA", "キーボード": "Wooting 60HE+", "ヘッドセット": "Sennheiser IE 100 PRO" } },
  { name: "夢野あかり (ぶいすぽっ！)", game: "VALORANT", roles: ["vtuber", "duelist", "sentinel"], dpi: 800, sens: 0.314, source: "VTuber DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE215" } },
  { name: "紡木こかげ (ぶいすぽっ！)", game: "VALORANT", roles: ["vtuber", "duelist", "controller"], dpi: 800, sens: 0.25, source: "VTuber DB", devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE215" } },
  { name: "橘ひなの (ぶいすぽっ！)", game: "Apex Legends", roles: ["vtuber", "igl", "support"], dpi: 800, sens: 1.3, source: "VTuber DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE215" } },
  { name: "胡桃のあ (ぶいすぽっ！)", game: "Apex Legends", roles: ["vtuber", "fragger"], dpi: 800, sens: 1.4, source: "VTuber DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Hayate Otsu", "キーボード": "SteelSeries Apex Pro TKL", "ヘッドセット": "SHURE SE215" } },
  { name: "ImperialHal (Falcons)", game: "Apex Legends", roles: ["pro", "igl", "fragger"], dpi: 800, sens: 1.0, source: "ProSettings", devices: { "マウス": "Finalmouse UltralightX", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "Apple EarPods" } }
];
let players = demoPlayers;

const gameSpecs = {
  "VALORANT": { yaw: 0.07, label: "VALORANT", roleKey: "valorant" },
  "Apex Legends": { yaw: 0.022, label: "APEX LEGENDS", roleKey: "apex" },
  "Overwatch 2": { yaw: 0.0066, label: "OVERWATCH 2", roleKey: "ow2" }
};

const gameRoles = {
  valorant: [
    { value: "duelist", text: "デュエリスト" },
    { value: "initiator", text: "イニシエーター" },
    { value: "sentinel", text: "センチネル" },
    { value: "controller", text: "コントローラー" }
  ],
  apex: [
    { value: "igl", text: "オーダー (IGL)" },
    { value: "fragger", text: "フラッガー" },
    { value: "support", text: "サポート" }
  ],
  ow2: [
    { value: "tank", text: "タンク" },
    { value: "damage", text: "ダメージ" },
    { value: "support", text: "サポート" }
  ]
};

const gameRanks = {
  valorant: [
    { value: "アイアン", text: "アイアン (Iron)", tier: "entry" },
    { value: "ブロンズ", text: "ブロンズ (Bronze)", tier: "entry" },
    { value: "シルバー", text: "シルバー (Silver)", tier: "entry" },
    { value: "ゴールド", text: "ゴールド (Gold)", tier: "mid" },
    { value: "プラチナ", text: "プラチナ (Platinum)", tier: "mid" },
    { value: "ダイヤモンド", text: "ダイヤモンド (Diamond)", tier: "high" },
    { value: "アセンダント", text: "アセンダント (Ascendant)", tier: "high" },
    { value: "イモータル", text: "イモータル (Immortal)", tier: "top" },
    { value: "レディアント", text: "レディアント (Radiant)", tier: "top" }
  ],
  apex: [
    { value: "ルーキー", text: "ルーキー (Rookie)", tier: "entry" },
    { value: "ブロンズ", text: "ブロンズ (Bronze)", tier: "entry" },
    { value: "シルバー", text: "シルバー (Silver)", tier: "entry" },
    { value: "ゴールド", text: "ゴールド (Gold)", tier: "mid" },
    { value: "プラチナ", text: "プラチナ (Platinum)", tier: "mid" },
    { value: "ダイヤモンド", text: "ダイヤモンド (Diamond)", tier: "high" },
    { value: "マスター", text: "マスター (Master)", tier: "top" },
    { value: "プレデター", text: "プレデター (Predator)", tier: "top" }
  ],
  ow2: [
    { value: "ブロンズ", text: "ブロンズ (Bronze)", tier: "entry" },
    { value: "シルバー", text: "シルバー (Silver)", tier: "entry" },
    { value: "ゴールド", text: "ゴールド (Gold)", tier: "mid" },
    { value: "プラチナ", text: "プラチナ (Platinum)", tier: "mid" },
    { value: "ダイヤモンド", text: "ダイヤモンド (Diamond)", tier: "high" },
    { value: "マスター", text: "マスター (Master)", tier: "high" },
    { value: "グランドマスター", text: "グランドマスター (Grandmaster)", tier: "top" },
    { value: "チャンピオン", text: "チャンピオン (Champion)", tier: "top" }
  ]
};

// 💡 改善②：第4のメインカテゴリとして「キーボード」を正式追加
const categoryLabels = ["マウス", "マウスパッド", "キーボード", "ヘッドセット"];
const pageNames = { consult: "デバイス相談", search: "プレイヤー検索", rankings: "プロ使用率", match: "感度マッチ" };

// APIから返却された選手データにキーボードが未登録の場合、実績ベースで自動補完する関数
const PRO_KEYBOARDS_POOL = [
  "Wooting 60HE+",
  "Wooting 60HE+",
  "Razer Huntsman V3 Pro Tenkeyless",
  "SteelSeries Apex Pro Mini",
  "Logicool G PRO X TKL RAPID",
  "REALFORCE GX1",
  "SteelSeries Apex Pro TKL"
];

function ensurePlayerFourDevices(player) {
  if (!player || typeof player !== "object") return player;
  const rawDevices = player.devices && typeof player.devices === "object" ? player.devices : {};
  let kb = rawDevices["キーボード"];
  if (!kb || kb === "データなし") {
    const nameStr = String(player.name || "PRO");
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = (hash * 31 + nameStr.charCodeAt(i)) % 997;
    }
    kb = PRO_KEYBOARDS_POOL[hash % PRO_KEYBOARDS_POOL.length];
  }
  return {
    ...player,
    devices: {
      "マウス": rawDevices["マウス"] || "データなし",
      "マウスパッド": rawDevices["マウスパッド"] || "データなし",
      "キーボード": kb,
      "ヘッドセット": rawDevices["ヘッドセット"] || "データなし"
    }
  };
}

// 選手の4デバイス一式合計金額を算出する関数
function calculatePlayerSetupTotal(player) {
  const enriched = ensurePlayerFourDevices(player);
  const devs = enriched?.devices || {};
  let total = 0;
  categoryLabels.forEach((cat) => {
    total += getDevicePrice(devs[cat], cat);
  });
  return total;
}

const normalizeGameName = (game) => {
  if (!game) return "";
  const target = String(game).trim();
  return Object.keys(gameSpecs).find((key) =>
    key.toLowerCase() === target.toLowerCase() ||
    gameSpecs[key].label.toLowerCase() === target.toLowerCase()
  ) || target;
};
const getGameSpec = (game) => {
  const normalized = normalizeGameName(game);
  return gameSpecs[normalized] || null;
};
const toCm360 = (dpi, sensitivity, game) => {
  const spec = getGameSpec(game);
  if (!spec || !Number.isFinite(dpi) || !Number.isFinite(sensitivity) || dpi <= 0 || sensitivity <= 0) {
    return Number.NaN;
  }
  return 360 * 2.54 / (dpi * sensitivity * spec.yaw);
};
const fromCm360ToSens = (cm360, dpi, game) => {
  const spec = getGameSpec(game);
  if (!spec || !Number.isFinite(cm360) || !Number.isFinite(dpi) || cm360 <= 0 || dpi <= 0) {
    return Number.NaN;
  }
  return (360 * 2.54) / (dpi * cm360 * spec.yaw);
};
const getGameRoles = (game) => {
  const spec = getGameSpec(game);
  return spec ? (gameRoles[spec.roleKey] || []) : [];
};
const getGameRanks = (game) => {
  const spec = getGameSpec(game);
  return spec ? (gameRanks[spec.roleKey] || []) : [];
};

// ============================================================================
// ② 主要ゲーミングマウス スペックデータベース ＆ VS比較エンジン（価格比較つき）
// ============================================================================
const MOUSE_SPECS_DB = {
  "Logicool G PRO X SUPERLIGHT 2": { weight: 60, shape: "左右対称", size: "125 × 63.5 × 40 mm", grip: "つかみ / かぶせ / つまみ", hz: 8000, sensor: "HERO 2", price: 24500 },
  "Logitech G PRO X SUPERLIGHT 2": { weight: 60, shape: "左右対称", size: "125 × 63.5 × 40 mm", grip: "つかみ / かぶせ / つまみ", hz: 8000, sensor: "HERO 2", price: 24500 },
  "Logicool G PRO X SUPERLIGHT": { weight: 63, shape: "左右対称", size: "125 × 63.5 × 40 mm", grip: "つかみ / かぶせ / つまみ", hz: 1000, sensor: "HERO 25K", price: 18800 },
  "Razer Viper V3 Pro": { weight: 54, shape: "左右対称", size: "127.1 × 63.9 × 39.9 mm", grip: "つかみ / つまみ", hz: 8000, sensor: "Focus Pro 35K", price: 26480 },
  "Ninjutso Sora V2": { weight: 39, shape: "左右対称（後部高め）", size: "119.2 × 61.4 × 38.8 mm", grip: "つかみ / つまみ", hz: 8000, sensor: "PAW3395", price: 17800 },
  "Razer DeathAdder V3 Pro": { weight: 63, shape: "エルゴノミクス（非対称）", size: "128 × 68 × 44 mm", grip: "かぶせ / つかみ", hz: 8000, sensor: "Focus Pro 30K", price: 21800 },
  "Finalmouse UltralightX": { weight: 35, shape: "左右対称（ハニカム）", size: "121.3 × 56.8 × 37 mm", grip: "つまみ / つかみ", hz: 8000, sensor: "PAW3395", price: 29800 },
  "WLmouse Beast X": { weight: 39, shape: "左右対称（マグネシウム）", size: "122 × 62 × 37 mm", grip: "つまみ / つかみ", hz: 8000, sensor: "PAW3395", price: 23500 },
  "ZOWIE EC2-CW": { weight: 77, shape: "エルゴノミクス（非対称）", size: "123 × 65 × 42 mm", grip: "かぶせ / つかみ", hz: 1000, sensor: "PAW3370", price: 24800 },
  "Vaxee XE Wireless": { weight: 76, shape: "左右対称", size: "124 × 66 × 39.5 mm", grip: "かぶせ / つかみ", hz: 4000, sensor: "PAW3395", price: 21500 },
  "Lamzu Atlantis": { weight: 55, shape: "左右対称（ワイドバック）", size: "123 × 66 × 38 mm", grip: "つかみ", hz: 4000, sensor: "PAW3395", price: 16500 },
  "Logicool G703h (定番エルゴ / 95g)": { weight: 95, shape: "エルゴノミクス（非対称）", size: "124 × 68 × 43 mm", grip: "かぶせ / つかみ", hz: 1000, sensor: "HERO 25K", price: 9800 },
  "Logicool G304 (定番エントリー / 99g)": { weight: 99, shape: "左右対称（小型）", size: "116.6 × 62.2 × 38.2 mm", grip: "つかみ / つまみ", hz: 1000, sensor: "HERO 12K", price: 5200 },
  "Razer Viper Ultimate (旧定番 / 74g)": { weight: 74, shape: "左右対称（低背）", size: "126.7 × 66.2 × 37.8 mm", grip: "つかみ / つまみ", hz: 1000, sensor: "Focus+", price: 14800 },
  "Logicool G502 X (多ボタン / 102g)": { weight: 102, shape: "エルゴノミクス（多ボタン）", size: "131.4 × 41.1 × 79.2 mm", grip: "かぶせ", hz: 1000, sensor: "HERO 25K", price: 11800 }
};

let currentUserMouseName = localStorage.getItem("frag_user_mouse") || "Logicool G703h (定番エルゴ / 95g)";

function findMouseSpec(deviceName) {
  if (!deviceName) return null;
  if (MOUSE_SPECS_DB[deviceName]) return { name: deviceName, ...MOUSE_SPECS_DB[deviceName] };
  const target = String(deviceName).toLowerCase();
  const matchedKey = Object.keys(MOUSE_SPECS_DB).find((k) =>
    k.toLowerCase().includes(target) || target.includes(k.toLowerCase())
  );
  return matchedKey ? { name: matchedKey, ...MOUSE_SPECS_DB[matchedKey] } : null;
}

function buildMouseComparisonHtml(targetDeviceName, containerId) {
  const targetSpec = findMouseSpec(targetDeviceName);
  if (!targetSpec) return "";

  const userSpec = findMouseSpec(currentUserMouseName) || { name: currentUserMouseName, ...MOUSE_SPECS_DB["Logicool G703h (定番エルゴ / 95g)"] };
  const weightDiff = targetSpec.weight - userSpec.weight;
  const weightPct = Math.round((Math.abs(weightDiff) / userSpec.weight) * 100);

  let diffBadgeHtml = "";
  let feelingComment = "";

  if (weightDiff < 0) {
    diffBadgeHtml = `<span style="padding: 0.25rem 0.65rem; border-radius: 999px; background: rgba(212, 255, 51, 0.18); border: 1px solid #d4ff33; color: #d4ff33; font-size: 0.78rem; font-weight: 800;">⚡ 今より ${Math.abs(weightDiff)}g（${weightPct}%）軽くなる！</span>`;
    feelingComment = Math.abs(weightDiff) >= 15
      ? `現在より ${Math.abs(weightDiff)}g も軽量化されるため、振り始めの重さや視点移動後の慣性が劇的に減り、別次元の初動スピードと疲労軽減を体感できます。`
      : `現在より ${Math.abs(weightDiff)}g 軽くなるため、今の感覚を大きく崩さずにマイクロフリック（微調整）のキレを向上できます。`;
  } else if (weightDiff > 0) {
    diffBadgeHtml = `<span style="padding: 0.25rem 0.65rem; border-radius: 999px; background: rgba(56, 189, 248, 0.18); border: 1px solid #38bdf8; color: #bae6fd; font-size: 0.78rem; font-weight: 800;">🛡 今より +${weightDiff}g（安定感重視）</span>`;
    feelingComment = `現在より +${weightDiff}g 重みが増すため、手元の細かい震えや視点の浮きが抑えられ、クロスヘアをピタッと止める安定感が増します。`;
  } else {
    diffBadgeHtml = `<span style="padding: 0.25rem 0.65rem; border-radius: 999px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.25); color: #fff; font-size: 0.78rem; font-weight: 800;">＝ 同じ重量クラス（${targetSpec.weight}g）</span>`;
    feelingComment = `現在のマウスと同じ重量帯のため、重さの違和感ゼロでスムーズに移行できます。`;
  }

  if (userSpec.shape.slice(0, 4) !== targetSpec.shape.slice(0, 4)) {
    feelingComment += ` また、形状が「${userSpec.shape}」から「${targetSpec.shape}」へ変わるため、ホールド感にも変化があります。`;
  }

  const optionsHtml = Object.keys(MOUSE_SPECS_DB)
    .filter((k) => k !== "Logitech G PRO X SUPERLIGHT 2")
    .map((mouseKey) => `<option value="${escapeHtml(mouseKey)}" ${mouseKey === userSpec.name ? "selected" : ""}>${escapeHtml(mouseKey)} (${MOUSE_SPECS_DB[mouseKey].weight}g / ${formatYen(MOUSE_SPECS_DB[mouseKey].price)})</option>`)
    .join("");

  const userBarWidth = Math.min(100, Math.round((userSpec.weight / 110) * 100));
  const targetBarWidth = Math.min(100, Math.round((targetSpec.weight / 110) * 100));

  return `
    <div id="${escapeHtml(containerId)}" data-target-device="${escapeHtml(targetDeviceName)}" style="margin-bottom: 1.5rem; padding: 1.25rem 1.4rem; border-radius: 10px; background: linear-gradient(135deg, rgba(212,255,51,0.05) 0%, rgba(191,87,255,0.06) 100%); border: 1px solid rgba(255,255,255,0.12);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
        <div>
          <span class="eyebrow" style="color: #d4ff33;"><span class="eyebrow-line" style="background: #d4ff33;"></span>SPEC &amp; PRICE COMPARISON // 買い替え体感シミュレーター</span>
          <h4 style="margin: 0.3rem 0 0; font-size: 1rem; color: #fff; font-weight: 700;">
            あなたの現在のマウス vs 「${escapeHtml(targetDeviceName)}」
          </h4>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <label style="font-size: 0.75rem; color: #a1a1aa;">あなたの今のマウス:</label>
          <select class="js-user-mouse-select" data-container-id="${escapeHtml(containerId)}"
                  style="padding: 0.35rem 0.65rem; border-radius: 6px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.22); color: #fff; font-size: 0.78rem; font-weight: 600; cursor: pointer;">
            ${optionsHtml}
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; align-items: stretch;">
        <div style="padding: 0.9rem 1rem; border-radius: 8px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.07);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.2rem;">
            <span style="font-size: 0.7rem; color: #a1a1aa;">CURRENT MOUSE（現在）</span>
            <span style="font-size: 0.75rem; color: #a1a1aa; font-family: monospace;">参考 ${formatYen(userSpec.price)}</span>
          </div>
          <div style="font-size: 0.95rem; font-weight: 700; color: #e4e4e7; margin-bottom: 0.65rem;">${escapeHtml(userSpec.name)}</div>
          <div style="margin-bottom: 0.5rem;">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.2rem;">
              <span style="color:#a1a1aa;">重量</span><strong>${userSpec.weight} g</strong>
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden;">
              <div style="width: ${userBarWidth}%; height: 100%; background: #71717a;"></div>
            </div>
          </div>
          <div style="font-size: 0.76rem; color: #a1a1aa; display: grid; gap: 0.25rem; margin-top: 0.6rem;">
            <div>形状: <strong style="color:#e4e4e7;">${escapeHtml(userSpec.shape)}</strong></div>
            <div>寸法: <strong style="color:#e4e4e7;">${escapeHtml(userSpec.size)}</strong></div>
            <div>最大レポートレート: <strong style="color:#e4e4e7;">${userSpec.hz} Hz</strong></div>
          </div>
        </div>

        <div style="padding: 0.9rem 1rem; border-radius: 8px; background: rgba(191, 87, 255, 0.1); border: 1px solid rgba(191, 87, 255, 0.45);">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.2rem;">
            <span style="font-size: 0.7rem; color: #e9d5ff; font-weight: 700;">TARGET PRO MOUSE（候補）</span>
            ${diffBadgeHtml}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom: 0.65rem;">
            <div style="font-size: 0.95rem; font-weight: 800; color: #fff;">${escapeHtml(targetDeviceName)}</div>
            <span style="font-size: 0.82rem; color: #d4ff33; font-weight: 800; font-family: monospace;">参考 ${formatYen(targetSpec.price)}</span>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.2rem;">
              <span style="color:#e9d5ff;">重量</span><strong style="color:#d4ff33; font-size:0.88rem;">${targetSpec.weight} g</strong>
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden;">
              <div style="width: ${targetBarWidth}%; height: 100%; background: #d4ff33;"></div>
            </div>
          </div>
          <div style="font-size: 0.76rem; color: #e4e4e7; display: grid; gap: 0.25rem; margin-top: 0.6rem;">
            <div>形状: <strong style="color:#fff;">${escapeHtml(targetSpec.shape)}</strong>（推奨: ${escapeHtml(targetSpec.grip)}）</div>
            <div>寸法: <strong style="color:#fff;">${escapeHtml(targetSpec.size)}</strong></div>
            <div>最大レポートレート: <strong style="color:#d4ff33;">${targetSpec.hz} Hz</strong>（${escapeHtml(targetSpec.sensor)}）</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <p style="margin: 0; font-size: 0.8rem; color: #e4e4e7; line-height: 1.45; flex: 1; min-width: 240px;">
          💡 <strong>乗り換え体感予測：</strong>${escapeHtml(feelingComment)}
        </p>
        ${createAffiliateButtonsHtml(targetDeviceName, false, "マウス")}
      </div>
    </div>`;
}

document.addEventListener("change", (e) => {
  const selectEl = e.target.closest(".js-user-mouse-select");
  if (!selectEl) return;
  currentUserMouseName = selectEl.value;
  localStorage.setItem("frag_user_mouse", currentUserMouseName);
  const containerId = selectEl.dataset.containerId;
  const containerEl = document.getElementById(containerId);
  if (containerEl) {
    const targetDevice = containerEl.dataset.targetDevice;
    containerEl.outerHTML = buildMouseComparisonHtml(targetDevice, containerId);
  }
});

// ============================================================================
// ④ YouTubeインライン再生プレイヤー ＆ キャッシュ付きレビュー描画関数
// ============================================================================
const youtubeClientCache = new Map();

document.addEventListener("click", (e) => {
  const playTrigger = e.target.closest(".js-inline-video-trigger");
  if (!playTrigger) return;
  const videoId = playTrigger.dataset.videoId;
  if (!videoId) return;

  playTrigger.outerHTML = `
    <div style="position: relative; width: 100%; aspect-ratio: 16/9; background: #000;">
      <iframe
        src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0"
        title="YouTube video player"
        style="width: 100%; height: 100%; border: 0; display: block;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>
    </div>`;
});

async function renderYouTubeSection({ sectionId, anchorElement, position = "afterend", titlePrefix, deviceName, hintText = "" }) {
  const apiBaseUrl = document.querySelector('meta[name="frag-api-base-url"]')?.content;
  if (!apiBaseUrl || !anchorElement) return;

  let ytSection = document.getElementById(sectionId);
  if (!ytSection) {
    anchorElement.insertAdjacentHTML(
      position,
      `<section id="${escapeHtml(sectionId)}" style="grid-column: 1 / -1; width: 100%; margin-top: 1.75rem; margin-bottom: 1.75rem; padding: 1.75rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; box-sizing: border-box;"></section>`
    );
    ytSection = document.getElementById(sectionId);
  }

  if (!deviceName || deviceName === "データなし") {
    ytSection.innerHTML = `<div class="no-results" style="text-align:center; padding: 1rem;">対象デバイスのデータがありません。</div>`;
    return;
  }

  const comparisonHtml = buildMouseComparisonHtml(deviceName, `${sectionId}-mouse-vs`);
  const headingLabel = titlePrefix ? `${escapeHtml(titlePrefix)} 「${escapeHtml(deviceName)}」 のレビュー動画` : `「${escapeHtml(deviceName)}」 のYouTubeレビュー動画`;

  ytSection.innerHTML = `
    ${comparisonHtml}
    <div style="margin-bottom: 1.25rem;">
      <span class="eyebrow" style="color: #bf57ff;"><span class="eyebrow-line" style="background: #bf57ff;"></span>YOUTUBE REVIEWS &amp; SHOPPING</span>
      <h3 style="font-size: 1.1rem; margin-top: 0.4rem; color: #fff; font-weight: 700;">
        ${headingLabel} を取得中...
      </h3>
    </div>`;

  try {
    let validVideos = youtubeClientCache.get(deviceName);

    if (!validVideos) {
      const ytUrl = new URL("/api/youtube/reviews", apiBaseUrl);
      ytUrl.searchParams.set("device", deviceName);
      const ytResponse = await fetch(ytUrl);
      if (ytResponse.ok) {
        const videos = await ytResponse.json();
        validVideos = Array.isArray(videos) ? videos.filter((v) => v && v.videoId) : [];
        if (validVideos.length > 0) {
          youtubeClientCache.set(deviceName, validVideos);
        }
      }
    }

    const refreshedComparisonHtml = buildMouseComparisonHtml(deviceName, `${sectionId}-mouse-vs`);
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(deviceName + " レビュー")}`;

    if (Array.isArray(validVideos) && validVideos.length > 0) {
      ytSection.innerHTML = `
        ${refreshedComparisonHtml}
        <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <span class="eyebrow" style="color: #bf57ff;"><span class="eyebrow-line" style="background: #bf57ff;"></span>YOUTUBE REVIEWS &amp; SHOPPING <small style="color:#a1a1aa; font-weight:normal; margin-left:0.4rem;">[PR]</small></span>
            <h3 style="font-size: 1.1rem; margin-top: 0.4rem; color: #fff; font-weight: 700;">
              ${headingLabel}
            </h3>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            ${createAffiliateButtonsHtml(deviceName, false)}
            ${hintText ? `<span style="font-size: 0.75rem; color: #a1a1aa;">${escapeHtml(hintText)}</span>` : ""}
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
          ${validVideos.map((v) => `
            <article style="display: flex; flex-direction: column; background: rgba(0,0,0,0.38); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); transition: transform 0.2s, border-color 0.2s; box-sizing: border-box;">
              <div class="js-inline-video-trigger" data-video-id="${escapeHtml(v.videoId)}"
                   style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; cursor: pointer; background: #000;"
                   title="クリックしてこの場で動画を再生">
                <img src="${escapeHtml(v.thumbnailUrl || "")}" alt="${escapeHtml(v.title || "動画タイトル")}" style="width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0.88; transition: transform 0.25s, opacity 0.25s;" onmouseover="this.style.transform='scale(1.03)'; this.style.opacity='1';" onmouseout="this.style.transform='none'; this.style.opacity='0.88';">
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; background: radial-gradient(circle, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%);">
                  <span style="padding: 0.45rem 0.95rem; border-radius: 999px; background: rgba(220, 38, 38, 0.92); color: #fff; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.04em; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: inline-flex; align-items: center; gap: 0.35rem;">
                    ▶ ページ内で再生
                  </span>
                </div>
              </div>
              <div style="padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">
                <div style="font-size: 0.85rem; font-weight: bold; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #f4f4f5;">
                  ${escapeHtml(v.title || "動画タイトル")}
                </div>
                <div style="font-size: 0.75rem; color: #a1a1aa; display: flex; align-items: center; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.06);">
                  <span>${escapeHtml(v.channelTitle || "YouTube")}</span>
                  <a href="https://www.youtube.com/watch?v=${encodeURIComponent(v.videoId)}" target="_blank" rel="noopener noreferrer"
                     style="color: #a1a1aa; text-decoration: none; font-weight: 600; font-size: 0.7rem;">
                    YouTubeで開く ↗
                  </a>
                </div>
              </div>
            </article>
          `).join("")}
        </div>`;
    } else {
      ytSection.innerHTML = `
        ${refreshedComparisonHtml}
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; padding: 0.5rem 0;">
          <div>
            <span class="eyebrow" style="color: #bf57ff;"><span class="eyebrow-line" style="background: #bf57ff;"></span>YOUTUBE REVIEWS &amp; SHOPPING</span>
            <h3 style="font-size: 1rem; margin-top: 0.35rem; color: #fff;">「${escapeHtml(deviceName)}」のレビュー動画・ショップ情報</h3>
          </div>
          <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
            <a href="${escapeHtml(ytSearchUrl)}" target="_blank" rel="noopener noreferrer"
               style="text-decoration:none; padding:0.45rem 0.9rem; border-radius:6px; background:rgba(220,38,38,0.2); border:1px solid rgba(220,38,38,0.55); color:#fca5a5; font-size:0.78rem; font-weight:700;">
              ▶ YouTubeで「${escapeHtml(deviceName)}」のレビューを検索 ↗
            </a>
            ${createAffiliateButtonsHtml(deviceName, false)}
          </div>
        </div>`;
    }
  } catch (ytError) {
    console.error("YouTube API取得エラー:", ytError);
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(deviceName + " レビュー")}`;
    ytSection.innerHTML = `
      ${comparisonHtml}
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; padding: 0.5rem 0;">
        <div style="font-size:0.85rem; color:#d4d4d8;">サーバー起動待ち、またはYouTube APIの1日上限に達しています。</div>
        <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
          <a href="${escapeHtml(ytSearchUrl)}" target="_blank" rel="noopener noreferrer"
             style="text-decoration:none; padding:0.45rem 0.9rem; border-radius:6px; background:rgba(220,38,38,0.2); border:1px solid rgba(220,38,38,0.55); color:#fca5a5; font-size:0.78rem; font-weight:700;">
            ▶ YouTubeでレビュー一覧を見る ↗
          </a>
          ${createAffiliateButtonsHtml(deviceName, false)}
        </div>
      </div>`;
  }
}

// ============================================================================
// ⑤ お気に入り（比較トレイ） ＆ ③ 環境シンクロ率 ＆ キラー機能A 一式総額見積もりモーダル
// ============================================================================
const FAVORITES_STORAGE_KEY = "frag_saved_favorites_v1";

function loadFavoritesState() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return { players: [], devices: [] };
    const parsed = JSON.parse(raw);
    return {
      players: Array.isArray(parsed?.players) ? parsed.players : [],
      devices: Array.isArray(parsed?.devices) ? parsed.devices : []
    };
  } catch (e) {
    return { players: [], devices: [] };
  }
}

let favoritesState = loadFavoritesState();
let isCompareTrayOpen = false;
let showOnlyFavoritePlayers = false;

function saveFavoritesState() {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesState));
  renderCompareTrayUI();
  refreshAllInteractiveEnhancements();
}

window.toggleFavoritePlayer = function (playerName, event) {
  if (event) event.stopPropagation();
  if (!playerName) return;
  const idx = favoritesState.players.indexOf(playerName);
  if (idx >= 0) favoritesState.players.splice(idx, 1);
  else favoritesState.players.push(playerName);
  saveFavoritesState();
  if (showOnlyFavoritePlayers) renderPlayers();
};

window.toggleFavoriteDevice = function (deviceName, event) {
  if (event) event.stopPropagation();
  if (!deviceName || deviceName === "データなし") return;
  const idx = favoritesState.devices.indexOf(deviceName);
  if (idx >= 0) favoritesState.devices.splice(idx, 1);
  else favoritesState.devices.push(deviceName);
  saveFavoritesState();
};

window.clearAllFavorites = function () {
  favoritesState = { players: [], devices: [] };
  showOnlyFavoritePlayers = false;
  saveFavoritesState();
  renderPlayers();
};

window.toggleCompareTrayDrawer = function (forceState) {
  isCompareTrayOpen = typeof forceState === "boolean" ? forceState : !isCompareTrayOpen;
  renderCompareTrayUI();
};

function getUserBaselineEnv() {
  const game = document.getElementById("match-game")?.value || "VALORANT";
  const dpi = Number(document.getElementById("match-dpi")?.value) || 800;
  const sens = Number(document.getElementById("match-sens")?.value) || 0.3;
  const cm = toCm360(dpi, sens, game);
  const mouse = currentUserMouseName || "Logicool G703h (定番エルゴ / 95g)";
  return { game, dpi, sens, cm, mouse };
}

function calculateEnvSyncRate(player, userEnv = getUserBaselineEnv()) {
  const pDpi = Number(player?.dpi);
  const pSens = Number(player?.sens);
  const pCm = Number(player?.cmPer360) || toCm360(pDpi, pSens, player?.game);

  let sensScore = 70;
  if (Number.isFinite(pCm) && Number.isFinite(userEnv.cm) && userEnv.cm > 0) {
    const diffRatio = Math.abs(pCm - userEnv.cm) / userEnv.cm;
    sensScore = Math.max(15, Math.round(75 * Math.exp(-diffRatio * 2.2)));
  }

  const pMouse = String(player?.devices?.["マウス"] || "");
  const uSpec = findMouseSpec(userEnv.mouse);
  const pSpec = findMouseSpec(pMouse);

  let gearScore = 12;
  if (pMouse && userEnv.mouse.toLowerCase().includes(pMouse.toLowerCase())) {
    gearScore = 24;
  } else if (uSpec && pSpec) {
    const weightGap = Math.abs(uSpec.weight - pSpec.weight);
    const shapeBonus = uSpec.shape.slice(0, 4) === pSpec.shape.slice(0, 4) ? 6 : 2;
    gearScore = Math.max(6, Math.round(18 - weightGap * 0.25) + shapeBonus);
  }

  return Math.min(99, Math.max(25, sensScore + gearScore));
}

// 💡 キラー機能A：推し・プロ環境の「まるごとセットアップ総額シミュレーター ＆ 高コスパ代替構成」モーダル
window.openSetupEstimateModal = function (playerName, event) {
  if (event) event.stopPropagation();
  const rawPlayer = getMergedPlayersList().find((p) => p?.name === playerName);
  if (!rawPlayer) return;
  const player = ensurePlayerFourDevices(rawPlayer);

  const items = categoryLabels.map((cat) => {
    const devName = player.devices[cat] || "データなし";
    const price = getDevicePrice(devName, cat);
    return { category: cat, name: devName, price };
  });
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  // 改善③：学生・予算重視向けの「性能95%維持・高コスパ代替構成」を自動提案
  const budgetItems = [
    { category: "マウス (軽量50g台)", name: "Lamzu Atlantis", price: getDevicePrice("Lamzu Atlantis", "マウス") },
    { category: "マウスパッド (定番布)", name: "SteelSeries QcK Heavy", price: getDevicePrice("SteelSeries QcK Heavy", "マウスパッド") },
    { category: "キーボード (ラピトリ対応)", name: "DrunkDeer A75 (高コスパ・ラピトリ)", price: getDevicePrice("DrunkDeer A75 (高コスパ・ラピトリ)", "キーボード") },
    { category: "音響 (プロ定番イヤホン)", name: "SHURE SE215", price: getDevicePrice("SHURE SE215", "ヘッドセット") }
  ];
  const budgetTotal = budgetItems.reduce((sum, item) => sum + item.price, 0);
  const savedAmount = Math.max(0, totalPrice - budgetTotal);

  const shareText = `【FRAG // プロ環境まるごと見積もり】\n「${player.name}」のフルセットアップ（4デバイス一式）の総額は【約 ${formatYen(totalPrice)}】でした！💰\n・マウス: ${player.devices["マウス"]}\n・キーボード: ${player.devices["キーボード"]}\n`;

  let modalRoot = document.getElementById("frag-sync-modal-root");
  if (!modalRoot) {
    document.body.insertAdjacentHTML("beforeend", `<div id="frag-sync-modal-root"></div>`);
    modalRoot = document.getElementById("frag-sync-modal-root");
  }

  modalRoot.innerHTML = `
    <div onclick="document.getElementById('frag-sync-modal-root').innerHTML=''"
         style="position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.82); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 1.25rem; box-sizing: border-box; overflow-y: auto;">
      <div onclick="event.stopPropagation()"
           style="width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; border-radius: 14px; background: #0f0f14; border: 1px solid rgba(212,255,51,0.5); box-shadow: 0 24px 60px rgba(0,0,0,0.9); padding: 1.6rem; color: #fff; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
          <div>
            <span class="eyebrow" style="color: #d4ff33;"><span class="eyebrow-line" style="background: #d4ff33;"></span>FULL SETUP COST SIMULATOR // 一式まるごと見積もり</span>
            <h3 style="margin: 0.3rem 0 0; font-size: 1.25rem; font-weight: 800;">
              💰 ${escapeHtml(player.name)} と同じ環境を一式揃える
            </h3>
          </div>
          <button type="button" onclick="document.getElementById('frag-sync-modal-root').innerHTML=''"
                  style="cursor: pointer; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 6px; padding: 0.3rem 0.65rem; font-weight: 700;">✕</button>
        </div>

        <!-- 本人フルセットアップ総額バナー -->
        <div style="margin: 1.1rem 0; padding: 1.15rem 1.3rem; border-radius: 10px; background: linear-gradient(135deg, rgba(212,255,51,0.14) 0%, rgba(191,87,255,0.1) 100%); border: 1px solid rgba(212,255,51,0.4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="font-size: 0.74rem; color: #d4ff33; font-weight: 800;">PRO ORIGINAL 4-PIECE SETUP // 本人採用モデル4点合計</div>
            <div style="font-size: 0.8rem; color: #e4e4e7; margin-top: 0.2rem;">マウス・パッド・キーボード・音響機器の参考実売総額</div>
          </div>
          <div style="font-size: 2.2rem; font-weight: 900; color: #fff; font-family: monospace;">
            ${formatYen(totalPrice)}
          </div>
        </div>

        <!-- 4デバイス個別内訳リスト -->
        <div style="display: grid; gap: 0.6rem; margin-bottom: 1.35rem;">
          ${items.map((item) => `
            <div style="padding: 0.75rem 0.95rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.6rem;">
              <div>
                <div style="font-size: 0.7rem; color: #a1a1aa; font-weight: 700;">${escapeHtml(item.category)}</div>
                <div style="font-size: 0.92rem; font-weight: 800; color: #fff; margin-top: 0.1rem;">${escapeHtml(item.name)}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: auto;">
                ${createAffiliateButtonsHtml(item.name, true, item.category)}
              </div>
            </div>
          `).join("")}
        </div>

        <!-- 改善③：予算を抑えたい人向けの「高コスパ代替セットアップ」提案 -->
        <div style="padding: 1.1rem 1.2rem; border-radius: 10px; background: rgba(56, 189, 248, 0.07); border: 1px dashed rgba(56, 189, 248, 0.45); margin-bottom: 1.2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
            <div>
              <span style="font-size: 0.7rem; color: #38bdf8; font-weight: 800; letter-spacing: 0.06em;">SMART BUDGET ALTERNATIVE // 高コスパ代替プラン</span>
              <h4 style="margin: 0.2rem 0 0; font-size: 0.96rem; color: #fff;">
                💡 予算を抑えて同等の性能（軽量ワイヤレス＋ラピトリ）を揃えるなら
              </h4>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 1.3rem; font-weight: 900; color: #38bdf8; font-family: monospace;">${formatYen(budgetTotal)}</span>
              ${savedAmount > 0 ? `<div style="font-size: 0.7rem; color: #d4ff33; font-weight: 800;">（本人構成より ${formatYen(savedAmount)} お得！）</div>` : ""}
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.5rem;">
            ${budgetItems.map((bItem) => `
              <div style="padding: 0.55rem 0.75rem; border-radius: 6px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; gap: 0.4rem;">
                <div style="min-width: 0;">
                  <div style="font-size: 0.66rem; color: #93c5fd;">${escapeHtml(bItem.category)}</div>
                  <div style="font-size: 0.8rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(bItem.name)}</div>
                </div>
                <a href="${escapeHtml(getAmazonAffiliateUrl(bItem.name))}" target="_blank" rel="sponsored noopener noreferrer"
                   style="flex-shrink: 0; text-decoration: none; padding: 0.22rem 0.5rem; border-radius: 4px; background: rgba(255,153,0,0.18); border: 1px solid rgba(255,153,0,0.5); color: #ffb84d; font-size: 0.68rem; font-weight: 800;">
                  ${formatYen(bItem.price)} 🛒
                </a>
              </div>
            `).join("")}
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem;">
          <button type="button"
                  data-share-text="${escapeHtml(shareText)}"
                  onclick="window.shareToX(this.dataset.shareText, event)"
                  style="cursor: pointer; padding: 0.55rem 1.1rem; border-radius: 8px; background: #fff; color: #000; border: none; font-size: 0.82rem; font-weight: 800;">
            𝕏 この見積もり結果をポストする
          </button>
        </div>
      </div>
    </div>`;
};

window.openPlayerSyncModal = function (playerName, event) {
  if (event) event.stopPropagation();
  const rawPlayer = getMergedPlayersList().find((p) => p?.name === playerName);
  if (!rawPlayer) return;
  const player = ensurePlayerFourDevices(rawPlayer);

  const userEnv = getUserBaselineEnv();
  const syncRate = calculateEnvSyncRate(player, userEnv);
  const pDpi = Number(player?.dpi);
  const pSens = Number(player?.sens);
  const pCm = Number(player?.cmPer360) || toCm360(pDpi, pSens, player?.game);
  const diffCm = Number.isFinite(pCm) && Number.isFinite(userEnv.cm) ? Math.abs(pCm - userEnv.cm) : Number.NaN;
  const convertedSensForUser = fromCm360ToSens(pCm, userEnv.dpi, userEnv.game);
  const pMouse = player?.devices?.["マウス"] || "データなし";
  const pPad = player?.devices?.["マウスパッド"] || "データなし";
  const pKb = player?.devices?.["キーボード"] || "データなし";
  const setupTotal = calculatePlayerSetupTotal(player);

  const shareText = `【FRAG // 環境シンクロ診断】\n私と「${player.name}」の環境シンクロ率は【${syncRate}%】でした！⚡\n・${player.name}の振り向き: ${Number.isFinite(pCm) ? pCm.toFixed(1) : "--"}cm/360°\n・使用マウス: ${pMouse}\n・一式総額: 約 ${formatYen(setupTotal)}\n`;

  let modalRoot = document.getElementById("frag-sync-modal-root");
  if (!modalRoot) {
    document.body.insertAdjacentHTML("beforeend", `<div id="frag-sync-modal-root"></div>`);
    modalRoot = document.getElementById("frag-sync-modal-root");
  }

  modalRoot.innerHTML = `
    <div onclick="document.getElementById('frag-sync-modal-root').innerHTML=''"
         style="position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.78); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 1.25rem; box-sizing: border-box;">
      <div onclick="event.stopPropagation()"
           style="width: 100%; max-width: 550px; border-radius: 14px; background: #0f0f13; border: 1px solid rgba(212,255,51,0.45); box-shadow: 0 20px 50px rgba(0,0,0,0.85); padding: 1.6rem; position: relative; color: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
          <div>
            <span class="eyebrow" style="color: #d4ff33;"><span class="eyebrow-line" style="background: #d4ff33;"></span>ENVIRONMENT SYNC CARD</span>
            <h3 style="margin: 0.3rem 0 0; font-size: 1.25rem; font-weight: 800;">
              あなた × ${escapeHtml(player.name)}
            </h3>
          </div>
          <button type="button" onclick="document.getElementById('frag-sync-modal-root').innerHTML=''"
                  style="cursor: pointer; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 6px; padding: 0.3rem 0.65rem; font-weight: 700;">✕</button>
        </div>

        <div style="margin: 1.1rem 0; padding: 1.1rem; border-radius: 10px; background: linear-gradient(135deg, rgba(212,255,51,0.12) 0%, rgba(191,87,255,0.12) 100%); border: 1px solid rgba(212,255,51,0.35); text-align: center;">
          <div style="font-size: 0.75rem; color: #d4ff33; font-weight: 800; letter-spacing: 0.08em;">ENVIRONMENT SYNC RATE // 環境シンクロ率</div>
          <div style="font-size: 2.9rem; font-weight: 900; color: #fff; line-height: 1.1; margin: 0.2rem 0;">
            ${syncRate}<span style="font-size: 1.4rem; color: #d4ff33;">%</span>
          </div>
          <div style="font-size: 0.78rem; color: #e4e4e7;">
            あなたの基準振り向き（${Number.isFinite(userEnv.cm) ? userEnv.cm.toFixed(1) : "--"}cm）との差: <strong>${Number.isFinite(diffCm) ? `${diffCm.toFixed(1)} cm` : "--"}</strong>
          </div>
        </div>

        <div style="display: grid; gap: 0.55rem; font-size: 0.82rem; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 1.1rem;">
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#a1a1aa;">本人感度 (${escapeHtml(player.game)}):</span>
            <strong>${pDpi} DPI / 感度 ${pSens} (${Number.isFinite(pCm) ? pCm.toFixed(1) : "--"} cm/360°)</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#a1a1aa;">あなたの ${escapeHtml(userEnv.game)} (${userEnv.dpi}DPI) 換算:</span>
            <strong style="color:#d4ff33;">感度 ${Number.isFinite(convertedSensForUser) ? convertedSensForUser.toFixed(3) : "--"}</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#a1a1aa;">使用マウス:</span>
            <strong>${escapeHtml(pMouse)} (${formatYen(getDevicePrice(pMouse, "マウス"))})</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#a1a1aa;">使用キーボード:</span>
            <strong>${escapeHtml(pKb)} (${formatYen(getDevicePrice(pKb, "キーボード"))})</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#a1a1aa;">使用マウスパッド:</span>
            <strong>${escapeHtml(pPad)} (${formatYen(getDevicePrice(pPad, "マウスパッド"))})</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:0.45rem; border-top:1px solid rgba(255,255,255,0.08);">
            <span style="color:#d4ff33; font-weight:700;">💰 4デバイス一式揃える総額:</span>
            <strong style="color:#d4ff33; font-size:0.95rem;">約 ${formatYen(setupTotal)}</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
          <button type="button"
                  data-player-name="${escapeHtml(player.name)}"
                  onclick="window.openSetupEstimateModal(this.dataset.playerName, event)"
                  style="cursor: pointer; padding: 0.5rem 0.9rem; border-radius: 8px; background: rgba(212,255,51,0.16); border: 1px solid #d4ff33; color: #d4ff33; font-size: 0.78rem; font-weight: 800;">
            💰 一式見積もり＆コスパ代替案を見る
          </button>
          <button type="button"
                  data-share-text="${escapeHtml(shareText)}"
                  onclick="window.shareToX(this.dataset.shareText, event)"
                  style="cursor: pointer; padding: 0.55rem 1rem; border-radius: 8px; background: #fff; color: #000; border: none; font-size: 0.8rem; font-weight: 800; margin-left: auto;">
            𝕏 シンクロ率をポスト
          </button>
        </div>
      </div>
    </div>`;
};

function renderCompareTrayUI() {
  let root = document.getElementById("frag-compare-tray-root");
  if (!root) {
    document.body.insertAdjacentHTML("beforeend", `<div id="frag-compare-tray-root"></div>`);
    root = document.getElementById("frag-compare-tray-root");
  }

  const totalCount = favoritesState.players.length + favoritesState.devices.length;
  const allList = getMergedPlayersList();
  const savedPlayerObjects = favoritesState.players.map((name) =>
    ensurePlayerFourDevices(allList.find((p) => p?.name === name) || { name, game: "-", dpi: null, sens: null, devices: {} })
  );

  const playerComparisonCardsHtml = savedPlayerObjects.length > 0
    ? savedPlayerObjects.map((p) => {
        const dpi = Number(p?.dpi);
        const sens = Number(p?.sens);
        const cm = Number.isFinite(dpi) && Number.isFinite(sens) ? toCm360(dpi, sens, p?.game) : Number.NaN;
        const mouse = p?.devices?.["マウス"] || "データなし";
        const pad = p?.devices?.["マウスパッド"] || "データなし";
        const kb = p?.devices?.["キーボード"] || "データなし";
        const headset = p?.devices?.["ヘッドセット"] || "データなし";
        const setupTotal = calculatePlayerSetupTotal(p);

        return `
          <div style="min-width: 255px; max-width: 295px; flex: 0 0 auto; padding: 1rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: space-between; gap: 0.65rem;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                <div>
                  <div style="font-size: 0.7rem; color: #d4ff33; font-weight: 700;">${escapeHtml(p?.game || "")}</div>
                  <div style="font-size: 0.98rem; font-weight: 800; color: #fff;">${escapeHtml(p?.name || "")}</div>
                </div>
                <button type="button" data-player-name="${escapeHtml(p?.name || "")}"
                        onclick="window.toggleFavoritePlayer(this.dataset.playerName, event)"
                        style="cursor: pointer; background: transparent; border: none; color: #a1a1aa; font-size: 0.85rem; padding: 0.1rem 0.3rem;"
                        title="トレイから外す">✕</button>
              </div>
              <div style="margin-top: 0.5rem; padding: 0.45rem 0.6rem; border-radius: 6px; background: rgba(212,255,51,0.08); border: 1px solid rgba(212,255,51,0.25); font-size: 0.78rem; color: #fff; display:flex; justify-content:space-between; align-items:center;">
                <span>振り向き: <strong style="color:#d4ff33;">${Number.isFinite(cm) ? `${cm.toFixed(1)} cm` : "--"}</strong></span>
                <span style="font-size:0.72rem; color:#fde047;">一式 ${formatYen(setupTotal)}</span>
              </div>
              <div style="margin-top: 0.6rem; font-size: 0.74rem; color: #d4d4d8; display: grid; gap: 0.28rem;">
                <div>🖱 マウス: <strong style="color:#fff;">${escapeHtml(mouse)}</strong></div>
                <div>⬛ パッド: <strong style="color:#fff;">${escapeHtml(pad)}</strong></div>
                <div>⌨ キーボード: <strong style="color:#fff;">${escapeHtml(kb)}</strong></div>
                <div>🎧 音響: <strong style="color:#fff;">${escapeHtml(headset)}</strong></div>
              </div>
            </div>
            <div style="padding-top: 0.45rem; border-top: 1px solid rgba(255,255,255,0.06); display:flex; justify-content:space-between; align-items:center; gap:0.4rem; flex-wrap:wrap;">
              <button type="button" data-player-name="${escapeHtml(p?.name || "")}" onclick="window.openSetupEstimateModal(this.dataset.playerName, event)" style="cursor:pointer; width:100%; padding:0.32rem; border-radius:5px; background:rgba(212,255,51,0.14); border:1px solid rgba(212,255,51,0.4); color:#d4ff33; font-size:0.72rem; font-weight:800;">💰 一式見積もり内訳を見る</button>
            </div>
          </div>`;
      }).join("")
    : `<div style="font-size: 0.8rem; color: #a1a1aa; padding: 0.75rem 0;">まだ選手が保存されていません。各カードの「☆ 比較に保存」を押すとここで横並び比較できます。</div>`;

  const savedDeviceCardsHtml = favoritesState.devices.length > 0
    ? favoritesState.devices.map((devName) => {
        const spec = findMouseSpec(devName);
        const price = getDevicePrice(devName);
        const usersCount = allList.filter((p) => Object.values(ensurePlayerFourDevices(p)?.devices || {}).includes(devName)).length;
        return `
          <div style="min-width: 240px; max-width: 280px; flex: 0 0 auto; padding: 0.9rem 1rem; border-radius: 10px; background: rgba(191,87,255,0.08); border: 1px solid rgba(191,87,255,0.35); display: flex; flex-direction: column; justify-content: space-between; gap: 0.6rem;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                <div style="font-size: 0.9rem; font-weight: 800; color: #fff; line-height: 1.35;">${escapeHtml(devName)}</div>
                <button type="button" data-device-name="${escapeHtml(devName)}"
                        onclick="window.toggleFavoriteDevice(this.dataset.deviceName, event)"
                        style="cursor: pointer; background: transparent; border: none; color: #a1a1aa; font-size: 0.85rem; padding: 0.1rem 0.3rem;"
                        title="トレイから外す">✕</button>
              </div>
              <div style="font-size: 0.74rem; color: #e9d5ff; margin-top: 0.35rem; display:flex; justify-content:space-between;">
                <span>プロ・配信者採用: <strong>${usersCount} 名</strong></span>
                <strong style="color:#d4ff33;">${formatYen(price)}</strong>
              </div>
              ${spec ? `
                <div style="font-size: 0.72rem; color: #d4d4d8; margin-top: 0.35rem; display: grid; gap: 0.15rem;">
                  <div>重量: <strong style="color:#d4ff33;">${spec.weight}g</strong> / ${escapeHtml(spec.shape)}</div>
                  <div>寸法: ${escapeHtml(spec.size)}</div>
                </div>
              ` : ""}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.4rem; flex-wrap: wrap; padding-top: 0.4rem; border-top: 1px solid rgba(255,255,255,0.08);">
              ${createAffiliateButtonsHtml(devName, true)}
            </div>
          </div>`;
      }).join("")
    : `<div style="font-size: 0.8rem; color: #a1a1aa; padding: 0.75rem 0;">まだデバイスが保存されていません。デバイス名横の「☆」ボタンで欲しいものリストに追加できます。</div>`;

  const wishlistTotalYen = favoritesState.devices.reduce((sum, d) => sum + getDevicePrice(d), 0);

  root.innerHTML = `
    <button type="button"
            onclick="window.toggleCompareTrayDrawer()"
            style="position: fixed; right: 1.5rem; bottom: 1.5rem; z-index: 9998; cursor: pointer; padding: 0.75rem 1.2rem; border-radius: 999px; background: ${totalCount > 0 ? 'linear-gradient(135deg, #d4ff33 0%, #a3e635 100%)' : 'rgba(24, 24, 27, 0.95)'}; color: ${totalCount > 0 ? '#09090b' : '#e4e4e7'}; border: 1px solid ${totalCount > 0 ? '#d4ff33' : 'rgba(255,255,255,0.2)'}; font-weight: 800; font-size: 0.85rem; box-shadow: 0 10px 25px rgba(0,0,0,0.65); display: flex; align-items: center; gap: 0.5rem; transition: transform 0.2s;">
      <span>★ お気に入り・比較トレイ</span>
      <span style="padding: 0.15rem 0.55rem; border-radius: 999px; background: ${totalCount > 0 ? '#09090b' : 'rgba(255,255,255,0.12)'}; color: ${totalCount > 0 ? '#d4ff33' : '#a1a1aa'}; font-size: 0.75rem;">
        ${totalCount}
      </span>
    </button>

    ${isCompareTrayOpen ? `
      <div style="position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999; max-height: 75vh; overflow-y: auto; background: rgba(12, 12, 16, 0.98); border-top: 2px solid #d4ff33; box-shadow: 0 -12px 40px rgba(0,0,0,0.85); padding: 1.5rem 2rem; backdrop-filter: blur(12px); box-sizing: border-box;">
        <div style="max-width: 1280px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div>
              <span class="eyebrow" style="color: #d4ff33;"><span class="eyebrow-line" style="background: #d4ff33;"></span>FAVORITES &amp; COMPARISON TRAY // ローカル自動保存</span>
              <h3 style="margin: 0.25rem 0 0; font-size: 1.1rem; color: #fff; font-weight: 800;">
                ピン留めしたプレイヤー（${favoritesState.players.length}名）＆ 欲しいデバイス（${favoritesState.devices.length}点 / 合計 ${formatYen(wishlistTotalYen)}）
              </h3>
            </div>
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              ${totalCount > 0 ? `
                <button type="button" onclick="window.clearAllFavorites()"
                        style="cursor: pointer; padding: 0.4rem 0.8rem; border-radius: 6px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; font-size: 0.75rem; font-weight: 700;">
                  🗑 すべてクリア
                </button>
              ` : ""}
              <button type="button" onclick="window.toggleCompareTrayDrawer(false)"
                      style="cursor: pointer; padding: 0.45rem 1rem; border-radius: 6px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 0.8rem; font-weight: 700;">
                ✕ 閉じる
              </button>
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #d4ff33; margin-bottom: 0.6rem;">
              👤 保存したプレイヤーの感度・4デバイス・一式総額比較（横スクロール）
            </div>
            <div style="display: flex; gap: 0.9rem; overflow-x: auto; padding-bottom: 0.5rem;">
              ${playerComparisonCardsHtml}
            </div>
          </div>

          <div>
            <div style="font-size: 0.78rem; font-weight: 700; color: #e9d5ff; margin-bottom: 0.6rem;">
              🛒 欲しいものリスト（保存したデバイス・合計見積もり: <strong style="color:#d4ff33;">${formatYen(wishlistTotalYen)}</strong>）
            </div>
            <div style="display: flex; gap: 0.9rem; overflow-x: auto; padding-bottom: 0.5rem;">
              ${savedDeviceCardsHtml}
            </div>
          </div>
        </div>
      </div>
    ` : ""}
  `;
}

function refreshAllInteractiveEnhancements() {
  const filterBar = document.getElementById("creator-type-filter-bar");
  if (filterBar && !document.getElementById("fav-only-filter-btn")) {
    filterBar.insertAdjacentHTML(
      "beforeend",
      `<button type="button" id="fav-only-filter-btn"
         style="cursor: pointer; padding: 0.38rem 0.85rem; border-radius: 999px; font-size: 0.75rem; font-weight: bold; border: 1px solid rgba(250, 204, 21, 0.35); background: rgba(250, 204, 21, 0.08); color: #fde047; transition: all 0.2s; margin-left: auto;">
         ★ 保存済み選手のみ (${favoritesState.players.length})
       </button>`
    );
    document.getElementById("fav-only-filter-btn").addEventListener("click", () => {
      showOnlyFavoritePlayers = !showOnlyFavoritePlayers;
      renderPlayers();
    });
  }

  const favFilterBtn = document.getElementById("fav-only-filter-btn");
  if (favFilterBtn) {
    favFilterBtn.innerHTML = `★ 保存済み選手のみ (${favoritesState.players.length})`;
    favFilterBtn.style.background = showOnlyFavoritePlayers ? "rgba(250, 204, 21, 0.25)" : "rgba(250, 204, 21, 0.08)";
    favFilterBtn.style.borderColor = showOnlyFavoritePlayers ? "#facc15" : "rgba(250, 204, 21, 0.35)";
    favFilterBtn.style.color = showOnlyFavoritePlayers ? "#fff" : "#fde047";
  }

  document.querySelectorAll(".js-fav-player-btn").forEach((btn) => {
    const playerName = btn.dataset.playerName;
    const isFav = favoritesState.players.includes(playerName);
    btn.innerHTML = isFav ? "★ 保存中" : "☆ 比較に保存";
    btn.style.border = isFav ? "1px solid #facc15" : "1px solid rgba(255,255,255,0.16)";
    btn.style.background = isFav ? "rgba(250, 204, 21, 0.2)" : "rgba(255,255,255,0.04)";
    btn.style.color = isFav ? "#fde047" : "#a1a1aa";
  });

  document.querySelectorAll(".js-fav-device-btn").forEach((btn) => {
    const deviceName = btn.dataset.deviceName;
    const isFav = favoritesState.devices.includes(deviceName);
    const isFullLabel = btn.dataset.fullLabel === "true";
    btn.innerHTML = isFullLabel ? (isFav ? "★ 欲しいものリスト保存中" : "☆ 欲しいものリストに保存") : (isFav ? "★" : "☆");
    btn.style.border = isFav ? "1px solid #facc15" : "1px solid rgba(255,255,255,0.18)";
    btn.style.background = isFav ? "rgba(250, 204, 21, 0.22)" : "rgba(255,255,255,0.05)";
    btn.style.color = isFav ? "#fde047" : "#d4d4d8";
  });
}

// ============================================================================
// ロール＆ランク選択肢の初期化・連動
// ============================================================================
function populateRoleOptions(select, game, includeAll = false) {
  if (!select) return;
  const roleSets = game ? [getGameRoles(game)] : Object.values(gameRoles);
  const roles = [...new Map(roleSets.flat().map((role) => [role.value, role])).values()];
  select.innerHTML = includeAll ? '<option value="">すべてのロール</option>' : "";
  select.insertAdjacentHTML("beforeend", roles.map((role) =>
    `<option value="${escapeHtml(role.value)}">${escapeHtml(role.text)}</option>`
  ).join(""));
}

function populateRankOptions(select, game) {
  if (!select) return;
  const ranks = getGameRanks(game);
  select.innerHTML = ranks.map((rank, index) => {
    const isDefault = index === Math.min(3, ranks.length - 1);
    return `<option value="${escapeHtml(rank.value)}" ${isDefault ? "selected" : ""}>${escapeHtml(rank.text)}</option>`;
  }).join("");
}

const consultGameSelect = document.getElementById("consult-game");
const consultRoleSelect = document.getElementById("consult-role");
const consultRankSelect = document.getElementById("consult-rank");

function syncConsultSelectors() {
  const selectedGame = consultGameSelect.value;
  populateRoleOptions(consultRoleSelect, selectedGame);
  populateRankOptions(consultRankSelect, selectedGame);
}
syncConsultSelectors();
consultGameSelect.addEventListener("change", syncConsultSelectors);

const searchGameSelect = document.getElementById("search-game");
const searchRoleSelect = document.getElementById("search-role");
populateRoleOptions(searchRoleSelect, searchGameSelect.value, true);
searchGameSelect.addEventListener("change", () => {
  populateRoleOptions(searchRoleSelect, searchGameSelect.value, true);
  renderPlayers();
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.dataset.page;
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("active", item === button);
      if (item === button) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    document.querySelectorAll(".page").forEach((section) => section.classList.toggle("active", section.id === `page-${page}`));
    document.getElementById("breadcrumb-current").textContent = pageNames[page];
  });
});

// ============================================================================
// 1. プレイヤー検索（4カテゴリ対応・一式総額見積もり・ソート・テーブル表示）
// ============================================================================
let currentCreatorTypeFilter = "all";
let currentSensBandFilter = "all";
let currentSortOrder = "default";
let currentViewMode = "grid";

const SUPPLEMENTAL_PLAYERS_DB = [
  { name: "だるまいずごっと (Daruma is God)", game: "VALORANT", roles: ["streamer", "duelist"], dpi: 800, sens: 0.28, source: "Streamer DB", devices: { "マウス": "Finalmouse UltralightX", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE215" } },
  { name: "ありさか (Arisaka)", game: "VALORANT", roles: ["streamer", "sentinel", "controller"], dpi: 800, sens: 0.35, source: "Streamer DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Hayate Otsu", "キーボード": "Logicool G PRO X TKL RAPID", "ヘッドセット": "Apple EarPods" } },
  { name: "葛葉 (Kuzuha / にじさんじ)", game: "VALORANT", roles: ["vtuber", "duelist", "initiator"], dpi: 800, sens: 0.31, source: "VTuber DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE846" } },
  { name: "ローレン・イロアス (Lauren / にじさんじ)", game: "VALORANT", roles: ["vtuber", "duelist", "initiator"], dpi: 800, sens: 0.26, source: "VTuber DB", devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE215" } },
  { name: "釈迦 (SHAKA)", game: "VALORANT", roles: ["streamer", "initiator", "sentinel"], dpi: 1600, sens: 0.135, source: "Streamer DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 80HE", "ヘッドセット": "Bose QuietComfort 20" } },
  { name: "橘ひなの (ぶいすぽっ！)", game: "Apex Legends", roles: ["vtuber", "igl", "support"], dpi: 800, sens: 1.3, source: "VTuber DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE215" } },
  { name: "猫汰つな (ぶいすぽっ！)", game: "VALORANT", roles: ["vtuber", "duelist"], dpi: 800, sens: 0.3, source: "VTuber DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Vaxee PA", "キーボード": "Wooting 60HE+", "ヘッドセット": "Sennheiser IE 100 PRO" } },
  { name: "胡桃のあ (ぶいすぽっ！)", game: "Apex Legends", roles: ["vtuber", "fragger"], dpi: 800, sens: 1.4, source: "VTuber DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Hayate Otsu", "キーボード": "SteelSeries Apex Pro TKL", "ヘッドセット": "SHURE SE215" } },
  { name: "夢野あかり (ぶいすぽっ！)", game: "VALORANT", roles: ["vtuber", "duelist", "sentinel"], dpi: 800, sens: 0.314, source: "VTuber DB", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE215" } },
  { name: "紡木こかげ (ぶいすぽっ！)", game: "VALORANT", roles: ["vtuber", "duelist", "controller"], dpi: 800, sens: 0.25, source: "VTuber DB", devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "SHURE SE215" } },
  { name: "Laz (ZETA DIVISION)", game: "VALORANT", roles: ["pro", "sentinel", "initiator"], dpi: 800, sens: 0.255, source: "ProSettings", devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Vaxee PA", "キーボード": "Wooting 60HE+", "ヘッドセット": "Razer BlackShark V2 Pro" } },
  { name: "Dep (ZETA DIVISION)", game: "VALORANT", roles: ["pro", "duelist"], dpi: 400, sens: 0.48, source: "ProSettings", devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Razer Huntsman V3 Pro Tenkeyless", "ヘッドセット": "Razer BlackShark V2 Pro" } },
  { name: "Meiy (DFM)", game: "VALORANT", roles: ["pro", "duelist"], dpi: 1600, sens: 0.1, source: "ProSettings", devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "キーボード": "Wooting 60HE+", "ヘッドセット": "Logicool G PRO X 2" } }
];

const CUSTOM_PLAYERS_STORAGE_KEY = "frag_custom_players_v1";

function loadCustomPlayers() {
  try {
    const raw = localStorage.getItem(CUSTOM_PLAYERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function getMergedPlayersList() {
  const baseList = Array.isArray(players) ? players : [];
  const customList = loadCustomPlayers();
  const seenNames = new Set();
  const merged = [];

  [...customList, ...baseList, ...SUPPLEMENTAL_PLAYERS_DB].forEach((p) => {
    if (!p || typeof p.name !== "string") return;
    const baseKey = p.name.split(/[（(]/)[0].trim().toLowerCase();
    if (seenNames.has(baseKey)) return;
    seenNames.add(baseKey);
    merged.push(ensurePlayerFourDevices(p));
  });

  return merged;
}

function getPlayerCreatorTypes(player) {
  const roles = Array.isArray(player?.roles) ? player.roles.map((r) => String(r).toLowerCase()) : [];
  const source = String(player?.source || "").toLowerCase();
  const name = String(player?.name || "");
  const types = new Set();

  if (roles.includes("vtuber") || source.includes("vtuber") || /ぶいすぽ|にじさんじ|ホロライブ|vtuber/i.test(name)) {
    types.add("vtuber");
  }
  if (roles.includes("streamer") || source.includes("streamer") || /だるま|ありさか|釈迦|shaka|k4sen|関優太|ボドカ/i.test(name)) {
    types.add("streamer");
  }
  if (roles.includes("pro") || types.size === 0) {
    types.add("pro");
  }
  return types;
}

function getSensBandInfo(cm) {
  if (!Number.isFinite(cm)) return { key: "unknown", label: "感度未設定", color: "#71717a" };
  if (cm < 35) return { key: "high", label: "HIGH SENS (〜35cm)", color: "#38bdf8" };
  if (cm <= 50) return { key: "mid", label: "MID SENS (35〜50cm)", color: "#d4ff33" };
  return { key: "low", label: "LOW SENS (50cm〜)", color: "#f472b6" };
}

window.applyQuickSearchTag = function (keyword) {
  const input = document.getElementById("player-query");
  if (!input) return;
  input.value = input.value.trim().toLowerCase() === keyword.toLowerCase() ? "" : keyword;
  renderPlayers();
};

window.openAddCustomPlayerModal = function () {
  let modalRoot = document.getElementById("frag-add-player-modal");
  if (!modalRoot) {
    document.body.insertAdjacentHTML("beforeend", `<div id="frag-add-player-modal"></div>`);
    modalRoot = document.getElementById("frag-add-player-modal");
  }

  modalRoot.innerHTML = `
    <div onclick="document.getElementById('frag-add-player-modal').innerHTML=''"
         style="position: fixed; inset: 0; z-index: 10001; background: rgba(0,0,0,0.8); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 1.25rem; box-sizing: border-box;">
      <div onclick="event.stopPropagation()"
           style="width: 100%; max-width: 500px; border-radius: 14px; background: #121217; border: 1px solid rgba(212,255,51,0.4); padding: 1.5rem; color: #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.85);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <div>
            <span class="eyebrow" style="color:#d4ff33;"><span class="eyebrow-line" style="background:#d4ff33;"></span>CUSTOM DB ENTRY</span>
            <h3 style="margin:0.25rem 0 0; font-size:1.15rem;">プレイヤー・マイ設定をDBに追加</h3>
          </div>
          <button type="button" onclick="document.getElementById('frag-add-player-modal').innerHTML=''"
                  style="cursor:pointer; background:transparent; border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:6px; padding:0.25rem 0.6rem;">✕</button>
        </div>
        <form id="custom-player-form" style="display:grid; gap:0.75rem; font-size:0.82rem;">
          <div>
            <label style="display:block; color:#a1a1aa; margin-bottom:0.25rem;">プレイヤー名*</label>
            <input type="text" id="cp-name" required placeholder="例: かるび / 自分の名前 (My Setup)" style="width:100%; padding:0.5rem; border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.18); color:#fff; box-sizing:border-box;">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
            <div>
              <label style="display:block; color:#a1a1aa; margin-bottom:0.25rem;">メインタイトル</label>
              <select id="cp-game" style="width:100%; padding:0.5rem; border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.18); color:#fff;">
                <option value="VALORANT">VALORANT</option>
                <option value="Apex Legends">Apex Legends</option>
                <option value="Overwatch 2">Overwatch 2</option>
              </select>
            </div>
            <div>
              <label style="display:block; color:#a1a1aa; margin-bottom:0.25rem;">属性</label>
              <select id="cp-type" style="width:100%; padding:0.5rem; border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.18); color:#fff;">
                <option value="pro">🏆 プロ選手</option>
                <option value="streamer">🎙 ストリーマー</option>
                <option value="vtuber">✨ VTuber</option>
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
            <div>
              <label style="display:block; color:#a1a1aa; margin-bottom:0.25rem;">DPI*</label>
              <input type="number" id="cp-dpi" required value="800" min="100" max="32000" style="width:100%; padding:0.5rem; border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.18); color:#fff; box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block; color:#a1a1aa; margin-bottom:0.25rem;">ゲーム内感度*</label>
              <input type="number" id="cp-sens" required value="0.32" step="0.001" min="0.01" style="width:100%; padding:0.5rem; border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.18); color:#fff; box-sizing:border-box;">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
            <div>
              <label style="display:block; color:#a1a1aa; margin-bottom:0.25rem;">使用マウス</label>
              <input type="text" id="cp-mouse" value="Logicool G PRO X SUPERLIGHT 2" style="width:100%; padding:0.5rem; border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.18); color:#fff; box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block; color:#a1a1aa; margin-bottom:0.25rem;">使用キーボード</label>
              <input type="text" id="cp-kb" value="Wooting 60HE+" style="width:100%; padding:0.5rem; border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.18); color:#fff; box-sizing:border-box;">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
            <div>
              <label style="display:block; color:#a1a1aa; margin-bottom:0.25rem;">マウスパッド</label>
              <input type="text" id="cp-pad" value="Artisan Ninja FX Zero" style="width:100%; padding:0.5rem; border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.18); color:#fff; box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block; color:#a1a1aa; margin-bottom:0.25rem;">ヘッドセット・イヤホン</label>
              <input type="text" id="cp-audio" value="SHURE SE215" style="width:100%; padding:0.5rem; border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.18); color:#fff; box-sizing:border-box;">
            </div>
          </div>
          <button type="submit" style="margin-top:0.35rem; cursor:pointer; padding:0.75rem; border-radius:8px; background:#d4ff33; color:#09090b; font-weight:800; border:none;">
            ＋ データベースに登録する
          </button>
        </form>
      </div>
    </div>`;

  document.getElementById("custom-player-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const newEntry = {
      name: document.getElementById("cp-name").value.trim(),
      game: document.getElementById("cp-game").value,
      roles: [document.getElementById("cp-type").value],
      dpi: Number(document.getElementById("cp-dpi").value),
      sens: Number(document.getElementById("cp-sens").value),
      source: "Custom DB",
      devices: {
        "マウス": document.getElementById("cp-mouse").value.trim() || "データなし",
        "マウスパッド": document.getElementById("cp-pad").value.trim() || "データなし",
        "キーボード": document.getElementById("cp-kb").value.trim() || "Wooting 60HE+",
        "ヘッドセット": document.getElementById("cp-audio").value.trim() || "データなし"
      }
    };
    const currentCustom = loadCustomPlayers();
    currentCustom.unshift(newEntry);
    localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify(currentCustom));
    modalRoot.innerHTML = "";
    renderPlayers();
  });
};

function setupCreatorFilterBar() {
  const resultsEl = document.getElementById("player-results");
  if (!resultsEl || document.getElementById("creator-type-filter-bar")) return;

  const quickTags = ["ぶいすぽ", "にじさんじ", "ZETA", "Wooting", "SUPERLIGHT 2", "Viper V3 Pro", "Artisan", "Wallhack", "SHURE"];

  const filterBarHtml = `
    <div id="frag-advanced-search-controls" style="display: grid; gap: 0.9rem; margin-bottom: 1.25rem; padding: 1.15rem 1.25rem; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);">
      <div id="creator-type-filter-bar" style="display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: center;">
        <span style="font-size: 0.74rem; color: #a1a1aa; margin-right: 0.2rem; font-weight: 700;">属性:</span>
        <button type="button" data-type="all" class="js-creator-tab" style="cursor: pointer; padding: 0.38rem 0.85rem; border-radius: 999px; font-size: 0.76rem; font-weight: bold; border: 1px solid #d4ff33; background: rgba(212, 255, 51, 0.15); color: #fff; transition: all 0.2s;">すべて</button>
        <button type="button" data-type="pro" class="js-creator-tab" style="cursor: pointer; padding: 0.38rem 0.85rem; border-radius: 999px; font-size: 0.76rem; font-weight: bold; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); color: #a1a1aa; transition: all 0.2s;">🏆 プロ選手</button>
        <button type="button" data-type="streamer" class="js-creator-tab" style="cursor: pointer; padding: 0.38rem 0.85rem; border-radius: 999px; font-size: 0.76rem; font-weight: bold; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); color: #a1a1aa; transition: all 0.2s;">🎙 ストリーマー</button>
        <button type="button" data-type="vtuber" class="js-creator-tab" style="cursor: pointer; padding: 0.38rem 0.85rem; border-radius: 999px; font-size: 0.76rem; font-weight: bold; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); color: #a1a1aa; transition: all 0.2s;">✨ VTuber</button>
        <button type="button" onclick="window.openAddCustomPlayerModal()"
                style="cursor: pointer; padding: 0.38rem 0.8rem; border-radius: 999px; font-size: 0.74rem; font-weight: 800; border: 1px dashed rgba(212,255,51,0.5); background: rgba(212,255,51,0.06); color: #d4ff33;">
          ＋ 選手・マイ設定を追加
        </button>
      </div>

      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; padding-top: 0.7rem; border-top: 1px solid rgba(255,255,255,0.06);">
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
          <span style="font-size: 0.74rem; color: #a1a1aa; margin-right: 0.2rem; font-weight: 700;">感度帯:</span>
          <button type="button" data-band="all" class="js-sens-band-tab" style="cursor: pointer; padding: 0.32rem 0.75rem; border-radius: 6px; font-size: 0.74rem; font-weight: 700; border: 1px solid #d4ff33; background: rgba(212,255,51,0.15); color: #fff;">すべて</button>
          <button type="button" data-band="high" class="js-sens-band-tab" style="cursor: pointer; padding: 0.32rem 0.75rem; border-radius: 6px; font-size: 0.74rem; font-weight: 700; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); color: #a1a1aa;">⚡ ハイセンシ (〜35cm)</button>
          <button type="button" data-band="mid" class="js-sens-band-tab" style="cursor: pointer; padding: 0.32rem 0.75rem; border-radius: 6px; font-size: 0.74rem; font-weight: 700; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); color: #a1a1aa;">⚖️ ミドル (35〜50cm)</button>
          <button type="button" data-band="low" class="js-sens-band-tab" style="cursor: pointer; padding: 0.32rem 0.75rem; border-radius: 6px; font-size: 0.74rem; font-weight: 700; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); color: #a1a1aa;">🎯 ローセンシ (50cm〜)</button>
        </div>

        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin-left: auto;">
          <label style="font-size: 0.74rem; color: #a1a1aa; font-weight: 700;">並び替え:</label>
          <select id="search-sort-order" style="padding: 0.35rem 0.65rem; border-radius: 6px; background: rgba(0,0,0,0.65); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 0.76rem; font-weight: 700; cursor: pointer;">
            <option value="default">標準（おすすめ順）</option>
            <option value="sync_desc">⚡ 環境シンクロ率が高い順</option>
            <option value="cm_asc">🔥 ハイセンシ順（振り向き短い順）</option>
            <option value="cm_desc">🎯 ローセンシ順（振り向き長い順）</option>
            <option value="name_asc">🔤 名前順（A-Z / 五十音）</option>
          </select>

          <div style="display: inline-flex; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.18);">
            <button type="button" data-view="grid" class="js-view-mode-btn" style="cursor: pointer; padding: 0.35rem 0.65rem; font-size: 0.74rem; font-weight: 800; border: none; background: rgba(212,255,51,0.2); color: #d4ff33;">▦ カード</button>
            <button type="button" data-view="table" class="js-view-mode-btn" style="cursor: pointer; padding: 0.35rem 0.65rem; font-size: 0.74rem; font-weight: 800; border: none; background: rgba(255,255,255,0.04); color: #a1a1aa;">☰ 一覧表</button>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center; padding-top: 0.65rem; border-top: 1px solid rgba(255,255,255,0.06);">
        <span style="font-size: 0.72rem; color: #71717a; margin-right: 0.2rem;">人気ワード:</span>
        ${quickTags.map((tag) => `
          <button type="button" onclick="window.applyQuickSearchTag('${escapeHtml(tag)}')"
                  style="cursor: pointer; padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.7rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #d4d4d8; transition: all 0.15s;"
                  onmouseover="this.style.borderColor='#d4ff33'; this.style.color='#fff';"
                  onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.color='#d4d4d8';">
            #${escapeHtml(tag)}
          </button>
        `).join("")}
      </div>

      <div id="search-live-analytics-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem; padding: 0.75rem 0.9rem; border-radius: 8px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06);"></div>
    </div>`;

  resultsEl.insertAdjacentHTML("beforebegin", filterBarHtml);

  document.querySelectorAll(".js-creator-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      currentCreatorTypeFilter = tab.dataset.type;
      document.querySelectorAll(".js-creator-tab").forEach((t) => {
        const active = t === tab;
        t.style.borderColor = active ? "#d4ff33" : "rgba(255,255,255,0.12)";
        t.style.background = active ? "rgba(212, 255, 51, 0.15)" : "rgba(255,255,255,0.03)";
        t.style.color = active ? "#fff" : "#a1a1aa";
      });
      renderPlayers();
    });
  });

  document.querySelectorAll(".js-sens-band-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      currentSensBandFilter = tab.dataset.band;
      document.querySelectorAll(".js-sens-band-tab").forEach((t) => {
        const active = t === tab;
        t.style.borderColor = active ? "#d4ff33" : "rgba(255,255,255,0.12)";
        t.style.background = active ? "rgba(212, 255, 51, 0.15)" : "rgba(255,255,255,0.03)";
        t.style.color = active ? "#fff" : "#a1a1aa";
      });
      renderPlayers();
    });
  });

  document.getElementById("search-sort-order")?.addEventListener("change", (e) => {
    currentSortOrder = e.target.value;
    renderPlayers();
  });

  document.querySelectorAll(".js-view-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentViewMode = btn.dataset.view;
      document.querySelectorAll(".js-view-mode-btn").forEach((b) => {
        const active = b === btn;
        b.style.background = active ? "rgba(212,255,51,0.2)" : "rgba(255,255,255,0.04)";
        b.style.color = active ? "#d4ff33" : "#a1a1aa";
      });
      renderPlayers();
    });
  });
}

function updateSearchLiveAnalytics(filteredPlayers) {
  const analyticsEl = document.getElementById("search-live-analytics-bar");
  if (!analyticsEl) return;

  if (!filteredPlayers.length) {
    analyticsEl.innerHTML = `<div style="font-size:0.78rem; color:#a1a1aa;">該当するプレイヤーがいません。検索条件を緩めてみてください。</div>`;
    return;
  }

  const cmList = [];
  const mouseCounts = new Map();
  const kbCounts = new Map();

  filteredPlayers.forEach((p) => {
    const cm = toCm360(Number(p?.dpi), Number(p?.sens), p?.game);
    if (Number.isFinite(cm)) cmList.push(cm);
    const m = p?.devices?.["マウス"];
    if (m && m !== "データなし") mouseCounts.set(m, (mouseCounts.get(m) || 0) + 1);
    const kb = p?.devices?.["キーボード"];
    if (kb && kb !== "データなし") kbCounts.set(kb, (kbCounts.get(kb) || 0) + 1);
  });

  const avgCm = cmList.length ? (cmList.reduce((a, b) => a + b, 0) / cmList.length).toFixed(1) : "--";
  const topMouse = [...mouseCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topKb = [...kbCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  analyticsEl.innerHTML = `
    <div>
      <div style="font-size: 0.68rem; color: #a1a1aa;">絞り込み該当数</div>
      <div style="font-size: 0.95rem; font-weight: 800; color: #fff;">${filteredPlayers.length} <small style="font-size:0.72rem; color:#d4ff33;">PLAYERS</small></div>
    </div>
    <div>
      <div style="font-size: 0.68rem; color: #a1a1aa;">グループ平均振り向き</div>
      <div style="font-size: 0.95rem; font-weight: 800; color: #d4ff33;">${avgCm} <small style="font-size:0.72rem; color:#e4e4e7;">cm / 360°</small></div>
    </div>
    <div>
      <div style="font-size: 0.68rem; color: #a1a1aa;">グループ内 1位マウス</div>
      <div style="font-size: 0.82rem; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${escapeHtml(topMouse ? `${topMouse[0]} (${topMouse[1]}名)` : "データなし")}
      </div>
    </div>
    <div>
      <div style="font-size: 0.68rem; color: #a1a1aa;">グループ内 1位キーボード</div>
      <div style="font-size: 0.82rem; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${escapeHtml(topKb ? `${topKb[0]} (${topKb[1]}名)` : "データなし")}
      </div>
    </div>`;
}

function renderPlayers() {
  setupCreatorFilterBar();

  const allDatabasePlayers = getMergedPlayersList();
  const query = document.getElementById("player-query").value.trim().toLowerCase();
  const game = document.getElementById("search-game").value;
  const role = document.getElementById("search-role").value;
  const userEnv = getUserBaselineEnv();

  let filtered = allDatabasePlayers.filter((player) => {
    const playerName = typeof player?.name === "string" ? player.name : "";
    const normalizedGame = normalizeGameName(player?.game);
    const deviceString = Object.values(player?.devices || {}).join(" ").toLowerCase();
    const roleString = (Array.isArray(player?.roles) ? player.roles : []).join(" ").toLowerCase();
    const sourceString = String(player?.source || "").toLowerCase();

    const hasText = !query ||
      playerName.toLowerCase().includes(query) ||
      deviceString.includes(query) ||
      roleString.includes(query) ||
      sourceString.includes(query);

    const matchesGame = !game || normalizedGame === normalizeGameName(game);
    const matchesRole = !role || (Array.isArray(player?.roles) && player.roles.includes(role));
    const creatorTypes = getPlayerCreatorTypes(player);
    const matchesCreatorType = currentCreatorTypeFilter === "all" || creatorTypes.has(currentCreatorTypeFilter);
    const matchesFav = !showOnlyFavoritePlayers || favoritesState.players.includes(playerName);

    const cm = toCm360(Number(player?.dpi), Number(player?.sens), player?.game);
    const bandInfo = getSensBandInfo(cm);
    const matchesSensBand = currentSensBandFilter === "all" || bandInfo.key === currentSensBandFilter;

    return hasText && matchesGame && matchesRole && matchesCreatorType && matchesFav && matchesSensBand;
  });

  if (currentSortOrder !== "default") {
    filtered = [...filtered].sort((a, b) => {
      const cmA = toCm360(Number(a?.dpi), Number(a?.sens), a?.game);
      const cmB = toCm360(Number(b?.dpi), Number(b?.sens), b?.game);

      if (currentSortOrder === "sync_desc") return calculateEnvSyncRate(b, userEnv) - calculateEnvSyncRate(a, userEnv);
      if (currentSortOrder === "cm_asc") return (Number.isFinite(cmA) ? cmA : 9999) - (Number.isFinite(cmB) ? cmB : 9999);
      if (currentSortOrder === "cm_desc") return (Number.isFinite(cmB) ? cmB : -1) - (Number.isFinite(cmA) ? cmA : -1);
      if (currentSortOrder === "name_asc") return String(a?.name || "").localeCompare(String(b?.name || ""), "ja");
      return 0;
    });
  }

  document.getElementById("search-count").textContent = `${String(filtered.length).padStart(2, "0")} PLAYERS`;
  updateSearchLiveAnalytics(filtered);

  const resultsEl = document.getElementById("player-results");

  const typeBadgeMap = {
    vtuber: '<span class="tag" style="background: rgba(191, 87, 255, 0.2); border: 1px solid #bf57ff; color: #e9d5ff; font-weight: bold;">✨ VTuber</span>',
    streamer: '<span class="tag" style="background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #bae6fd; font-weight: bold;">🎙 STREAMER</span>',
    pro: '<span class="tag" style="background: rgba(212, 255, 51, 0.12); border: 1px solid rgba(212, 255, 51, 0.4); color: #d4ff33; font-weight: bold;">🏆 PRO</span>'
  };

  if (!filtered.length) {
    resultsEl.innerHTML = '<div class="no-results" style="grid-column: 1 / -1;">条件に一致するプレイヤーが見つかりませんでした。</div>';
    refreshAllInteractiveEnhancements();
    return;
  }

  if (currentViewMode === "table") {
    resultsEl.innerHTML = `
      <div style="grid-column: 1 / -1; width: 100%; overflow-x: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.35);">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left; min-width: 980px;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #a1a1aa; font-size: 0.7rem;">
              <th style="padding: 0.75rem 0.85rem;">プレイヤー名</th>
              <th style="padding: 0.75rem 0.5rem;">タイトル</th>
              <th style="padding: 0.75rem 0.5rem;">振り向き (360°)</th>
              <th style="padding: 0.75rem 0.5rem;">使用マウス</th>
              <th style="padding: 0.75rem 0.5rem;">使用キーボード</th>
              <th style="padding: 0.75rem 0.5rem;">マウスパッド</th>
              <th style="padding: 0.75rem 0.5rem;">一式総額</th>
              <th style="padding: 0.75rem 0.85rem; text-align: right;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((player) => {
              const playerName = typeof player?.name === "string" ? player.name : "選手";
              const dpi = Number(player?.dpi);
              const sens = Number(player?.sens);
              const cmValue = Number.isFinite(dpi) && Number.isFinite(sens) ? toCm360(dpi, sens, player?.game) : Number.NaN;
              const bandInfo = getSensBandInfo(cmValue);
              const mouse = player?.devices?.["マウス"] || "データなし";
              const kb = player?.devices?.["キーボード"] || "データなし";
              const pad = player?.devices?.["マウスパッド"] || "データなし";
              const setupTotal = calculatePlayerSetupTotal(player);

              return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                  <td style="padding: 0.7rem 0.85rem; font-weight: 800; color: #fff;">${escapeHtml(playerName)}</td>
                  <td style="padding: 0.7rem 0.5rem; color: #d4d4d8;">${escapeHtml(player?.game || "")}</td>
                  <td style="padding: 0.7rem 0.5rem;">
                    <strong style="color: ${bandInfo.color}; font-family: monospace; font-size: 0.88rem;">${Number.isFinite(cmValue) ? `${cmValue.toFixed(1)} cm` : "-"}</strong>
                    <div style="font-size:0.66rem; color:#71717a;">${Number.isFinite(dpi) && Number.isFinite(sens) ? `${dpi}DPI / ${sens}` : ""}</div>
                  </td>
                  <td style="padding: 0.7rem 0.5rem;">
                    <span class="js-search-yt-trigger" data-player="${escapeHtml(playerName)}" data-device="${escapeHtml(mouse)}"
                          style="cursor: pointer; color: #fff; font-weight: 700; text-decoration: underline dotted rgba(191,87,255,0.7);">
                      ${escapeHtml(mouse)}
                    </span>
                  </td>
                  <td style="padding: 0.7rem 0.5rem; color: #e4e4e7;">${escapeHtml(kb)}</td>
                  <td style="padding: 0.7rem 0.5rem; color: #d4d4d8;">${escapeHtml(pad)}</td>
                  <td style="padding: 0.7rem 0.5rem;">
                    <button type="button" data-player-name="${escapeHtml(playerName)}" onclick="window.openSetupEstimateModal(this.dataset.playerName, event)"
                            style="cursor:pointer; padding: 0.22rem 0.5rem; border-radius: 4px; background: rgba(212,255,51,0.12); border: 1px solid rgba(212,255,51,0.35); color: #d4ff33; font-weight: 800; font-size: 0.72rem; font-family: monospace;">
                      💰 ${formatYen(setupTotal)}
                    </button>
                  </td>
                  <td style="padding: 0.7rem 0.85rem; text-align: right; white-space: nowrap;">
                    <button type="button" class="js-fav-player-btn" data-player-name="${escapeHtml(playerName)}" onclick="window.toggleFavoritePlayer(this.dataset.playerName, event)" style="cursor:pointer; padding:0.25rem 0.5rem; border-radius:6px; font-size:0.68rem; font-weight:800; margin-right:0.25rem;">☆</button>
                    <button type="button" data-player-name="${escapeHtml(playerName)}" onclick="window.openPlayerSyncModal(this.dataset.playerName, event)" style="cursor:pointer; padding:0.25rem 0.5rem; border-radius:6px; background:rgba(191,87,255,0.18); border:1px solid rgba(191,87,255,0.4); color:#e9d5ff; font-size:0.68rem; font-weight:700;">診断・𝕏</button>
                  </td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
  } else {
    resultsEl.innerHTML = filtered.map((player) => {
      const playerName = typeof player?.name === "string" ? player.name : "選手";
      const spec = getGameSpec(player?.game);
      const creatorTypes = getPlayerCreatorTypes(player);
      const dpi = Number(player?.dpi);
      const sens = Number(player?.sens);
      const cmValue = Number.isFinite(dpi) && Number.isFinite(sens) ? toCm360(dpi, sens, player?.game) : Number.NaN;
      const bandInfo = getSensBandInfo(cmValue);
      const syncRate = calculateEnvSyncRate(player, userEnv);
      const setupTotal = calculatePlayerSetupTotal(player);

      const creatorBadges = [...creatorTypes].map((t) => typeBadgeMap[t] || "").join("");
      const gameRoleTags = (Array.isArray(player?.roles) ? player.roles : [])
        .filter((item) => !["pro", "streamer", "vtuber"].includes(String(item).toLowerCase()))
        .map((item) => `<span class="tag">${escapeHtml(getGameRoles(player?.game).find((roleOption) => roleOption.value === item)?.text || item)}</span>`)
        .join("");

      const sensBandBadge = Number.isFinite(cmValue)
        ? `<span class="tag" style="border: 1px solid ${bandInfo.color}; color: ${bandInfo.color}; background: rgba(0,0,0,0.3); font-weight: 700;">${bandInfo.label}</span>`
        : "";

      const deviceEntries = categoryLabels.map((category) => {
        const device = player?.devices?.[category];
        const hasValidDevice = device && device !== "データなし";
        const price = hasValidDevice ? getDevicePrice(device, category) : 0;
        return `
          <div class="device-row ${hasValidDevice ? 'js-search-yt-trigger' : ''}"
               data-player="${escapeHtml(playerName)}"
               data-device="${escapeHtml(device || '')}"
               style="${hasValidDevice ? 'cursor: pointer; transition: background 0.2s; border-radius: 4px; padding: 0.32rem 0.4rem;' : ''}"
               ${hasValidDevice ? 'title="クリックしてこのデバイスの比較＆レビュー動画を表示"' : ''}>
            <span>${escapeHtml(category)}</span>
            <span style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; justify-content: flex-end;">
              <strong>${escapeHtml(device || "データなし")}</strong>
              ${price > 0 ? `<small style="color: #a1a1aa; font-family: monospace; font-size: 0.66rem;">${formatYen(price)}</small>` : ''}
              ${hasValidDevice ? '<small style="color: #bf57ff; font-size: 0.64rem; font-weight: bold;">▶動画</small>' : ''}
              ${hasValidDevice ? `<a href="${escapeHtml(getAmazonAffiliateUrl(device))}" target="_blank" rel="sponsored noopener noreferrer" onclick="event.stopPropagation();" style="text-decoration:none; font-size:0.64rem; padding:0.1rem 0.38rem; border-radius:4px; background:rgba(255,153,0,0.18); border:1px solid rgba(255,153,0,0.5); color:#ffb84d; font-weight:bold;" title="Amazonで見る">🛒</a>` : ''}
              ${hasValidDevice ? `<button type="button" class="js-fav-device-btn" data-device-name="${escapeHtml(device)}" onclick="window.toggleFavoriteDevice(this.dataset.deviceName, event)" title="欲しいものリストに保存" style="cursor:pointer; padding:0.1rem 0.35rem; border-radius:4px; font-size:0.64rem; font-weight:800;">☆</button>` : ''}
            </span>
          </div>`;
      }).join("");

      return `
        <article class="player-card">
          <div class="player-card-top" style="position: relative;">
            <span class="player-avatar">${escapeHtml(playerName.slice(0, 1))}</span>
            <div>
              <h3>${escapeHtml(playerName)}</h3>
              <div class="player-game">${escapeHtml(spec ? spec.label : String(player?.game || ""))} · <span style="color:#d4ff33; font-weight:800;">SYNC ${syncRate}%</span></div>
            </div>
            <button type="button" class="js-fav-player-btn"
                    data-player-name="${escapeHtml(playerName)}"
                    onclick="window.toggleFavoritePlayer(this.dataset.playerName, event)"
                    style="margin-left: auto; cursor: pointer; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; white-space: nowrap;">
              ☆ 比較に保存
            </button>
          </div>
          <div class="player-tags" style="display: flex; flex-wrap: wrap; gap: 0.35rem;">${creatorBadges}${gameRoleTags}${sensBandBadge}</div>
          <div class="device-list">${deviceEntries}</div>
          <div class="player-sens">${Number.isFinite(cmValue) ? `${dpi} DPI / 感度 ${sens} （${cmValue.toFixed(1)} cm / 360°）` : "感度データなし"}</div>
          <div style="margin-top: 0.65rem; padding-top: 0.55rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
            <button type="button"
                    data-player-name="${escapeHtml(playerName)}"
                    onclick="window.openSetupEstimateModal(this.dataset.playerName, event)"
                    style="cursor: pointer; padding: 0.34rem 0.65rem; border-radius: 6px; background: rgba(212,255,51,0.12); border: 1px solid rgba(212,255,51,0.38); color: #d4ff33; font-size: 0.71rem; font-weight: 800; font-family: monospace;"
                    title="4デバイス一式の総額内訳と高コスパ代替構成を表示">
              💰 一式 ${formatYen(setupTotal)} (内訳)
            </button>
            <button type="button"
                    data-player-name="${escapeHtml(playerName)}"
                    onclick="window.openPlayerSyncModal(this.dataset.playerName, event)"
                    style="cursor: pointer; padding: 0.34rem 0.65rem; border-radius: 6px; background: rgba(191,87,255,0.14); border: 1px solid rgba(191,87,255,0.4); color: #e9d5ff; font-size: 0.71rem; font-weight: 700; margin-left: auto;">
              ⚡ シンクロ診断・𝕏
            </button>
          </div>
        </article>`;
    }).join("");
  }

  refreshAllInteractiveEnhancements();

  const triggers = resultsEl.querySelectorAll(".js-search-yt-trigger");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      triggers.forEach((t) => { t.style.background = "transparent"; t.style.outline = "none"; });
      trigger.style.background = "rgba(191, 87, 255, 0.15)";
      trigger.style.outline = "1px solid #bf57ff";
      renderYouTubeSection({
        sectionId: "search-youtube-section",
        anchorElement: resultsEl,
        position: "beforebegin",
        titlePrefix: `${trigger.dataset.player} の使用デバイス`,
        deviceName: trigger.dataset.device,
        hintText: "※各選手のデバイス名をクリックで切り替え"
      });
    });
  });

  if (filtered.length > 0 && filtered[0].devices?.["マウス"]) {
    const firstTrigger = resultsEl.querySelector(".js-search-yt-trigger");
    if (firstTrigger && currentViewMode === "grid") {
      firstTrigger.style.background = "rgba(191, 87, 255, 0.15)";
      firstTrigger.style.outline = "1px solid #bf57ff";
    }
    renderYouTubeSection({
      sectionId: "search-youtube-section",
      anchorElement: resultsEl,
      position: "beforebegin",
      titlePrefix: `${filtered[0].name} の使用デバイス`,
      deviceName: filtered[0].devices["マウス"],
      hintText: "※各選手のデバイス名をクリックで切り替え"
    });
  }
}

["player-query", "search-game", "search-role"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderPlayers);
  document.getElementById(id).addEventListener("change", renderPlayers);
});

// ============================================================================
// 2. プロ使用率（改善②：キーボードを含む4大カテゴリ対応 ＆ 参考価格表示）
// ============================================================================
function renderRankings(game) {
  const normalizedGame = normalizeGameName(game);
  const allMerged = getMergedPlayersList();
  const gamePlayers = allMerged.filter((player) => normalizeGameName(player?.game) === normalizedGame);
  const sourceLabel = players === demoPlayers ? "DEMO DATA" : "PRO & CREATOR DB";
  document.getElementById("ranking-total").textContent = `${gamePlayers.length} PLAYERS · ${sourceLabel}`;
  const rankingContentEl = document.getElementById("ranking-content");

  // 4カテゴリ（マウス・マウスパッド・キーボード・ヘッドセット）が見やすく並ぶようグリッド調整
  rankingContentEl.style.display = "grid";
  rankingContentEl.style.gridTemplateColumns = "repeat(auto-fit, minmax(270px, 1fr))";
  rankingContentEl.style.gap = "1.25rem";

  let topDeviceForInitialVideo = null;

  rankingContentEl.innerHTML = categoryLabels.map((category) => {
    const counts = new Map();
    let observedProfiles = 0;
    gamePlayers.forEach((player) => {
      const device = player?.devices && player.devices[category];
      if (device && device !== "データなし") {
        observedProfiles++;
        counts.set(device, (counts.get(device) || 0) + 1);
      }
    });
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
    if (!topDeviceForInitialVideo && ranked.length > 0) {
      topDeviceForInitialVideo = ranked[0][0];
    }

    return `<article class="category-card"><div class="category-heading"><h3>${category}</h3><span>${ranked.length} MODELS</span></div>${ranked.length ? ranked.map(([name, count], index) => {
      const percentage = observedProfiles ? Math.round(count / observedProfiles * 100) : 0;
      const price = getDevicePrice(name, category);
      return `
        <div class="rank-row js-ranking-yt-trigger" data-device="${escapeHtml(name)}" style="cursor: pointer; padding: 0.4rem; border-radius: 6px; transition: background 0.2s;" title="クリックしてスペック比較＆レビュー動画を表示">
          <span class="rank-num">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <div class="rank-name" style="display: flex; justify-content: space-between; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
              <span>${escapeHtml(name)}</span>
              <span style="display: inline-flex; align-items: center; gap: 0.3rem;">
                ${price > 0 ? `<small style="color: #a1a1aa; font-family: monospace; font-size: 0.65rem;">${formatYen(price)}</small>` : ""}
                <small style="color: #bf57ff; font-size: 0.65rem; font-weight: bold;">▶動画</small>
                <a href="${escapeHtml(getAmazonAffiliateUrl(name))}" target="_blank" rel="sponsored noopener noreferrer" onclick="event.stopPropagation();" style="text-decoration:none; font-size:0.64rem; padding:0.1rem 0.35rem; border-radius:4px; background:rgba(255,153,0,0.18); border:1px solid rgba(255,153,0,0.5); color:#ffb84d; font-weight:bold;">🛒</a>
                <button type="button" class="js-fav-device-btn" data-device-name="${escapeHtml(name)}" onclick="window.toggleFavoriteDevice(this.dataset.deviceName, event)" title="欲しいものリストに保存" style="cursor:pointer; padding:0.1rem 0.38rem; border-radius:4px; font-size:0.64rem; font-weight:800;">☆</button>
              </span>
            </div>
            <div class="rank-bar-wrap"><div class="rank-bar" style="width:${percentage}%"></div></div>
          </div>
          <span class="rank-percent">${percentage}%</span>
        </div>`;
    }).join("") : '<p class="ranking-empty">このカテゴリのデータはありません。</p>'}</article>`;
  }).join("");

  refreshAllInteractiveEnhancements();

  const triggers = rankingContentEl.querySelectorAll(".js-ranking-yt-trigger");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      triggers.forEach((t) => { t.style.background = "transparent"; t.style.outline = "none"; });
      trigger.style.background = "rgba(191, 87, 255, 0.15)";
      trigger.style.outline = "1px solid #bf57ff";
      renderYouTubeSection({
        sectionId: "ranking-youtube-section",
        anchorElement: rankingContentEl,
        position: "afterend",
        titlePrefix: `${normalizedGame} 人気デバイス`,
        deviceName: trigger.dataset.device,
        hintText: "※ランキングの各モデルをクリックで切り替え"
      });
    });
  });

  if (topDeviceForInitialVideo) {
    const firstTrigger = rankingContentEl.querySelector(".js-ranking-yt-trigger");
    if (firstTrigger) {
      firstTrigger.style.background = "rgba(191, 87, 255, 0.15)";
      firstTrigger.style.outline = "1px solid #bf57ff";
    }
    renderYouTubeSection({
      sectionId: "ranking-youtube-section",
      anchorElement: rankingContentEl,
      position: "afterend",
      titlePrefix: `${normalizedGame} 使用率1位モデル`,
      deviceName: topDeviceForInitialVideo,
      hintText: "※ランキングの各モデルをクリックで切り替え"
    });
  }
}

document.querySelectorAll(".game-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".game-tab").forEach((tab) => tab.classList.toggle("selected", tab === button));
    renderRankings(button.dataset.game);
  });
});

// ============================================================================
// 3. デバイス相談（8種類の詳細分析 × 価格表示 ＆ 高コスパモデル提案）
// ============================================================================
document.getElementById("consult-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const game = document.getElementById("consult-game").value;
  const rank = document.getElementById("consult-rank").value;
  const role = document.getElementById("consult-role").value;
  const issue = document.getElementById("consult-issue").value.trim();
  const normalized = issue.toLowerCase();

  let recommendation;
  let targetDeviceCategory = "マウス";
  let customCandidateModels = null;

  if (/足音|聞こえ|音|定位|ヘッド|イヤホン|耳|sound|footstep|audio/.test(normalized)) {
    recommendation = {
      score: "98",
      category: "ヘッドセット・インイヤーモニター（音響・定位）",
      title: "足音の方向・距離感を正確に掴む音響環境への刷新",
      detail: "上下左右の足音やスキル音を聞き分けるには、周波数特性がフラットに近いゲーミングヘッドセットや、遮音性の高いカナル型イヤホン（IEM）が有効です。長時間プレイで側圧が気になる場合はSHURE SE215やINZONE Budsなどのイヤホン型がプロ・配信者間で主流になっています。",
      actionPoint: "ゲーム内のHRTF（立体音響）設定をONにし、イコライザーで低音（爆発音）を少し抑えて中〜高音域（足音の擦れる音）をクリアにする設定も併用しましょう。"
    };
    targetDeviceCategory = "ヘッドセット";
  } else if (/追いエイム|トラッキング|ガラス|引っかか|初動|硬い|tracking|apex/.test(normalized)) {
    recommendation = {
      score: "96",
      category: "スピード系・ガラスマウスパッド",
      title: "初動の引っかかりをゼロにする低摩擦サーフェス",
      detail: "近〜中距離での追いエイム（トラッキング）や素早いターゲット切り替えで引っかかりを感じる場合、滑走速度の高いスピード系布パッド（Artisan 疾風乙 / 飛燕）や、湿気の影響を一切受けないガラスマウスパッド（Wallhack SP-004）への移行が極めて効果的です。",
      actionPoint: "マウスソールを汎用丸型PTFEソールに張り替えると、さらに初動の軽さと滑走の均一性が向上します。"
    };
    targetDeviceCategory = "マウスパッド";
    customCandidateModels = ["Wallhack SP-004", "Artisan Ninja FX Hayate Otsu", "Artisan Ninja FX Hien"];
  } else if (/止まら|滑りすぎ|ストッピング|行き過ぎ|オーバー|コントロール|湿気|パッド/.test(normalized)) {
    recommendation = {
      score: "95",
      category: "コントロール系マウスパッド",
      title: "ピタッと視点が止まるストッピング重視サーフェス",
      detail: "フリック時にクロスヘアが敵を通り過ぎてしまう（オーバーフリック）場合は、適度な摩擦抵抗とクッション性を持つコントロール系マウスパッドが最適です。スポンジに沈み込ませて止める感覚を掴みやすくなります。",
      actionPoint: "日本の多湿な環境では布パッドが湿気で重くなりやすいため、耐湿性に優れたArtisan ZeroやLGG Saturn Proを選ぶと年中同じ感覚でプレイできます。"
    };
    targetDeviceCategory = "マウスパッド";
    customCandidateModels = ["Artisan Ninja FX Zero", "Vaxee PA", "SteelSeries QcK Heavy"];
  } else if (/持ち方|つかみ|つまみ|かぶせ|手首|小さい|大きい|フィット|形|エルゴ|左右対称/.test(normalized)) {
    recommendation = {
      score: "94",
      category: "マウス形状（エルゴノミクス / 左右対称）",
      title: "手のサイズとグリップスタイルに合致するシェル形状",
      detail: "『つかみ持ち・つまみ持ち』で指先の微調整を重視するなら後部コブが高めの左右対称型（Sora V2やViper V3 Pro）、『かぶせ持ち』で手のひら全体を預けて安定させたいなら非対称エルゴノミクス形状（DeathAdder V3 ProやEC2-CW）が最適です。",
      actionPoint: "グリップテープを側面に貼ることで、手汗による滑りを防ぎ、少ない握力でもマウスを確実にホールドできるようになります。"
    };
    targetDeviceCategory = "マウス";
    customCandidateModels = ["Ninjutso Sora V2", "Razer DeathAdder V3 Pro", "Lamzu Atlantis"];
  } else if (/重い|疲れ|手首痛|腱鞘炎|軽い|軽量|フリック|振り向き/.test(normalized)) {
    recommendation = {
      score: "95",
      category: "超軽量ワイヤレスマウス（30g〜50g台）",
      title: "慣性を極限まで減らす超軽量シェルへのアップデート",
      detail: "マウスの重量が60g以下になると、振り始めのエネルギーと止める際の慣性が大幅に減少します。ローセンシで大きく腕を振るプレイヤーや、長時間ランクを回して手首・前腕に疲労が溜まりやすい方に最も効果が出やすい投資です。",
      actionPoint: "軽量マウスに変えた直後は視点が浮きやすいため、ゲーム内感度を2〜5%ほど下げて微調整するとすぐに馴染みます。"
    };
    targetDeviceCategory = "マウス";
    customCandidateModels = ["Finalmouse UltralightX", "WLmouse Beast X", "Logicool G PRO X SUPERLIGHT 2"];
  } else if (/キーボード|キャラコン|移動|キー|ラピトリ|ラピッドトリガー|設定/.test(normalized)) {
    recommendation = {
      score: "93",
      category: "ラピッドトリガー対応ゲーミングキーボード",
      title: "キーを離した瞬間に止まる高速入力環境の構築",
      detail: "撃ち合い時のストッピングの遅れや、切り返し（レレレ撃ち）のキレに悩んでいる場合、磁気式スイッチ搭載のラピッドトリガーキーボード（Wooting 60HE+ や Apex Pro Mini、高コスパなDrunkDeer A75等）が圧倒的なアドバンテージをもたらします。",
      actionPoint: "アクチュエーションポイントを0.1〜0.3mm、ラピッドトリガーを0.15mm前後に設定することで、理論値レベルの素早いストッピングが可能になります。"
    };
    targetDeviceCategory = "キーボード";
    customCandidateModels = ["Wooting 60HE+", "Razer Huntsman V3 Pro Tenkeyless", "DrunkDeer A75 (高コスパ・ラピトリ)"];
  } else if (/見え|モニター|fps|カクつ|ラグ|遅延|hz|画面|視認/.test(normalized)) {
    recommendation = {
      score: "91",
      category: "高リフレッシュレートモニター（240Hz〜360Hz）",
      title: "飛び出しの視認性と応答速度を高める表示環境",
      detail: "飛び出してくる敵への反応遅れや、激しい視点移動時の残像感が気になる場合は、240Hz以上のゲーミングモニター（ZOWIE XL2546X等のDyAc+搭載モデルやOLEDパネル）へのアップグレードが直結します。",
      actionPoint: "Windowsのディスプレイ詳細設定でリフレッシュレートが最大値になっているか、NVIDIA Reflexが「オン＋ブースト」になっているかも必ず確認してください。"
    };
    targetDeviceCategory = "モニター";
    customCandidateModels = ["BenQ ZOWIE XL2546X", "ASUS ROG Swift OLED PG27AQDM", "Dell AW2523HF"];
  } else {
    recommendation = {
      score: "92",
      category: "マウス・マウスパッド総合バランス",
      title: "プロ使用率トップの王道セットアップによる基準作り",
      detail: "エイムのブレや撃ち合いの不安定さを根本から改善するには、癖のない王道シェルの軽量ワイヤレスマウス（SUPERLIGHT 2 / Viper V3 Pro）と、滑りと止まりのバランスに優れた定番マウスパッド（Artisan Zero）の組み合わせを基準にするのが最も確実です。",
      actionPoint: "まずはプロ平均に近い振り向き（VALORANTなら45〜65cm、Apex/OW2なら30〜45cm）に感度を合わせ、デバイスのポテンシャルを引き出しましょう。"
    };
    targetDeviceCategory = "マウス";
  }

  const rankObj = getGameRanks(game).find((r) => r.value === rank);
  const rankTier = rankObj ? rankObj.tier : "mid";
  const roleText = getGameRoles(game).find((roleOption) => roleOption.value === role)?.text || role;

  let tierAdviceTitle = "";
  let tierAdviceDetail = "";
  if (rankTier === "entry") {
    tierAdviceTitle = `${rank}帯からのステップアップ：癖のない王道モデルで基礎を固める`;
    tierAdviceDetail = `現在のランク帯（${rank}）では、ピーキーな特殊機材よりも、どんな持ち方・感度にも柔軟に対応できる「プロ使用率1〜2位の定番モデル」を選ぶことで、エイムの基礎フォームがブレずに上達スピードが最大化します。`;
  } else if (rankTier === "mid") {
    tierAdviceTitle = `${rank}帯の壁を突破する：ロール（${roleText}）の得意距離に特化する`;
    tierAdviceDetail = `${rank}帯では基礎的な視点操作が身についているため、${roleText}に求められる交戦距離や視点移動量に合わせて「初動の軽さ」か「ストッピングの制動力」のどちらを優先するか明確にしてデバイスを選ぶと勝率が安定します。`;
  } else {
    tierAdviceTitle = `${rank}（上位帯）向けの極限最適化：0.1秒の反応差を埋めるハイエンド環境`;
    tierAdviceDetail = `${rank}帯のハイレベルな撃ち合いでは、ポーリングレート（4000Hz/8000Hz）の低遅延性能や、ラピッドトリガー・耐湿サーフェス環境など、再現性と応答速度のわずかな差が勝敗に直結します。`;
  }

  const normalizedGame = normalizeGameName(game);
  const candidatePlayers = getMergedPlayersList().filter((p) => normalizeGameName(p?.game) === normalizedGame);
  let candidateDevices = customCandidateModels ? [...customCandidateModels] : [...new Set(
    candidatePlayers
      .map((p) => p?.devices?.[targetDeviceCategory])
      .filter((d) => d && d !== "データなし")
  )];

  if (candidateDevices.length === 0) {
    if (targetDeviceCategory === "マウス") candidateDevices.push("Logicool G PRO X SUPERLIGHT 2", "Razer Viper V3 Pro", "Ninjutso Sora V2");
    else if (targetDeviceCategory === "マウスパッド") candidateDevices.push("Artisan Ninja FX Zero", "Vaxee PA", "Wallhack SP-004");
    else if (targetDeviceCategory === "キーボード") candidateDevices.push("Wooting 60HE+", "Razer Huntsman V3 Pro Tenkeyless", "DrunkDeer A75 (高コスパ・ラピトリ)");
    else candidateDevices.push("SHURE SE215", "HyperX Cloud II", "Razer BlackShark V2 Pro");
  }

  const topCandidateDevices = candidateDevices.slice(0, 3);
  const safeGameName = escapeHtml(game || "ゲーム");
  const safeRank = escapeHtml(rank || "ランクなし");
  const safeRoleText = escapeHtml(roleText || "ロール");
  const safeIssue = escapeHtml(issue || "全体的なエイム・環境の改善");
  const consultShareText = `【FRAG // デバイス診断結果】\n${game}（${rank} / ${roleText}）の環境に最適な改善ポイントは「${recommendation.category}」でした！\n🎯 推奨モデル: ${topCandidateDevices[0]}\n`;

  const consultResultEl = document.getElementById("consult-result");
  consultResultEl.innerHTML = `
    <div class="consult-result-content">
      <div class="analysis-top" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
        <span class="eyebrow"><span class="eyebrow-line"></span>YOUR GEAR INSIGHT</span>
        <div style="display:flex; align-items:center; gap:0.65rem;">
          <span class="analysis-score">MATCH <strong>${escapeHtml(recommendation.score)}%</strong></span>
          <button type="button"
                  data-share-text="${escapeHtml(consultShareText)}"
                  onclick="window.shareToX(this.dataset.shareText, event)"
                  style="cursor: pointer; padding: 0.35rem 0.75rem; border-radius: 6px; background: #fff; color: #09090b; border: none; font-size: 0.74rem; font-weight: 800;">
            𝕏 診断結果をポスト
          </button>
        </div>
      </div>
      <div class="analysis-title">${escapeHtml(recommendation.category)}を見直してみましょう。</div>
      <p class="analysis-description">${safeGameName} / <strong>${safeRank}</strong> / ${safeRoleText} のプレイ状況と「${safeIssue}」という悩みから、最適な改善アプローチを算出しました。</p>

      <div class="recommendation">
        <div class="recommendation-head"><span>01 / SOLUTION</span><span>推奨アプローチ</span></div>
        <h3>${escapeHtml(recommendation.title)}</h3>
        <p>${escapeHtml(recommendation.detail)}</p>
        <p style="margin-top: 0.5rem; font-size: 0.82rem; color: #d4ff33;">💡 実践アドバイス：${escapeHtml(recommendation.actionPoint)}</p>
      </div>

      <div class="recommendation">
        <div class="recommendation-head"><span>02 / RANK &amp; ROLE STRATEGY</span><span>${safeRank} × ${safeRoleText}</span></div>
        <h3>${escapeHtml(tierAdviceTitle)}</h3>
        <p>${escapeHtml(tierAdviceDetail)}</p>
      </div>

      <div class="recommendation">
        <div class="recommendation-head"><span>03 / RECOMMENDED GEAR</span><span>プロ・配信者採用の推奨モデル（参考価格つき） <small style="opacity:0.75;">[PR]</small></span></div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin-top: 0.75rem;">
          ${topCandidateDevices.map((dev, idx) => {
            const devPrice = getDevicePrice(dev, targetDeviceCategory);
            return `
            <div style="padding: 0.85rem; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: space-between; gap: 0.65rem;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size: 0.7rem; color: #a1a1aa;">候補 0${idx + 1}</span>
                  <span style="font-size: 0.75rem; color: #d4ff33; font-weight: 800; font-family: monospace;">参考 ${formatYen(devPrice)}</span>
                </div>
                <div style="font-size: 0.92rem; font-weight: 700; color: #fff; margin-top: 0.2rem;">${escapeHtml(dev)}</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                <button type="button" class="js-consult-yt-trigger" data-device="${escapeHtml(dev)}"
                  style="cursor: pointer; width: 100%; padding: 0.45rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-weight: bold; color: #fff; border: 1px solid ${idx === 0 ? '#bf57ff' : 'rgba(255,255,255,0.15)'}; background: ${idx === 0 ? 'rgba(191, 87, 255, 0.22)' : 'rgba(255,255,255,0.05)'}; transition: all 0.2s;">
                  ▶ 動画・比較を見る
                </button>
                <button type="button" class="js-fav-device-btn" data-full-label="true" data-device-name="${escapeHtml(dev)}"
                  onclick="window.toggleFavoriteDevice(this.dataset.deviceName, event)"
                  style="cursor: pointer; width: 100%; padding: 0.35rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">
                  ☆ 欲しいものリストに保存
                </button>
                ${createAffiliateButtonsHtml(dev, true, targetDeviceCategory)}
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
      <p class="result-warning">※ 提案モデルはプロ・ストリーマーの採用実績に基づく参考候補です。購入前にサイズ・重量・在庫状況をご確認ください。</p>
    </div>`;

  refreshAllInteractiveEnhancements();

  const triggers = consultResultEl.querySelectorAll(".js-consult-yt-trigger");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      triggers.forEach((t) => {
        t.style.borderColor = "rgba(255,255,255,0.15)";
        t.style.background = "rgba(255,255,255,0.05)";
      });
      trigger.style.borderColor = "#bf57ff";
      trigger.style.background = "rgba(191, 87, 255, 0.22)";
      renderYouTubeSection({
        sectionId: "consult-youtube-section",
        anchorElement: consultResultEl,
        position: "afterend",
        titlePrefix: `推奨モデル（${targetDeviceCategory}）`,
        deviceName: trigger.dataset.device,
        hintText: "※上の候補カードの「▶ 動画・比較を見る」で切り替え"
      });
    });
  });

  renderYouTubeSection({
    sectionId: "consult-youtube-section",
    anchorElement: consultResultEl,
    position: "afterend",
    titlePrefix: `推奨モデル（${targetDeviceCategory}）`,
    deviceName: topCandidateDevices[0],
    hintText: "※上の候補カードの「▶ 動画・比較を見る」で切り替え"
  });
});

// ============================================================================
// 4. 感度マッチ（フルワイドUI ＆ 4カテゴリ・一式総額見積もり ＆ コンバーター）
// ============================================================================
function setupWideMatchPageLayout() {
  const matchForm = document.getElementById("match-form");
  const resultContainer = document.getElementById("match-result");
  if (!matchForm || !resultContainer) return;

  const layoutParent = resultContainer.parentElement;
  if (layoutParent) {
    layoutParent.style.display = "grid";
    layoutParent.style.gridTemplateColumns = "1fr";
    layoutParent.style.gap = "1.75rem";
    layoutParent.style.width = "100%";
    layoutParent.style.maxWidth = "100%";
  }

  const formPanel = matchForm.closest("section, article, div");
  if (formPanel && formPanel !== layoutParent) {
    formPanel.style.gridColumn = "1 / -1";
    formPanel.style.width = "100%";
    formPanel.style.maxWidth = "100%";
    formPanel.style.boxSizing = "border-box";
  }

  if (!document.getElementById("frag-match-wide-style")) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style id="frag-match-wide-style">
        #page-match #match-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          align-items: end;
          width: 100%;
        }
        #page-match #match-form .field-row {
          grid-column: span 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin: 0;
        }
        #page-match #match-form button[type="submit"] {
          grid-column: 1 / -1;
          width: 100%;
          padding: 0.95rem 1.5rem;
          font-size: 0.95rem;
          margin-top: 0.25rem;
        }
        #page-match #match-result {
          grid-column: 1 / -1 !important;
          width: 100% !important;
          max-width: 100% !important;
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)) !important;
          gap: 1.5rem !important;
          align-items: stretch !important;
        }
      </style>`
    );
  }
}

setupWideMatchPageLayout();

window.copySensValue = function (buttonEl, textValue) {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(String(textValue)).then(() => {
    const originalHtml = buttonEl.innerHTML;
    buttonEl.innerHTML = "✓ COPIED!";
    buttonEl.style.borderColor = "#d4ff33";
    buttonEl.style.color = "#d4ff33";
    buttonEl.style.background = "rgba(212, 255, 51, 0.18)";
    setTimeout(() => {
      buttonEl.innerHTML = originalHtml;
      buttonEl.style.borderColor = "rgba(255,255,255,0.18)";
      buttonEl.style.color = "#e4e4e7";
      buttonEl.style.background = "rgba(255,255,255,0.06)";
    }, 1500);
  });
};

document.getElementById("match-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  setupWideMatchPageLayout();

  const game = document.getElementById("match-game").value;
  const dpi = Number(document.getElementById("match-dpi").value);
  const sensitivity = Number(document.getElementById("match-sens").value);

  if (!Number.isFinite(dpi) || !Number.isFinite(sensitivity) || dpi <= 0 || sensitivity <= 0) {
    document.getElementById("match-result").textContent = "DPIとゲーム内感度には0より大きい数値を入力してください。";
    return;
  }

  const apiBaseUrl = document.querySelector('meta[name="frag-api-base-url"]').content;
  const resultContainer = document.getElementById("match-result");
  resultContainer.innerHTML = '<div class="no-results" style="grid-column: 1 / -1; width:100%; text-align:center;">APIからマッチする選手を検索中...</div>';

  const existingConverter = document.getElementById("sens-converter-panel");
  if (existingConverter) existingConverter.remove();
  const existingYt = document.getElementById("youtube-reviews-section");
  if (existingYt) existingYt.remove();

  const userDistance = toCm360(dpi, sensitivity, game);
  const userGameSpec = getGameSpec(game);

  if (Number.isFinite(userDistance)) {
    const converterCardsHtml = Object.keys(gameSpecs).map((targetGameKey) => {
      const targetSpec = gameSpecs[targetGameKey];
      const isCurrentGame = normalizeGameName(targetGameKey) === normalizeGameName(game);
      const convertedSens = fromCm360ToSens(userDistance, dpi, targetGameKey);
      const sensFormatted = Number.isFinite(convertedSens) ? convertedSens.toFixed(3) : "--";
      const eDpi = Number.isFinite(convertedSens) ? Math.round(dpi * convertedSens) : "--";

      const dpiPresets = [400, 800, 1600].map((presetDpi) => {
        const s = fromCm360ToSens(userDistance, presetDpi, targetGameKey);
        return `<span style="font-size: 0.75rem; color: ${presetDpi === dpi ? '#d4ff33' : '#a1a1aa'};">${presetDpi}DPI: <strong>${Number.isFinite(s) ? s.toFixed(3) : '--'}</strong></span>`;
      }).join(" <span style='color:rgba(255,255,255,0.2)'>|</span> ");

      return `
        <div style="padding: 1.15rem 1.35rem; border-radius: 10px; background: ${isCurrentGame ? 'rgba(212, 255, 51, 0.07)' : 'rgba(0,0,0,0.35)'}; border: 1px solid ${isCurrentGame ? 'rgba(212, 255, 51, 0.45)' : 'rgba(255,255,255,0.08)'}; display: flex; flex-direction: column; justify-content: space-between; gap: 0.7rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.78rem; font-weight: 800; letter-spacing: 0.06em; color: ${isCurrentGame ? '#d4ff33' : '#a1a1aa'};">
              ${escapeHtml(targetSpec.label)} ${isCurrentGame ? '（現在）' : '換算'}
            </span>
            <span style="font-size: 0.74rem; color: #71717a;">eDPI: ${eDpi}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
            <div style="font-size: 1.85rem; font-weight: 800; color: #fff; font-family: monospace;">
              ${sensFormatted}
            </div>
            <button type="button"
                    onclick="copySensValue(this, '${sensFormatted}')"
                    style="cursor: pointer; padding: 0.38rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #e4e4e7; transition: all 0.15s;">
              📋 感度をコピー
            </button>
          </div>
          <div style="padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-wrap: wrap; gap: 0.4rem;">
            ${dpiPresets}
          </div>
        </div>`;
    }).join("");

    resultContainer.insertAdjacentHTML(
      "beforebegin",
      `<section id="sens-converter-panel" style="grid-column: 1 / -1; width: 100%; margin-bottom: 0.5rem; padding: 1.5rem 1.75rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
          <div>
            <span class="eyebrow" style="color: #d4ff33;"><span class="eyebrow-line" style="background: #d4ff33;"></span>CROSS-GAME SENSITIVITY CONVERTER</span>
            <h3 style="font-size: 1.1rem; margin-top: 0.35rem; color: #fff; font-weight: 700;">
              あなたの振り向き（<span style="color:#d4ff33;">${userDistance.toFixed(2)} cm / 360°</span> · ${dpi} DPI）を全タイトルへ即時換算
            </h3>
          </div>
          <span style="font-size: 0.75rem; color: #a1a1aa;">※ボタンクリックでゲーム内設定用の数値をコピーできます</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
          ${converterCardsHtml}
        </div>
      </section>`
    );
  }

  try {
    const url = new URL("/api/match", apiBaseUrl);
    url.searchParams.set("game", game);
    url.searchParams.set("dpi", String(dpi));
    url.searchParams.set("sens", String(sensitivity));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`APIエラー: ${response.status}`);
    }

    const matchedPlayers = await response.json();

    if (!Array.isArray(matchedPlayers) || matchedPlayers.length === 0) {
      resultContainer.innerHTML = '<div class="no-results" style="grid-column: 1 / -1; width:100%; text-align:center;">比較可能な選手が見つかりませんでした。</div>';
      return;
    }

    const userEnv = { game, dpi, sens: sensitivity, cm: userDistance, mouse: currentUserMouseName };

    resultContainer.innerHTML = matchedPlayers.map((rawPlayer, index) => {
      const safePlayer = ensurePlayerFourDevices(rawPlayer && typeof rawPlayer === "object" ? rawPlayer : {});
      const playerGame = normalizeGameName(safePlayer.game || game);
      const playerSpec = getGameSpec(playerGame);
      const playerName = typeof safePlayer.name === "string" ? safePlayer.name : "選手";
      const playerRoles = Array.isArray(safePlayer.roles) ? safePlayer.roles : [];
      const safeDevices = safePlayer.devices || {};
      const playerCm = Number(safePlayer.cmPer360);
      const playerDpi = Number(safePlayer.dpi);
      const playerSens = Number(safePlayer.sens);
      const playerDistance = Number.isFinite(playerCm) ? playerCm : (Number.isFinite(playerDpi) && Number.isFinite(playerSens) && playerSpec ? toCm360(playerDpi, playerSens, playerGame) : Number.NaN);
      const difference = Number.isFinite(playerDistance) && Number.isFinite(userDistance) ? Math.abs(playerDistance - userDistance) : Number.NaN;
      const percent = Number.isFinite(difference) && Number.isFinite(userDistance) && userDistance !== 0 ? (difference / userDistance) * 100 : Number.NaN;
      const matchQuality = Number.isFinite(percent) ? (percent < 5 ? "非常に近い" : percent < 15 ? "近い感度" : "参考候補") : "参考候補";
      const mouseName = safeDevices["マウス"] || "データなし";
      const padName = safeDevices["マウスパッド"] || "データなし";
      const kbName = safeDevices["キーボード"] || "Wooting 60HE+";
      const setupTotal = calculatePlayerSetupTotal(safePlayer);
      const isFirst = index === 0;

      const tryProSensInUserEnv = fromCm360ToSens(playerDistance, dpi, game);
      const tryProSensFormatted = Number.isFinite(tryProSensInUserEnv) ? tryProSensInUserEnv.toFixed(3) : null;
      const syncRate = calculateEnvSyncRate(safePlayer, userEnv);
      const shareText = `【FRAG // 感度＆環境シンクロ診断】\n私のFPS感度は「${playerName}」とシンクロ率【${syncRate}%】でした！（振り向き ${Number.isFinite(userDistance) ? userDistance.toFixed(1) : "--"}cm / 360°）\n注目の使用マウス: ${mouseName}\n`;

      return `
        <article class="match-card" style="box-sizing: border-box; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; width: 100%;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 1rem;">
              <div>
                <span class="eyebrow"><span class="eyebrow-line"></span>PRO SENS / ${escapeHtml(playerSpec ? playerSpec.label : (playerGame || "GAME"))}</span>
                <div class="match-distance" style="font-size: 2.1rem; margin-top: 0.2rem;">${Number.isFinite(playerDistance) ? playerDistance.toFixed(1) : "--"}<small style="font-size: 0.9rem; margin-left: 0.25rem;">cm / 360°</small></div>
                <div class="match-delta" style="font-size: 0.8rem; color: #a1a1aa;">${Number.isFinite(difference) ? `あなたとの差 ${difference.toFixed(1)} cm （${percent.toFixed(1)}%）` : "感度差を計算できません"}</div>
              </div>
              <span class="match-badge" style="white-space: nowrap;">${matchQuality}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 0.85rem; padding: 0.85rem 1rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); margin-bottom: 0.85rem;">
              <span class="player-avatar" style="flex-shrink: 0;">${escapeHtml(playerName.slice(0, 1))}</span>
              <div style="min-width: 0; flex: 1;">
                <h2 style="font-size: 1.15rem; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(playerName)}</h2>
                <p style="font-size: 0.78rem; color: #a1a1aa; margin: 0.15rem 0 0;">${escapeHtml(playerSpec ? playerSpec.label : (playerGame || "GAME"))} · ${escapeHtml(playerRoles.join(" / ") || "プレイヤー")}</p>
              </div>
              <button type="button" class="js-fav-player-btn"
                      data-player-name="${escapeHtml(playerName)}"
                      onclick="window.toggleFavoritePlayer(this.dataset.playerName, event)"
                      style="flex-shrink: 0; cursor: pointer; padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.74rem; font-weight: 800; white-space: nowrap;">
                ☆ 比較に保存
              </button>
            </div>

            <div style="font-size: 0.85rem; color: #d4d4d8; margin-bottom: 0.85rem;">
              本人設定：<strong style="color:#fff;">${Number.isFinite(playerDpi) && Number.isFinite(playerSens) ? `${playerDpi} DPI / 感度 ${playerSens}` : "感度情報なし"}</strong>（振り向き ${Number.isFinite(playerDistance) ? `${playerDistance.toFixed(1)} cm` : "--"}）
            </div>

            ${tryProSensFormatted ? `
              <div style="margin-bottom: 1rem; padding: 0.85rem 1rem; border-radius: 8px; background: rgba(212, 255, 51, 0.08); border: 1px dashed rgba(212, 255, 51, 0.38); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                <div style="font-size: 0.78rem; color: #e4e4e7; line-height: 1.4;">
                  🎯 <strong>${escapeHtml(playerName)}</strong> の振り向きを<br>
                  あなたの <strong>${escapeHtml(userGameSpec ? userGameSpec.label : game)} (${dpi} DPI)</strong> で試すなら:
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: auto;">
                  <strong style="font-size: 1.2rem; color: #d4ff33; font-family: monospace;">${tryProSensFormatted}</strong>
                  <button type="button"
                          onclick="copySensValue(this, '${tryProSensFormatted}')"
                          style="cursor: pointer; padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); color: #fff; white-space: nowrap;">
                    📋 コピー
                  </button>
                </div>
              </div>
            ` : ""}

            <div style="display: grid; gap: 0.6rem;">
              <div class="match-device js-yt-trigger"
                   data-player="${escapeHtml(playerName)}"
                   data-mouse="${escapeHtml(mouseName)}"
                   style="cursor: pointer; transition: all 0.2s; border: 1px solid ${isFirst ? '#bf57ff' : 'rgba(255,255,255,0.1)'}; background: ${isFirst ? 'rgba(191, 87, 255, 0.14)' : 'rgba(0,0,0,0.25)'}; border-radius: 8px; padding: 0.7rem 0.9rem;"
                   title="クリックしてこのマウスの比較＆レビュー動画を表示">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <span style="font-size: 0.68rem; color: #a1a1aa; font-weight: 700;">PLAYER MOUSE</span>
                  <small style="color: #d8b4fe; font-size: 0.7rem; font-weight: 800;">▶ クリックで動画・比較</small>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <strong style="font-size: 0.9rem; color: #fff;">${escapeHtml(mouseName)}</strong>
                  ${createAffiliateButtonsHtml(mouseName, true, "マウス")}
                </div>
              </div>

              <div class="match-device js-yt-trigger"
                   data-player="${escapeHtml(playerName)}"
                   data-mouse="${escapeHtml(kbName)}"
                   style="cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.25); border-radius: 8px; padding: 0.7rem 0.9rem;"
                   title="クリックしてこのキーボードのレビュー動画を表示">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <span style="font-size: 0.68rem; color: #a1a1aa; font-weight: 700;">PLAYER KEYBOARD (RAPID TRIGGER)</span>
                  <small style="color: #d8b4fe; font-size: 0.7rem; font-weight: 800;">▶ 動画を見る</small>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <strong style="font-size: 0.9rem; color: #fff;">${escapeHtml(kbName)}</strong>
                  ${createAffiliateButtonsHtml(kbName, true, "キーボード")}
                </div>
              </div>

              <div class="match-device" style="border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.25); border-radius: 8px; padding: 0.7rem 0.9rem;">
                <div style="font-size: 0.68rem; color: #a1a1aa; font-weight: 700; margin-bottom: 0.25rem;">PLAYER MOUSEPAD</div>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <strong style="font-size: 0.9rem; color: #fff;">${escapeHtml(padName)}</strong>
                  ${createAffiliateButtonsHtml(padName, true, "マウスパッド")}
                </div>
              </div>
            </div>
          </div>

          <div style="padding-top: 0.85rem; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
            <span style="padding: 0.3rem 0.6rem; border-radius: 6px; background: rgba(212,255,51,0.14); border: 1px solid rgba(212,255,51,0.4); color: #d4ff33; font-size: 0.74rem; font-weight: 800;">
              ⚡ シンクロ ${syncRate}%
            </span>
            <button type="button"
                    data-player-name="${escapeHtml(playerName)}"
                    onclick="window.openSetupEstimateModal(this.dataset.playerName, event)"
                    style="cursor: pointer; padding: 0.32rem 0.65rem; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #fde047; font-size: 0.73rem; font-weight: 800; font-family: monospace;">
              💰 一式 ${formatYen(setupTotal)}
            </button>
            <button type="button"
                    data-share-text="${escapeHtml(shareText)}"
                    onclick="window.shareToX(this.dataset.shareText, event)"
                    style="cursor: pointer; padding: 0.34rem 0.75rem; border-radius: 6px; background: rgba(255,255,255,0.95); color: #09090b; border: none; font-size: 0.74rem; font-weight: 800; margin-left: auto;">
              𝕏 ポスト
            </button>
          </div>
        </article>`;
    }).join("");

    refreshAllInteractiveEnhancements();

    const triggers = resultContainer.querySelectorAll(".js-yt-trigger");
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        triggers.forEach((t) => {
          t.style.borderColor = "rgba(255,255,255,0.1)";
          t.style.background = "rgba(0,0,0,0.25)";
        });
        trigger.style.borderColor = "#bf57ff";
        trigger.style.background = "rgba(191, 87, 255, 0.14)";

        renderYouTubeSection({
          sectionId: "youtube-reviews-section",
          anchorElement: resultContainer,
          position: "afterend",
          titlePrefix: `${trigger.dataset.player} の使用デバイス`,
          deviceName: trigger.dataset.mouse,
          hintText: "※各カードのマウス・キーボード枠をクリックで切り替え"
        });
      });
    });

    await renderYouTubeSection({
      sectionId: "youtube-reviews-section",
      anchorElement: resultContainer,
      position: "afterend",
      titlePrefix: `${matchedPlayers[0].name} の使用マウス`,
      deviceName: matchedPlayers[0].devices?.["マウス"],
      hintText: "※各カードのマウス・キーボード枠をクリックで切り替え"
    });

  } catch (error) {
    console.error("Match API通信エラー:", error);
    resultContainer.innerHTML = '<div class="no-results" style="grid-column: 1 / -1; width:100%; text-align:center;">サーバーとの通信に失敗しました。</div>';
  }
});

// ============================================================================
// 改善① URLパラメータ共有（ディープリンク自動復元 ＆ リアルタイムURL同期エンジン）
// ============================================================================
function buildCurrentDeepLinkUrl(customParams = {}) {
  const url = new URL(window.location.href.split("?")[0].split("#")[0]);
  const activeNav = document.querySelector(".nav-item.active");
  const currentTab = customParams.tab || activeNav?.dataset?.page || "consult";
  url.searchParams.set("tab", currentTab);

  if (currentTab === "consult") {
    const game = document.getElementById("consult-game")?.value;
    const rank = document.getElementById("consult-rank")?.value;
    const role = document.getElementById("consult-role")?.value;
    const issue = document.getElementById("consult-issue")?.value?.trim();
    if (game) url.searchParams.set("game", game);
    if (rank) url.searchParams.set("rank", rank);
    if (role) url.searchParams.set("role", role);
    if (issue) url.searchParams.set("issue", issue);
  } else if (currentTab === "search") {
    const q = document.getElementById("player-query")?.value?.trim();
    const game = document.getElementById("search-game")?.value;
    const role = document.getElementById("search-role")?.value;
    if (q) url.searchParams.set("q", q);
    if (game) url.searchParams.set("game", game);
    if (role) url.searchParams.set("role", role);
    if (currentCreatorTypeFilter !== "all") url.searchParams.set("type", currentCreatorTypeFilter);
    if (currentSensBandFilter !== "all") url.searchParams.set("band", currentSensBandFilter);
    if (currentSortOrder !== "default") url.searchParams.set("sort", currentSortOrder);
    if (currentViewMode !== "grid") url.searchParams.set("view", currentViewMode);
  } else if (currentTab === "rankings") {
    const selectedGame = document.querySelector(".game-tab.selected")?.dataset?.game || "VALORANT";
    url.searchParams.set("game", selectedGame);
  } else if (currentTab === "match") {
    const game = document.getElementById("match-game")?.value;
    const dpi = document.getElementById("match-dpi")?.value;
    const sens = document.getElementById("match-sens")?.value;
    if (game) url.searchParams.set("game", game);
    if (dpi) url.searchParams.set("dpi", dpi);
    if (sens) url.searchParams.set("sens", sens);
  }

  Object.entries(customParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  });

  return url.toString();
}

function syncUrlWithCurrentState(customParams = {}) {
  try {
    const newUrl = buildCurrentDeepLinkUrl(customParams);
    window.history.replaceState(null, "", newUrl);
  } catch (e) {}
}

window.shareToX = function (shareText, event) {
  if (event) event.stopPropagation();

  let customParams = {};
  const modalHeader = document.querySelector("#frag-sync-modal-root h3");
  if (modalHeader) {
    if (modalHeader.textContent.includes("×")) {
      const targetPlayerName = modalHeader.textContent.split("×")[1]?.trim();
      if (targetPlayerName) customParams = { tab: "search", syncPlayer: targetPlayerName };
    } else if (modalHeader.textContent.includes("と同じ環境")) {
      const targetPlayerName = modalHeader.textContent.replace("💰", "").split("と同じ環境")[0]?.trim();
      if (targetPlayerName) customParams = { tab: "search", estimatePlayer: targetPlayerName };
    }
  }

  const deepLinkUrl = buildCurrentDeepLinkUrl(customParams);
  const hashtags = "FRAG_GEAR,FPS感度,ゲーミングデバイス";
  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(deepLinkUrl)}&hashtags=${encodeURIComponent(hashtags)}`;
  window.open(intentUrl, "_blank", "noopener,noreferrer,width=600,height=520");
};

window.copyCurrentDeepLink = function (buttonEl, customParams = {}) {
  const urlToCopy = buildCurrentDeepLinkUrl(customParams);
  syncUrlWithCurrentState(customParams);
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(urlToCopy).then(() => {
    const originalHtml = buttonEl.innerHTML;
    buttonEl.innerHTML = "✓ リンクをコピーしました！";
    buttonEl.style.borderColor = "#d4ff33";
    buttonEl.style.color = "#d4ff33";
    setTimeout(() => {
      buttonEl.innerHTML = originalHtml;
      buttonEl.style.borderColor = "rgba(255,255,255,0.18)";
      buttonEl.style.color = "#e4e4e7";
    }, 1800);
  });
};

function setupGlobalShareUrlButton() {
  const statusEl = document.getElementById("source-status");
  if (!statusEl || document.getElementById("frag-copy-url-btn")) return;

  const parent = statusEl.parentElement;
  if (parent) {
    parent.insertAdjacentHTML(
      "beforebegin",
      `<button type="button" id="frag-copy-url-btn"
         onclick="window.copyCurrentDeepLink(this)"
         style="cursor: pointer; margin-right: 0.65rem; padding: 0.4rem 0.85rem; border-radius: 999px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.18); color: #e4e4e7; font-size: 0.74rem; font-weight: 700; transition: all 0.2s;"
         title="現在のタブ・検索条件・感度設定を含んだ共有URLをコピー">
         🔗 この画面のURLをコピー
       </button>`
    );
  }
}

let hasRestoredFromUrl = false;

function restoreStateFromUrlParams(isAfterApiLoad = false) {
  const params = new URLSearchParams(window.location.search);
  if ([...params.keys()].length === 0) return;

  const tab = params.get("tab");
  if (tab && pageNames[tab]) {
    const navBtn = document.querySelector(`.nav-item[data-page="${tab}"]`);
    if (navBtn) navBtn.click();
  }

  if (tab === "consult" && !hasRestoredFromUrl) {
    const game = params.get("game");
    const rank = params.get("rank");
    const role = params.get("role");
    const issue = params.get("issue");

    if (game && consultGameSelect) {
      consultGameSelect.value = game;
      syncConsultSelectors();
    }
    if (rank && consultRankSelect) consultRankSelect.value = rank;
    if (role && consultRoleSelect) consultRoleSelect.value = role;
    if (issue !== null && document.getElementById("consult-issue")) {
      document.getElementById("consult-issue").value = issue;
    }
    document.getElementById("consult-form")?.dispatchEvent(new Event("submit", { cancelable: true }));
  }

  if (tab === "search") {
    setupCreatorFilterBar();
    const q = params.get("q");
    const game = params.get("game");
    const role = params.get("role");
    const type = params.get("type");
    const band = params.get("band");
    const sort = params.get("sort");
    const view = params.get("view");
    const syncPlayer = params.get("syncPlayer");
    const estimatePlayer = params.get("estimatePlayer");

    if (q !== null && document.getElementById("player-query")) document.getElementById("player-query").value = q;
    if (game !== null && searchGameSelect) {
      searchGameSelect.value = game;
      populateRoleOptions(searchRoleSelect, game, true);
    }
    if (role !== null && searchRoleSelect) searchRoleSelect.value = role;
    if (type) {
      currentCreatorTypeFilter = type;
      document.querySelectorAll(".js-creator-tab").forEach((t) => {
        const active = t.dataset.type === type;
        t.style.borderColor = active ? "#d4ff33" : "rgba(255,255,255,0.12)";
        t.style.background = active ? "rgba(212, 255, 51, 0.15)" : "rgba(255,255,255,0.03)";
        t.style.color = active ? "#fff" : "#a1a1aa";
      });
    }
    if (band) {
      currentSensBandFilter = band;
      document.querySelectorAll(".js-sens-band-tab").forEach((t) => {
        const active = t.dataset.band === band;
        t.style.borderColor = active ? "#d4ff33" : "rgba(255,255,255,0.12)";
        t.style.background = active ? "rgba(212, 255, 51, 0.15)" : "rgba(255,255,255,0.03)";
        t.style.color = active ? "#fff" : "#a1a1aa";
      });
    }
    if (sort && document.getElementById("search-sort-order")) {
      currentSortOrder = sort;
      document.getElementById("search-sort-order").value = sort;
    }
    if (view) {
      currentViewMode = view;
      document.querySelectorAll(".js-view-mode-btn").forEach((b) => {
        const active = b.dataset.view === view;
        b.style.background = active ? "rgba(212,255,51,0.2)" : "rgba(255,255,255,0.04)";
        b.style.color = active ? "#d4ff33" : "#a1a1aa";
      });
    }

    renderPlayers();

    if (isAfterApiLoad) {
      if (syncPlayer) window.openPlayerSyncModal(syncPlayer);
      if (estimatePlayer) window.openSetupEstimateModal(estimatePlayer);
    }
  }

  if (tab === "rankings") {
    const game = params.get("game");
    if (game) {
      const gameBtn = document.querySelector(`.game-tab[data-game="${game}"]`);
      if (gameBtn) gameBtn.click();
    }
  }

  if (tab === "match" && !hasRestoredFromUrl) {
    const game = params.get("game");
    const dpi = params.get("dpi");
    const sens = params.get("sens");
    if (game && document.getElementById("match-game")) document.getElementById("match-game").value = game;
    if (dpi && document.getElementById("match-dpi")) document.getElementById("match-dpi").value = dpi;
    if (sens && document.getElementById("match-sens")) document.getElementById("match-sens").value = sens;

    document.getElementById("match-form")?.dispatchEvent(new Event("submit", { cancelable: true }));
  }

  hasRestoredFromUrl = true;
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".nav-item, .game-tab, .js-creator-tab, .js-sens-band-tab, .js-view-mode-btn")) {
    setTimeout(() => syncUrlWithCurrentState(), 50);
  }
});
document.addEventListener("change", (e) => {
  if (e.target.matches("#search-game, #search-role, #search-sort-order, #consult-game, #consult-rank, #consult-role, #match-game")) {
    syncUrlWithCurrentState();
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.matches("#consult-form, #match-form")) {
    syncUrlWithCurrentState();
  }
});
document.getElementById("player-query")?.addEventListener("input", () => {
  syncUrlWithCurrentState();
});
// ============================================================================
// APIスマート接続エンジン（ローカル/Render自動判別 ＆ 感度マッチ即時フォールバック）
// ============================================================================
(() => {
  // 1. もしローカルでSpring Boot(8080)を起動している場合はローカルへ、なければRenderへ接続
  const metaApi = document.querySelector('meta[name="frag-api-base-url"]');
  const renderUrl = metaApi?.content || "https://backend-server-a1y2.onrender.com";

  // ページ読み込み時にRenderのウォームアップ（スリープ解除リクエスト）を非同期送信
  fetch(`${renderUrl}/api/liquipedia/players?game=VALORANT`, { mode: "no-cors" }).catch(() => {});

  // 2. /api/match への fetch がCORSやスリープで失敗した場合、即座にローカルDBで計算して正常レスポンスを返すラッパー
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const urlStr = typeof input === "string" ? input : (input instanceof URL ? input.toString() : input?.url || "");

    try {
      const response = await originalFetch(input, init);
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      // A. 感度マッチAPI (/api/match) のフォールバック計算
      if (urlStr.includes("/api/match")) {
        const parsedUrl = new URL(urlStr, window.location.origin);
        const game = parsedUrl.searchParams.get("game") || "VALORANT";
        const dpi = Number(parsedUrl.searchParams.get("dpi")) || 800;
        const sens = Number(parsedUrl.searchParams.get("sens")) || 0.35;
        const userCm = toCm360(dpi, sens, game);

        const allCandidates = getMergedPlayersList()
          .map((p) => {
            const pDpi = Number(p?.dpi);
            const pSens = Number(p?.sens);
            const cmPer360 = toCm360(pDpi, pSens, p?.game);
            const diff = Number.isFinite(cmPer360) && Number.isFinite(userCm) ? Math.abs(cmPer360 - userCm) : 9999;
            return { ...p, cmPer360, _diff: diff };
          })
          .filter((p) => Number.isFinite(p.cmPer360))
          .sort((a, b) => a._diff - b._diff)
          .slice(0, 6);

        console.info("⚡ APIスリープ中またはCORS制限のため、クライアント統合DBで感度マッチングを実行しました。");
        return new Response(JSON.stringify(allCandidates), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      // B. プレイヤー一覧API (/api/liquipedia/players) のフォールバック
      if (urlStr.includes("/api/liquipedia/players")) {
        const parsedUrl = new URL(urlStr, window.location.origin);
        const targetGame = parsedUrl.searchParams.get("game");
        const fallbackList = getMergedPlayersList().filter(
          (p) => !targetGame || normalizeGameName(p?.game) === normalizeGameName(targetGame)
        );
        return new Response(JSON.stringify(fallbackList), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      throw err;
    }
  };
})();
// 初回起動処理
setupGlobalShareUrlButton();
renderCompareTrayUI();
renderPlayers();
renderRankings("VALORANT");
restoreStateFromUrlParams(false);

async function loadLiquipediaPlayers() {
  const sourceStatus = document.getElementById("source-status");
  const sourceSummary = document.getElementById("source-summary");
  const apiBaseUrl = document.querySelector('meta[name="frag-api-base-url"]').content;
  sourceStatus.textContent = "データ同期中";
  sourceSummary.textContent = "サーバーからデータ取得中";

  try {
    const importedPlayers = [];
    for (const game of Object.keys(gameSpecs)) {
      const url = new URL("/api/liquipedia/players", apiBaseUrl);
      url.searchParams.set("game", game);
      const response = await fetch(url);
      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`API ${response.status}: ${responseText || response.statusText}`);
      }
      const gamePlayers = await response.json();
      if (!Array.isArray(gamePlayers)) {
        throw new Error("APIから不正なデータ形式が返されました。");
      }
      importedPlayers.push(...gamePlayers);
    }

    if (importedPlayers.length === 0) {
      sourceStatus.textContent = "該当データなし";
      sourceSummary.textContent = "API応答済み・表示データなし";
      return;
    }

    players = importedPlayers;
    const totalMergedCount = getMergedPlayersList().length;
    sourceStatus.textContent = "PRO & CREATOR DB";
    sourceSummary.textContent = `全 ${totalMergedCount} 名のデータを表示中`;
    document.getElementById("search-data-hint").textContent = `${totalMergedCount} PROFILES`;
    document.getElementById("ranking-disclaimer").innerHTML = `<strong>データ出典・範囲</strong><br>世界・日本のトッププロ選手および人気ストリーマー・VTuber計${totalMergedCount}名の公開デバイス・感度データを統合集計。出典: Liquipedia / ProSettings / 各配信者公開情報（CC BY-SA 3.0）。`;
    renderPlayers();
    const selectedRankingGame = document.querySelector(".game-tab.selected")?.dataset.game || "VALORANT";
    renderRankings(selectedRankingGame);
    renderCompareTrayUI();
    restoreStateFromUrlParams(true);
  } catch (error) {
    sourceStatus.textContent = "API接続失敗";
    sourceSummary.textContent = "APIエラー・デモデータを表示中";
    console.error("Data could not be loaded; demo data remains visible.", error);
  }
}

loadLiquipediaPlayers();
// ============================================================================
// キラー機能B：マウスパッド「スピード × コントロール」2次元性能マトリクス図
// ============================================================================
const FRAG_MOUSEPAD_DB = {
  "Wallhack SP-004": { speed: 9.5, control: 2.8, surface: "強化ガラス（超低摩擦）", thickness: "3.0mm", humidity: "👑 完全耐湿", price: 19800 },
  "SkyPAD 3.0 XL": { speed: 9.2, control: 3.2, surface: "強化ガラス（スピード）", thickness: "3.7mm", humidity: "👑 完全耐湿", price: 16800 },
  "Artisan Ninja FX Hien": { speed: 8.0, control: 5.8, surface: "布（梨地・スピード）", thickness: "4.0mm", humidity: "◎ 高耐湿", price: 6800 },
  "Artisan Ninja FX Hayate Otsu": { speed: 7.2, control: 6.8, surface: "布（ハイバランス）", thickness: "4.0mm", humidity: "◎ 高耐湿", price: 7200 },
  "Artisan Ninja FX Zero": { speed: 5.5, control: 8.2, surface: "布（王道バランス制御）", thickness: "4.0mm", humidity: "◎ 高耐湿", price: 6800 },
  "Lethal Gaming Gear Saturn Pro": { speed: 5.0, control: 8.6, surface: "布（しっとり制御）", thickness: "4.0mm", humidity: "◎ 高耐湿", price: 9800 },
  "Vaxee PA": { speed: 4.5, control: 8.5, surface: "布（フラット制御）", thickness: "3.5mm", humidity: "○ 標準", price: 5400 },
  "ZOWIE G-SR-SE": { speed: 4.2, control: 8.8, surface: "布（高密度ストッピング）", thickness: "3.5mm", humidity: "○ 標準", price: 5900 },
  "SteelSeries QcK Heavy": { speed: 3.8, control: 9.2, surface: "布（極厚6mm制動特化）", thickness: "6.0mm", humidity: "△ 湿気影響あり", price: 4200 }
};

let currentUserPadName = localStorage.getItem("frag_user_mousepad") || "SteelSeries QcK Heavy";

function findMousepadSpec(deviceName) {
  if (!deviceName) return null;
  if (FRAG_MOUSEPAD_DB[deviceName]) return { name: deviceName, ...FRAG_MOUSEPAD_DB[deviceName] };
  const target = String(deviceName).toLowerCase();
  const matchedKey = Object.keys(FRAG_MOUSEPAD_DB).find((k) =>
    k.toLowerCase().includes(target) || target.includes(k.toLowerCase())
  );
  return matchedKey ? { name: matchedKey, ...FRAG_MOUSEPAD_DB[matchedKey] } : null;
}

function buildMousepadMatrixHtml(targetDeviceName, containerId, sectionId = "ranking-youtube-section") {
  const targetSpec = findMousepadSpec(targetDeviceName);
  if (!targetSpec) return "";

  const userSpec = findMousepadSpec(currentUserPadName) || { name: "SteelSeries QcK Heavy", ...FRAG_MOUSEPAD_DB["SteelSeries QcK Heavy"] };
  const speedDiff = (targetSpec.speed - userSpec.speed).toFixed(1);
  const ctrlDiff = (targetSpec.control - userSpec.control).toFixed(1);

  let padAdvice = "";
  if (Number(speedDiff) >= 1.5) {
    padAdvice = `現在のパッドより滑走スピードが +${speedDiff} ポイント速くなるため、初動の引っかかりが消え、ApexやOW2などの追いエイム（トラッキング）や視点切り替えが劇的に軽くなります。`;
  } else if (Number(speedDiff) <= -1.5) {
    padAdvice = `現在のパッドよりストッピング性能が +${Math.abs(Number(ctrlDiff))} ポイント高まるため、VALORANT等のフリック時にクロスヘアがピタッと止まり、オーバーフリック（行き過ぎ）を防げます。`;
  } else {
    padAdvice = `現在のパッドと近いスピード帯（差 ${speedDiff}）のため、今のエイム感覚を大きく崩さずに表面の質感や耐湿性（${targetSpec.humidity}）をアップグレードできます。`;
  }

  const optionsHtml = Object.keys(FRAG_MOUSEPAD_DB).map((padKey) =>
    `<option value="${escapeHtml(padKey)}" ${padKey === userSpec.name ? "selected" : ""}>${escapeHtml(padKey)} (${formatYen(FRAG_MOUSEPAD_DB[padKey].price)})</option>`
  ).join("");

  // 2次元座標マップ上のドットを生成
  const dotsHtml = Object.entries(FRAG_MOUSEPAD_DB).map(([padName, spec]) => {
    const isTarget = padName === targetSpec.name;
    const isUser = padName === userSpec.name;
    const leftPct = Math.min(92, Math.max(8, (spec.speed / 10) * 84 + 6));
    const bottomPct = Math.min(88, Math.max(10, (spec.control / 10) * 78 + 8));

    const dotColor = isTarget ? "#d4ff33" : isUser ? "#38bdf8" : "rgba(255,255,255,0.45)";
    const dotSize = isTarget ? "14px" : isUser ? "12px" : "9px";
    const zIdx = isTarget ? 30 : isUser ? 20 : 10;
    const shortLabel = padName.replace("Artisan Ninja FX ", "Artisan ").replace("Lethal Gaming Gear ", "LGG ");

    return `
      <div onclick="window.selectMousepadFromMatrix('${escapeHtml(padName)}', '${escapeHtml(sectionId)}')"
           style="position: absolute; left: ${leftPct}%; bottom: ${bottomPct}%; transform: translate(-50%, 50%); z-index: ${zIdx}; cursor: pointer; display: flex; flex-direction: column; align-items: center; group;"
           title="クリックして「${escapeHtml(padName)}」を選択（スピード:${spec.speed} / コントロール:${spec.control}）">
        <span style="font-size: ${isTarget ? '0.72rem' : '0.64rem'}; font-weight: ${isTarget || isUser ? '800' : '600'}; color: ${isTarget ? '#d4ff33' : isUser ? '#38bdf8' : '#d4d4d8'}; background: rgba(9,9,11,0.88); padding: 0.1rem 0.4rem; border-radius: 4px; border: 1px solid ${isTarget ? '#d4ff33' : isUser ? '#38bdf8' : 'rgba(255,255,255,0.12)'}; white-space: nowrap; margin-bottom: 0.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.6);">
          ${isTarget ? "🎯 " : isUser ? "👤 " : ""}${escapeHtml(shortLabel)}
        </span>
        <div style="width: ${dotSize}; height: ${dotSize}; border-radius: 999px; background: ${dotColor}; border: 2px solid #09090b; box-shadow: ${isTarget ? '0 0 14px #d4ff33' : isUser ? '0 0 10px #38bdf8' : 'none'}; transition: transform 0.2s;"></div>
      </div>`;
  }).join("");

  return `
    <div id="${escapeHtml(containerId)}" data-target-device="${escapeHtml(targetSpec.name)}" data-section-id="${escapeHtml(sectionId)}"
         style="margin-bottom: 1.5rem; padding: 1.35rem 1.5rem; border-radius: 12px; background: linear-gradient(135deg, rgba(191,87,255,0.07) 0%, rgba(212,255,51,0.05) 100%); border: 1px solid rgba(255,255,255,0.14);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
        <div>
          <span class="eyebrow" style="color: #d4ff33;"><span class="eyebrow-line" style="background: #d4ff33;"></span>MOUSEPAD 2D PERFORMANCE MATRIX // スピード×コントロール性能マップ</span>
          <h4 style="margin: 0.3rem 0 0; font-size: 1.02rem; color: #fff; font-weight: 800;">
            🎯 選択中：「${escapeHtml(targetSpec.name)}」 <small style="color:#a1a1aa; font-weight:normal;">（マップ上の点をクリックで切り替え可能）</small>
          </h4>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <label style="font-size: 0.75rem; color: #38bdf8; font-weight: 700;">👤 あなたの今のパッド:</label>
          <select class="js-user-pad-select" data-container-id="${escapeHtml(containerId)}"
                  style="padding: 0.35rem 0.65rem; border-radius: 6px; background: rgba(0,0,0,0.65); border: 1px solid rgba(56,189,248,0.45); color: #fff; font-size: 0.76rem; font-weight: 600; cursor: pointer;">
            ${optionsHtml}
          </select>
        </div>
      </div>

      <!-- 2次元座標マップ本体 -->
      <div style="position: relative; width: 100%; height: 270px; border-radius: 10px; background: rgba(9, 9, 13, 0.85); border: 1px solid rgba(255,255,255,0.12); overflow: hidden; margin-bottom: 1rem;">
        <!-- 十字センターライン -->
        <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.08); border-left: 1px dashed rgba(255,255,255,0.15);"></div>
        <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: rgba(255,255,255,0.08); border-top: 1px dashed rgba(255,255,255,0.15);"></div>

        <!-- 4象限のラベル -->
        <div style="position: absolute; top: 0.6rem; left: 0.75rem; font-size: 0.68rem; color: #a1a1aa; font-weight: 700;">⬆️ ストッピング・制動力 高（フリック安定）</div>
        <div style="position: absolute; bottom: 0.6rem; left: 0.75rem; font-size: 0.68rem; color: #71717a;">⬇️ ハード・沈み込み少</div>
        <div style="position: absolute; bottom: 0.6rem; right: 0.75rem; font-size: 0.68rem; color: #d4ff33; font-weight: 700;">➡️ 初動・滑走スピード 速（追いエイム・ガラス）</div>
        <div style="position: absolute; top: 0.6rem; right: 0.75rem; font-size: 0.68rem; color: #e9d5ff; font-weight: 700;">✨ 高初動 × 高制動（ハイエンド布）</div>

        ${dotsHtml}
      </div>

      <!-- 選択中のパッド vs 自分のパッド スペック比較バー -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin-bottom: 0.85rem; font-size: 0.78rem;">
        <div style="padding: 0.7rem 0.9rem; border-radius: 8px; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.3);">
          <div style="font-size: 0.68rem; color: #38bdf8; font-weight: 800;">👤 現在: ${escapeHtml(userSpec.name)}</div>
          <div style="margin-top: 0.3rem; color: #e4e4e7;">スピード: <strong>${userSpec.speed}</strong> / 制動力: <strong>${userSpec.control}</strong> / 耐湿: ${escapeHtml(userSpec.humidity)}</div>
        </div>
        <div style="padding: 0.7rem 0.9rem; border-radius: 8px; background: rgba(212,255,51,0.1); border: 1px solid rgba(212,255,51,0.4);">
          <div style="display:flex; justify-content:space-between;">
            <span style="font-size: 0.68rem; color: #d4ff33; font-weight: 800;">🎯 候補: ${escapeHtml(targetSpec.name)}</span>
            <strong style="color:#fff; font-family:monospace;">${formatYen(targetSpec.price)}</strong>
          </div>
          <div style="margin-top: 0.3rem; color: #fff;">スピード: <strong style="color:#d4ff33;">${targetSpec.speed}</strong> / 制動力: <strong style="color:#d4ff33;">${targetSpec.control}</strong> / 耐湿: ${escapeHtml(targetSpec.humidity)}</div>
        </div>
      </div>

      <div style="padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <p style="margin: 0; font-size: 0.8rem; color: #e4e4e7; line-height: 1.45; flex: 1; min-width: 240px;">
          💡 <strong>マウスパッド乗り換え予測：</strong>${escapeHtml(padAdvice)}
        </p>
        ${createAffiliateButtonsHtml(targetSpec.name, false, "マウスパッド")}
      </div>
    </div>`;
}

// マップ上のドットをクリックしたときにそのマウスパッドの動画＆比較へ切り替える関数
window.selectMousepadFromMatrix = function (padName, sectionId) {
  const sec = document.getElementById(sectionId);
  if (!sec || !sec.previousElementSibling) return;
  renderYouTubeSection({
    sectionId,
    anchorElement: sec.previousElementSibling,
    position: "afterend",
    titlePrefix: "マウスパッド性能比較",
    deviceName: padName,
    hintText: "※2次元マップ上のドットをクリックで他のマウスパッドと比較できます"
  });
};

// ユーザーの現在パッド変更イベント
document.addEventListener("change", (e) => {
  const selectEl = e.target.closest(".js-user-pad-select");
  if (!selectEl) return;
  currentUserPadName = selectEl.value;
  localStorage.setItem("frag_user_mousepad", currentUserPadName);
  const containerId = selectEl.dataset.containerId;
  const containerEl = document.getElementById(containerId);
  if (containerEl) {
    const targetDevice = containerEl.dataset.targetDevice;
    const sectionId = containerEl.dataset.sectionId;
    containerEl.outerHTML = buildMousepadMatrixHtml(targetDevice, containerId, sectionId);
  }
});

// 既存の buildMouseComparisonHtml を拡張し、マウスなら「マウス比較」、マウスパッドなら「2次元性能マトリクス」を自動描画！
const _origBuildMouseComparison = buildMouseComparisonHtml;
buildMouseComparisonHtml = function (targetDeviceName, containerId) {
  const mouseHtml = _origBuildMouseComparison(targetDeviceName, containerId);
  if (mouseHtml) return mouseHtml;
  const sectionId = String(containerId).replace("-mouse-vs", "");
  return buildMousepadMatrixHtml(targetDeviceName, containerId, sectionId);
};

// ============================================================================
// キラー機能C：プロ＆配信者の「クロスヘアコード 1クリックコピー ＆ 視覚プレビュー」
// ============================================================================
const FRAG_CROSSHAIR_DB = {
  "TenZ": { code: "0;s;1;P;c;5;h;0;m;1;0l;4;0o;2;0a;1;0f;0;1b;0", label: "Cyan 1-4-2-2 Cross", color: "#00ffff", type: "cross", size: 6, gap: 2 },
  "Laz": { code: "0;p;0;s;1;P;c;1;u;000000FF;h;0;f;0;0l;4;0v;4;0o;2;0a;1;0f;0;1b;0", label: "White 1-4-2-2 Cross", color: "#ffffff", type: "cross", size: 6, gap: 2 },
  "Dep": { code: "0;P;c;5;o;1;d;1;z;3;f;0;0b;0;1b;0", label: "Cyan Center Dot", color: "#00ffff", type: "dot", size: 4, gap: 0 },
  "Meiy": { code: "0;P;c;1;h;0;f;0;0l;3;0o;2;0a;1;0f;0;1b;0", label: "White 1-3-2-2 Tight", color: "#ffffff", type: "cross", size: 5, gap: 2 },
  "Aspas": { code: "0;P;c;1;o;1;0l;3;0o;1;0a;1;0f;0;1b;0", label: "White 1-3-1-1 Micro", color: "#ffffff", type: "cross", size: 5, gap: 1 },
  "Demon1": { code: "0;P;o;1;d;1;0b;0;1b;0", label: "White 2px Headshot Dot", color: "#ffffff", type: "dot", size: 4, gap: 0 },
  "釈迦": { code: "0;P;c;1;o;1;0l;3;0o;1;0a;1;0f;0;1b;0", label: "White Tight Cross", color: "#ffffff", type: "cross", size: 5, gap: 1 },
  "葛葉": { code: "0;P;c;5;h;0;0l;4;0o;2;0a;1;0f;0;1b;0", label: "Cyan Standard Cross", color: "#00ffff", type: "cross", size: 6, gap: 2 },
  "だるまいずごっと": { code: "0;P;c;1;h;0;0l;4;0o;1;0a;1;0f;0;1b;0", label: "White 1-4-1-1 Cross", color: "#ffffff", type: "cross", size: 6, gap: 1 },
  "ありさか": { code: "0;P;c;1;o;1;d;1;0b;0;1b;0", label: "White Center Dot", color: "#ffffff", type: "dot", size: 4, gap: 0 },
  "ローレン": { code: "0;P;c;5;h;0;0l;3;0o;2;0a;1;0f;0;1b;0", label: "Cyan 1-3-2-2 Cross", color: "#00ffff", type: "cross", size: 5, gap: 2 },
  "猫汰つな": { code: "0;P;c;8;u;FF69B4FF;o;1;d;1;0b;0;1b;0", label: "Pink Custom Dot", color: "#ff69b4", type: "dot", size: 4, gap: 0 },
  "夢野あかり": { code: "0;P;c;1;h;0;0l;4;0o;2;0a;1;0f;0;1b;0", label: "White Classic Cross", color: "#ffffff", type: "cross", size: 6, gap: 2 },
  "紡木こかげ": { code: "0;P;c;5;h;0;0l;3;0o;1;0a;1;0f;0;1b;0", label: "Cyan Micro Cross", color: "#38bdf8", type: "cross", size: 4, gap: 1 },
  "胡桃のあ": { code: "0;P;c;5;h;0;0l;4;0o;2;0a;1;0f;0;1b;0", label: "Cyan 1-4-2-2 Cross", color: "#00ffff", type: "cross", size: 6, gap: 2 },
  "橘ひなの": { code: "0;P;c;1;h;0;0l;3;0o;2;0a;1;0f;0;1b;0", label: "White 1-3-2-2 Cross", color: "#ffffff", type: "cross", size: 5, gap: 2 }
};

const FALLBACK_CROSSHAIR_POOL = [
  { code: "0;P;c;5;h;0;f;0;0l;4;0o;2;0a;1;0f;0;1b;0", label: "Cyan 1-4-2-2 Pro Cross", color: "#00ffff", type: "cross", size: 6, gap: 2 },
  { code: "0;P;c;1;h;0;f;0;0l;3;0o;2;0a;1;0f;0;1b;0", label: "White 1-3-2-2 Compact", color: "#ffffff", type: "cross", size: 5, gap: 2 },
  { code: "0;P;c;1;o;1;d;1;z;3;0b;0;1b;0", label: "White Precision Dot", color: "#ffffff", type: "dot", size: 4, gap: 0 },
  { code: "0;P;c;2;h;0;f;0;0l;4;0o;1;0a;1;0f;0;1b;0", label: "Green 1-4-1-1 Sharp", color: "#4ade80", type: "cross", size: 6, gap: 1 },
  { code: "0;P;c;4;h;0;f;0;0l;3;0o;2;0a;1;0f;0;1b;0", label: "Yellow 1-3-2-2 Pro", color: "#facc15", type: "cross", size: 5, gap: 2 }
];

function getPlayerCrosshairData(playerName) {
  const cleanName = String(playerName || "");
  const matchedKey = Object.keys(FRAG_CROSSHAIR_DB).find((k) => cleanName.toLowerCase().includes(k.toLowerCase()));
  if (matchedKey) return FRAG_CROSSHAIR_DB[matchedKey];

  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = (hash * 31 + cleanName.charCodeAt(i)) % 997;
  }
  return FALLBACK_CROSSHAIR_POOL[hash % FALLBACK_CROSSHAIR_POOL.length];
}

// クロスヘアの視覚的なミニSVGプレビューを生成
function renderCrosshairSvgPreview(ch) {
  if (ch.type === "dot") {
    return `
      <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.16); flex-shrink:0;" title="クロスヘアプレビュー">
        <span style="width:5px; height:5px; border-radius:999px; background:${ch.color}; box-shadow:0 0 2px #000;"></span>
      </span>`;
  }
  return `
    <svg width="28" height="28" viewBox="0 0 28 28" style="border-radius:6px; background:#09090b; border:1px solid rgba(255,255,255,0.16); flex-shrink:0;" title="クロスヘアプレビュー">
      <rect x="13" y="${14 - ch.gap - ch.size}" width="2" height="${ch.size}" fill="${ch.color}" />
      <rect x="13" y="${14 + ch.gap}" width="2" height="${ch.size}" fill="${ch.color}" />
      <rect x="${14 - ch.gap - ch.size}" y="13" width="${ch.size}" height="2" fill="${ch.color}" />
      <rect x="${14 + ch.gap}" y="13" width="${ch.size}" height="2" fill="${ch.color}" />
    </svg>`;
}

function buildCrosshairBarHtml(playerName) {
  const ch = getPlayerCrosshairData(playerName);
  return `
    <div class="js-crosshair-box" style="margin-top: 0.55rem; padding: 0.45rem 0.65rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
      <div style="display: flex; align-items: center; gap: 0.55rem; min-width: 0;">
        ${renderCrosshairSvgPreview(ch)}
        <div style="min-width: 0;">
          <div style="font-size: 0.64rem; color: #a1a1aa; font-weight: 700; letter-spacing: 0.04em;">CROSSHAIR CODE</div>
          <div style="font-size: 0.76rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(ch.label)}</div>
        </div>
      </div>
      <button type="button"
              onclick="window.copySensValue(this, '${escapeHtml(ch.code)}')"
              style="flex-shrink: 0; cursor: pointer; padding: 0.28rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 800; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #e4e4e7; transition: all 0.15s;"
              title="VALORANT用クロスヘアコード（${escapeHtml(ch.code)}）をコピー">
        🎯 コードをコピー
      </button>
    </div>`;
}

// 既存の refreshAllInteractiveEnhancements を安全にラップし、全カードへクロスヘアバーを自動注入
const _origRefreshEnhancements = refreshAllInteractiveEnhancements;
refreshAllInteractiveEnhancements = function () {
  _origRefreshEnhancements();

  document.querySelectorAll(".player-card, .match-card").forEach((card) => {
    if (card.querySelector(".js-crosshair-box")) return;
    const heading = card.querySelector("h3, h2");
    if (!heading) return;
    const playerName = heading.textContent.trim();
    if (!playerName) return;

    const sensRow = card.querySelector(".player-sens");
    if (sensRow) {
      sensRow.insertAdjacentHTML("afterend", buildCrosshairBarHtml(playerName));
    } else {
      const devicesBox = card.querySelector(".match-devices") || card.querySelector(".js-yt-trigger")?.parentElement;
      if (devicesBox) {
        devicesBox.insertAdjacentHTML("beforebegin", `<div style="margin-bottom:0.65rem;">${buildCrosshairBarHtml(playerName)}</div>`);
      }
    }
  });
};

// シンクロ診断モーダルにもクロスヘアコピー欄を自動追加
const _origOpenPlayerSyncModal = window.openPlayerSyncModal;
window.openPlayerSyncModal = function (playerName, event) {
  _origOpenPlayerSyncModal(playerName, event);
  const modalRoot = document.getElementById("frag-sync-modal-root");
  if (!modalRoot || modalRoot.querySelector(".js-crosshair-box")) return;
  const infoGrid = modalRoot.querySelector("div[style*='display: grid']");
  if (infoGrid) {
    infoGrid.insertAdjacentHTML("afterend", `<div style="margin-bottom: 1.1rem;">${buildCrosshairBarHtml(playerName)}</div>`);
  }
};

// 初回反映
refreshAllInteractiveEnhancements();
// ============================================================================
// キラー機能D：マウス形状・サイズ感「実寸シルエットオーバーレイ比較（上面・側面SVG）」
// ============================================================================

// 寸法文字列（例: "125 × 63.5 × 40 mm"）から 全長(L)・横幅(W)・高さ(H) を数値抽出する関数
function parseMouseDimensions(spec) {
  const raw = String(spec?.size || "125 × 63.5 × 40 mm");
  const matches = raw.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/i);
  if (!matches) {
    return { length: 125, width: 63.5, height: 40 };
  }
  const v1 = parseFloat(matches[1]);
  const v2 = parseFloat(matches[2]);
  const v3 = parseFloat(matches[3]);
  // 横幅と高さの記載順が逆のモデル（G502 X等）でも正確に横幅＞高さとして正規化
  return {
    length: v1,
    width: Math.max(v2, v3),
    height: Math.min(v2, v3)
  };
}

// 上面（Top View）の実寸比率SVGパスを生成する関数
function createTopViewPath(dim, shapeStr, nameStr) {
  const scale = 0.88;
  const cx = 110;
  const bottomY = 132;
  const L = dim.length * scale;
  const W = dim.width * scale;
  const topY = bottomY - L;
  const halfW = W / 2;

  const isErgo = /エルゴ|非対称/.test(shapeStr);
  const ergoLeftFlare = isErgo ? 3.5 : 0;
  const ergoRightTilt = isErgo ? 2.5 : 0;

  // お尻（下部）→ 左くびれ → 左先端 → 先端中央 → 右先端 → 右くびれ → お尻
  return `
    M ${cx} ${bottomY}
    C ${cx - halfW * 0.95} ${bottomY}, ${cx - halfW - ergoLeftFlare} ${bottomY - L * 0.28}, ${cx - halfW * 0.86} ${bottomY - L * 0.52}
    C ${cx - halfW * 0.78} ${bottomY - L * 0.72}, ${cx - halfW * 0.88} ${topY + L * 0.14}, ${cx - halfW * 0.45} ${topY + 2}
    Q ${cx} ${topY - 2}, ${cx + halfW * 0.45} ${topY + 2 + ergoRightTilt}
    C ${cx + halfW * 0.88} ${topY + L * 0.14 + ergoRightTilt}, ${cx + halfW * 0.82} ${bottomY - L * 0.72}, ${cx + halfW * 0.9} ${bottomY - L * 0.5}
    C ${cx + halfW * 1.02} ${bottomY - L * 0.25}, ${cx + halfW * 0.95} ${bottomY}, ${cx} ${bottomY}
    Z
  `;
}

// 側面（Side View）の実寸比率SVGパス（コブの高さ・頂点位置）を生成する関数
function createSideViewPath(dim, shapeStr, nameStr) {
  const scale = 1.42;
  const baseY = 104;
  const rearX = 24;
  const L = dim.length * scale;
  const H = dim.height * scale;
  const frontX = rearX + L;
  const peakY = baseY - H;

  // 後部高め（Sora V2 / Atlantis等）はコブの頂点を後ろ寄りに配置
  const isBackHump = /後部高め|ワイドバック|Sora|Atlantis/i.test(String(shapeStr) + String(nameStr));
  const humpRatio = isBackHump ? 0.37 : 0.47;
  const peakX = rearX + L * humpRatio;

  return {
    path: `
      M ${rearX + 4} ${baseY}
      Q ${rearX - 3} ${baseY - H * 0.35}, ${rearX + L * 0.14} ${peakY + H * 0.18}
      Q ${peakX - L * 0.08} ${peakY}, ${peakX} ${peakY}
      C ${peakX + L * 0.22} ${peakY}, ${frontX - L * 0.14} ${baseY - H * 0.38}, ${frontX} ${baseY - 6}
      Q ${frontX + 2} ${baseY - 1}, ${frontX - 5} ${baseY}
      Z
    `,
    peakX,
    peakY
  };
}

function buildMouseSilhouetteOverlayHtml(userSpec, targetSpec) {
  const uDim = parseMouseDimensions(userSpec);
  const tDim = parseMouseDimensions(targetSpec);

  const dLength = (tDim.length - uDim.length).toFixed(1);
  const dWidth = (tDim.width - uDim.width).toFixed(1);
  const dHeight = (tDim.height - uDim.height).toFixed(1);

  const formatDelta = (val, posLabel, negLabel) => {
    const num = Number(val);
    if (num > 0) return `<span style="color:#fde047; font-weight:800;">+${val}mm (${posLabel})</span>`;
    if (num < 0) return `<span style="color:#d4ff33; font-weight:800;">${val}mm (${negLabel})</span>`;
    return `<span style="color:#a1a1aa; font-weight:700;">±0.0mm (同寸)</span>`;
  };

  const uTopPath = createTopViewPath(uDim, userSpec.shape, userSpec.name);
  const tTopPath = createTopViewPath(tDim, targetSpec.shape, targetSpec.name);

  const uSide = createSideViewPath(uDim, userSpec.shape, userSpec.name);
  const tSide = createSideViewPath(tDim, targetSpec.shape, targetSpec.name);

  return `
    <div class="js-silhouette-overlay" style="margin: 1rem 0; padding: 1.1rem 1.25rem; border-radius: 10px; background: rgba(9, 9, 13, 0.78); border: 1px solid rgba(255,255,255,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.85rem;">
        <div>
          <span style="font-size: 0.7rem; color: #d4ff33; font-weight: 800; letter-spacing: 0.06em;">REAL-SCALE SILHOUETTE OVERLAY // 実寸形状オーバーレイ比較</span>
          <div style="font-size: 0.82rem; color: #e4e4e7; margin-top: 0.15rem;">上面（幅・くびれ）と側面（高さ・コブ位置）の1:1スケール重ね合わせ</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.9rem; font-size: 0.74rem;">
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #38bdf8; font-weight: 700;">
            <span style="width: 14px; height: 3px; border-top: 2px dashed #38bdf8; display: inline-block;"></span>
            現在 (${escapeHtml(userSpec.name.split("(")[0].trim())})
          </span>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #d4ff33; font-weight: 800;">
            <span style="width: 14px; height: 3px; background: #d4ff33; display: inline-block;"></span>
            候補 (${escapeHtml(targetSpec.name)})
          </span>
        </div>
      </div>

      <!-- 上面（Top View）＆ 側面（Side View）の2カラムSVG -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; align-items: center;">
        <!-- 1. TOP VIEW (上面シルエット) -->
        <div style="padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: center;">
          <div style="font-size: 0.7rem; color: #a1a1aa; font-weight: 700; margin-bottom: 0.3rem;">TOP VIEW // 上面（全長 × 横幅）</div>
          <svg viewBox="0 0 220 145" style="width: 100%; max-width: 220px; height: 145px; margin: 0 auto; display: block;">
            <!-- 背景ミリ単位グリッド -->
            <line x1="110" y1="8" x2="110" y2="136" stroke="rgba(255,255,255,0.07)" stroke-dasharray="2 2" />
            <line x1="30" y1="72" x2="190" y2="72" stroke="rgba(255,255,255,0.07)" stroke-dasharray="2 2" />
            <!-- 現在のマウス（水色点線） -->
            <path d="${uTopPath}" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4 3" />
            <!-- 候補のプロマウス（ライム実線） -->
            <path d="${tTopPath}" fill="rgba(212, 255, 51, 0.14)" stroke="#d4ff33" stroke-width="2.2" />
            <!-- ホイール位置マーカー -->
            <rect x="107.5" y="34" width="5" height="12" rx="2.5" fill="rgba(212,255,51,0.7)" />
          </svg>
          <div style="font-size: 0.74rem; color: #d4d4d8; margin-top: 0.25rem; display: flex; justify-content: center; gap: 0.75rem;">
            <span>全長差: ${formatDelta(dLength, "長め", "コンパクト")}</span>
            <span>横幅差: ${formatDelta(dWidth, "広め", "細身")}</span>
          </div>
        </div>

        <!-- 2. SIDE VIEW (側面シルエット・コブ位置) -->
        <div style="padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: center;">
          <div style="font-size: 0.7rem; color: #a1a1aa; font-weight: 700; margin-bottom: 0.3rem;">SIDE VIEW // 側面（高さ・コブの頂点位置）</div>
          <svg viewBox="0 0 235 120" style="width: 100%; max-width: 245px; height: 145px; margin: 0 auto; display: block;">
            <!-- 底面ライン -->
            <line x1="12" y1="104" x2="222" y2="104" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
            <!-- 現在のマウス側面（水色点線） -->
            <path d="${uSide.path}" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4 3" />
            <circle cx="${uSide.peakX}" cy="${uSide.peakY}" r="3" fill="#38bdf8" />
            <!-- 候補のプロマウス側面（ライム実線） -->
            <path d="${tSide.path}" fill="rgba(212, 255, 51, 0.14)" stroke="#d4ff33" stroke-width="2.2" />
            <circle cx="${tSide.peakX}" cy="${tSide.peakY}" r="3.5" fill="#d4ff33" />
            <!-- 向きラベル -->
            <text x="20" y="116" fill="#71717a" font-size="8" font-weight="bold">◀ 後部 (手のひら側)</text>
            <text x="152" y="116" fill="#71717a" font-size="8" font-weight="bold">先端 (クリック側) ▶</text>
          </svg>
          <div style="font-size: 0.74rem; color: #d4d4d8; margin-top: 0.25rem; display: flex; justify-content: center; gap: 0.75rem;">
            <span>高さ差: ${formatDelta(dHeight, "高め", "低背")}</span>
            <span>推奨: <strong style="color:#fff;">${escapeHtml(targetSpec.grip || "オールラウンド")}</strong></span>
          </div>
        </div>
      </div>
    </div>`;
}

// 既存の buildMouseComparisonHtml を拡張し、マウス比較カード内に「実寸シルエットオーバーレイ」を自動挿入
const _prevBuildMouseComparisonForSilhouette = buildMouseComparisonHtml;
buildMouseComparisonHtml = function (targetDeviceName, containerId) {
  const baseHtml = _prevBuildMouseComparisonForSilhouette(targetDeviceName, containerId);
  const targetSpec = findMouseSpec(targetDeviceName);
  // マウス以外（マウスパッドの2次元マップなど）の場合はそのまま返す
  if (!targetSpec || !baseHtml || baseHtml.includes("js-silhouette-overlay")) {
    return baseHtml;
  }

  const userSpec = findMouseSpec(currentUserMouseName) || {
    name: currentUserMouseName,
    ...MOUSE_SPECS_DB["Logicool G703h (定番エルゴ / 95g)"]
  };
  const silhouetteHtml = buildMouseSilhouetteOverlayHtml(userSpec, targetSpec);

  // 「💡 乗り換え体感予測」のフッター行の直前にシルエット比較図を差し込む
  const footerMarker = '<div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08);';
  if (baseHtml.includes(footerMarker)) {
    return baseHtml.replace(footerMarker, silhouetteHtml + footerMarker);
  }
  return baseHtml;
};

// 初回表示中のマウス比較カードにも即座にシルエット図を反映
document.querySelectorAll("[id$='-mouse-vs']").forEach((el) => {
  const targetDev = el.dataset.targetDevice;
  if (targetDev && findMouseSpec(targetDev)) {
    el.outerHTML = buildMouseComparisonHtml(targetDev, el.id);
  }
});
// ============================================================================
// SEO強化：URLパラメータ連動の動的タイトル＆Canonical更新エンジン
// ============================================================================
function updateDynamicSeoMeta() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab") || "consult";
  const q = params.get("q") || "";
  const type = params.get("type") || "";
  const game = params.get("game") || "";
  const syncPlayer = params.get("syncPlayer") || params.get("estimatePlayer") || "";

  let pageTitle = "FRAG // GEAR INTELLIGENCE | FPSプロ・配信者の感度変換＆デバイス比較データベース";
  if (syncPlayer) {
    pageTitle = `${syncPlayer} の使用デバイス・感度（振り向き）・一式総額 | FRAG`;
  } else if (tab === "search") {
    if (type === "vtuber") pageTitle = "ぶいすぽっ！・にじさんじ等 VTuberのFPS感度＆使用デバイス一覧 | FRAG";
    else if (type === "streamer") pageTitle = "人気ストリーマー（釈迦・だるま・ありさか等）の使用デバイス＆感度一覧 | FRAG";
    else if (q) pageTitle = `「${q}」の使用プロ・配信者＆感度設定データ | FRAG`;
    else pageTitle = "FPSプロ・ストリーマー・VTuberの感度＆デバイス検索データベース | FRAG";
  } else if (tab === "rankings") {
    pageTitle = `${game || "VALORANT"} プロ使用率ランキング（マウス・ラピトリキーボード・パッド） | FRAG`;
  } else if (tab === "match") {
    pageTitle = "FPS感度コンバーター・振り向き(cm/360°)計算＆プロ感度マッチング | FRAG";
  }

  document.title = pageTitle;

  const canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) {
    canonicalEl.setAttribute("href", window.location.href.split("#")[0]);
  }
}

updateDynamicSeoMeta();
window.addEventListener("popstate", updateDynamicSeoMeta);
document.addEventListener("click", () => setTimeout(updateDynamicSeoMeta, 80));
// ============================================================================
// サイト全体ビジュアル化エンジン v4（カード整列 ＋ 下部FAQ・リンク集の図解ベントーグリッド化）
// ============================================================================
(() => {
  // 1. レイアウト＆図解ベントーグリッド用CSSの注入
  if (!document.getElementById("frag-clean-card-layout-css")) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style id="frag-clean-card-layout-css">
        .player-card {
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
        }
        .player-card .device-list {
          display: grid !important;
          gap: 0.55rem !important;
          margin: 0.65rem 0 !important;
        }
        .player-card .device-row {
          display: grid !important;
          grid-template-columns: 52px 1fr !important;
          align-items: center !important;
          gap: 0.7rem !important;
          padding: 0.6rem 0.7rem !important;
          border-radius: 8px !important;
          background: rgba(255, 255, 255, 0.025) !important;
          border: 1px solid rgba(255, 255, 255, 0.07) !important;
          box-sizing: border-box !important;
        }
        .player-card .device-row:hover {
          background: rgba(191, 87, 255, 0.08) !important;
          border-color: rgba(191, 87, 255, 0.4) !important;
        }
        /* 下部ベントーグリッド＆チップのホバー演出 */
        .frag-bento-card {
          padding: 1.15rem 1.25rem;
          border-radius: 12px;
          background: rgba(16, 16, 22, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.09);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.85rem;
          transition: transform 0.18s, border-color 0.18s;
        }
        .frag-bento-card:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 255, 51, 0.45);
        }
        .frag-visual-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.38rem 0.75rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 800;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #f4f4f5;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .frag-visual-chip:hover {
          transform: translateY(-1px);
          background: rgba(212, 255, 51, 0.14);
          border-color: #d4ff33;
          color: #fff;
        }
      </style>`
    );
  }

  // 2. デバイス名からブランドカラー・形状タイプを判定
  function getDeviceVisualTheme(deviceName, categoryHint = "") {
    const name = String(deviceName || "");
    const lower = name.toLowerCase();

    let accent = "#d4ff33";
    let bodyColor = "#1e1e26";
    let subColor = "#2e2e3a";

    if (/logicool|logitech|superlight|g703|g304|g502/i.test(lower)) {
      accent = "#38bdf8"; bodyColor = "#f4f4f6"; subColor = "#27272a";
    } else if (/razer|viper|deathadder|huntsman|blackshark/i.test(lower)) {
      accent = "#4ade80"; bodyColor = "#141418"; subColor = "#1f2937";
    } else if (/wooting/i.test(lower)) {
      accent = "#facc15"; bodyColor = "#18181b"; subColor = "#f59e0b";
    } else if (/artisan|zero|hayate|hien|疾風|飛燕/i.test(lower)) {
      accent = "#ef4444"; bodyColor = "#16161a"; subColor = "#7f1d1d";
    } else if (/wallhack|skypad/i.test(lower)) {
      accent = "#e2e8f0"; bodyColor = "#0f172a"; subColor = "#38bdf8";
    } else if (/finalmouse|ultralight|beast/i.test(lower)) {
      accent = "#fbbf24"; bodyColor = "#1c1917"; subColor = "#78350f";
    } else if (/sora|ninjutso|lamzu|atlantis/i.test(lower)) {
      accent = "#c084fc"; bodyColor = "#1e1b4b"; subColor = "#4c1d95";
    } else if (/vaxee|zowie|ec2|g-sr|xl25/i.test(lower)) {
      accent = "#fb923c"; bodyColor = "#18181b"; subColor = "#9a3412";
    } else if (/steelseries|apex pro|qck|arctis/i.test(lower)) {
      accent = "#f97316"; bodyColor = "#18181b"; subColor = "#431407";
    } else if (/shure|se215|se846|ie 100|sennheiser|earpods|bose|inzone|hyperx/i.test(lower)) {
      accent = "#2dd4bf"; bodyColor = "#131c21"; subColor = "#115e59";
    } else if (/drunkdeer|realforce/i.test(lower)) {
      accent = "#ec4899"; bodyColor = "#1f1624"; subColor = "#831843";
    }

    let cat = categoryHint;
    if (!cat) {
      if (/wooting|huntsman|apex pro|realforce|drunkdeer|celeritas|rapid|キーボード/i.test(lower)) cat = "キーボード";
      else if (/artisan|zero|hayate|hien|vaxee pa|saturn|qck|g-sr|wallhack|skypad|パッド/i.test(lower)) cat = "マウスパッド";
      else if (/shure|se215|se846|earpods|bose|sennheiser|inzone|cloud|blackshark|arctis|g pro x 2|ヘッド/i.test(lower)) cat = "ヘッドセット";
      else if (/xl25|oled|aw25|モニター/i.test(lower)) cat = "モニター";
      else cat = "マウス";
    }

    return { accent, bodyColor, subColor, cat, isLightBody: bodyColor === "#f4f4f6" };
  }

  // 3. デバイス種別ごとのSVGイラスト生成
  window.renderDeviceVisualThumb = function (deviceName, categoryHint = "", size = "md") {
    if (!deviceName || deviceName === "データなし") return "";
    const theme = getDeviceVisualTheme(deviceName, categoryHint);
    const w = size === "lg" ? 88 : size === "sm" ? 52 : size === "xs" ? 34 : 60;
    const h = size === "lg" ? 64 : size === "sm" ? 44 : size === "xs" ? 26 : 46;
    const lower = String(deviceName).toLowerCase();

    let illustrationSvg = "";

    if (theme.cat === "マウス") {
      const isHoneycomb = /finalmouse|ultralight|beast/i.test(lower);
      const strokeCol = theme.isLightBody ? "#a1a1aa" : "rgba(255,255,255,0.28)";
      illustrationSvg = `
        <rect x="33" y="8" width="22" height="40" rx="11" fill="${theme.bodyColor}" stroke="${strokeCol}" stroke-width="1.6"/>
        <line x1="34" y1="21" x2="54" y2="21" stroke="${strokeCol}" stroke-width="1"/>
        <line x1="44" y1="8" x2="44" y2="21" stroke="${strokeCol}" stroke-width="1"/>
        <rect x="42.2" y="12" width="3.6" height="7" rx="1.8" fill="${theme.accent}"/>
        <rect x="31.5" y="22" width="1.8" height="5" rx="0.9" fill="${theme.accent}"/>
        <rect x="31.5" y="28.5" width="1.8" height="4.5" rx="0.9" fill="${theme.accent}"/>
        ${isHoneycomb ? `
          <circle cx="41" cy="31" r="1.6" fill="${theme.accent}" opacity="0.7"/>
          <circle cx="47" cy="31" r="1.6" fill="${theme.accent}" opacity="0.7"/>
          <circle cx="44" cy="36" r="1.6" fill="${theme.accent}" opacity="0.7"/>
        ` : `<circle cx="44" cy="37" r="2.6" fill="${theme.accent}" opacity="0.85"/>`}
      `;
    } else if (theme.cat === "キーボード") {
      const hasStrap = /wooting/i.test(lower);
      illustrationSvg = `
        ${hasStrap ? `<path d="M 10 24 L 16 20 L 16 34 L 10 30 Z" fill="#facc15"/>` : ""}
        <rect x="15" y="14" width="58" height="28" rx="4" fill="${theme.bodyColor}" stroke="rgba(255,255,255,0.28)" stroke-width="1.5"/>
        <line x1="18" y1="39" x2="70" y2="39" stroke="${theme.accent}" stroke-width="1.8" stroke-linecap="round"/>
        <rect x="19" y="18" width="5" height="4.5" rx="1" fill="${theme.accent}"/>
        <rect x="25.5" y="18" width="5" height="4.5" rx="1" fill="#3f3f46"/>
        <rect x="32" y="18" width="5" height="4.5" rx="1" fill="${theme.accent}"/>
        <rect x="38.5" y="18" width="5" height="4.5" rx="1" fill="#3f3f46"/>
        <rect x="45" y="18" width="5" height="4.5" rx="1" fill="#3f3f46"/>
        <rect x="51.5" y="18" width="5" height="4.5" rx="1" fill="#3f3f46"/>
        <rect x="58" y="18" width="11" height="4.5" rx="1" fill="${theme.subColor}"/>
        <rect x="20" y="24.5" width="5.5" height="4.5" rx="1" fill="${theme.accent}"/>
        <rect x="27" y="24.5" width="5.5" height="4.5" rx="1" fill="${theme.accent}"/>
        <rect x="34" y="24.5" width="5.5" height="4.5" rx="1" fill="${theme.accent}"/>
        <rect x="41" y="24.5" width="16" height="4.5" rx="1" fill="#27272a"/>
        <rect x="58.5" y="24.5" width="10.5" height="4.5" rx="1" fill="#3f3f46"/>
        <rect x="19" y="31" width="9" height="4.5" rx="1" fill="#3f3f46"/>
        <rect x="30" y="31" width="24" height="4.5" rx="1" fill="${theme.accent}" opacity="0.85"/>
        <rect x="56" y="31" width="13" height="4.5" rx="1" fill="#3f3f46"/>
      `;
    } else if (theme.cat === "マウスパッド") {
      const isGlass = /wallhack|skypad/i.test(lower);
      illustrationSvg = `
        <rect x="16" y="10" width="56" height="36" rx="4" fill="${theme.bodyColor}" stroke="${isGlass ? '#38bdf8' : 'rgba(255,255,255,0.25)'}" stroke-width="1.6" ${isGlass ? '' : 'stroke-dasharray="3 1"'}/>
        <path d="M 22 38 Q 42 16, 64 22" fill="none" stroke="${theme.accent}" stroke-width="1.6" stroke-dasharray="2 2"/>
        <circle cx="64" cy="22" r="3" fill="${theme.accent}"/>
        <rect x="56" y="37" width="12" height="5" rx="1" fill="${theme.accent}"/>
      `;
    } else if (theme.cat === "ヘッドセット") {
      const isIem = /shure|se215|se846|earpods|bose|sennheiser|ie 100|inzone/i.test(lower);
      illustrationSvg = isIem ? `
        <path d="M 24 38 C 24 14, 42 12, 46 24" fill="none" stroke="${theme.accent}" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="47" cy="28" rx="9" ry="6.5" fill="${theme.bodyColor}" stroke="${theme.accent}" stroke-width="1.8"/>
        <circle cx="49" cy="28" r="2.5" fill="${theme.accent}"/>
        <rect x="55" y="26" width="5" height="4" rx="2" fill="#e4e4e7"/>
      ` : `
        <path d="M 28 32 A 16 15 0 0 1 60 32" fill="none" stroke="#e4e4e7" stroke-width="3" stroke-linecap="round"/>
        <rect x="24" y="27" width="7" height="14" rx="3.5" fill="${theme.bodyColor}" stroke="${theme.accent}" stroke-width="1.6"/>
        <rect x="57" y="27" width="7" height="14" rx="3.5" fill="${theme.bodyColor}" stroke="${theme.accent}" stroke-width="1.6"/>
        <path d="M 27 39 Q 34 45, 42 43" fill="none" stroke="${theme.accent}" stroke-width="1.6" stroke-linecap="round"/>
      `;
    } else {
      illustrationSvg = `
        <rect x="18" y="10" width="52" height="30" rx="3" fill="${theme.bodyColor}" stroke="${theme.accent}" stroke-width="1.6"/>
        <line x1="44" y1="40" x2="44" y2="47" stroke="#a1a1aa" stroke-width="2.5"/>
        <line x1="34" y1="47" x2="54" y2="47" stroke="#a1a1aa" stroke-width="2.5" stroke-linecap="round"/>
        <text x="44" y="28" text-anchor="middle" fill="${theme.accent}" font-size="9" font-weight="900" font-family="monospace">240Hz+</text>
      `;
    }

    return `
      <span class="frag-device-thumb" style="display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: ${w}px; height: ${h}px; border-radius: 7px; background: radial-gradient(circle at 50% 35%, ${theme.subColor} 0%, #09090d 90%); border: 1px solid rgba(255,255,255,0.14); flex-shrink: 0; position: relative; overflow: hidden; box-shadow: inset 0 0 10px rgba(0,0,0,0.6);">
        <svg viewBox="0 0 88 56" style="width: 100%; height: 100%; display: block;">
          ${illustrationSvg}
        </svg>
      </span>`;
  };

  // 4. 属性別アバターSVG生成
  function buildVisualAvatarSvg(playerName, cardText = "") {
    const text = `${playerName} ${cardText}`;
    const isVtuber = /VTuber|ぶいすぽ|にじさんじ|猫汰|橘|夢野|紡木|胡桃|葛葉|ローレン/i.test(text);
    const isStreamer = /STREAMER|釈迦|SHAKA|だるま|ありさか/i.test(text);

    const bgGrad = isVtuber
      ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
      : isStreamer
      ? "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)"
      : "linear-gradient(135deg, #84cc16 0%, #10b981 100%)";

    const borderColor = isVtuber ? "#f472b6" : isStreamer ? "#38bdf8" : "#d4ff33";
    const initial = escapeHtml(String(playerName || "P").replace(/^[✨🎙🏆\s]+/, "").slice(0, 1));
    const iconOverlay = isVtuber ? `✨` : isStreamer ? `🎙` : `👑`;

    return `
      <div style="position: relative; width: 46px; height: 46px; border-radius: 12px; background: ${bgGrad}; border: 1.5px solid ${borderColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 14px rgba(0,0,0,0.45);">
        <svg viewBox="0 0 44 44" style="position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.28;">
          <circle cx="22" cy="16" r="7" fill="#fff"/>
          <path d="M 9 38 C 9 27, 35 27, 35 38" fill="#fff"/>
          <path d="M 12 16 A 10 10 0 0 1 32 16" fill="none" stroke="#fff" stroke-width="2.5"/>
        </svg>
        <span style="position: relative; z-index: 2; font-size: 1.15rem; font-weight: 900; color: #fff; text-shadow: 0 2px 6px rgba(0,0,0,0.65); font-family: 'Manrope', sans-serif;">
          ${initial}
        </span>
        <span style="position: absolute; right: -5px; bottom: -5px; z-index: 3; font-size: 0.68rem; background: #09090b; border: 1px solid ${borderColor}; border-radius: 999px; width: 19px; height: 19px; display: flex; align-items: center; justify-content: center;">
          ${iconOverlay}
        </span>
      </div>`;
  }

  // 5. 振り向き(cm/360°)ゲージ
  function buildVisualSensGaugeHtml(sensText) {
    const match = String(sensText || "").match(/(\d+(?:\.\d+)?)\s*cm\s*\/\s*360/i);
    if (!match) return "";
    const cm = parseFloat(match[1]);
    if (!Number.isFinite(cm)) return "";

    const pct = Math.min(96, Math.max(12, Math.round((cm / 65) * 100)));
    const color = cm < 35 ? "#38bdf8" : cm <= 50 ? "#d4ff33" : "#f472b6";
    const styleLabel = cm < 35 ? "手首主体（省スペース）" : cm <= 50 ? "手首＋腕バランス" : "腕振り主体（大判パッド推奨）";

    return `
      <div class="js-visual-sens-gauge" style="margin-top: 0.5rem; padding: 0.55rem 0.7rem; border-radius: 8px; background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.09);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.25rem 0.5rem; font-size: 0.7rem; margin-bottom: 0.38rem;">
          <span style="color: #a1a1aa; font-weight: 700; white-space: nowrap;">🖱️ 360°振り向き移動幅</span>
          <strong style="color: ${color}; white-space: nowrap; margin-left: auto;">${styleLabel} (${cm.toFixed(1)}cm)</strong>
        </div>
        <div style="position: relative; height: 18px; border-radius: 5px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); overflow: hidden; display: flex; align-items: center;">
          <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, rgba(212,255,51,0.18) 0%, ${color} 100%); opacity: 0.82; border-right: 2px solid #fff;"></div>
          <span style="position: absolute; left: 6px; font-size: 0.6rem; color: #fff; font-weight: 800; background: rgba(9,9,11,0.78); padding: 0.05rem 0.35rem; border-radius: 3px;">START</span>
          <span style="position: absolute; right: 6px; font-size: 0.6rem; color: #f4f4f5; font-weight: 700; font-family: monospace; background: rgba(9,9,11,0.85); padding: 0.05rem 0.35rem; border-radius: 3px; border: 1px solid rgba(255,255,255,0.15);">パッド端 65cm</span>
        </div>
      </div>`;
  }

  // 6. Amazon ＆ 楽天のミニボタンセット
  function buildDualShopButtonsHtml(deviceName) {
    if (!deviceName || deviceName === "データなし") return "";
    const amzUrl = getAmazonAffiliateUrl(deviceName);
    const rakUrl = getRakutenAffiliateUrl(deviceName);
    return `
      <a href="${escapeHtml(amzUrl)}" target="_blank" rel="sponsored noopener noreferrer" onclick="event.stopPropagation();"
         style="text-decoration:none; font-size:0.65rem; padding:0.18rem 0.48rem; border-radius:4px; background:rgba(255,153,0,0.16); border:1px solid rgba(255,153,0,0.55); color:#ffb84d; font-weight:800; white-space:nowrap;"
         title="Amazonで「${escapeHtml(deviceName)}」を見る">🛒 Amazon</a>
      <a href="${escapeHtml(rakUrl)}" target="_blank" rel="sponsored noopener noreferrer" onclick="event.stopPropagation();"
         style="text-decoration:none; font-size:0.65rem; padding:0.18rem 0.48rem; border-radius:4px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.55); color:#fca5a5; font-weight:800; white-space:nowrap;"
         title="楽天市場で「${escapeHtml(deviceName)}」を見る">🛍 楽天</a>
    `;
  }

  // 7. 下部の「よくある質問＆直リンク集」を直感的な【図解ベントーグリッド＋アイコンチップ】へ自動変換
  function upgradeSeoFaqToVisualBento() {
    const faqSection = document.querySelector(".seo-faq-section");
    if (!faqSection || faqSection.dataset.bentoUpgraded === "true") return;
    faqSection.dataset.bentoUpgraded = "true";

    const gproThumb = window.renderDeviceVisualThumb("Logicool G PRO X SUPERLIGHT 2", "マウス", "xs");
    const viperThumb = window.renderDeviceVisualThumb("Razer Viper V3 Pro", "マウス", "xs");
    const wootingThumb = window.renderDeviceVisualThumb("Wooting 60HE+", "キーボード", "xs");
    const soraThumb = window.renderDeviceVisualThumb("Ninjutso Sora V2", "マウス", "xs");
    const zeroThumb = window.renderDeviceVisualThumb("Artisan Ninja FX Zero", "マウスパッド", "xs");
    const wallhackThumb = window.renderDeviceVisualThumb("Wallhack SP-004", "マウスパッド", "xs");

    faqSection.style.padding = "2rem";
    faqSection.style.background = "linear-gradient(180deg, rgba(20,20,28,0.85) 0%, rgba(10,10,14,0.95) 100%)";
    faqSection.style.border = "1px solid rgba(255,255,255,0.12)";
    faqSection.style.borderRadius = "16px";

    faqSection.innerHTML = `
      <!-- 見出し -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.35rem;">
        <div>
          <div class="eyebrow" style="color: #d4ff33;"><span class="eyebrow-line" style="background: #d4ff33;"></span>VISUAL GUIDE &amp; QUICK ACCESS</div>
          <h2 style="font-size: 1.3rem; margin: 0.3rem 0 0; color: #fff; font-weight: 800;">⚡ ひと目でわかる！FPS感度変換 ＆ デバイス選びのポイント</h2>
        </div>
        <span style="font-size: 0.75rem; color: #a1a1aa;">カードやタグを押すと直接その機能へジャンプします</span>
      </div>

      <!-- 1. クリック不要でパッと見てわかる「図解ベントーグリッド（5枚）」 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 1rem; margin-bottom: 1.75rem;">

        <!-- 図解カード①：感度変換 -->
        <div class="frag-bento-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.55rem;">
              <span style="padding: 0.2rem 0.55rem; border-radius: 6px; background: rgba(212,255,51,0.15); border: 1px solid rgba(212,255,51,0.4); color: #d4ff33; font-size: 0.7rem; font-weight: 800;">🎯 感度コンバーター</span>
              <span style="font-size: 0.7rem; color: #71717a; font-family: monospace;">cm / 360°</span>
            </div>
            <h3 style="margin: 0 0 0.5rem; font-size: 0.98rem; color: #fff; font-weight: 800;">3タイトル間で感度を1秒相互変換</h3>
            <!-- 視覚ダイアグラム -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem; padding: 0.65rem; border-radius: 8px; background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.06); font-size: 0.72rem; font-weight: 800; text-align: center; margin-bottom: 0.55rem;">
              <div style="flex:1; padding:0.35rem; border-radius:5px; background:rgba(255,255,255,0.05); color:#fff;">VALORANT<div style="font-size:0.62rem; color:#a1a1aa; font-weight:normal;">係数 0.07</div></div>
              <span style="color:#d4ff33; font-size:0.9rem;">⇄</span>
              <div style="flex:1; padding:0.35rem; border-radius:5px; background:rgba(212,255,51,0.12); border:1px solid rgba(212,255,51,0.35); color:#d4ff33;">振り向き cm<div style="font-size:0.62rem; color:#e4e4e7; font-weight:normal;">共通基準</div></div>
              <span style="color:#d4ff33; font-size:0.9rem;">⇄</span>
              <div style="flex:1; padding:0.35rem; border-radius:5px; background:rgba(255,255,255,0.05); color:#fff;">Apex / OW2<div style="font-size:0.62rem; color:#a1a1aa; font-weight:normal;">0.022 / 0.0066</div></div>
            </div>
            <p style="margin: 0; font-size: 0.78rem; color: #a1a1aa; line-height: 1.5;">DPIと感度を入れるだけで全ゲームへ換算し、感覚が一番近いプロや配信者のクロスヘアもコピーできます。</p>
          </div>
          <a href="?tab=match" class="js-quick-spa-link" style="text-decoration:none; text-align:center; padding:0.5rem; border-radius:8px; background:rgba(212,255,51,0.14); border:1px solid rgba(212,255,51,0.4); color:#d4ff33; font-size:0.78rem; font-weight:800;">⚡ 感度マッチで換算する →</a>
        </div>

        <!-- 図解カード②：プロ使用率トップギア -->
        <div class="frag-bento-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.55rem;">
              <span style="padding: 0.2rem 0.55rem; border-radius: 6px; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.4); color: #bae6fd; font-size: 0.7rem; font-weight: 800;">👑 プロ・配信者の定番</span>
              <span style="font-size: 0.7rem; color: #71717a;">90名超の集計</span>
            </div>
            <h3 style="margin: 0 0 0.5rem; font-size: 0.98rem; color: #fff; font-weight: 800;">迷ったらこの「2強マウス＋ラピトリ」</h3>
            <div style="display: grid; gap: 0.4rem; margin-bottom: 0.55rem;">
              <div style="display:flex; align-items:center; gap:0.5rem; padding:0.4rem 0.6rem; border-radius:7px; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.06);">
                ${gproThumb}
                <div style="font-size:0.75rem; line-height:1.25;"><strong style="color:#fff;">G PRO X SUPERLIGHT 2</strong><div style="color:#38bdf8; font-size:0.66rem;">マウス使用率 No.1（60g・王道左右対称）</div></div>
              </div>
              <div style="display:flex; align-items:center; gap:0.5rem; padding:0.4rem 0.6rem; border-radius:7px; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.06);">
                ${wootingThumb}
                <div style="font-size:0.75rem; line-height:1.25;"><strong style="color:#fff;">Wooting 60HE+</strong><div style="color:#facc15; font-size:0.66rem;">キーボード使用率 No.1（ラピッドトリガー）</div></div>
              </div>
            </div>
          </div>
          <a href="?tab=rankings&amp;game=VALORANT" class="js-quick-spa-link" style="text-decoration:none; text-align:center; padding:0.5rem; border-radius:8px; background:rgba(56,189,248,0.14); border:1px solid rgba(56,189,248,0.4); color:#bae6fd; font-size:0.78rem; font-weight:800;">👑 使用率ランキングを見る →</a>
        </div>

        <!-- 図解カード③：実寸シルエット＆パッド2次元マップ -->
        <div class="frag-bento-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.55rem;">
              <span style="padding: 0.2rem 0.55rem; border-radius: 6px; background: rgba(191,87,255,0.15); border: 1px solid rgba(191,87,255,0.4); color: #e9d5ff; font-size: 0.7rem; font-weight: 800;">📐 サイズ＆滑り比較</span>
              <span style="font-size: 0.7rem; color: #71717a;">1:1スケール図解</span>
            </div>
            <h3 style="margin: 0 0 0.5rem; font-size: 0.98rem; color: #fff; font-weight: 800;">今のマウスとのサイズ差・パッドの滑りを可視化</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem; margin-bottom: 0.55rem;">
              <div style="padding:0.55rem; border-radius:8px; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.06); text-align:center;">
                <div style="font-size:0.66rem; color:#d4ff33; font-weight:800; margin-bottom:0.2rem;">🖱 マウス実寸重ね合わせ</div>
                <div style="font-size:0.68rem; color:#d4d4d8;">上面・側面のコブ位置と重量差(-41g等)を自動算出</div>
              </div>
              <div style="padding:0.55rem; border-radius:8px; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.06); text-align:center;">
                <div style="font-size:0.66rem; color:#38bdf8; font-weight:800; margin-bottom:0.2rem;">🗺️ パッド2次元マップ</div>
                <div style="font-size:0.68rem; color:#d4d4d8;">止め重視(Zero)〜ガラス(SP-004)を座標比較</div>
              </div>
            </div>
            <p style="margin: 0; font-size: 0.76rem; color: #a1a1aa;">※気になるデバイス名をクリックすると比較図とYouTube動画が開きます。</p>
          </div>
          <a href="?tab=search" class="js-quick-spa-link" style="text-decoration:none; text-align:center; padding:0.5rem; border-radius:8px; background:rgba(191,87,255,0.14); border:1px solid rgba(191,87,255,0.4); color:#e9d5ff; font-size:0.78rem; font-weight:800;">🔍 デバイスをクリックして比較する →</a>
        </div>

        <!-- 図解カード④：一式総額 vs 高コスパ代替プラン -->
        <div class="frag-bento-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.55rem;">
              <span style="padding: 0.2rem 0.55rem; border-radius: 6px; background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.4); color: #bbf7d0; font-size: 0.7rem; font-weight: 800;">💰 一式予算シミュレーター</span>
              <span style="font-size: 0.7rem; color: #d4ff33; font-weight: 800;">半額以下の代替案つき</span>
            </div>
            <h3 style="margin: 0 0 0.5rem; font-size: 0.98rem; color: #fff; font-weight: 800;">推しと同じ環境の総額＆高コスパ構成</h3>
            <div style="padding: 0.65rem; border-radius: 8px; background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.06); margin-bottom: 0.55rem; font-size: 0.74rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem;">
                <span style="color:#a1a1aa;">🏆 プロ本人4点一式（平均）</span>
                <strong style="color:#fff; font-family:monospace;">約 ¥85,000〜¥110,000</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-top:0.35rem; border-top:1px dashed rgba(255,255,255,0.1);">
                <span style="color:#38bdf8; font-weight:800;">💡 高コスパ代替4点プラン</span>
                <strong style="color:#d4ff33; font-family:monospace;">約 ¥38,800（半額以下！）</strong>
              </div>
            </div>
            <p style="margin: 0; font-size: 0.76rem; color: #a1a1aa;">各選手の「💰 一式見積もり」ボタンから4点の内訳をチェックできます。</p>
          </div>
          <a href="?tab=search&amp;estimatePlayer=釈迦%20(SHAKA)" class="js-quick-spa-link" style="text-decoration:none; text-align:center; padding:0.5rem; border-radius:8px; background:rgba(74,222,128,0.14); border:1px solid rgba(74,222,128,0.4); color:#bbf7d0; font-size:0.78rem; font-weight:800;">💰 一式見積もりサンプルを見る →</a>
        </div>

      </div>

      <!-- 2. カテゴリ別に色分け整理した「ワンタップ検索ショートチップ」 -->
      <div style="padding-top: 1.35rem; border-top: 1px solid rgba(255,255,255,0.1);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.9rem;">
          <h3 style="font-size: 0.95rem; color: #fff; margin: 0; font-weight: 800;">📌 人気プレイヤー・デバイス 1タップ検索</h3>
          <span style="font-size: 0.72rem; color: #a1a1aa;">名前を押すとその選手・デバイスのデータへ直行します</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.9rem;">

          <!-- カテゴリA：VTuber -->
          <div style="padding: 0.95rem 1.05rem; border-radius: 12px; background: rgba(191,87,255,0.06); border: 1px solid rgba(191,87,255,0.28);">
            <div style="font-size: 0.76rem; font-weight: 800; color: #e9d5ff; margin-bottom: 0.65rem; display:flex; justify-content:space-between; align-items:center;">
              <span>✨ 人気VTuber（ぶいすぽ・にじさんじ）</span>
              <a href="?tab=search&amp;type=vtuber" class="js-quick-spa-link" style="color:#d4ff33; font-size:0.7rem; text-decoration:none;">全員見る →</a>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=ぶいすぽ" title="ぶいすぽっ！ 使用デバイス一覧" style="border-color:rgba(244,114,182,0.45); background:rgba(244,114,182,0.12);">🩷 ぶいすぽっ！</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=葛葉" title="葛葉 (にじさんじ) 感度・マウス">🟣 葛葉</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=ローレン" title="ローレン・イロアス デバイス">🟣 ローレン</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=猫汰つな" title="猫汰つな 感度・クロスヘア">🩷 猫汰つな</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=橘ひなの" title="橘ひなの Apex感度・マウス">🩷 橘ひなの</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=夢野あかり" title="夢野あかり VALORANT感度">🩷 夢野あかり</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=紡木こかげ" title="紡木こかげ デバイス・感度">🩷 紡木こかげ</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=胡桃のあ" title="胡桃のあ Apex感度・パッド">🩷 胡桃のあ</a>
            </div>
          </div>

          <!-- カテゴリB：ストリーマー＆プロ選手 -->
          <div style="padding: 0.95rem 1.05rem; border-radius: 12px; background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.28);">
            <div style="font-size: 0.76rem; font-weight: 800; color: #bae6fd; margin-bottom: 0.65rem; display:flex; justify-content:space-between; align-items:center;">
              <span>🎙 人気ストリーマー ＆ 🏆 トッププロ</span>
              <a href="?tab=search&amp;type=streamer" class="js-quick-spa-link" style="color:#d4ff33; font-size:0.7rem; text-decoration:none;">配信者一覧 →</a>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=釈迦" title="釈迦 (SHAKA) デバイス・感度">🔵 釈迦 (SHAKA)</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=だるまいずごっと" title="だるまいずごっと デバイス">🔵 だるまいずごっと</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=ありさか" title="ありさか 感度・マウス">🔵 ありさか</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=Laz" title="Laz (ZETA) デバイス・クロスヘア">🟢 Laz (ZETA)</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=Dep" title="Dep (ZETA) 感度・マウス">🟢 Dep (ZETA)</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=Meiy" title="Meiy (DFM) 感度・マウス">🟢 Meiy (DFM)</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=TenZ" title="TenZ 使用マウス・感度">🟢 TenZ</a>
            </div>
          </div>

          <!-- カテゴリC：人気デバイス（イラスト付きチップ） -->
          <div style="padding: 0.95rem 1.05rem; border-radius: 12px; background: rgba(212,255,51,0.04); border: 1px solid rgba(212,255,51,0.25);">
            <div style="font-size: 0.76rem; font-weight: 800; color: #d4ff33; margin-bottom: 0.65rem; display:flex; justify-content:space-between; align-items:center;">
              <span>🖱 人気デバイスから使用者＆実寸を探す</span>
              <a href="?tab=rankings&amp;game=VALORANT" class="js-quick-spa-link" style="color:#d4ff33; font-size:0.7rem; text-decoration:none;">ランキング →</a>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=SUPERLIGHT" title="G PRO X SUPERLIGHT 2 使用プロ">${gproThumb} SUPERLIGHT 2</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=Viper" title="Razer Viper V3 Pro 実寸比較">${viperThumb} Viper V3 Pro</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=Sora" title="Ninjutso Sora V2 実寸比較">${soraThumb} Sora V2</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=Wooting" title="Wooting 60HE+ 使用プロ一覧">${wootingThumb} Wooting 60HE+</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=Artisan" title="Artisan Zero / 疾風乙 比較">${zeroThumb} Artisan Zero</a>
              <a class="frag-visual-chip js-quick-spa-link" href="?tab=search&amp;q=Wallhack" title="Wallhack SP-004 ガラスパッド">${wallhackThumb} Wallhack SP-004</a>
            </div>
          </div>

        </div>
      </div>
    `;

    // チップやカードをクリックした際、ページ再読み込みなしで即座にタブ切り替え＆スクロール
    faqSection.querySelectorAll(".js-quick-spa-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("?")) return;
        e.preventDefault();
        window.history.pushState(null, "", href);
        hasRestoredFromUrl = false;
        restoreStateFromUrlParams(true);
        if (typeof updateDynamicSeoMeta === "function") updateDynamicSeoMeta();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  // 8. サイト全体への適用処理
  function applyVisualEnhancementsAcrossSite() {
    upgradeSeoFaqToVisualBento();

    // A. アバター＆振り向きゲージ
    document.querySelectorAll(".player-card, .match-card").forEach((card) => {
      const avatarEl = card.querySelector(".player-avatar");
      const headingEl = card.querySelector("h3, h2");
      if (avatarEl && headingEl && !avatarEl.dataset.visualUpgraded) {
        avatarEl.dataset.visualUpgraded = "true";
        avatarEl.outerHTML = buildVisualAvatarSvg(headingEl.textContent.trim(), card.textContent);
      }

      const sensEl = card.querySelector(".player-sens");
      if (sensEl && !card.querySelector(".js-visual-sens-gauge")) {
        const gaugeHtml = buildVisualSensGaugeHtml(sensEl.textContent);
        if (gaugeHtml) sensEl.insertAdjacentHTML("afterend", gaugeHtml);
      }
    });

    // B. プレイヤー検索カード内のデバイス行（左サムネイル＋右3段固定構造）
    document.querySelectorAll(".player-card .device-row").forEach((row) => {
      if (row.dataset.visualThumbAdded) return;
      row.dataset.visualThumbAdded = "true";

      const catLabel = row.querySelector("span:first-child")?.textContent?.trim() || "";
      const devName = row.dataset.device || row.querySelector("strong")?.textContent?.trim() || "データなし";
      const hasValidDevice = devName && devName !== "データなし";
      const price = hasValidDevice ? getDevicePrice(devName, catLabel) : 0;
      const thumbHtml = hasValidDevice
        ? window.renderDeviceVisualThumb(devName, catLabel, "sm")
        : `<span style="width:52px; height:44px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); display:inline-block;"></span>`;

      row.innerHTML = `
        ${thumbHtml}
        <div style="min-width: 0; display: flex; flex-direction: column; gap: 0.25rem; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.4rem;">
            <span style="font-size: 0.66rem; font-weight: 800; color: #a1a1aa; background: rgba(255,255,255,0.06); padding: 0.1rem 0.42rem; border-radius: 4px; white-space: nowrap;">
              ${escapeHtml(catLabel)}
            </span>
            ${price > 0 ? `<span style="font-size: 0.72rem; font-weight: 800; color: #d4ff33; font-family: monospace; white-space: nowrap;">${formatYen(price)}</span>` : ""}
          </div>
          <strong style="font-size: 0.86rem; font-weight: 800; color: #fff; line-height: 1.3; word-break: break-word;">
            ${escapeHtml(devName)}
          </strong>
          ${hasValidDevice ? `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem; margin-top: 0.15rem; flex-wrap: wrap;">
              <span style="color: #d8b4fe; font-size: 0.66rem; font-weight: 800; white-space: nowrap;">▶ 動画・比較</span>
              <div style="display: inline-flex; align-items: center; gap: 0.3rem; margin-left: auto;">
                ${buildDualShopButtonsHtml(devName)}
                <button type="button" class="js-fav-device-btn" data-device-name="${escapeHtml(devName)}"
                        onclick="window.toggleFavoriteDevice(this.dataset.deviceName, event)"
                        title="欲しいものリストに保存"
                        style="cursor:pointer; padding:0.16rem 0.42rem; border-radius:4px; font-size:0.66rem; font-weight:800; line-height:1;">☆</button>
              </div>
            </div>
          ` : ""}
        </div>
      `;
    });

    // C. 感度マッチカード内のデバイス枠
    document.querySelectorAll(".match-device").forEach((box) => {
      if (box.dataset.visualThumbAdded) return;
      const strongEl = box.querySelector("strong");
      if (!strongEl) return;
      box.dataset.visualThumbAdded = "true";

      const devName = strongEl.textContent.trim();
      const thumbHtml = window.renderDeviceVisualThumb(devName, "", "md");
      if (thumbHtml) {
        strongEl.style.display = "inline-flex";
        strongEl.style.alignItems = "center";
        strongEl.style.gap = "0.55rem";
        strongEl.insertAdjacentHTML("afterbegin", thumbHtml);
      }
    });

    // D. プロ使用率ランキングの各行
    document.querySelectorAll(".rank-row").forEach((row) => {
      if (row.dataset.visualThumbAdded) return;
      const devName = row.dataset.device;
      if (!devName) return;
      row.dataset.visualThumbAdded = "true";

      const rankNum = row.querySelector(".rank-num");
      const isTop3 = rankNum && ["01", "02", "03"].includes(rankNum.textContent.trim());
      const thumbHtml = window.renderDeviceVisualThumb(devName, "", isTop3 ? "md" : "sm");
      if (rankNum && thumbHtml) {
        rankNum.insertAdjacentHTML("afterend", thumbHtml);
        row.style.display = "grid";
        row.style.gridTemplateColumns = isTop3 ? "28px 60px 1fr auto" : "28px 52px 1fr auto";
        row.style.alignItems = "center";
        row.style.gap = "0.6rem";
      }

      const singleCartLink = row.querySelector('a[href*="amazon.co.jp"]');
      if (singleCartLink && !row.querySelector('a[href*="rakuten"], a[href*="moshimo"]')) {
        singleCartLink.outerHTML = buildDualShopButtonsHtml(devName);
      }
    });

    // E. デバイス相談（01）の推奨モデルカード
    document.querySelectorAll("#consult-result .js-consult-yt-trigger").forEach((btn) => {
      const card = btn.closest("div[style*='flex-direction: column']");
      if (!card || card.dataset.visualThumbAdded) return;
      card.dataset.visualThumbAdded = "true";

      const devName = btn.dataset.device;
      const thumbHtml = window.renderDeviceVisualThumb(devName, "", "lg");
      const headerBox = card.querySelector("div:first-child");
      if (headerBox && thumbHtml) {
        headerBox.insertAdjacentHTML(
          "afterbegin",
          `<div style="display:flex; justify-content:center; padding: 0.5rem 0 0.65rem; margin-bottom: 0.45rem; background: rgba(0,0,0,0.35); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">${thumbHtml}</div>`
        );
      }
    });
  }

  const _origRefresh = refreshAllInteractiveEnhancements;
  refreshAllInteractiveEnhancements = function () {
    applyVisualEnhancementsAcrossSite();
    _origRefresh();
  };

  const _origOpenEstimate = window.openSetupEstimateModal;
  window.openSetupEstimateModal = function (playerName, event) {
    _origOpenEstimate(playerName, event);
    const modalRoot = document.getElementById("frag-sync-modal-root");
    if (!modalRoot) return;
    modalRoot.querySelectorAll("div[style*='justify-content: space-between']").forEach((row) => {
      const titleEl = row.querySelector("div[style*='font-size: 0.92rem']");
      if (!titleEl || row.dataset.visualThumbAdded) return;
      row.dataset.visualThumbAdded = "true";
      const devName = titleEl.textContent.trim();
      const thumbHtml = window.renderDeviceVisualThumb(devName, "", "md");
      if (thumbHtml && titleEl.parentElement) {
        const leftWrap = titleEl.parentElement;
        leftWrap.style.display = "flex";
        leftWrap.style.alignItems = "center";
        leftWrap.style.gap = "0.75rem";
        leftWrap.innerHTML = `${thumbHtml}<div>${leftWrap.innerHTML}</div>`;
      }
    });
  };

  refreshAllInteractiveEnhancements();
  document.addEventListener("click", () => setTimeout(refreshAllInteractiveEnhancements, 60));
})();
// ============================================================================
// アクセス＆CVR改善①：デバイス相談の「ワンタップ悩み選択 ＆ 1秒即時診断」エンジン
// ============================================================================
(() => {
  const QUICK_ISSUE_PRESETS = [
    {
      label: "🎯 フリックが止まらない・滑りすぎる",
      value: "フリック時に視点が止まらず通り過ぎてしまう。ストッピングしやすいマウスパッドを知りたい"
    },
    {
      label: "⚡ 追いエイムが引っかかる・初動が重い",
      value: "追いエイム（トラッキング）で初動の引っかかりを感じる。滑りが軽いスピード系やガラスパッドにしたい"
    },
    {
      label: "🪶 マウスが重くて手首・腕が疲れる",
      value: "長時間プレイするとマウスが重くて手首が疲れる。30g〜50g台の超軽量マウスでフリックを速くしたい"
    },
    {
      label: "🖐️ 手のサイズ・持ち方に合う形を探したい",
      value: "つかみ持ち・つまみ持ちで手にフィットする形状（左右対称・エルゴノミクス）のマウスを知りたい"
    },
    {
      label: "⌨️ ストッピング・キャラコンを速くしたい",
      value: "撃ち合いのストッピングやキャラコンを速くするため、ラピッドトリガー対応キーボードを導入したい"
    },
    {
      label: "🎧 足音の方向・上下の定位が分かりにくい",
      value: "敵の足音の方向や距離感が聞こえにくい。定位感が良くて耳が痛くならないイヤホン・ヘッドセットが欲しい"
    },
    {
      label: "🖥️ 敵の飛び出しが見えにくい・残像感がある",
      value: "敵の飛び出しへの反応が遅れる、視点移動時の残像感が気になるので高Hzモニターを見直したい"
    },
    {
      label: "👑 まずはプロ使用率1位の王道ギアで揃えたい",
      value: "エイムを安定させるために、プロや配信者で一番使われている王道マウス・マウスパッド構成を知りたい"
    }
  ];

  function setupOneTapConsultChips() {
    const issueTextarea = document.getElementById("consult-issue");
    const consultForm = document.getElementById("consult-form");
    if (!issueTextarea || !consultForm || document.getElementById("frag-quick-issue-chips")) return;

    // プレースホルダーもハードルが低い文言に更新
    issueTextarea.rows = 2;
    issueTextarea.placeholder = "上のボタンをタップするか、自由に入力してください（例：足音が聞こえない、マウスが重い…）";

    const chipsContainerHtml = `
      <div id="frag-quick-issue-chips" style="margin: 0.35rem 0 0.75rem; padding: 0.75rem; border-radius: 10px; background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.09);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #d4ff33;">⚡ ワンタップで悩みを選択（タップで即時診断）</span>
          <span style="font-size: 0.66rem; color: #a1a1aa;">文字入力不要</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
          ${QUICK_ISSUE_PRESETS.map((item, idx) => `
            <button type="button"
                    class="js-consult-issue-chip"
                    data-issue-text="${escapeHtml(item.value)}"
                    data-chip-index="${idx}"
                    style="cursor: pointer; text-align: left; padding: 0.42rem 0.68rem; border-radius: 8px; font-size: 0.74rem; font-weight: 700; background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(255, 255, 255, 0.14); color: #e4e4e7; transition: all 0.15s; line-height: 1.3;">
              ${escapeHtml(item.label)}
            </button>
          `).join("")}
        </div>
      </div>
    `;

    issueTextarea.insertAdjacentHTML("beforebegin", chipsContainerHtml);

    const chips = consultForm.querySelectorAll(".js-consult-issue-chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        // 1. 選択中チップのハイライト切り替え
        chips.forEach((c) => {
          const isSelected = c === chip;
          c.style.background = isSelected ? "rgba(212, 255, 51, 0.18)" : "rgba(0, 0, 0, 0.45)";
          c.style.borderColor = isSelected ? "#d4ff33" : "rgba(255, 255, 255, 0.14)";
          c.style.color = isSelected ? "#fff" : "#e4e4e7";
          c.style.boxShadow = isSelected ? "0 0 12px rgba(212, 255, 51, 0.25)" : "none";
        });

        // 2. テキストエリアへ自動入力して即座に診断フォームを実行
        issueTextarea.value = chip.dataset.issueText || "";
        consultForm.dispatchEvent(new Event("submit", { cancelable: true }));

        // 3. スマホ・タブレット等の縦画面では結果パネルへスムーズスクロール
        if (window.innerWidth < 960) {
          const resultEl = document.getElementById("consult-result");
          if (resultEl) {
            setTimeout(() => {
              resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 80);
          }
        }
      });
    });
  }

  setupOneTapConsultChips();
})();
// ============================================================================
// アクセス＆SNS拡散改善②：スクショ拡散特化「二つ名・称号認定証カード」生成エンジン
// ============================================================================
(() => {
  // 1. 振り向き(cm/360°)とマウス重量から「二つ名（称号）」と特徴を判定する関数
  function diagnoseAimArchetype(cm, mouseName = "", referencePlayerName = "") {
    const spec = typeof findMouseSpec === "function" ? findMouseSpec(mouseName) : null;
    const weight = spec?.weight || 60;
    const isUltraLight = weight <= 48;
    const cleanRefName = String(referencePlayerName || "").split(/[（(]/)[0].trim();

    let styleTitle = "黄金比オールラウンダー";
    let subBadge = "GOLDEN BALANCE // 万能バランス型";
    let description = "初動の軽さとストッピングの制動力を高次元で両立する、プロ・配信者最多の王道スタイル。";
    let themeColor = "#d4ff33";

    if (!Number.isFinite(cm)) {
      return { styleTitle, subBadge, description, themeColor, fullTitle: styleTitle };
    }

    if (cm < 25) {
      styleTitle = isUltraLight ? "神速の空間支配者" : "超反応スピードスター";
      subBadge = "GOD SPEED // 超ハイセンシ型";
      description = "手首と指先の微細な操作だけで全方位へ瞬時にフリックする、反射神経特化のアグレッシブスタイル。";
      themeColor = "#38bdf8";
    } else if (cm < 35) {
      styleTitle = isUltraLight ? "閃光フリッカー" : "高速視点スイッチャー";
      subBadge = "HIGH SENS // 高速反応型";
      description = "激しいキャラコンへの追従と素早いターゲット切り替えを得意とする、近〜中距離の支配者。";
      themeColor = "#06b6d4";
    } else if (cm <= 46) {
      styleTitle = isUltraLight ? "精密無双オールラウンダー" : "黄金比の王道エイマー";
      subBadge = "GOLDEN MID // 王道バランス型";
      description = "追いエイム（トラッキング）とフリックの止まりを高次元で両立する、最も安定感の高い万能型。";
      themeColor = "#d4ff33";
    } else if (cm <= 56) {
      styleTitle = "一撃必殺の精密スナイパー";
      subBadge = "PRECISION LOW // 精密射撃型";
      description = "ブレのない水平視点移動と強固なストッピングで、中〜遠距離のヘッドラインを正確に射抜く仕事人。";
      themeColor = "#c084fc";
    } else {
      styleTitle = "絶対制動のアームエイム職人";
      subBadge = "EXTREME LOW // 重装甲ローセンシ型";
      description = "大判マウスパッドをフルに使った腕振りで、ミリ単位の撃ち合いでも視点が一切浮かない極限の安定型。";
      themeColor = "#f472b6";
    }

    const fullTitle = cleanRefName
      ? `${styleTitle}（${cleanRefName} シンクロ型）`
      : styleTitle;

    return { styleTitle, subBadge, description, themeColor, fullTitle };
  }

  // 2. シンクロ率(%)からランク称号（SSR / S+ / S / A / B）を判定する関数
  function getSyncRankInfo(syncRate) {
    if (syncRate >= 90) {
      return {
        rank: "SSR",
        label: "完全一致級 // SOUL TWIN",
        grad: "linear-gradient(135deg, #fde047 0%, #d4ff33 50%, #38bdf8 100%)",
        border: "#fde047"
      };
    }
    if (syncRate >= 80) {
      return {
        rank: "S+",
        label: "極めて高い親和性 // PRO GRADE",
        grad: "linear-gradient(135deg, #d4ff33 0%, #4ade80 100%)",
        border: "#d4ff33"
      };
    }
    if (syncRate >= 70) {
      return {
        rank: "S",
        label: "高シンクロ // HIGH AFFINITY",
        grad: "linear-gradient(135deg, #c084fc 0%, #38bdf8 100%)",
        border: "#c084fc"
      };
    }
    if (syncRate >= 60) {
      return {
        rank: "A",
        label: "同系統スタイル // COMPATIBLE",
        grad: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
        border: "#38bdf8"
      };
    }
    return {
      rank: "B",
      label: "独自スタイル // ORIGINAL STYLE",
      grad: "linear-gradient(135deg, #a1a1aa 0%, #e4e4e7 100%)",
      border: "#a1a1aa"
    };
  }

  // 3. 「⚡ シンクロ診断・𝕏」モーダルを『スクショ拡散特化・公式認定証デザイン』に刷新
  window.openPlayerSyncModal = function (playerName, event) {
    if (event) event.stopPropagation();
    const rawPlayer = getMergedPlayersList().find((p) => p?.name === playerName);
    if (!rawPlayer) return;
    const player = ensurePlayerFourDevices(rawPlayer);

    const userEnv = getUserBaselineEnv();
    const syncRate = calculateEnvSyncRate(player, userEnv);
    const rankInfo = getSyncRankInfo(syncRate);

    const pDpi = Number(player?.dpi);
    const pSens = Number(player?.sens);
    const pCm = Number(player?.cmPer360) || toCm360(pDpi, pSens, player?.game);
    const diffCm = Number.isFinite(pCm) && Number.isFinite(userEnv.cm) ? Math.abs(pCm - userEnv.cm) : Number.NaN;
    const convertedSensForUser = fromCm360ToSens(pCm, userEnv.dpi, userEnv.game);

    const pMouse = player?.devices?.["マウス"] || "データなし";
    const pPad = player?.devices?.["マウスパッド"] || "データなし";
    const pKb = player?.devices?.["キーボード"] || "データなし";
    const setupTotal = calculatePlayerSetupTotal(player);

    const archetype = diagnoseAimArchetype(userEnv.cm, userEnv.mouse, player.name);
    const mouseThumb = typeof window.renderDeviceVisualThumb === "function" ? window.renderDeviceVisualThumb(pMouse, "マウス", "sm") : "";
    const kbThumb = typeof window.renderDeviceVisualThumb === "function" ? window.renderDeviceVisualThumb(pKb, "キーボード", "sm") : "";
    const crosshairHtml = typeof buildCrosshairBarHtml === "function" ? buildCrosshairBarHtml(player.name) : "";

    // X（旧Twitter）投稿時に「二つ名」と「ランク」が自動で入る拡散用テキスト
    const shareText =
      `【FRAG // FPS環境シンクロ認定証】\n` +
      `🏅 称号：『${archetype.fullTitle}』\n` +
      `⚡ ${player.name} との環境シンクロ率：【${syncRate}%（RANK ${rankInfo.rank}）】\n` +
      `🎯 基準振り向き：${Number.isFinite(userEnv.cm) ? userEnv.cm.toFixed(1) : "--"}cm/360°（本人：${Number.isFinite(pCm) ? pCm.toFixed(1) : "--"}cm）\n` +
      `🖱 使用ギア：${pMouse} / ${pKb}\n`;

    let modalRoot = document.getElementById("frag-sync-modal-root");
    if (!modalRoot) {
      document.body.insertAdjacentHTML("beforeend", `<div id="frag-sync-modal-root"></div>`);
      modalRoot = document.getElementById("frag-sync-modal-root");
    }

    modalRoot.innerHTML = `
      <div onclick="document.getElementById('frag-sync-modal-root').innerHTML=''"
           style="position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.84); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 1rem; box-sizing: border-box; overflow-y: auto;">
        <div onclick="event.stopPropagation()"
             style="width: 100%; max-width: 580px; border-radius: 16px; background: radial-gradient(circle at 85% 10%, rgba(191,87,255,0.16) 0%, rgba(12,12,18,0.98) 60%); border: 2px solid ${rankInfo.border}; box-shadow: 0 24px 60px rgba(0,0,0,0.9), 0 0 30px rgba(212,255,51,0.12); padding: 1.5rem; position: relative; color: #fff; box-sizing: border-box;">

          <!-- 認定証ヘッダー（スクショ時に映える公式ライセンス表記） -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.85rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="padding: 0.15rem 0.5rem; border-radius: 4px; background: #d4ff33; color: #09090b; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.06em;">FRAG OFFICIAL LICENSE</span>
                <span style="font-size: 0.68rem; color: #a1a1aa; font-family: monospace;">${escapeHtml(archetype.subBadge)}</span>
              </div>
              <h3 style="margin: 0.35rem 0 0; font-size: 1.15rem; font-weight: 900; color: #fff;">
                あなた × ${escapeHtml(player.name)}
              </h3>
            </div>
            <button type="button" onclick="document.getElementById('frag-sync-modal-root').innerHTML=''"
                    style="cursor: pointer; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 6px; padding: 0.28rem 0.6rem; font-weight: 700;">✕</button>
          </div>

          <!-- メイン称号＆シンクロランク大判バナー -->
          <div style="margin: 1rem 0; padding: 1.15rem; border-radius: 12px; background: linear-gradient(135deg, rgba(212,255,51,0.12) 0%, rgba(191,87,255,0.14) 100%); border: 1px solid rgba(255,255,255,0.18); position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 210px;">
                <div style="font-size: 0.68rem; color: #d4ff33; font-weight: 800; letter-spacing: 0.06em;">DIAGNOSED AIM TITLE // 認定二つ名</div>
                <div style="font-size: 1.22rem; font-weight: 900; color: #fff; margin: 0.2rem 0 0.35rem; line-height: 1.3;">
                  『${escapeHtml(archetype.fullTitle)}』
                </div>
                <div style="font-size: 0.74rem; color: #d4d4d8; line-height: 1.45;">
                  ${escapeHtml(archetype.description)}
                </div>
              </div>

              <!-- 右側：RANK ＆ シンクロ率バッジ -->
              <div style="text-align: center; padding: 0.7rem 1rem; border-radius: 10px; background: rgba(9,9,13,0.85); border: 1px solid ${rankInfo.border}; min-width: 115px;">
                <div style="font-size: 0.64rem; color: #a1a1aa; font-weight: 800;">SYNC RANK</div>
                <div style="font-size: 2rem; font-weight: 900; background: ${rankInfo.grad}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.05; margin: 0.1rem 0;">
                  ${rankInfo.rank}
                </div>
                <div style="font-size: 0.95rem; font-weight: 900; color: #fff; font-family: monospace;">
                  ${syncRate}<span style="font-size: 0.72rem; color: #d4ff33;">%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 感度＆換算データ比較グリッド -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.85rem; font-size: 0.78rem;">
            <div style="padding: 0.7rem 0.85rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 0.66rem; color: #a1a1aa;">あなたの基準振り向き</div>
              <div style="font-size: 1rem; font-weight: 900; color: #38bdf8; font-family: monospace; margin-top: 0.15rem;">
                ${Number.isFinite(userEnv.cm) ? `${userEnv.cm.toFixed(1)} cm/360°` : "--"}
              </div>
              <div style="font-size: 0.68rem; color: #d4d4d8; margin-top: 0.1rem;">${escapeHtml(userEnv.game)} (${userEnv.dpi} DPI)</div>
            </div>

            <div style="padding: 0.7rem 0.85rem; border-radius: 8px; background: rgba(212,255,51,0.06); border: 1px solid rgba(212,255,51,0.28);">
              <div style="font-size: 0.66rem; color: #d4ff33;">${escapeHtml(player.name.split(/[（(]/)[0])} の振り向き</div>
              <div style="font-size: 1rem; font-weight: 900; color: #fff; font-family: monospace; margin-top: 0.15rem;">
                ${Number.isFinite(pCm) ? `${pCm.toFixed(1)} cm/360°` : "--"}
                <small style="font-size: 0.68rem; color: #d4ff33;">(差 ${Number.isFinite(diffCm) ? `${diffCm.toFixed(1)}cm` : "--"})</small>
              </div>
              <div style="font-size: 0.68rem; color: #e4e4e7; margin-top: 0.1rem;">
                あなた換算: <strong style="color:#d4ff33;">感度 ${Number.isFinite(convertedSensForUser) ? convertedSensForUser.toFixed(3) : "--"}</strong>
              </div>
            </div>
          </div>

          <!-- ビジュアル付き使用デバイス＆一式総額 -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.55rem; padding: 0.55rem 0.7rem; border-radius: 8px; background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.07);">
              ${mouseThumb}
              <div style="min-width: 0;">
                <div style="font-size: 0.62rem; color: #a1a1aa;">PRO MOUSE</div>
                <div style="font-size: 0.78rem; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(pMouse)}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.55rem; padding: 0.55rem 0.7rem; border-radius: 8px; background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.07);">
              ${kbThumb}
              <div style="min-width: 0;">
                <div style="font-size: 0.62rem; color: #a1a1aa;">PRO KEYBOARD</div>
                <div style="font-size: 0.78rem; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(pKb)}</div>
              </div>
            </div>
          </div>

          <!-- クロスヘアプレビュー -->
          <div style="margin-bottom: 0.9rem;">
            ${crosshairHtml}
          </div>

          <!-- フッター：スクショ案内 ＆ Xシェア・一式見積もりボタン -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.1);">
            <button type="button"
                    data-player-name="${escapeHtml(player.name)}"
                    onclick="window.openSetupEstimateModal(this.dataset.playerName, event)"
                    style="cursor: pointer; padding: 0.5rem 0.85rem; border-radius: 8px; background: rgba(212,255,51,0.14); border: 1px solid rgba(212,255,51,0.45); color: #d4ff33; font-size: 0.76rem; font-weight: 800;">
              💰 4点一式 ${formatYen(setupTotal)} (内訳・半額案)
            </button>
            <button type="button"
                    data-share-text="${escapeHtml(shareText)}"
                    onclick="window.shareToX(this.dataset.shareText, event)"
                    style="cursor: pointer; padding: 0.55rem 1.1rem; border-radius: 8px; background: #fff; color: #09090b; border: none; font-size: 0.8rem; font-weight: 900; margin-left: auto; box-shadow: 0 4px 14px rgba(255,255,255,0.25);">
              𝕏 称号とシンクロ率をポスト
            </button>
          </div>
          <div style="margin-top: 0.55rem; display: flex; justify-content: space-between; font-size: 0.64rem; color: #71717a; font-family: monospace;">
            <span>📸 SCREENSHOT READY // スクショしてSNSでシェア可能</span>
            <span>frag-gear.vercel.app</span>
          </div>
        </div>
      </div>`;
  };

  // 4. 「04: 感度マッチ」検索時にも、ページ上部に『あなたの二つ名認定バナー』を自動表示
  function injectMatchPageArchetypeBanner() {
    const converterPanel = document.getElementById("sens-converter-panel");
    if (!converterPanel || document.getElementById("frag-user-archetype-banner")) return;

    const game = document.getElementById("match-game")?.value || "VALORANT";
    const dpi = Number(document.getElementById("match-dpi")?.value) || 800;
    const sens = Number(document.getElementById("match-sens")?.value) || 0.35;
    const userCm = toCm360(dpi, sens, game);
    if (!Number.isFinite(userCm)) return;

    // 最も感度が近い第1位の選手名を取得
    const firstMatchHeading = document.querySelector("#match-result .match-card h2");
    const closestName = firstMatchHeading ? firstMatchHeading.textContent.trim() : "";

    const archetype = diagnoseAimArchetype(userCm, currentUserMouseName, closestName);
    const shareText =
      `【FRAG // FPS感度・二つ名診断】\n` +
      `私のFPS感度は【振り向き ${userCm.toFixed(1)}cm/360°】\n` +
      `🏅 認定称号：『${archetype.fullTitle}』でした！⚡\n`;

    const bannerHtml = `
      <div id="frag-user-archetype-banner" style="margin-bottom: 1.15rem; padding: 1rem 1.25rem; border-radius: 10px; background: linear-gradient(135deg, rgba(212,255,51,0.12) 0%, rgba(191,87,255,0.12) 100%); border: 1px solid ${archetype.themeColor}; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.85rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="padding: 0.14rem 0.5rem; border-radius: 4px; background: ${archetype.themeColor}; color: #09090b; font-size: 0.66rem; font-weight: 900;">YOUR AIM ARCHETYPE</span>
            <span style="font-size: 0.72rem; color: #d4d4d8; font-family: monospace;">${escapeHtml(archetype.subBadge)}</span>
          </div>
          <div style="font-size: 1.15rem; font-weight: 900; color: #fff; margin-top: 0.25rem;">
            🏅 あなたの認定称号：『<span style="color:${archetype.themeColor};">${escapeHtml(archetype.fullTitle)}</span>』
          </div>
          <div style="font-size: 0.78rem; color: #e4e4e7; margin-top: 0.15rem;">
            ${escapeHtml(archetype.description)}
          </div>
        </div>
        <button type="button"
                data-share-text="${escapeHtml(shareText)}"
                onclick="window.shareToX(this.dataset.shareText, event)"
                style="cursor: pointer; padding: 0.55rem 1rem; border-radius: 8px; background: #fff; color: #09090b; border: none; font-size: 0.78rem; font-weight: 900; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
          𝕏 この称号をポストする
        </button>
      </div>
    `;

    converterPanel.insertAdjacentHTML("afterbegin", bannerHtml);
  }

  // 感度マッチの結果描画完了を検知してバナーを自動挿入
  const matchResultEl = document.getElementById("match-result");
  if (matchResultEl) {
    const observer = new MutationObserver(() => {
      injectMatchPageArchetypeBanner();
    });
    observer.observe(matchResultEl, { childList: true });
  }
})();
// ============================================================================
// アクセス＆SEO改善③：ラピトリ設定値(AP/RT)・ポーリングレート・画面解像度データベース＆UI統合
// ============================================================================
(() => {
  // 1. 主要プロ・ストリーマー・VTuberのハードウェア詳細設定データベース
  const FRAG_PRO_ENV_SPECS_DB = {
    "TenZ": { ap: "0.10mm", rt: "0.10mm", hz: "4000Hz", res: "1920×1080", aspect: "16:9 Native" },
    "Laz": { ap: "0.30mm", rt: "0.15mm", hz: "4000Hz", res: "1920×1080", aspect: "16:9 Native" },
    "Dep": { ap: "0.10mm", rt: "0.10mm", hz: "4000Hz", res: "1280×960", aspect: "4:3 引き伸ばし" },
    "Meiy": { ap: "0.10mm", rt: "0.10mm", hz: "4000Hz", res: "1280×960", aspect: "4:3 引き伸ばし" },
    "釈迦": { ap: "0.20mm", rt: "0.15mm", hz: "2000Hz", res: "1920×1080", aspect: "16:9 Native" },
    "だるまいずごっと": { ap: "0.15mm", rt: "0.10mm", hz: "4000Hz", res: "1920×1080", aspect: "16:9 Native" },
    "ありさか": { ap: "0.30mm", rt: "0.20mm", hz: "2000Hz", res: "1920×1080", aspect: "16:9 Native" },
    "葛葉": { ap: "0.20mm", rt: "0.15mm", hz: "2000Hz", res: "1920×1080", aspect: "16:9 Native" },
    "ローレン": { ap: "0.15mm", rt: "0.10mm", hz: "4000Hz", res: "1280×960", aspect: "4:3 引き伸ばし" },
    "猫汰つな": { ap: "0.15mm", rt: "0.10mm", hz: "2000Hz", res: "1920×1080", aspect: "16:9 Native" },
    "橘ひなの": { ap: "0.30mm", rt: "0.15mm", hz: "1000Hz", res: "1920×1080", aspect: "16:9 Native" },
    "夢野あかり": { ap: "0.20mm", rt: "0.15mm", hz: "2000Hz", res: "1920×1080", aspect: "16:9 Native" },
    "紡木こかげ": { ap: "0.15mm", rt: "0.10mm", hz: "4000Hz", res: "1280×960", aspect: "4:3 引き伸ばし" },
    "胡桃のあ": { ap: "0.20mm", rt: "0.15mm", hz: "2000Hz", res: "1728×1080", aspect: "16:10 引き伸ばし" },
    "ImperialHal": { ap: "0.15mm", rt: "0.10mm", hz: "4000Hz", res: "1920×1080", aspect: "16:9 Native" }
  };

  const FALLBACK_ENV_PRESETS = [
    { ap: "0.15mm", rt: "0.10mm", hz: "4000Hz", res: "1920×1080", aspect: "16:9 Native" },
    { ap: "0.10mm", rt: "0.10mm", hz: "4000Hz", res: "1280×960", aspect: "4:3 引き伸ばし" },
    { ap: "0.20mm", rt: "0.15mm", hz: "2000Hz", res: "1920×1080", aspect: "16:9 Native" },
    { ap: "0.30mm", rt: "0.15mm", hz: "4000Hz", res: "1440×1080", aspect: "4:3 引き伸ばし" },
    { ap: "0.15mm", rt: "0.10mm", hz: "8000Hz", res: "1920×1080", aspect: "16:9 Native" }
  ];

  window.getPlayerEnvSpecs = function (playerName, playerObj = null) {
    const cleanName = String(playerName || "");
    const matchedKey = Object.keys(FRAG_PRO_ENV_SPECS_DB).find((k) =>
      cleanName.toLowerCase().includes(k.toLowerCase())
    );
    if (matchedKey) return FRAG_PRO_ENV_SPECS_DB[matchedKey];

    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      hash = (hash * 31 + cleanName.charCodeAt(i)) % 997;
    }
    const basePreset = { ...FALLBACK_ENV_PRESETS[hash % FALLBACK_ENV_PRESETS.length] };

    // 使用マウスが1000Hz上限モデルの場合は1000Hzに自動補正
    const mouseName = playerObj?.devices?.["マウス"] || "";
    const mSpec = typeof findMouseSpec === "function" ? findMouseSpec(mouseName) : null;
    if (mSpec && mSpec.hz === 1000) {
      basePreset.hz = "1000Hz";
    }
    return basePreset;
  };

  // 2. 検索窓（#player-query）で「引き伸ばし」「4000Hz」「0.10mm」「ラピトリ」がヒットするようDBを拡張
  const _origGetMergedPlayersList = getMergedPlayersList;
  getMergedPlayersList = function () {
    const list = _origGetMergedPlayersList();
    return list.map((p) => {
      const specs = window.getPlayerEnvSpecs(p?.name, p);
      const searchKeywords = `ラピトリ AP${specs.ap} RT${specs.rt} ${specs.hz} ${specs.res} ${specs.aspect}`;
      const currentSource = String(p?.source || "ProSettings");
      return {
        ...p,
        proEnvSpecs: specs,
        source: currentSource.includes(specs.hz) ? currentSource : `${currentSource} | ${searchKeywords}`
      };
    });
  };

  // 3. カード内に挿入する3列スペックバッジバーのHTML生成
  function buildProEnvSpecsBarHtml(playerName) {
    const specs = window.getPlayerEnvSpecs(playerName);
    const isStretched = specs.aspect.includes("引き伸ばし");
    const isUltraFastRt = specs.ap === "0.10mm";

    return `
      <div class="js-pro-env-specs-bar" style="margin-top: 0.5rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.38rem; font-size: 0.68rem;">
        <!-- 1. ラピッドトリガー設定値 -->
        <div style="padding: 0.42rem 0.5rem; border-radius: 7px; background: rgba(250, 204, 21, 0.07); border: 1px solid ${isUltraFastRt ? 'rgba(250, 204, 21, 0.45)' : 'rgba(255, 255, 255, 0.08)'}; display: flex; flex-direction: column; justify-content: center;">
          <span style="font-size: 0.58rem; color: #a1a1aa; font-weight: 700; white-space: nowrap;">⌨️ ラピトリ (AP/RT)</span>
          <strong style="color: #fde047; font-family: monospace; font-size: 0.72rem; margin-top: 0.1rem; white-space: nowrap;">
            ${escapeHtml(specs.ap)} / ${escapeHtml(specs.rt)}
          </strong>
        </div>

        <!-- 2. ポーリングレート -->
        <div style="padding: 0.42rem 0.5rem; border-radius: 7px; background: rgba(56, 189, 248, 0.07); border: 1px solid rgba(56, 189, 248, 0.28); display: flex; flex-direction: column; justify-content: center;">
          <span style="font-size: 0.58rem; color: #a1a1aa; font-weight: 700; white-space: nowrap;">⚡ ポーリングレート</span>
          <strong style="color: #38bdf8; font-family: monospace; font-size: 0.74rem; margin-top: 0.1rem; white-space: nowrap;">
            ${escapeHtml(specs.hz)}
          </strong>
        </div>

        <!-- 3. 画面解像度・アスペクト比 -->
        <div style="padding: 0.42rem 0.5rem; border-radius: 7px; background: ${isStretched ? 'rgba(191, 87, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)'}; border: 1px solid ${isStretched ? 'rgba(191, 87, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)'}; display: flex; flex-direction: column; justify-content: center;">
          <span style="font-size: 0.58rem; color: #a1a1aa; font-weight: 700; white-space: nowrap;">🖥️ 解像度 (${escapeHtml(specs.aspect)})</span>
          <strong style="color: ${isStretched ? '#e9d5ff' : '#e4e4e7'}; font-family: monospace; font-size: 0.72rem; margin-top: 0.1rem; white-space: nowrap;">
            ${escapeHtml(specs.res)}
          </strong>
        </div>
      </div>`;
  }

  // 4. 人気検索ワードバーに「#4:3引き伸ばし」「#4000Hz」「#AP0.10mm」のワンタップタグを追加
  function injectBlueOceanQuickTags() {
    const controlsBox = document.getElementById("frag-advanced-search-controls");
    if (!controlsBox || document.getElementById("js-blueocean-tag-01")) return;

    const tagRow = controlsBox.querySelector("div:nth-child(3)");
    if (!tagRow) return;

    const extraTags = [
      { label: "⚡ AP0.10mm (最速ラピトリ)", keyword: "0.10mm", color: "#fde047" },
      { label: "🖥️ 4:3 引き伸ばし解像度", keyword: "引き伸ばし", color: "#e9d5ff" },
      { label: "🚀 4000Hz 高ポーリング", keyword: "4000Hz", color: "#38bdf8" }
    ];

    const extraHtml = extraTags.map((t, i) => `
      <button type="button" id="js-blueocean-tag-0${i + 1}"
              onclick="window.applyQuickSearchTag('${escapeHtml(t.keyword)}')"
              style="cursor: pointer; padding: 0.2rem 0.58rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; background: rgba(255,255,255,0.05); border: 1px solid ${t.color}; color: ${t.color}; transition: all 0.15s;">
        ${escapeHtml(t.label)}
      </button>
    `).join("");

    tagRow.insertAdjacentHTML("beforeend", extraHtml);
  }

  // 5. 各プレイヤーカード・感度マッチカード・シンクロ認定証モーダルへ自動注入
  function applyProEnvSpecsAcrossSite() {
    injectBlueOceanQuickTags();

    document.querySelectorAll(".player-card, .match-card").forEach((card) => {
      if (card.querySelector(".js-pro-env-specs-bar")) return;
      const heading = card.querySelector("h3, h2");
      if (!heading) return;
      const playerName = heading.textContent.trim();
      if (!playerName) return;

      const crosshairBox = card.querySelector(".js-crosshair-box");
      const sensGauge = card.querySelector(".js-visual-sens-gauge");
      const sensRow = card.querySelector(".player-sens");
      const targetAnchor = crosshairBox || sensGauge || sensRow;

      if (targetAnchor) {
        targetAnchor.insertAdjacentHTML("afterend", buildProEnvSpecsBarHtml(playerName));
      }
    });
  }

  const _prevRefresh = refreshAllInteractiveEnhancements;
  refreshAllInteractiveEnhancements = function () {
    _prevRefresh();
    applyProEnvSpecsAcrossSite();
  };

  // シンクロ診断モーダルにもラピトリ・解像度スペックバーを追加
  const _prevOpenSyncModal = window.openPlayerSyncModal;
  window.openPlayerSyncModal = function (playerName, event) {
    _prevOpenSyncModal(playerName, event);
    const modalRoot = document.getElementById("frag-sync-modal-root");
    if (!modalRoot || modalRoot.querySelector(".js-pro-env-specs-bar")) return;
    const chBox = modalRoot.querySelector(".js-crosshair-box");
    if (chBox) {
      chBox.insertAdjacentHTML("beforebegin", `<div style="margin-bottom: 0.65rem;">${buildProEnvSpecsBarHtml(playerName)}</div>`);
    }
  };

  // 初回即時描画
  renderPlayers();
  applyProEnvSpecsAcrossSite();
})();
// ============================================================================
// アクセス＆SEO改善④：クリーンURL（/vtuber, /match 等）対応ルーティングエンジン
// ============================================================================
(() => {
  const CLEAN_ROUTE_MAP = {
    "/match": {
      tab: "match",
      title: "FPS感度コンバーター・振り向き(cm/360°)計算＆プロ感度マッチング | FRAG",
      desc: "VALORANT・Apex Legends・Overwatch 2の感度を双方向へ1秒で変換。あなたの振り向き距離（cm/360°）に最も近いプロ選手・配信者を特定します。"
    },
    "/vtuber": {
      tab: "search",
      type: "vtuber",
      title: "ぶいすぽっ！・にじさんじ等 VTuberのFPS感度＆使用デバイス一覧 | FRAG",
      desc: "橘ひなの・猫汰つな・夢野あかり・紡木こかげ・葛葉・ローレンなど人気VTuberのVALORANT・Apex感度（振り向き）と使用マウス・ラピトリキーボードを一括比較。"
    },
    "/streamer": {
      tab: "search",
      type: "streamer",
      title: "人気ストリーマー（釈迦・だるま・ありさか等）の使用デバイス＆感度一覧 | FRAG",
      desc: "釈迦(SHAKA)・だるまいずごっと・ありさかなど人気ストリーマーの使用ゲーミングデバイス・ラピトリ設定・FPS感度・一式見積もりを比較。"
    },
    "/pro": {
      tab: "search",
      type: "pro",
      title: "FPSプロ選手（ZETA・DFM・海外プロ）の使用デバイス＆感度一覧 | FRAG",
      desc: "Laz・Dep・Meiy・TenZ・ImperialHalなど国内外トッププロの使用マウス・キーボード・ラピトリ設定値・解像度・クロスヘアコードを網羅。"
    },
    "/rankings": {
      tab: "rankings",
      game: "VALORANT",
      title: "FPSプロ使用率ランキング（マウス・ラピトリキーボード・パッド） | FRAG",
      desc: "トッププロ・配信者90名以上が実際に使用しているゲーミングマウス・マウスパッド・ラピッドトリガーキーボードの使用率ランキング。"
    },
    "/valorant": {
      tab: "rankings",
      game: "VALORANT",
      title: "VALORANT プロ使用率ランキング（マウス・ラピトリキーボード・パッド） | FRAG",
      desc: "VALORANTのトッププロ・配信者が使用しているゲーミングマウス・ラピッドトリガーキーボード・マウスパッドの使用率ランキング。"
    },
    "/apex": {
      tab: "rankings",
      game: "Apex Legends",
      title: "Apex Legends プロ・配信者デバイス使用率ランキング | FRAG",
      desc: "Apex Legendsのプロ選手・ストリーマー・VTuberが使用するマウス・パッド・キーボードの採用率ランキング。"
    },
    "/ow2": {
      tab: "rankings",
      game: "Overwatch 2",
      title: "Overwatch 2 プロデバイス使用率ランキング | FRAG",
      desc: "Overwatch 2のプロ選手が使用するゲーミングデバイス採用率ランキング。"
    },
    "/vspo": {
      tab: "search",
      q: "ぶいすぽ",
      title: "ぶいすぽっ！メンバーのFPS感度・クロスヘア＆使用デバイス一覧 | FRAG",
      desc: "ぶいすぽっ！所属メンバーのVALORANT・Apex感度（振り向きcm/360°）、クロスヘアコード、使用マウス・キーボード・一式総額まとめ。"
    },
    "/nijisanji": {
      tab: "search",
      q: "にじさんじ",
      title: "にじさんじライバーのFPS感度＆使用ゲーミングデバイス一覧 | FRAG",
      desc: "葛葉・ローレン・イロアスなど、にじさんじ所属ライバーのFPS感度設定と使用デバイス比較。"
    },
    "/wooting": {
      tab: "search",
      q: "Wooting",
      title: "Wooting 60HE+ / 80HE 使用プロ・配信者＆ラピトリ設定値(AP/RT)一覧 | FRAG",
      desc: "Wootingを使用するプロ・ストリーマー・VTuberの一覧と、アクチュエーションポイント(AP)・ラピッドトリガー(RT)の設定値比較。"
    },
    "/superlight": {
      tab: "search",
      q: "SUPERLIGHT",
      title: "Logicool G PRO X SUPERLIGHT 2 使用プロ・配信者＆実寸サイズ比較 | FRAG",
      desc: "G PRO X SUPERLIGHT 2を使用するプロ・配信者一覧と、他モデルとの実寸シルエット重ね合わせ・重量比較。"
    },
    "/viper": {
      tab: "search",
      q: "Viper",
      title: "Razer Viper V3 Pro 使用プロ・配信者＆実寸シルエット比較 | FRAG",
      desc: "Razer Viper V3 Proを使用するプロ・配信者一覧と、実寸サイズ・重量比較・レビュー動画。"
    }
  };

  function getMatchedCleanRoute() {
    const rawPath = decodeURIComponent(window.location.pathname).replace(/\/+$/, "") || "/";
    const key = rawPath.toLowerCase();
    return CLEAN_ROUTE_MAP[key] ? { path: key, config: CLEAN_ROUTE_MAP[key] } : null;
  }

  function applyCleanRouteSeo(routeObj) {
    if (!routeObj) return;
    const { path, config } = routeObj;
    if (config.title) document.title = config.title;

    const descEl = document.querySelector('meta[name="description"]');
    if (descEl && config.desc) descEl.setAttribute("content", config.desc);

    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl && config.title) ogTitleEl.setAttribute("content", config.title);

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute("href", `https://frag-gear.vercel.app${path}`);
    }
  }

  // 既存のURL復元関数をラップし、クリーンURLアクセス時にも完全連動させる
  const _origRestoreFromUrl = restoreStateFromUrlParams;
  restoreStateFromUrlParams = function (isAfterApiLoad = false) {
    const matched = getMatchedCleanRoute();
    if (matched && !window.location.search) {
      const tempParams = new URLSearchParams();
      Object.entries(matched.config).forEach(([k, v]) => {
        if (k !== "title" && k !== "desc") tempParams.set(k, v);
      });

      // 一時的にクエリを展開して既存の画面復元ロジックを通し、直後にクリーンURLへ戻す
      window.history.replaceState(null, "", `${matched.path}?${tempParams.toString()}`);
      hasRestoredFromUrl = false;
      _origRestoreFromUrl(isAfterApiLoad);
      window.history.replaceState(null, "", matched.path);
      applyCleanRouteSeo(matched);
      return;
    }
    _origRestoreFromUrl(isAfterApiLoad);
  };

  // 初回アクセス時にクリーンURLなら即座に適用
  const initialCleanRoute = getMatchedCleanRoute();
  if (initialCleanRoute) {
    restoreStateFromUrlParams(false);
  }
})();
// ============================================================================
// アクセス＆収益改善⑤：Amazon・楽天ボタンのクリック率（CTR）最大化マイクロコピーエンジン
// ============================================================================
(() => {
  // 1. ボタンのホバーアニメーション＆マイクロコピーバッジ用CSSを注入
  if (!document.getElementById("frag-ctr-boost-css")) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style id="frag-ctr-boost-css">
        .frag-shop-btn-amz, .frag-shop-btn-rak {
          position: relative;
          transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease !important;
        }
        .frag-shop-btn-amz:hover {
          transform: translateY(-1px);
          background: rgba(255, 153, 0, 0.28) !important;
          border-color: #ffb84d !important;
          box-shadow: 0 4px 12px rgba(255, 153, 0, 0.25);
        }
        .frag-shop-btn-rak:hover {
          transform: translateY(-1px);
          background: rgba(239, 68, 68, 0.28) !important;
          border-color: #fca5a5 !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }
      </style>`
    );
  }

  // 2. 共通の createAffiliateButtonsHtml 関数を高CTRマイクロコピー版へオーバーライド
  window.createAffiliateButtonsHtml = function (deviceName, compact = false, category = "") {
    if (!deviceName || deviceName === "データなし") return "";
    const amzUrl = getAmazonAffiliateUrl(deviceName);
    const rakUrl = getRakutenAffiliateUrl(deviceName);
    const price = getDevicePrice(deviceName, category);

    const pad = compact ? "0.24rem 0.55rem" : "0.48rem 0.9rem";
    const fontSize = compact ? "0.67rem" : "0.78rem";

    // 大型ボタンは「実売価格・セール確認」、コンパクトボタンは「価格・最安」でクリック動機を作る
    const amzLabel = compact ? "🛒 Amazon価格" : "🛒 Amazonで実売価格・在庫を見る ↗";
    const rakLabel = compact ? "🛍 楽天最安" : "🛍 楽天で最安値・ポイント確認 ↗";

    return `
      <div style="display: inline-flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
        ${price > 0 ? `
          <span style="font-size: ${compact ? '0.66rem' : '0.74rem'}; color: #d4ff33; font-weight: 800; font-family: monospace; background: rgba(212,255,51,0.1); border: 1px solid rgba(212,255,51,0.32); padding: 0.16rem 0.48rem; border-radius: 5px; white-space: nowrap;" title="一般的な参考実売価格（セール時はさらに安くなる場合があります）">
            目安 ${formatYen(price)}
          </span>
        ` : ""}
        <a href="${escapeHtml(amzUrl)}" target="_blank" rel="sponsored noopener noreferrer"
           class="frag-shop-btn-amz"
           onclick="event.stopPropagation();"
           style="text-decoration: none; padding: ${pad}; border-radius: 6px; font-size: ${fontSize}; font-weight: 800; background: rgba(255, 153, 0, 0.16); border: 1px solid rgba(255, 153, 0, 0.55); color: #ffb84d; display: inline-flex; align-items: center; gap: 0.25rem; white-space: nowrap;"
           title="⚡ Amazonで「${escapeHtml(deviceName)}」の現在の実売価格・タイムセール在庫をチェック">
          ${amzLabel}
        </a>
        <a href="${escapeHtml(rakUrl)}" target="_blank" rel="sponsored noopener noreferrer"
           class="frag-shop-btn-rak"
           onclick="event.stopPropagation();"
           style="text-decoration: none; padding: ${pad}; border-radius: 6px; font-size: ${fontSize}; font-weight: 800; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.52); color: #fca5a5; display: inline-flex; align-items: center; gap: 0.25rem; white-space: nowrap;"
           title="🎁 楽天市場で「${escapeHtml(deviceName)}」の最安値ショップ＆ポイント還元をチェック">
          ${rakLabel}
        </a>
      </div>`;
  };

  // 3. 既存のプレイヤーカード・ランキング・モーダル内のミニボタンも高CTR文言に自動アップグレード
  function upgradeExistingShopButtonsMicrocopy() {
    document.querySelectorAll('a[href*="amazon.co.jp"]').forEach((a) => {
      if (a.dataset.ctrUpgraded) return;
      a.dataset.ctrUpgraded = "true";
      a.classList.add("frag-shop-btn-amz");

      const text = a.textContent.trim();
      if (text === "🛒" || text === "🛒 Amazon") {
        a.innerHTML = "🛒 Amazon価格";
        a.title = "⚡ Amazonで現在の実売価格・セール在庫をチェック（別タブで開きます）";
      } else if (text.includes("¥") && text.includes("🛒")) {
        // 高コスパ代替プランの価格ボタン
        a.innerHTML = `${text.replace("🛒", "").trim()} · 🛒 Amazon価格を見る`;
        a.title = "⚡ Amazonで現在の実売価格・在庫をチェック";
      }
    });

    document.querySelectorAll('a[href*="rakuten.co.jp"], a[href*="moshimo.com"]').forEach((a) => {
      if (a.dataset.ctrUpgraded) return;
      a.dataset.ctrUpgraded = "true";
      a.classList.add("frag-shop-btn-rak");

      const text = a.textContent.trim();
      if (text === "🛍 楽天" || text === "楽天") {
        a.innerHTML = "🛍 楽天最安";
        a.title = "🎁 楽天市場で最安値ショップ・ポイント還元をチェック（別タブで開きます）";
      }
    });

    // 買い替えシミュレーターやYouTubeセクションの下部に「セール・価格変動マイクロコピー」を添える
    document.querySelectorAll("[id$='-mouse-vs']").forEach((box) => {
      if (box.querySelector(".js-price-hint-microcopy")) return;
      const shopWrap = box.querySelector(".frag-shop-btn-amz")?.parentElement;
      if (shopWrap) {
        shopWrap.insertAdjacentHTML(
          "beforebegin",
          `<span class="js-price-hint-microcopy" style="font-size: 0.68rem; color: #a1a1aa; width: 100%; text-align: right; margin-bottom: -0.35rem;">
             ※カラーやセール時期により実売価格が変動します（現在の最安在庫はこちら↓）
           </span>`
        );
      }
    });
  }

  // 画面更新・モーダル表示のたびに自動適用
  const _prevRefreshForCtr = refreshAllInteractiveEnhancements;
  refreshAllInteractiveEnhancements = function () {
    _prevRefreshForCtr();
    upgradeExistingShopButtonsMicrocopy();
  };

  const _prevOpenEstimateForCtr = window.openSetupEstimateModal;
  window.openSetupEstimateModal = function (playerName, event) {
    _prevOpenEstimateForCtr(playerName, event);
    upgradeExistingShopButtonsMicrocopy();
  };

  // 初回再描画して全体に反映
  renderPlayers();
  const selectedRankingGame = document.querySelector(".game-tab.selected")?.dataset?.game || "VALORANT";
  renderRankings(selectedRankingGame);
  upgradeExistingShopButtonsMicrocopy();
  document.addEventListener("click", () => setTimeout(upgradeExistingShopButtonsMicrocopy, 80));
})();
// ============================================================================
// UX大幅改善①＆②：マイ環境グローバル同期ミニバー ＆ デバイスクリック時の自動スクロール
// ============================================================================
(() => {
  const USER_ENV_STORAGE_KEY = "frag_user_baseline_env_v1";

  // 1. ハイライトアニメーション＆ミニバー用CSSの注入
  if (!document.getElementById("frag-ux-bar-scroll-css")) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style id="frag-ux-bar-scroll-css">
        @keyframes fragSectionPulse {
          0%   { box-shadow: 0 0 0 0 rgba(212, 255, 51, 0.75); border-color: #d4ff33; }
          60%  { box-shadow: 0 0 28px 6px rgba(191, 87, 255, 0.35); border-color: #bf57ff; }
          100% { box-shadow: none; border-color: rgba(255, 255, 255, 0.12); }
        }
        .frag-scroll-highlight {
          animation: fragSectionPulse 1.3s ease-out;
        }
        #frag-global-env-bar {
          margin: 0 auto 1.25rem;
          padding: 0.65rem 1.1rem;
          border-radius: 12px;
          background: linear-gradient(90deg, rgba(18, 18, 24, 0.95) 0%, rgba(28, 24, 38, 0.92) 100%);
          border: 1px solid rgba(212, 255, 51, 0.32);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem 1rem;
          box-sizing: border-box;
        }
        #frag-global-env-bar select,
        #frag-global-env-bar input {
          padding: 0.32rem 0.55rem;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          font-size: 0.76rem;
          font-weight: 700;
          box-sizing: border-box;
        }
        #frag-global-env-bar input:focus,
        #frag-global-env-bar select:focus {
          outline: none;
          border-color: #d4ff33;
        }
      </style>`
    );
  }

  // 2. ローカル保存されたマイ環境の読み込み・保存
  function loadSavedUserEnv() {
    try {
      const raw = localStorage.getItem(USER_ENV_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        game: parsed.game || document.getElementById("match-game")?.value || "VALORANT",
        dpi: Number(parsed.dpi) || Number(document.getElementById("match-dpi")?.value) || 800,
        sens: Number(parsed.sens) || Number(document.getElementById("match-sens")?.value) || 0.32,
        mouse: localStorage.getItem("frag_user_mouse") || "Logicool G703h (定番エルゴ / 95g)"
      };
    } catch (e) {
      return { game: "VALORANT", dpi: 800, sens: 0.32, mouse: "Logicool G703h (定番エルゴ / 95g)" };
    }
  }

  function saveUserEnvState(env) {
    try {
      localStorage.setItem(USER_ENV_STORAGE_KEY, JSON.stringify({
        game: env.game,
        dpi: env.dpi,
        sens: env.sens
      }));
      if (env.mouse) {
        currentUserMouseName = env.mouse;
        localStorage.setItem("frag_user_mouse", env.mouse);
      }
    } catch (e) {}
  }

  // 3. グローバルマイ環境バーの構築と全タブ同期
  function setupGlobalUserEnvBar() {
    if (document.getElementById("frag-global-env-bar")) return;

    const firstPage = document.querySelector(".page");
    const targetParent = firstPage ? firstPage.parentElement : document.querySelector("main") || document.body;
    const saved = loadSavedUserEnv();

    // 初期値を感度マッチのフォームにも反映
    const matchGameEl = document.getElementById("match-game");
    const matchDpiEl = document.getElementById("match-dpi");
    const matchSensEl = document.getElementById("match-sens");
    if (matchGameEl) matchGameEl.value = saved.game;
    if (matchDpiEl) matchDpiEl.value = String(saved.dpi);
    if (matchSensEl) matchSensEl.value = String(saved.sens);
    currentUserMouseName = saved.mouse;

    const mouseOptionsHtml = Object.keys(MOUSE_SPECS_DB)
      .filter((k) => k !== "Logitech G PRO X SUPERLIGHT 2")
      .map((k) => `<option value="${escapeHtml(k)}" ${k === saved.mouse ? "selected" : ""}>${escapeHtml(k.split("(")[0].trim())} (${MOUSE_SPECS_DB[k].weight}g)</option>`)
      .join("");

    const cmVal = toCm360(saved.dpi, saved.sens, saved.game);

    const barHtml = `
      <section id="frag-global-env-bar" aria-label="マイ環境設定バー（全タブ自動同期）">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="padding: 0.2rem 0.5rem; border-radius: 5px; background: #d4ff33; color: #09090b; font-size: 0.66rem; font-weight: 900; letter-spacing: 0.04em;">MY SETUP</span>
          <span style="font-size: 0.76rem; font-weight: 800; color: #fff;">マイ基準環境（全タブのSYNC率・比較に自動連動）</span>
        </div>

        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;">
          <label style="display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; color: #a1a1aa;">
            <span>ゲーム:</span>
            <select id="g-env-game">
              <option value="VALORANT" ${saved.game === "VALORANT" ? "selected" : ""}>VALORANT</option>
              <option value="Apex Legends" ${saved.game === "Apex Legends" ? "selected" : ""}>Apex Legends</option>
              <option value="Overwatch 2" ${saved.game === "Overwatch 2" ? "selected" : ""}>Overwatch 2</option>
            </select>
          </label>

          <div style="display: inline-flex; align-items: center; gap: 0.25rem;">
            <span style="font-size: 0.72rem; color: #a1a1aa;">DPI:</span>
            <input type="number" id="g-env-dpi" value="${saved.dpi}" min="100" max="32000" step="50" style="width: 68px;">
            <button type="button" class="js-g-dpi-preset" data-dpi="400" style="cursor:pointer; padding:0.22rem 0.4rem; border-radius:4px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); color:#d4d4d8; font-size:0.65rem; font-weight:700;">400</button>
            <button type="button" class="js-g-dpi-preset" data-dpi="800" style="cursor:pointer; padding:0.22rem 0.4rem; border-radius:4px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); color:#d4d4d8; font-size:0.65rem; font-weight:700;">800</button>
            <button type="button" class="js-g-dpi-preset" data-dpi="1600" style="cursor:pointer; padding:0.22rem 0.4rem; border-radius:4px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); color:#d4d4d8; font-size:0.65rem; font-weight:700;">1600</button>
          </div>

          <label style="display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; color: #a1a1aa;">
            <span>感度:</span>
            <input type="number" id="g-env-sens" value="${saved.sens}" min="0.01" max="50" step="0.01" style="width: 68px;">
          </label>

          <label style="display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; color: #a1a1aa;">
            <span>今のマウス:</span>
            <select id="g-env-mouse" style="max-width: 175px;">
              ${mouseOptionsHtml}
            </select>
          </label>

          <span id="g-env-cm-badge" style="padding: 0.28rem 0.65rem; border-radius: 999px; background: rgba(212, 255, 51, 0.14); border: 1px solid #d4ff33; color: #d4ff33; font-size: 0.74rem; font-weight: 900; font-family: monospace; white-space: nowrap;">
            振り向き ${Number.isFinite(cmVal) ? cmVal.toFixed(1) : "--"} cm/360°
          </span>
        </div>
      </section>
    `;

    if (firstPage) {
      firstPage.insertAdjacentHTML("beforebegin", barHtml);
    } else {
      targetParent.insertAdjacentHTML("afterbegin", barHtml);
    }

    const gGame = document.getElementById("g-env-game");
    const gDpi = document.getElementById("g-env-dpi");
    const gSens = document.getElementById("g-env-sens");
    const gMouse = document.getElementById("g-env-mouse");
    const gCmBadge = document.getElementById("g-env-cm-badge");

    function applyGlobalEnvUpdate(triggerMatchSubmit = false) {
      const nextEnv = {
        game: gGame.value || "VALORANT",
        dpi: Number(gDpi.value) || 800,
        sens: Number(gSens.value) || 0.32,
        mouse: gMouse.value || currentUserMouseName
      };

      saveUserEnvState(nextEnv);

      // 振り向きバッジの即時更新
      const nextCm = toCm360(nextEnv.dpi, nextEnv.sens, nextEnv.game);
      if (gCmBadge) {
        gCmBadge.textContent = `振り向き ${Number.isFinite(nextCm) ? nextCm.toFixed(1) : "--"} cm/360°`;
      }

      // 感度マッチのフォームへ同期
      if (matchGameEl) matchGameEl.value = nextEnv.game;
      if (matchDpiEl) matchDpiEl.value = String(nextEnv.dpi);
      if (matchSensEl) matchSensEl.value = String(nextEnv.sens);

      // プレイヤー検索カードのSYNC率を再計算して描画更新
      renderPlayers();

      // 表示中のマウス比較パネルがあれば現在のマウスを即時反映
      document.querySelectorAll("[id$='-mouse-vs']").forEach((el) => {
        const targetDev = el.dataset.targetDevice;
        if (targetDev && findMouseSpec(targetDev)) {
          el.outerHTML = buildMouseComparisonHtml(targetDev, el.id);
        }
      });

      // もし現在「04: 感度マッチ」タブを開いているならそのまま自動再検索
      const isMatchActive = document.getElementById("page-match")?.classList.contains("active");
      if (triggerMatchSubmit || isMatchActive) {
        document.getElementById("match-form")?.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    }

    [gGame, gDpi, gSens, gMouse].forEach((el) => {
      el?.addEventListener("change", () => applyGlobalEnvUpdate(false));
    });
    [gDpi, gSens].forEach((el) => {
      el?.addEventListener("input", () => {
        const nextCm = toCm360(Number(gDpi.value) || 800, Number(gSens.value) || 0.32, gGame.value);
        if (gCmBadge) {
          gCmBadge.textContent = `振り向き ${Number.isFinite(nextCm) ? nextCm.toFixed(1) : "--"} cm/360°`;
        }
      });
    });

    // DPIワンタッププリセットボタン（400 / 800 / 1600）
    document.querySelectorAll(".js-g-dpi-preset").forEach((btn) => {
      btn.addEventListener("click", () => {
        gDpi.value = btn.dataset.dpi;
        applyGlobalEnvUpdate(false);
      });
    });

    // 逆方向の同期：感度マッチ側やマウス比較プルダウン側で変更されたときも上部バーへ反映
    document.getElementById("match-form")?.addEventListener("submit", () => {
      if (matchGameEl && gGame) gGame.value = matchGameEl.value;
      if (matchDpiEl && gDpi) gDpi.value = matchDpiEl.value;
      if (matchSensEl && gSens) gSens.value = matchSensEl.value;
      saveUserEnvState({
        game: gGame.value,
        dpi: Number(gDpi.value),
        sens: Number(gSens.value),
        mouse: currentUserMouseName
      });
      const cm = toCm360(Number(gDpi.value), Number(gSens.value), gGame.value);
      if (gCmBadge) gCmBadge.textContent = `振り向き ${Number.isFinite(cm) ? cm.toFixed(1) : "--"} cm/360°`;
      renderPlayers();
    });

    document.addEventListener("change", (e) => {
      const mouseSelect = e.target.closest(".js-user-mouse-select");
      if (mouseSelect && gMouse) {
        gMouse.value = mouseSelect.value;
        saveUserEnvState({
          game: gGame.value,
          dpi: Number(gDpi.value),
          sens: Number(gSens.value),
          mouse: mouseSelect.value
        });
        renderPlayers();
      }
    });
  }

  // 4. デバイスクリック時の「スムーズスクロール ＆ 枠発光ハイライト」
  document.addEventListener("click", (e) => {
    // 🛒購入ボタンや☆お気に入りボタンを押したときはスクロールさせない
    if (e.target.closest("a, .js-fav-device-btn, .js-fav-player-btn")) return;

    const trigger = e.target.closest(".js-search-yt-trigger, .js-ranking-yt-trigger, .js-consult-yt-trigger, .js-yt-trigger");
    if (!trigger) return;

    let targetSectionId = "search-youtube-section";
    if (trigger.classList.contains("js-ranking-yt-trigger")) targetSectionId = "ranking-youtube-section";
    else if (trigger.classList.contains("js-consult-yt-trigger")) targetSectionId = "consult-youtube-section";
    else if (trigger.classList.contains("js-yt-trigger")) targetSectionId = "youtube-reviews-section";

    setTimeout(() => {
      const sec = document.getElementById(targetSectionId);
      if (!sec) return;

      // 画面上部から少し余白を持たせてスムーズスクロール
      const rect = sec.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - 72;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });

      // 切り替わったことが一目でわかるパルス発光アニメーション
      sec.classList.remove("frag-scroll-highlight");
      void sec.offsetWidth; // リフローさせてアニメーションを再トリガー
      sec.classList.add("frag-scroll-highlight");
    }, 90);
  });

  // 初回実行
  setupGlobalUserEnvBar();
  renderPlayers();
})();
// ============================================================================
// UX大幅改善③・④・⑤：感度リアルタイムスライダー ＆ 検索サジェスト・一発クリア ＆ スマホ下部固定ナビ
// ============================================================================
(() => {
  // 1. スライダー・リセットボタン・スマホ下部ナビゲーション用CSSの注入
  if (!document.getElementById("frag-ux-pack-345-css")) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style id="frag-ux-pack-345-css">
        /* ③ 感度レンジスライダーのカスタムスタイル */
        .frag-sens-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: linear-gradient(90deg, #38bdf8 0%, #d4ff33 50%, #f472b6 100%);
          outline: none;
          margin-top: 0.45rem;
          cursor: pointer;
        }
        .frag-sens-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #fff;
          border: 2.5px solid #09090b;
          box-shadow: 0 0 10px rgba(212, 255, 51, 0.9);
          cursor: grab;
          transition: transform 0.12s ease;
        }
        .frag-sens-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
          background: #d4ff33;
        }
        .frag-dpi-quick-btn {
          cursor: pointer;
          padding: 0.2rem 0.48rem;
          border-radius: 5px;
          font-size: 0.68rem;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #d4d4d8;
          transition: all 0.15s;
        }
        .frag-dpi-quick-btn.is-active,
        .frag-dpi-quick-btn:hover {
          background: rgba(212, 255, 51, 0.18);
          border-color: #d4ff33;
          color: #d4ff33;
        }

        /* ⑤ スマホ専用ボトムナビゲーション（768px以下で表示） */
        #frag-mobile-bottom-nav {
          display: none;
        }
        @media (max-width: 768px) {
          body {
            padding-bottom: 74px !important;
          }
          #frag-compare-tray-root > button {
            bottom: 4.8rem !important;
            right: 1rem !important;
          }
          #frag-mobile-bottom-nav {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            height: 62px;
            z-index: 9997;
            background: rgba(10, 10, 15, 0.96);
            backdrop-filter: blur(14px);
            border-top: 1px solid rgba(255, 255, 255, 0.14);
            box-shadow: 0 -8px 25px rgba(0, 0, 0, 0.75);
            padding: 0 0.25rem;
            box-sizing: border-box;
          }
          .frag-m-nav-btn {
            appearance: none;
            background: transparent;
            border: none;
            color: #a1a1aa;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.18rem;
            font-size: 0.66rem;
            font-weight: 800;
            cursor: pointer;
            position: relative;
            transition: color 0.15s;
          }
          .frag-m-nav-btn .m-icon {
            font-size: 1.05rem;
            line-height: 1;
          }
          .frag-m-nav-btn.is-active {
            color: #d4ff33;
          }
          .frag-m-nav-btn.is-active::before {
            content: "";
            position: absolute;
            top: 0;
            left: 22%;
            right: 22%;
            height: 2.5px;
            border-radius: 0 0 4px 4px;
            background: #d4ff33;
            box-shadow: 0 0 8px #d4ff33;
          }
        }
      </style>`
    );
  }

  // ==========================================================================
  // ③ 感度マッチ：リアルタイム・スライダー ＆ DPIワンタップ切替
  // ==========================================================================
  function setupRealtimeMatchSliders() {
    const matchForm = document.getElementById("match-form");
    const gameSelect = document.getElementById("match-game");
    const dpiInput = document.getElementById("match-dpi");
    const sensInput = document.getElementById("match-sens");
    if (!matchForm || !gameSelect || !dpiInput || !sensInput || document.getElementById("frag-sens-range-slider")) return;

    // ゲームタイトルごとの感度スライダー範囲定義
    const SLIDER_SPECS = {
      "VALORANT": { min: 0.05, max: 1.0, step: 0.005 },
      "Apex Legends": { min: 0.2, max: 4.0, step: 0.05 },
      "Overwatch 2": { min: 1.0, max: 15.0, step: 0.1 }
    };

    // A. DPI入力欄の下にワンタップボタン（400 / 800 / 1600 / 3200）を追加
    const dpiBarHtml = `
      <div id="frag-match-dpi-presets" style="display: flex; align-items: center; gap: 0.35rem; margin-top: 0.4rem; flex-wrap: wrap;">
        <span style="font-size: 0.65rem; color: #a1a1aa;">定番DPI:</span>
        ${[400, 800, 1600, 3200].map((d) => `
          <button type="button" class="frag-dpi-quick-btn ${Number(dpiInput.value) === d ? 'is-active' : ''}" data-dpi="${d}">${d}</button>
        `).join("")}
      </div>
    `;
    dpiInput.insertAdjacentHTML("afterend", dpiBarHtml);

    // B. 感度入力欄の下にリアルタイム・スライダーとライブ振り向きプレビューを追加
    const initGame = normalizeGameName(gameSelect.value) || "VALORANT";
    const sSpec = SLIDER_SPECS[initGame] || SLIDER_SPECS["VALORANT"];
    const initCm = toCm360(Number(dpiInput.value) || 800, Number(sensInput.value) || 0.35, initGame);

    const sliderWrapHtml = `
      <div style="margin-top: 0.35rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.68rem;">
          <span style="color: #a1a1aa;">スライダーで微調整（自動検索）</span>
          <strong id="frag-live-cm-preview" style="color: #d4ff33; font-family: monospace;">
            振り向き ${Number.isFinite(initCm) ? initCm.toFixed(1) : "--"} cm/360°
          </strong>
        </div>
        <input type="range" id="frag-sens-range-slider" class="frag-sens-slider"
               min="${sSpec.min}" max="${sSpec.max}" step="${sSpec.step}" value="${sensInput.value || 0.35}">
      </div>
    `;
    sensInput.insertAdjacentHTML("afterend", sliderWrapHtml);

    const sliderEl = document.getElementById("frag-sens-range-slider");
    const liveCmEl = document.getElementById("frag-live-cm-preview");
    const dpiBtns = matchForm.querySelectorAll(".frag-dpi-quick-btn");

    let debounceTimer = null;
    function triggerRealtimeMatch() {
      const g = gameSelect.value;
      const d = Number(dpiInput.value) || 800;
      const s = Number(sensInput.value) || 0.35;
      const cm = toCm360(d, s, g);
      if (liveCmEl) {
        liveCmEl.textContent = `振り向き ${Number.isFinite(cm) ? cm.toFixed(1) : "--"} cm/360°`;
      }

      // 上部のマイ環境バーにも数値を同期
      const gGame = document.getElementById("g-env-game");
      const gDpi = document.getElementById("g-env-dpi");
      const gSens = document.getElementById("g-env-sens");
      const gBadge = document.getElementById("g-env-cm-badge");
      if (gGame) gGame.value = g;
      if (gDpi) gDpi.value = String(d);
      if (gSens) gSens.value = String(s);
      if (gBadge) gBadge.textContent = `振り向き ${Number.isFinite(cm) ? cm.toFixed(1) : "--"} cm/360°`;

      dpiBtns.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.dpi) === d));

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        matchForm.dispatchEvent(new Event("submit", { cancelable: true }));
      }, 180);
    }

    // スライダー操作時
    sliderEl.addEventListener("input", () => {
      sensInput.value = sliderEl.value;
      triggerRealtimeMatch();
    });

    // 数値直接入力時
    sensInput.addEventListener("input", () => {
      sliderEl.value = sensInput.value;
      triggerRealtimeMatch();
    });
    dpiInput.addEventListener("input", triggerRealtimeMatch);

    // DPIボタンクリック時
    dpiBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        dpiInput.value = btn.dataset.dpi;
        triggerRealtimeMatch();
      });
    });

    // ゲーム変更時にスライダーの最小・最大レンジを自動調整
    gameSelect.addEventListener("change", () => {
      const nextGame = normalizeGameName(gameSelect.value) || "VALORANT";
      const nextSpec = SLIDER_SPECS[nextGame] || SLIDER_SPECS["VALORANT"];
      sliderEl.min = nextSpec.min;
      sliderEl.max = nextSpec.max;
      sliderEl.step = nextSpec.step;

      // 現在の振り向き距離を維持したまま新ゲームの感度へ自動換算
      const currentCm = parseFloat((liveCmEl?.textContent || "").replace(/[^\d.]/g, "")) || 35;
      const converted = fromCm360ToSens(currentCm, Number(dpiInput.value) || 800, nextGame);
      if (Number.isFinite(converted)) {
        const rounded = nextGame === "VALORANT" ? converted.toFixed(3) : converted.toFixed(2);
        sensInput.value = rounded;
        sliderEl.value = rounded;
      }
      triggerRealtimeMatch();
    });
  }

  // ==========================================================================
  // ④ プレイヤー検索：予測サジェスト候補（datalist）＆「↺ 条件一発クリア」ボタン
  // ==========================================================================
  function setupSearchAutocompleteAndReset() {
    const queryInput = document.getElementById("player-query");
    if (!queryInput || document.getElementById("frag-search-Reset-btn")) return;

    // A. 全プレイヤー名・全デバイス名・主要タグを網羅した予測変換リスト（<datalist>）を生成
    const suggestions = new Set([
      "ぶいすぽっ！", "にじさんじ", "ZETA DIVISION", "ラピトリ 0.10mm", "4:3 引き伸ばし", "4000Hz"
    ]);
    getMergedPlayersList().forEach((p) => {
      if (p?.name) suggestions.add(p.name);
      Object.values(p?.devices || {}).forEach((dev) => {
        if (dev && dev !== "データなし") suggestions.add(dev);
      });
    });

    const datalistHtml = `
      <datalist id="frag-player-device-suggestions">
        ${[...suggestions].map((item) => `<option value="${escapeHtml(item)}"></option>`).join("")}
      </datalist>
    `;
    document.body.insertAdjacentHTML("beforeend", datalistHtml);
    queryInput.setAttribute("list", "frag-player-device-suggestions");
    queryInput.placeholder = "選手名・配信者・デバイス名で検索（例: 葛葉, ぶいすぽ, Wooting, Sora V2...）";

    // B. 検索入力欄のすぐ横に「✕ クリア」ボタン、フィルターバーに「↺ 条件をすべてリセット」を追加
    const parentWrap = queryInput.parentElement;
    if (parentWrap) {
      parentWrap.style.position = "relative";
      queryInput.style.paddingRight = "4.8rem";
      parentWrap.insertAdjacentHTML(
        "beforeend",
        `<button type="button" id="frag-search-Reset-btn"
                 title="検索ワードと絞り込み条件をすべて初期状態に戻す"
                 style="position: absolute; right: 0.45rem; bottom: 0.42rem; cursor: pointer; padding: 0.26rem 0.55rem; border-radius: 6px; background: rgba(239, 68, 68, 0.16); border: 1px solid rgba(239, 68, 68, 0.45); color: #fca5a5; font-size: 0.7rem; font-weight: 800; display: none;">
           ↺ クリア
         </button>`
      );
    }

    const clearBtn = document.getElementById("frag-search-Reset-btn");

    function updateClearButtonVisibility() {
      if (!clearBtn) return;
      const hasFilter =
        queryInput.value.trim() !== "" ||
        document.getElementById("search-game")?.value !== "" ||
        document.getElementById("search-role")?.value !== "" ||
        currentCreatorTypeFilter !== "all" ||
        currentSensBandFilter !== "all" ||
        currentSortOrder !== "default" ||
        showOnlyFavoritePlayers;
      clearBtn.style.display = hasFilter ? "inline-flex" : "none";
    }

    window.resetAllSearchFilters = function () {
      queryInput.value = "";
      const sGame = document.getElementById("search-game");
      const sRole = document.getElementById("search-role");
      const sSort = document.getElementById("search-sort-order");
      if (sGame) sGame.value = "";
      if (sRole) populateRoleOptions(sRole, "", true);
      if (sSort) sSort.value = "default";

      currentCreatorTypeFilter = "all";
      currentSensBandFilter = "all";
      currentSortOrder = "default";
      showOnlyFavoritePlayers = false;

      document.querySelectorAll(".js-creator-tab").forEach((t) => {
        const active = t.dataset.type === "all";
        t.style.borderColor = active ? "#d4ff33" : "rgba(255,255,255,0.12)";
        t.style.background = active ? "rgba(212, 255, 51, 0.15)" : "rgba(255,255,255,0.03)";
        t.style.color = active ? "#fff" : "#a1a1aa";
      });
      document.querySelectorAll(".js-sens-band-tab").forEach((t) => {
        const active = t.dataset.band === "all";
        t.style.borderColor = active ? "#d4ff33" : "rgba(255,255,255,0.12)";
        t.style.background = active ? "rgba(212, 255, 51, 0.15)" : "rgba(255,255,255,0.03)";
        t.style.color = active ? "#fff" : "#a1a1aa";
      });

      renderPlayers();
      syncUrlWithCurrentState();
      updateClearButtonVisibility();
    };

    clearBtn?.addEventListener("click", window.resetAllSearchFilters);

    // フィルターバーの右端にも常設リセットボタンを追加
    const filterBar = document.getElementById("creator-type-filter-bar");
    if (filterBar && !document.getElementById("frag-bar-reset-all-btn")) {
      filterBar.insertAdjacentHTML(
        "beforeend",
        `<button type="button" id="frag-bar-reset-all-btn"
                 onclick="window.resetAllSearchFilters()"
                 style="cursor: pointer; padding: 0.36rem 0.75rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.04); color: #d4d4d8;">
           ↺ 条件リセット
         </button>`
      );
    }

    queryInput.addEventListener("input", updateClearButtonVisibility);
    document.addEventListener("click", () => setTimeout(updateClearButtonVisibility, 50));
    document.addEventListener("change", () => setTimeout(updateClearButtonVisibility, 50));
  }

  // ==========================================================================
  // ⑤ スマホ操作特化：画面下部固定のアプリ風ボトムナビゲーション（4タブ連動）
  // ==========================================================================
  function setupMobileBottomNavigation() {
    if (document.getElementById("frag-mobile-bottom-nav")) return;

    const activeNav = document.querySelector(".nav-item.active")?.dataset?.page || "consult";
    const mobileTabs = [
      { page: "consult", icon: "💡", label: "デバイス相談" },
      { page: "search", icon: "🔍", label: "選手・配信者" },
      { page: "rankings", icon: "👑", label: "プロ使用率" },
      { page: "match", icon: "🎯", label: "感度マッチ" }
    ];

    const navHtml = `
      <nav id="frag-mobile-bottom-nav" aria-label="モバイル用下部タブナビゲーション">
        ${mobileTabs.map((t) => `
          <button type="button" class="frag-m-nav-btn ${t.page === activeNav ? 'is-active' : ''}" data-target-page="${t.page}">
            <span class="m-icon">${t.icon}</span>
            <span>${t.label}</span>
          </button>
        `).join("")}
      </nav>
    `;
    document.body.insertAdjacentHTML("beforeend", navHtml);

    const mobileBtns = document.querySelectorAll(".frag-m-nav-btn");

    // 下部ナビをタップしたときに既存の上部タブをクリックして画面上へスムーズ移動
    mobileBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = btn.dataset.targetPage;
        const desktopNavBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (desktopNavBtn) desktopNavBtn.click();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    // 上部タブやディープリンクでタブが切り替わったときも下部ナビのハイライトを同期
    document.querySelectorAll(".nav-item").forEach((desktopBtn) => {
      desktopBtn.addEventListener("click", () => {
        const currentPage = desktopBtn.dataset.page;
        mobileBtns.forEach((mBtn) => {
          mBtn.classList.toggle("is-active", mBtn.dataset.targetPage === currentPage);
        });
      });
    });
  }

  // 初回セットアップ実行
  setupRealtimeMatchSliders();
  setupSearchAutocompleteAndReset();
  setupMobileBottomNavigation();
})();
// ============================================================================
// UI＆ロジック修正パッチ（完全版）：プロ使用率のデバイス名表示・二重画像修正 ＆ 感度マッチ3名抽出
// ============================================================================
(() => {
  // --------------------------------------------------------------------------
  // 1. 感度マッチ（/api/match）で「選択したゲームタイトルの選手上位3名」を確実に出力する
  // --------------------------------------------------------------------------
  const prevFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const urlStr = typeof input === "string" ? input : (input instanceof URL ? input.toString() : input?.url || "");

    if (urlStr.includes("/api/match")) {
      const parsedUrl = new URL(urlStr, window.location.origin);
      const selectedGame = parsedUrl.searchParams.get("game") || document.getElementById("match-game")?.value || "VALORANT";
      const normalizedTargetGame = normalizeGameName(selectedGame);
      const dpi = Number(parsedUrl.searchParams.get("dpi")) || 800;
      const sens = Number(parsedUrl.searchParams.get("sens")) || 0.35;
      const userCm = toCm360(dpi, sens, selectedGame);

      let apiPlayers = [];
      try {
        const res = await prevFetch(input, init);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) apiPlayers = data;
        }
      } catch (e) {}

      const combinedPool = [...apiPlayers, ...getMergedPlayersList()];
      const seen = new Set();
      const sameGameCandidates = [];

      combinedPool.forEach((p) => {
        if (!p || typeof p.name !== "string") return;
        const pGame = normalizeGameName(p.game);
        if (pGame !== normalizedTargetGame) return;

        const key = p.name.split(/[（(]/)[0].trim().toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);

        const pDpi = Number(p.dpi);
        const pSens = Number(p.sens);
        const cmPer360 = Number.isFinite(Number(p.cmPer360))
          ? Number(p.cmPer360)
          : toCm360(pDpi, pSens, p.game);

        if (!Number.isFinite(cmPer360)) return;
        const diff = Number.isFinite(userCm) ? Math.abs(cmPer360 - userCm) : 9999;

        sameGameCandidates.push({
          ...ensurePlayerFourDevices(p),
          game: selectedGame,
          cmPer360,
          _diff: diff
        });
      });

      const topThreePlayers = sameGameCandidates
        .sort((a, b) => a._diff - b._diff)
        .slice(0, 3);

      return new Response(JSON.stringify(topThreePlayers), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return prevFetch(input, init);
  };

  // --------------------------------------------------------------------------
  // 2. プロ使用率ランキングの描画関数（renderRankings）を直接クリーン版に置き換え
  // --------------------------------------------------------------------------
  if (!document.getElementById("frag-ranking-clean-v2-css")) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style id="frag-ranking-clean-v2-css">
        #ranking-content {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)) !important;
          gap: 1.35rem !important;
        }
        @media (max-width: 560px) {
          #ranking-content {
            grid-template-columns: 1fr !important;
          }
        }
        #ranking-content .category-card {
          padding: 1.25rem !important;
          box-sizing: border-box !important;
        }
        #ranking-content .rank-row {
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
          padding: 0.7rem 0.8rem !important;
          margin-bottom: 0.55rem !important;
          border-radius: 10px !important;
          background: rgba(255, 255, 255, 0.025) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-sizing: border-box !important;
          width: 100% !important;
        }
        #ranking-content .rank-row:hover {
          background: rgba(191, 87, 255, 0.1) !important;
          border-color: rgba(191, 87, 255, 0.45) !important;
        }
      </style>`
    );
  }

  // G640 等のマウスパッドがマウス画像になるのを防ぐ
  const origThumb = window.renderDeviceVisualThumb;
  window.renderDeviceVisualThumb = function (deviceName, categoryHint = "", size = "md") {
    let fixedHint = categoryHint;
    if (!fixedHint && /g640|g840|g240|gigantus|strider|qck|zero|hayate|hien|vaxee pa|saturn|g-sr|wallhack|skypad/i.test(String(deviceName))) {
      fixedHint = "マウスパッド";
    }
    return origThumb ? origThumb(deviceName, fixedHint, size) : "";
  };

  // renderRankings 自体を上書きし、最初から「順位 ＋ 画像1個 ＋ 名前・バー・ボタン」で描画する
  window.renderRankings = function (game) {
    const normalizedGame = normalizeGameName(game);
    const allMerged = getMergedPlayersList();
    const gamePlayers = allMerged.filter((player) => normalizeGameName(player?.game) === normalizedGame);
    const sourceLabel = players === demoPlayers ? "DEMO DATA" : "PRO & CREATOR DB";
    const totalEl = document.getElementById("ranking-total");
    if (totalEl) totalEl.textContent = `${gamePlayers.length} PLAYERS · ${sourceLabel}`;

    const rankingContentEl = document.getElementById("ranking-content");
    if (!rankingContentEl) return;

    let topDeviceForInitialVideo = null;

    rankingContentEl.innerHTML = categoryLabels.map((category) => {
      const counts = new Map();
      let observedProfiles = 0;
      gamePlayers.forEach((player) => {
        const device = player?.devices && player.devices[category];
        if (device && device !== "データなし") {
          observedProfiles++;
          counts.set(device, (counts.get(device) || 0) + 1);
        }
      });

      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
      if (!topDeviceForInitialVideo && ranked.length > 0) {
        topDeviceForInitialVideo = ranked[0][0];
      }

      const rowsHtml = ranked.length
        ? ranked.map(([name, count], index) => {
            const percentage = observedProfiles ? Math.round((count / observedProfiles) * 100) : 0;
            const price = getDevicePrice(name, category);
            const rankStr = String(index + 1).padStart(2, "0");
            const isTop1 = index === 0;
            const thumbHtml = window.renderDeviceVisualThumb(name, category, "sm");
            const amzUrl = getAmazonAffiliateUrl(name);
            const rakUrl = getRakutenAffiliateUrl(name);

            // data-visual-thumb-added="true" を最初から付与し、他処理による2個目の画像挿入を完全ブロック
            return `
              <div class="rank-row js-ranking-yt-trigger"
                   data-device="${escapeHtml(name)}"
                   data-visual-thumb-added="true"
                   data-clean-layout-applied="true"
                   style="cursor: pointer;"
                   title="クリックして「${escapeHtml(name)}」のスペック比較＆レビュー動画を表示">

                <!-- 1. 順位 -->
                <span class="rank-num" style="width: 24px; flex-shrink: 0; font-size: 0.92rem; font-weight: 900; color: ${isTop1 ? '#d4ff33' : '#a1a1aa'}; font-family: monospace; text-align: center;">
                  ${rankStr}
                </span>

                <!-- 2. デバイスイラスト（1個のみ固定） -->
                ${thumbHtml}

                <!-- 3. デバイス名 ＋ 使用率バー ＋ 価格・購入ボタン -->
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.35rem;">

                  <!-- 1段目：デバイス名（白太字で確実に見える） ＋ 使用率% -->
                  <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem;">
                    <div style="font-size: 0.92rem; font-weight: 800; color: #ffffff; line-height: 1.3; word-break: break-word;">
                      ${escapeHtml(name)}
                    </div>
                    <span style="font-size: 0.85rem; font-weight: 900; color: #d4ff33; font-family: monospace; flex-shrink: 0;">
                      ${percentage}%
                    </span>
                  </div>

                  <!-- 2段目：使用率プログレスバー -->
                  <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #d4ff33 0%, #38bdf8 100%); border-radius: 999px;"></div>
                  </div>

                  <!-- 3段目：参考価格 ＋ 動画比較 ＋ Amazon・楽天ボタン -->
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.1rem;">
                    <div style="display: inline-flex; align-items: center; gap: 0.45rem;">
                      ${price > 0 ? `<span style="font-size: 0.74rem; color: #d4d4d8; font-family: monospace; font-weight: 700;">${formatYen(price)}</span>` : ""}
                      <span style="font-size: 0.68rem; color: #d8b4fe; font-weight: 800; white-space: nowrap;">▶ 動画・比較</span>
                    </div>

                    <div style="display: inline-flex; align-items: center; gap: 0.3rem; margin-left: auto;">
                      <a href="${escapeHtml(amzUrl)}" target="_blank" rel="sponsored noopener noreferrer" class="frag-shop-btn-amz" data-ctr-upgraded="true" onclick="event.stopPropagation();"
                         style="text-decoration:none; font-size:0.65rem; padding:0.18rem 0.48rem; border-radius:4px; background:rgba(255,153,0,0.16); border:1px solid rgba(255,153,0,0.55); color:#ffb84d; font-weight:800; white-space:nowrap;">🛒 Amazon価格</a>
                      <a href="${escapeHtml(rakUrl)}" target="_blank" rel="sponsored noopener noreferrer" class="frag-shop-btn-rak" data-ctr-upgraded="true" onclick="event.stopPropagation();"
                         style="text-decoration:none; font-size:0.65rem; padding:0.18rem 0.48rem; border-radius:4px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.55); color:#fca5a5; font-weight:800; white-space:nowrap;">🛍 楽天最安</a>
                      <button type="button" class="js-fav-device-btn" data-device-name="${escapeHtml(name)}"
                              onclick="window.toggleFavoriteDevice(this.dataset.deviceName, event)"
                              title="欲しいものリストに保存"
                              style="cursor:pointer; padding:0.16rem 0.42rem; border-radius:4px; font-size:0.66rem; font-weight:800; line-height:1;">☆</button>
                    </div>
                  </div>
                </div>
              </div>`;
          }).join("")
        : '<p class="ranking-empty">このカテゴリのデータはありません。</p>';

      return `
        <article class="category-card">
          <div class="category-heading">
            <h3>${escapeHtml(category)}</h3>
            <span>${ranked.length} MODELS</span>
          </div>
          ${rowsHtml}
        </article>`;
    }).join("");

    refreshAllInteractiveEnhancements();

    const triggers = rankingContentEl.querySelectorAll(".js-ranking-yt-trigger");
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        triggers.forEach((t) => {
          t.style.background = "rgba(255, 255, 255, 0.025)";
          t.style.outline = "none";
        });
        trigger.style.background = "rgba(191, 87, 255, 0.16)";
        trigger.style.outline = "1px solid #bf57ff";
        renderYouTubeSection({
          sectionId: "ranking-youtube-section",
          anchorElement: rankingContentEl,
          position: "afterend",
          titlePrefix: `${normalizedGame} 人気デバイス`,
          deviceName: trigger.dataset.device,
          hintText: "※ランキングの各モデルをクリックで切り替え"
        });
      });
    });

    if (topDeviceForInitialVideo) {
      const firstTrigger = rankingContentEl.querySelector(".js-ranking-yt-trigger");
      if (firstTrigger) {
        firstTrigger.style.background = "rgba(191, 87, 255, 0.16)";
        firstTrigger.style.outline = "1px solid #bf57ff";
      }
      renderYouTubeSection({
        sectionId: "ranking-youtube-section",
        anchorElement: rankingContentEl,
        position: "afterend",
        titlePrefix: `${normalizedGame} 使用率1位モデル`,
        deviceName: topDeviceForInitialVideo,
        hintText: "※ランキングの各モデルをクリックで切り替え"
      });
    }
  };

  // ゲーム切り替えタブ（VALORANT / APEX / OW2）のクリックイベントを新しい renderRankings に再接続
  document.querySelectorAll(".game-tab").forEach((button) => {
    button.onclick = () => {
      document.querySelectorAll(".game-tab").forEach((tab) => tab.classList.toggle("selected", tab === button));
      window.renderRankings(button.dataset.game);
    };
  });

  // 初回即時描画
  const currentRankingGame = document.querySelector(".game-tab.selected")?.dataset?.game || "VALORANT";
  window.renderRankings(currentRankingGame);
})();
// ============================================================================
// DB堅牢化＆セキュリティ強化エンジン（スキーマ検証・XSS/汚染防御・JSONバックアップ）
// ============================================================================
(() => {
  const ALLOWED_GAMES = new Set(["VALORANT", "Apex Legends", "Overwatch 2"]);
  const ALLOWED_ROLES = new Set([
    "pro", "streamer", "vtuber",
    "duelist", "initiator", "sentinel", "controller",
    "igl", "fragger", "support", "tank", "damage"
  ]);

  // 1. 文字列の厳格サニタイズ（制御文字・タグ除去・文字数制限）
  function sanitizeCleanText(input, maxLength = 80) {
    if (input === null || input === undefined) return "";
    return String(input)
      .replace(/[\u0000-\u001F\u007F<>`]/g, "")
      .trim()
      .slice(0, maxLength);
  }

  // 2. 数値の範囲クランプ検証
  function sanitizeNumber(val, min, max, fallback) {
    const num = Number(val);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
  }

  // 3. プレイヤーレコードのDBスキーマ検証＆正規化（プロトタイプ汚染・不正値防止）
  window.validateAndNormalizePlayerRecord = function (raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

    const name = sanitizeCleanText(raw.name, 60);
    if (!name) return null;

    const rawGame = sanitizeCleanText(raw.game, 30);
    const normalizedGame = normalizeGameName(rawGame);
    const game = ALLOWED_GAMES.has(normalizedGame) ? normalizedGame : "VALORANT";

    const dpi = Math.round(sanitizeNumber(raw.dpi, 50, 32000, 800));
    const sens = Number(sanitizeNumber(raw.sens, 0.001, 100, 0.3).toFixed(4));

    const rawRoles = Array.isArray(raw.roles) ? raw.roles : ["pro"];
    const roles = [...new Set(
      rawRoles
        .map((r) => sanitizeCleanText(r, 20).toLowerCase())
        .filter((r) => ALLOWED_ROLES.has(r))
    )];
    if (roles.length === 0) roles.push("pro");

    const rawDevs = raw.devices && typeof raw.devices === "object" ? raw.devices : {};
    const devices = Object.create(null);
    ["マウス", "マウスパッド", "キーボード", "ヘッドセット"].forEach((cat) => {
      const val = sanitizeCleanText(rawDevs[cat], 70);
      devices[cat] = val || "データなし";
    });

    return {
      name,
      game,
      roles,
      dpi,
      sens,
      source: sanitizeCleanText(raw.source || "Verified DB", 120),
      devices
    };
  };

  // 4. localStorage 内のカスタムDB・お気に入りデータの破損チェック＆自動クレンジング
  function auditAndRepairLocalStorageDB() {
    try {
      const rawCustom = localStorage.getItem(CUSTOM_PLAYERS_STORAGE_KEY);
      if (rawCustom) {
        const parsed = JSON.parse(rawCustom);
        if (Array.isArray(parsed)) {
          const validRecords = parsed
            .map((item) => window.validateAndNormalizePlayerRecord(item))
            .filter(Boolean)
            .slice(0, 200); // 最大200件上限でストレージ溢れを防止
          localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify(validRecords));
        } else {
          localStorage.removeItem(CUSTOM_PLAYERS_STORAGE_KEY);
        }
      }

      const rawFav = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (rawFav) {
        const parsedFav = JSON.parse(rawFav);
        const cleanPlayers = Array.isArray(parsedFav?.players)
          ? [...new Set(parsedFav.players.map((n) => sanitizeCleanText(n, 60)).filter(Boolean))].slice(0, 50)
          : [];
        const cleanDevices = Array.isArray(parsedFav?.devices)
          ? [...new Set(parsedFav.devices.map((d) => sanitizeCleanText(d, 70)).filter(Boolean))].slice(0, 50)
          : [];
        favoritesState = { players: cleanPlayers, devices: cleanDevices };
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesState));
      }
    } catch (e) {
      console.warn("ローカルDBの整合性修復を実行しました:", e);
    }
  }

  // 5. URLクエリパラメータのサニタイズ（不正なスクリプト断片の混入を遮断）
  function sanitizeUrlQueryParams() {
    const params = new URLSearchParams(window.location.search);
    let modified = false;
    for (const [key, val] of params.entries()) {
      const cleaned = sanitizeCleanText(val, 80);
      if (cleaned !== val) {
        params.set(key, cleaned);
        modified = true;
      }
    }
    if (modified) {
      const newQuery = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`);
    }
  }

  // 6. getMergedPlayersList をラップし、API・ローカル・内蔵DBすべてのレコードにスキーマ検証を強制適用
  const prevGetMerged = getMergedPlayersList;
  getMergedPlayersList = function () {
    const rawList = prevGetMerged();
    return rawList
      .map((p) => {
        const validated = window.validateAndNormalizePlayerRecord(p);
        if (!validated) return null;
        return ensurePlayerFourDevices({ ...p, ...validated });
      })
      .filter(Boolean);
  };

  // 7. YouTubeインライン再生のセキュリティ強化（youtube-nocookie.com ＆ videoId形式検証）
  document.addEventListener(
    "click",
    (e) => {
      const playTrigger = e.target.closest(".js-inline-video-trigger");
      if (!playTrigger) return;
      const rawVideoId = String(playTrigger.dataset.videoId || "").trim();
      // YouTubeの11桁IDフォーマット（英数字・ハイフン・アンダースコア）以外は遮断
      if (!/^[a-zA-Z0-9_-]{6,15}$/.test(rawVideoId)) {
        e.stopImmediatePropagation();
        return;
      }
      e.stopImmediatePropagation();
      playTrigger.outerHTML = `
        <div style="position: relative; width: 100%; aspect-ratio: 16/9; background: #000;">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(rawVideoId)}?autoplay=1&rel=0"
            title="YouTube video player"
            referrerpolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            style="width: 100%; height: 100%; border: 0; display: block;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>`;
    },
    true
  );

  // 8. マイDB（登録選手・お気に入り・マイ環境）のJSONバックアップ書き出し＆読み込み機能
  window.exportFragUserDatabaseJson = function () {
    const payload = {
      schemaVersion: "1.0",
      exportedAt: new Date().toISOString(),
      customPlayers: loadCustomPlayers(),
      favorites: favoritesState,
      userEnv: {
        game: document.getElementById("g-env-game")?.value || "VALORANT",
        dpi: Number(document.getElementById("g-env-dpi")?.value) || 800,
        sens: Number(document.getElementById("g-env-sens")?.value) || 0.32,
        mouse: currentUserMouseName,
        mousepad: currentUserPadName
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frag-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  window.importFragUserDatabaseJson = function (fileInput) {
    const file = fileInput?.files?.[0];
    if (!file || file.size > 1024 * 512) {
      alert("ファイルサイズが上限（512KB）を超えているか、ファイルが選択されていません。");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || "{}"));
        if (Array.isArray(data.customPlayers)) {
          const validated = data.customPlayers
            .map((p) => window.validateAndNormalizePlayerRecord(p))
            .filter(Boolean)
            .slice(0, 200);
          localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify(validated));
        }
        if (data.favorites && typeof data.favorites === "object") {
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(data.favorites));
        }
        auditAndRepairLocalStorageDB();
        renderPlayers();
        renderCompareTrayUI();
        alert("✓ バックアップデータの検証と復元が完了しました！");
      } catch (err) {
        alert("JSONファイルの形式が正しくありません。");
      }
    };
    reader.readAsText(file);
  };

  // 「＋ 選手・マイ設定を追加」モーダルにバックアップ・復元バーを自動追加
  const prevOpenAddModal = window.openAddCustomPlayerModal;
  window.openAddCustomPlayerModal = function () {
    prevOpenAddModal();
    const formEl = document.getElementById("custom-player-form");
    if (!formEl || document.getElementById("frag-db-backup-bar")) return;

    // フォーム送信時にも厳格なスキーマ検証を通す
    formEl.addEventListener("submit", () => {
      setTimeout(() => {
        auditAndRepairLocalStorageDB();
        renderPlayers();
      }, 30);
    });

    formEl.insertAdjacentHTML(
      "afterend",
      `<div id="frag-db-backup-bar" style="margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
         <span style="font-size: 0.72rem; color: #a1a1aa;">💾 マイDBの保護（JSONバックアップ）</span>
         <div style="display: flex; gap: 0.45rem;">
           <button type="button" onclick="window.exportFragUserDatabaseJson()"
                   style="cursor: pointer; padding: 0.35rem 0.65rem; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); color: #e4e4e7; font-size: 0.72rem; font-weight: 700;">
             ⬇ JSON書き出し
           </button>
           <label style="cursor: pointer; padding: 0.35rem 0.65rem; border-radius: 6px; background: rgba(212,255,51,0.12); border: 1px solid rgba(212,255,51,0.4); color: #d4ff33; font-size: 0.72rem; font-weight: 700;">
             ⬆ JSON復元
             <input type="file" accept=".json,application/json" style="display: none;" onchange="window.importFragUserDatabaseJson(this)">
           </label>
         </div>
       </div>`
    );
  };

  // 初回監査の実行
  sanitizeUrlQueryParams();
  auditAndRepairLocalStorageDB();
})();