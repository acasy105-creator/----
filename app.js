// ============================================================================
// 0. 共通ユーティリティ ＆ アフィリエイト設定（Amazon / 楽天）
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
  amazonTag: "your-amazon-tag-22", // ご自身のAmazonアソシエイトID（例: "fraggear-22"）
  rakutenAffiliateId: ""           // 楽天アフィリエイトID（任意）
};

function getAmazonAffiliateUrl(deviceName) {
  const query = encodeURIComponent(deviceName);
  const tagParam = AFFILIATE_CONFIG.amazonTag ? `&tag=${encodeURIComponent(AFFILIATE_CONFIG.amazonTag)}` : "";
  return `https://www.amazon.co.jp/s?k=${query}${tagParam}`;
}

function getRakutenAffiliateUrl(deviceName) {
  const query = encodeURIComponent(deviceName);
  const searchUrl = `https://search.rakuten.co.jp/search/mall/${query}/`;
  if (AFFILIATE_CONFIG.rakutenAffiliateId) {
    return `https://hb.afl.rakuten.co.jp/hgc/${encodeURIComponent(AFFILIATE_CONFIG.rakutenAffiliateId)}/?pc=${encodeURIComponent(searchUrl)}`;
  }
  return searchUrl;
}

function createAffiliateButtonsHtml(deviceName, compact = false) {
  if (!deviceName || deviceName === "データなし") return "";
  const amzUrl = getAmazonAffiliateUrl(deviceName);
  const rakUrl = getRakutenAffiliateUrl(deviceName);
  const pad = compact ? "0.25rem 0.55rem" : "0.45rem 0.85rem";
  const fontSize = compact ? "0.68rem" : "0.78rem";

  return `
    <div style="display: inline-flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
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

// ============================================================================
// 初期データ・ゲーム仕様定義（ロール＆タイトル専用ランク）
// ============================================================================
const demoPlayers = [
  { name: "RAY", game: "VALORANT", roles: ["pro", "duelist"], dpi: 800, sens: 0.32, devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "ヘッドセット": "HyperX Cloud II" } },
  { name: "MIO", game: "VALORANT", roles: ["pro", "sentinel", "controller"], dpi: 800, sens: 0.28, devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Vaxee PA", "ヘッドセット": "Logicool G PRO X" } },
  { name: "KAI", game: "VALORANT", roles: ["pro", "initiator"], dpi: 1600, sens: 0.16, devices: { "マウス": "Ninjutso Sora V2", "マウスパッド": "Artisan Ninja FX Hayate Otsu", "ヘッドセット": "Razer BlackShark V2" } },
  { name: "NOVA", game: "VALORANT", roles: ["pro", "duelist"], dpi: 800, sens: 0.4, devices: { "マウス": "ZOWIE EC2-CW", "マウスパッド": "SteelSeries QcK Heavy", "ヘッドセット": "HyperX Cloud Alpha" } },
  { name: "SORA", game: "VALORANT", roles: ["pro", "controller"], dpi: 400, sens: 0.7, devices: { "マウス": "Lamzu Atlantis", "マウスパッド": "Lethal Gaming Gear Saturn Pro", "ヘッドセット": "Logicool G PRO X 2" } },
  { name: "KITE", game: "Apex Legends", roles: ["pro", "fragger", "support"], dpi: 800, sens: 1.2, devices: { "マウス": "Finalmouse UltralightX", "マウスパッド": "Artisan Ninja FX Zero", "ヘッドセット": "SteelSeries Arctis Nova Pro" } },
  { name: "LUNA", game: "Apex Legends", roles: ["pro", "fragger"], dpi: 1600, sens: 0.55, devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Hayate Otsu", "ヘッドセット": "HyperX Cloud II" } },
  { name: "ACE", game: "Apex Legends", roles: ["pro", "igl"], dpi: 800, sens: 1.6, devices: { "マウス": "Razer DeathAdder V3 Pro", "マウスパッド": "ZOWIE G-SR-SE", "ヘッドセット": "Razer BlackShark V2 Pro" } },
  { name: "ZEN", game: "Apex Legends", roles: ["pro", "fragger"], dpi: 800, sens: 1.0, devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Wallhack SP-004", "ヘッドセット": "Logicool G PRO X" } },
  { name: "YUKI", game: "Overwatch 2", roles: ["pro", "damage"], dpi: 800, sens: 4.5, devices: { "マウス": "Logicool G PRO X SUPERLIGHT", "マウスパッド": "Artisan Ninja FX Zero", "ヘッドセット": "HyperX Cloud II" } },
  { name: "REI", game: "Overwatch 2", roles: ["pro", "support"], dpi: 1600, sens: 2.2, devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Vaxee PA", "ヘッドセット": "SteelSeries Arctis Nova 7" } },
  { name: "SHIN", game: "Overwatch 2", roles: ["pro", "tank"], dpi: 800, sens: 5.2, devices: { "マウス": "Logitech G PRO X SUPERLIGHT 2", "マウスパッド": "SteelSeries QcK Heavy", "ヘッドセット": "Logicool G PRO X" } }
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

const categoryLabels = ["マウス", "マウスパッド", "ヘッドセット"];
const pageNames = { consult: "デバイス相談", search: "プレイヤー検索", rankings: "プロ使用率", match: "感度マッチ" };

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
const getGameRoles = (game) => {
  const spec = getGameSpec(game);
  return spec ? (gameRoles[spec.roleKey] || []) : [];
};
const getGameRanks = (game) => {
  const spec = getGameSpec(game);
  return spec ? (gameRanks[spec.roleKey] || []) : [];
};

// ============================================================================
// ② 主要ゲーミングマウス スペックデータベース ＆ VS比較エンジン
// ============================================================================
const MOUSE_SPECS_DB = {
  "Logicool G PRO X SUPERLIGHT 2": { weight: 60, shape: "左右対称", size: "125 × 63.5 × 40 mm", grip: "つかみ / かぶせ / つまみ", hz: 8000, sensor: "HERO 2" },
  "Logitech G PRO X SUPERLIGHT 2": { weight: 60, shape: "左右対称", size: "125 × 63.5 × 40 mm", grip: "つかみ / かぶせ / つまみ", hz: 8000, sensor: "HERO 2" },
  "Logicool G PRO X SUPERLIGHT": { weight: 63, shape: "左右対称", size: "125 × 63.5 × 40 mm", grip: "つかみ / かぶせ / つまみ", hz: 1000, sensor: "HERO 25K" },
  "Razer Viper V3 Pro": { weight: 54, shape: "左右対称", size: "127.1 × 63.9 × 39.9 mm", grip: "つかみ / つまみ", hz: 8000, sensor: "Focus Pro 35K" },
  "Ninjutso Sora V2": { weight: 39, shape: "左右対称（後部高め）", size: "119.2 × 61.4 × 38.8 mm", grip: "つかみ / つまみ", hz: 8000, sensor: "PAW3395" },
  "Razer DeathAdder V3 Pro": { weight: 63, shape: "エルゴノミクス（非対称）", size: "128 × 68 × 44 mm", grip: "かぶせ / つかみ", hz: 8000, sensor: "Focus Pro 30K" },
  "Finalmouse UltralightX": { weight: 35, shape: "左右対称（ハニカム）", size: "121.3 × 56.8 × 37 mm", grip: "つまみ / つかみ", hz: 8000, sensor: "PAW3395" },
  "WLmouse Beast X": { weight: 39, shape: "左右対称（マグネシウム）", size: "122 × 62 × 37 mm", grip: "つまみ / つかみ", hz: 8000, sensor: "PAW3395" },
  "ZOWIE EC2-CW": { weight: 77, shape: "エルゴノミクス（非対称）", size: "123 × 65 × 42 mm", grip: "かぶせ / つかみ", hz: 1000, sensor: "PAW3370" },
  "Vaxee XE Wireless": { weight: 76, shape: "左右対称", size: "124 × 66 × 39.5 mm", grip: "かぶせ / つかみ", hz: 4000, sensor: "PAW3395" },
  "Lamzu Atlantis": { weight: 55, shape: "左右対称（ワイドバック）", size: "123 × 66 × 38 mm", grip: "つかみ", hz: 4000, sensor: "PAW3395" },
  "Logicool G703h (定番エルゴ / 95g)": { weight: 95, shape: "エルゴノミクス（非対称）", size: "124 × 68 × 43 mm", grip: "かぶせ / つかみ", hz: 1000, sensor: "HERO 25K" },
  "Logicool G304 (定番エントリー / 99g)": { weight: 99, shape: "左右対称（小型）", size: "116.6 × 62.2 × 38.2 mm", grip: "つかみ / つまみ", hz: 1000, sensor: "HERO 12K" },
  "Razer Viper Ultimate (旧定番 / 74g)": { weight: 74, shape: "左右対称（低背）", size: "126.7 × 66.2 × 37.8 mm", grip: "つかみ / つまみ", hz: 1000, sensor: "Focus+" },
  "Logicool G502 X (多ボタン / 102g)": { weight: 102, shape: "エルゴノミクス（多ボタン）", size: "131.4 × 41.1 × 79.2 mm", grip: "かぶせ", hz: 1000, sensor: "HERO 25K" }
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
    .map((mouseKey) => `<option value="${escapeHtml(mouseKey)}" ${mouseKey === userSpec.name ? "selected" : ""}>${escapeHtml(mouseKey)} (${MOUSE_SPECS_DB[mouseKey].weight}g)</option>`)
    .join("");

  const userBarWidth = Math.min(100, Math.round((userSpec.weight / 110) * 100));
  const targetBarWidth = Math.min(100, Math.round((targetSpec.weight / 110) * 100));

  return `
    <div id="${escapeHtml(containerId)}" data-target-device="${escapeHtml(targetDeviceName)}" style="margin-bottom: 1.5rem; padding: 1.25rem 1.4rem; border-radius: 10px; background: linear-gradient(135deg, rgba(212,255,51,0.05) 0%, rgba(191,87,255,0.06) 100%); border: 1px solid rgba(255,255,255,0.12);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
        <div>
          <span class="eyebrow" style="color: #d4ff33;"><span class="eyebrow-line" style="background: #d4ff33;"></span>SPEC COMPARISON // 買い替え体感シミュレーター</span>
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
          <div style="font-size: 0.7rem; color: #a1a1aa; margin-bottom: 0.2rem;">CURRENT MOUSE（現在）</div>
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
          <div style="font-size: 0.95rem; font-weight: 800; color: #fff; margin-bottom: 0.65rem;">${escapeHtml(targetDeviceName)}</div>
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
        ${createAffiliateButtonsHtml(targetDeviceName, false)}
      </div>
    </div>`;
}

// プルダウン変更時のイベント委譲（クォート文字による構文エラーを完全防止）
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
// ④ YouTubeインライン再生プレイヤー ＆ 全ページ共通レビュー描画関数
// ============================================================================
document.addEventListener("click", (e) => {
  const playTrigger = e.target.closest(".js-inline-video-trigger");
  if (!playTrigger) return;
  const videoId = playTrigger.dataset.videoId;
  if (!videoId) return;

  // クリックされたサムネイル枠をそのままYouTube埋め込みプレイヤー(iframe)に置き換える
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
    const ytUrl = new URL("/api/youtube/reviews", apiBaseUrl);
    ytUrl.searchParams.set("device", deviceName);
    const ytResponse = await fetch(ytUrl);

    if (ytResponse.ok) {
      const videos = await ytResponse.json();
      const validVideos = Array.isArray(videos) ? videos.filter((v) => v && v.videoId) : [];
      const refreshedComparisonHtml = buildMouseComparisonHtml(deviceName, `${sectionId}-mouse-vs`);

      if (validVideos.length > 0) {
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
                <!-- 💡 サムネイルをクリックするとその場でYouTubeがインライン再生される -->
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
                       style="color: #a1a1aa; text-decoration: none; font-weight: 600; font-size: 0.7rem; transition: color 0.15s;"
                       onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#a1a1aa'">
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
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
            <div class="no-results" style="padding: 0.5rem 0;">「${escapeHtml(deviceName)}」のレビュー動画が見つかりませんでした。</div>
            ${createAffiliateButtonsHtml(deviceName, false)}
          </div>`;
      }
    }
  } catch (ytError) {
    console.error("YouTube API取得エラー:", ytError);
    ytSection.innerHTML = `${comparisonHtml}<div class="no-results" style="text-align:center; padding: 1rem;">動画の取得に失敗しました。</div>`;
  }
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
// 1. プレイヤー検索（プロ / ストリーマー / VTuber フィルター＆動画＆購入ボタン）
// ============================================================================
let currentCreatorTypeFilter = "all";

function getPlayerCreatorTypes(player) {
  const roles = Array.isArray(player?.roles) ? player.roles.map((r) => String(r).toLowerCase()) : [];
  const source = String(player?.source || "").toLowerCase();
  const types = new Set();

  if (roles.includes("vtuber") || source.includes("vtuber") || /ぶいすぽ|にじさんじ/.test(player?.name || "")) {
    types.add("vtuber");
  }
  if (roles.includes("streamer") || source.includes("streamer")) {
    types.add("streamer");
  }
  if (roles.includes("pro") || (types.size === 0)) {
    types.add("pro");
  }
  return types;
}

function setupCreatorFilterBar() {
  const resultsEl = document.getElementById("player-results");
  if (!resultsEl || document.getElementById("creator-type-filter-bar")) return;

  const filterBarHtml = `
    <div id="creator-type-filter-bar" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; align-items: center;">
      <span style="font-size: 0.75rem; color: #a1a1aa; margin-right: 0.25rem;">属性フィルター:</span>
      <button type="button" data-type="all" class="js-creator-tab" style="cursor: pointer; padding: 0.4rem 0.9rem; border-radius: 999px; font-size: 0.78rem; font-weight: bold; border: 1px solid #d4ff33; background: rgba(212, 255, 51, 0.15); color: #fff; transition: all 0.2s;">すべて</button>
      <button type="button" data-type="pro" class="js-creator-tab" style="cursor: pointer; padding: 0.4rem 0.9rem; border-radius: 999px; font-size: 0.78rem; font-weight: bold; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); color: #a1a1aa; transition: all 0.2s;">🏆 プロ選手</button>
      <button type="button" data-type="streamer" class="js-creator-tab" style="cursor: pointer; padding: 0.4rem 0.9rem; border-radius: 999px; font-size: 0.78rem; font-weight: bold; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); color: #a1a1aa; transition: all 0.2s;">🎙 ストリーマー / 配信者</button>
      <button type="button" data-type="vtuber" class="js-creator-tab" style="cursor: pointer; padding: 0.4rem 0.9rem; border-radius: 999px; font-size: 0.78rem; font-weight: bold; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); color: #a1a1aa; transition: all 0.2s;">✨ VTuber（ぶいすぽっ！・にじさんじ等）</button>
    </div>`;

  resultsEl.insertAdjacentHTML("beforebegin", filterBarHtml);

  const tabs = document.querySelectorAll(".js-creator-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      currentCreatorTypeFilter = tab.dataset.type;
      tabs.forEach((t) => {
        const active = t === tab;
        t.style.borderColor = active ? "#d4ff33" : "rgba(255,255,255,0.12)";
        t.style.background = active ? "rgba(212, 255, 51, 0.15)" : "rgba(255,255,255,0.03)";
        t.style.color = active ? "#fff" : "#a1a1aa";
      });
      renderPlayers();
    });
  });
}

function renderPlayers() {
  setupCreatorFilterBar();

  const query = document.getElementById("player-query").value.trim().toLowerCase();
  const game = document.getElementById("search-game").value;
  const role = document.getElementById("search-role").value;

  const filtered = players.filter((player) => {
    const playerName = typeof player?.name === "string" ? player.name : "";
    const normalizedGame = normalizeGameName(player?.game);
    const deviceString = Object.values(player?.devices || {}).join(" ").toLowerCase();
    const hasText = !query || playerName.toLowerCase().includes(query) || deviceString.includes(query);
    const matchesGame = !game || normalizedGame === normalizeGameName(game);
    const matchesRole = !role || (Array.isArray(player?.roles) && player.roles.includes(role));
    const creatorTypes = getPlayerCreatorTypes(player);
    const matchesCreatorType = currentCreatorTypeFilter === "all" || creatorTypes.has(currentCreatorTypeFilter);

    return hasText && matchesGame && matchesRole && matchesCreatorType;
  });

  document.getElementById("search-count").textContent = `${String(filtered.length).padStart(2, "0")} PLAYERS`;
  const resultsEl = document.getElementById("player-results");

  const typeBadgeMap = {
    vtuber: '<span class="tag" style="background: rgba(191, 87, 255, 0.2); border: 1px solid #bf57ff; color: #e9d5ff; font-weight: bold;">✨ VTuber</span>',
    streamer: '<span class="tag" style="background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #bae6fd; font-weight: bold;">🎙 STREAMER</span>',
    pro: '<span class="tag" style="background: rgba(212, 255, 51, 0.12); border: 1px solid rgba(212, 255, 51, 0.4); color: #d4ff33; font-weight: bold;">🏆 PRO</span>'
  };

  resultsEl.innerHTML = filtered.length ? filtered.map((player) => {
    const playerName = typeof player?.name === "string" ? player.name : "選手";
    const spec = getGameSpec(player?.game);
    const creatorTypes = getPlayerCreatorTypes(player);

    const creatorBadges = [...creatorTypes].map((t) => typeBadgeMap[t] || "").join("");
    const gameRoleTags = (Array.isArray(player?.roles) ? player.roles : [])
      .filter((item) => !["pro", "streamer", "vtuber"].includes(String(item).toLowerCase()))
      .map((item) => `<span class="tag">${escapeHtml(getGameRoles(player?.game).find((roleOption) => roleOption.value === item)?.text || item)}</span>`)
      .join("");

    const deviceEntries = Object.entries(player?.devices || {}).map(([category, device]) => {
      const hasValidDevice = device && device !== "データなし";
      return `
        <div class="device-row ${hasValidDevice ? 'js-search-yt-trigger' : ''}"
             data-player="${escapeHtml(playerName)}"
             data-device="${escapeHtml(device || '')}"
             style="${hasValidDevice ? 'cursor: pointer; transition: background 0.2s; border-radius: 4px; padding: 0.35rem 0.4rem;' : ''}"
             ${hasValidDevice ? 'title="クリックしてこのデバイスの比較＆レビュー動画を表示"' : ''}>
          <span>${escapeHtml(category)}</span>
          <span style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; justify-content: flex-end;">
            <strong>${escapeHtml(device || "データなし")}</strong>
            ${hasValidDevice ? '<small style="color: #bf57ff; font-size: 0.65rem; font-weight: bold;">▶ 動画・比較</small>' : ''}
            ${hasValidDevice ? `<a href="${escapeHtml(getAmazonAffiliateUrl(device))}" target="_blank" rel="sponsored noopener noreferrer" onclick="event.stopPropagation();" style="text-decoration:none; font-size:0.65rem; padding:0.1rem 0.4rem; border-radius:4px; background:rgba(255,153,0,0.18); border:1px solid rgba(255,153,0,0.5); color:#ffb84d; font-weight:bold;" title="Amazonで見る">🛒 Amazon</a>` : ''}
          </span>
        </div>`;
    }).join("");

    const dpi = Number(player?.dpi);
    const sens = Number(player?.sens);
    const cmValue = Number.isFinite(dpi) && Number.isFinite(sens) ? toCm360(dpi, sens, player?.game) : Number.NaN;

    return `
      <article class="player-card">
        <div class="player-card-top"><span class="player-avatar">${escapeHtml(playerName.slice(0, 1))}</span><div><h3>${escapeHtml(playerName)}</h3><div class="player-game">${escapeHtml(spec ? spec.label : String(player?.game || ""))}</div></div></div>
        <div class="player-tags" style="display: flex; flex-wrap: wrap; gap: 0.35rem;">${creatorBadges}${gameRoleTags || ""}</div>
        <div class="device-list">${deviceEntries || '<div class="device-row"><span>デバイス</span><span>データなし</span></div>'}</div>
        <div class="player-sens">${Number.isFinite(cmValue) ? `${dpi} DPI / 感度 ${sens} （${cmValue.toFixed(1)} cm / 360°）` : "感度データなし"}</div>
        ${player?.sourceUrl ? `<a class="player-source" href="${escapeHtml(player.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(player.source || "出典")} ↗</a>` : ""}
      </article>`;
  }).join("") : '<div class="no-results">条件に一致するプレイヤーが見つかりませんでした。</div>';

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
        hintText: "※各カードの「▶ 動画・比較」をクリックで切り替え"
      });
    });
  });

  if (filtered.length > 0 && filtered[0].devices?.["マウス"]) {
    const firstTrigger = resultsEl.querySelector(".js-search-yt-trigger");
    if (firstTrigger) {
      firstTrigger.style.background = "rgba(191, 87, 255, 0.15)";
      firstTrigger.style.outline = "1px solid #bf57ff";
    }
    renderYouTubeSection({
      sectionId: "search-youtube-section",
      anchorElement: resultsEl,
      position: "beforebegin",
      titlePrefix: `${filtered[0].name} の使用デバイス`,
      deviceName: filtered[0].devices["マウス"],
      hintText: "※各カードの「▶ 動画・比較」をクリックで切り替え"
    });
  }
}

["player-query", "search-game", "search-role"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderPlayers);
  document.getElementById(id).addEventListener("change", renderPlayers);
});

// ============================================================================
// 2. プロ使用率（ランキングクリックで比較シミュレーター＆動画＆購入リンク表示）
// ============================================================================
function renderRankings(game) {
  const normalizedGame = normalizeGameName(game);
  const gamePlayers = Array.isArray(players) ? players.filter((player) => normalizeGameName(player?.game) === normalizedGame) : [];
  const sourceLabel = players === demoPlayers ? "DEMO DATA" : "PRO & CREATOR DB";
  document.getElementById("ranking-total").textContent = `${gamePlayers.length} PLAYERS · ${sourceLabel}`;
  const rankingContentEl = document.getElementById("ranking-content");

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
      return `
        <div class="rank-row js-ranking-yt-trigger" data-device="${escapeHtml(name)}" style="cursor: pointer; padding: 0.4rem; border-radius: 6px; transition: background 0.2s;" title="クリックしてスペック比較＆レビュー動画を表示">
          <span class="rank-num">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <div class="rank-name" style="display: flex; justify-content: space-between; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span>${escapeHtml(name)}</span>
              <span style="display: inline-flex; align-items: center; gap: 0.35rem;">
                <small style="color: #bf57ff; font-size: 0.65rem; font-weight: bold;">▶ 動画・比較</small>
                <a href="${escapeHtml(getAmazonAffiliateUrl(name))}" target="_blank" rel="sponsored noopener noreferrer" onclick="event.stopPropagation();" style="text-decoration:none; font-size:0.65rem; padding:0.1rem 0.35rem; border-radius:4px; background:rgba(255,153,0,0.18); border:1px solid rgba(255,153,0,0.5); color:#ffb84d; font-weight:bold;">🛒 Amazon</a>
              </span>
            </div>
            <div class="rank-bar-wrap"><div class="rank-bar" style="width:${percentage}%"></div></div>
          </div>
          <span class="rank-percent">${percentage}%</span>
        </div>`;
    }).join("") : '<p class="ranking-empty">このカテゴリのデータはありません。</p>'}</article>`;
  }).join("");

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
// 3. デバイス相談（8種類の詳細分析バリエーション × ランク帯別アドバイス × 収益化導線）
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
    customCandidateModels = ["Artisan Ninja FX Zero", "Vaxee PA", "Lethal Gaming Gear Saturn Pro"];
  } else if (/持ち方|つかみ|つまみ|かぶせ|手首|小さい|大きい|フィット|形|エルゴ|左右対称/.test(normalized)) {
    recommendation = {
      score: "94",
      category: "マウス形状（エルゴノミクス / 左右対称）",
      title: "手のサイズとグリップスタイルに合致するシェル形状",
      detail: "『つかみ持ち・つまみ持ち』で指先の微調整を重視するなら後部コブが高めの左右対称型（Sora V2やViper V3 Pro）、『かぶせ持ち』で手のひら全体を預けて安定させたいなら非対称エルゴノミクス形状（DeathAdder V3 ProやEC2-CW）が最適です。",
      actionPoint: "グリップテープを側面に貼ることで、手汗による滑りを防ぎ、少ない握力でもマウスを確実にホールドできるようになります。"
    };
    targetDeviceCategory = "マウス";
    customCandidateModels = ["Ninjutso Sora V2", "Razer DeathAdder V3 Pro", "Razer Viper V3 Pro"];
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
      detail: "撃ち合い時のストッピングの遅れや、切り返し（レレレ撃ち）のキレに悩んでいる場合、磁気式スイッチ搭載のラピッドトリガーキーボード（Wooting 60HE+ や Apex Pro Mini 等）が圧倒的なアドバンテージをもたらします。",
      actionPoint: "アクチュエーションポイントを0.1〜0.3mm、ラピッドトリガーを0.15mm前後に設定することで、理論値レベルの素早いストッピングが可能になります。"
    };
    targetDeviceCategory = "キーボード";
    customCandidateModels = ["Wooting 60HE+", "SteelSeries Apex Pro Mini", "REALFORCE GX1"];
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
    tierAdviceDetail = `${rank}帯のハイレベルな撃ち合いでは、ポーリングレート（4000Hz/8000Hz）の低遅延性能や、手汗・湿気に左右されないサーフェス環境など、再現性と応答速度のわずかな差が勝敗に直結します。`;
  }

  const normalizedGame = normalizeGameName(game);
  const candidatePlayers = players.filter((p) => normalizeGameName(p?.game) === normalizedGame);
  let candidateDevices = customCandidateModels ? [...customCandidateModels] : [...new Set(
    candidatePlayers
      .map((p) => p?.devices?.[targetDeviceCategory])
      .filter((d) => d && d !== "データなし")
  )];

  if (candidateDevices.length === 0) {
    if (targetDeviceCategory === "マウス") candidateDevices.push("Logicool G PRO X SUPERLIGHT 2", "Razer Viper V3 Pro", "Ninjutso Sora V2");
    else if (targetDeviceCategory === "マウスパッド") candidateDevices.push("Artisan Ninja FX Zero", "Vaxee PA", "Wallhack SP-004");
    else candidateDevices.push("SHURE SE215", "HyperX Cloud II", "Razer BlackShark V2 Pro");
  }

  const topCandidateDevices = candidateDevices.slice(0, 3);
  const safeGameName = escapeHtml(game || "ゲーム");
  const safeRank = escapeHtml(rank || "ランクなし");
  const safeRoleText = escapeHtml(roleText || "ロール");
  const safeIssue = escapeHtml(issue || "全体的なエイム・環境の改善");

  const consultResultEl = document.getElementById("consult-result");
  consultResultEl.innerHTML = `
    <div class="consult-result-content">
      <div class="analysis-top">
        <span class="eyebrow"><span class="eyebrow-line"></span>YOUR GEAR INSIGHT</span>
        <span class="analysis-score">MATCH <strong>${escapeHtml(recommendation.score)}%</strong></span>
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
        <div class="recommendation-head"><span>03 / RECOMMENDED GEAR</span><span>プロ・配信者採用の推奨モデル <small style="opacity:0.75;">[PR]</small></span></div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin-top: 0.75rem;">
          ${topCandidateDevices.map((dev, idx) => `
            <div style="padding: 0.85rem; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: space-between; gap: 0.65rem;">
              <div>
                <div style="font-size: 0.7rem; color: #a1a1aa;">候補 0${idx + 1}</div>
                <div style="font-size: 0.92rem; font-weight: 700; color: #fff; margin-top: 0.15rem;">${escapeHtml(dev)}</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                <button type="button" class="js-consult-yt-trigger" data-device="${escapeHtml(dev)}"
                  style="cursor: pointer; width: 100%; padding: 0.45rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-weight: bold; color: #fff; border: 1px solid ${idx === 0 ? '#bf57ff' : 'rgba(255,255,255,0.15)'}; background: ${idx === 0 ? 'rgba(191, 87, 255, 0.22)' : 'rgba(255,255,255,0.05)'}; transition: all 0.2s;">
                  ▶ 動画・比較を見る
                </button>
                ${createAffiliateButtonsHtml(dev, true)}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
      <p class="result-warning">※ 提案モデルはプロ・ストリーマーの採用実績に基づく参考候補です。購入前にサイズ・重量・在庫状況をご確認ください。</p>
    </div>`;

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
// 4. 感度マッチ（①双方向・感度コンバーター ＆ プロ感度逆算コピー ＆ マウス比較・動画）
// ============================================================================
const fromCm360ToSens = (cm360, dpi, game) => {
  const spec = getGameSpec(game);
  if (!spec || !Number.isFinite(cm360) || !Number.isFinite(dpi) || cm360 <= 0 || dpi <= 0) {
    return Number.NaN;
  }
  return (360 * 2.54) / (dpi * cm360 * spec.yaw);
};

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
        return `<span style="font-size: 0.7rem; color: ${presetDpi === dpi ? '#d4ff33' : '#a1a1aa'};">${presetDpi}DPI: <strong>${Number.isFinite(s) ? s.toFixed(3) : '--'}</strong></span>`;
      }).join(" <span style='color:rgba(255,255,255,0.2)'>|</span> ");

      return `
        <div style="padding: 1rem 1.15rem; border-radius: 10px; background: ${isCurrentGame ? 'rgba(212, 255, 51, 0.07)' : 'rgba(0,0,0,0.35)'}; border: 1px solid ${isCurrentGame ? 'rgba(212, 255, 51, 0.45)' : 'rgba(255,255,255,0.08)'}; display: flex; flex-direction: column; justify-content: space-between; gap: 0.6rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; font-weight: 800; letter-spacing: 0.06em; color: ${isCurrentGame ? '#d4ff33' : '#a1a1aa'};">
              ${escapeHtml(targetSpec.label)} ${isCurrentGame ? '（現在）' : '換算'}
            </span>
            <span style="font-size: 0.7rem; color: #71717a;">eDPI: ${eDpi}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem;">
            <div style="font-size: 1.65rem; font-weight: 800; color: #fff; font-family: monospace;">
              ${sensFormatted}
            </div>
            <button type="button"
                    onclick="copySensValue(this, '${sensFormatted}')"
                    style="cursor: pointer; padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #e4e4e7; transition: all 0.15s;">
              📋 感度をコピー
            </button>
          </div>
          <div style="padding-top: 0.45rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-wrap: wrap; gap: 0.35rem;">
            ${dpiPresets}
          </div>
        </div>`;
    }).join("");

    resultContainer.insertAdjacentHTML(
      "beforebegin",
      `<section id="sens-converter-panel" style="grid-column: 1 / -1; width: 100%; margin-bottom: 1.75rem; padding: 1.5rem 1.75rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
          <div>
            <span class="eyebrow" style="color: #d4ff33;"><span class="eyebrow-line" style="background: #d4ff33;"></span>CROSS-GAME SENSITIVITY CONVERTER</span>
            <h3 style="font-size: 1.05rem; margin-top: 0.35rem; color: #fff; font-weight: 700;">
              あなたの振り向き（<span style="color:#d4ff33;">${userDistance.toFixed(2)} cm / 360°</span> · ${dpi} DPI）を全タイトルへ即時換算
            </h3>
          </div>
          <span style="font-size: 0.75rem; color: #a1a1aa;">※ボタンクリックでゲーム内設定用の数値をコピーできます</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
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

    resultContainer.innerHTML = matchedPlayers.map((player, index) => {
      const safePlayer = player && typeof player === "object" ? player : {};
      const playerGame = normalizeGameName(safePlayer.game || game);
      const playerSpec = getGameSpec(playerGame);
      const playerName = typeof safePlayer.name === "string" ? safePlayer.name : "選手";
      const playerRoles = Array.isArray(safePlayer.roles) ? safePlayer.roles : [];
      const safeDevices = safePlayer.devices && typeof safePlayer.devices === "object" ? safePlayer.devices : {};
      const playerCm = Number(safePlayer.cmPer360);
      const playerDpi = Number(safePlayer.dpi);
      const playerSens = Number(safePlayer.sens);
      const playerDistance = Number.isFinite(playerCm) ? playerCm : (Number.isFinite(playerDpi) && Number.isFinite(playerSens) && playerSpec ? toCm360(playerDpi, playerSens, playerGame) : Number.NaN);
      const difference = Number.isFinite(playerDistance) && Number.isFinite(userDistance) ? Math.abs(playerDistance - userDistance) : Number.NaN;
      const percent = Number.isFinite(difference) && Number.isFinite(userDistance) && userDistance !== 0 ? (difference / userDistance) * 100 : Number.NaN;
      const matchQuality = Number.isFinite(percent) ? (percent < 5 ? "非常に近い" : percent < 15 ? "近い感度" : "参考候補") : "参考候補";
      const mouseName = typeof safeDevices["マウス"] === "string" && safeDevices["マウス"].trim() ? safeDevices["マウス"] : "データなし";
      const padName = typeof safeDevices["マウスパッド"] === "string" && safeDevices["マウスパッド"].trim() ? safeDevices["マウスパッド"] : "データなし";
      const isFirst = index === 0;

      const tryProSensInUserEnv = fromCm360ToSens(playerDistance, dpi, game);
      const tryProSensFormatted = Number.isFinite(tryProSensInUserEnv) ? tryProSensInUserEnv.toFixed(3) : null;

      return `
        <article class="match-card" style="box-sizing: border-box;">
          <div class="match-card-head">
            <div>
              <span class="eyebrow"><span class="eyebrow-line"></span>PRO SENS / ${escapeHtml(playerSpec ? playerSpec.label : (playerGame || "GAME"))}</span>
              <div class="match-distance">${Number.isFinite(playerDistance) ? playerDistance.toFixed(1) : "--"}<small>cm / 360°</small></div>
              <div class="match-delta">${Number.isFinite(difference) ? `あなたとの差 ${difference.toFixed(1)} cm · ${percent.toFixed(1)}%` : "感度差を計算できません"}</div>
            </div>
            <span class="match-badge">${matchQuality}</span>
          </div>
          <div class="match-player">
            <span class="player-avatar">${escapeHtml(playerName.slice(0, 1))}</span>
            <div>
              <h2>${escapeHtml(playerName)}</h2>
              <p>${escapeHtml(playerSpec ? playerSpec.label : (playerGame || "GAME"))} · ${escapeHtml(playerRoles.join(" / ") || "プレイヤー")}</p>
            </div>
          </div>
          <p class="match-explanation" style="font-size: 0.85rem; line-height:1.5;">
            本人設定：<strong>${Number.isFinite(playerDpi) && Number.isFinite(playerSens) ? `${playerDpi} DPI / 感度 ${playerSens}` : "感度情報なし"}</strong>（振り向き ${Number.isFinite(playerDistance) ? `${playerDistance.toFixed(1)} cm` : "--"}）
          </p>

          ${tryProSensFormatted ? `
            <div style="margin: 0.5rem 0 0.85rem; padding: 0.65rem 0.75rem; border-radius: 8px; background: rgba(212, 255, 51, 0.08); border: 1px dashed rgba(212, 255, 51, 0.35); display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <div style="font-size: 0.75rem; color: #e4e4e7; line-height: 1.35;">
                🎯 <strong>${escapeHtml(playerName)}</strong> の振り向きを<br>
                あなたの <strong>${escapeHtml(userGameSpec ? userGameSpec.label : game)} (${dpi} DPI)</strong> で試すなら:
              </div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <strong style="font-size: 1.05rem; color: #d4ff33; font-family: monospace;">${tryProSensFormatted}</strong>
                <button type="button"
                        onclick="copySensValue(this, '${tryProSensFormatted}')"
                        style="cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 5px; font-size: 0.68rem; font-weight: 700; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #e4e4e7;">
                  📋 コピー
                </button>
              </div>
            </div>
          ` : ""}

          <div class="match-devices" style="margin-top: auto;">
            <div class="match-device js-yt-trigger"
                 data-player="${escapeHtml(playerName)}"
                 data-mouse="${escapeHtml(mouseName)}"
                 style="cursor: pointer; transition: all 0.2s; border: 1px solid ${isFirst ? '#bf57ff' : 'rgba(255,255,255,0.08)'}; background: ${isFirst ? 'rgba(191, 87, 255, 0.12)' : 'transparent'}; border-radius: 6px; padding: 0.55rem;"
                 title="クリックしてこのマウスの比較＆レビュー動画を表示">
              <span style="display: flex; justify-content: space-between; align-items: center;">
                PLAYER MOUSE
                <small style="color: #bf57ff; font-size: 0.65rem; font-weight: bold;">▶ 動画・比較</small>
              </span>
              <strong style="display:block; margin-bottom: 0.4rem;">${escapeHtml(mouseName)}</strong>
              ${createAffiliateButtonsHtml(mouseName, true)}
            </div>
            <div class="match-device" style="padding: 0.55rem;">
              <span>PLAYER MOUSEPAD</span>
              <strong style="display:block; margin-bottom: 0.4rem;">${escapeHtml(padName)}</strong>
              ${createAffiliateButtonsHtml(padName, true)}
            </div>
          </div>
          ${safePlayer.sourceUrl ? `<a class="player-source" style="margin-top: 1rem; display: inline-block;" href="${escapeHtml(safePlayer.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(safePlayer.source || "出典")} ↗</a>` : ""}
        </article>`;
    }).join("");

    const triggers = resultContainer.querySelectorAll(".js-yt-trigger");
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        triggers.forEach((t) => {
          t.style.borderColor = "rgba(255,255,255,0.08)";
          t.style.background = "transparent";
        });
        trigger.style.borderColor = "#bf57ff";
        trigger.style.background = "rgba(191, 87, 255, 0.12)";

        renderYouTubeSection({
          sectionId: "youtube-reviews-section",
          anchorElement: resultContainer,
          position: "afterend",
          titlePrefix: `${trigger.dataset.player} の使用マウス`,
          deviceName: trigger.dataset.mouse,
          hintText: "※各カードの「PLAYER MOUSE」をクリックで切り替え"
        });
      });
    });

    await renderYouTubeSection({
      sectionId: "youtube-reviews-section",
      anchorElement: resultContainer,
      position: "afterend",
      titlePrefix: `${matchedPlayers[0].name} の使用マウス`,
      deviceName: matchedPlayers[0].devices?.["マウス"],
      hintText: "※各カードの「PLAYER MOUSE」をクリックで切り替え"
    });

  } catch (error) {
    console.error("Match API通信エラー:", error);
    resultContainer.innerHTML = '<div class="no-results" style="grid-column: 1 / -1; width:100%; text-align:center;">サーバーとの通信に失敗しました。</div>';
  }
});

renderPlayers();
renderRankings("VALORANT");

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
    sourceStatus.textContent = "PRO & CREATOR DB";
    sourceSummary.textContent = `全 ${players.length} 名のデータを表示中`;
    document.getElementById("search-data-hint").textContent = `${players.length} PROFILES`;
    document.getElementById("ranking-disclaimer").innerHTML = '<strong>データ出典・範囲</strong><br>世界・日本のトッププロ選手および人気ストリーマー・VTuber計85名の公開デバイス・感度データを統合集計。出典: Liquipedia / ProSettings / 各配信者公開情報（CC BY-SA 3.0）。';
    renderPlayers();
    const selectedRankingGame = document.querySelector(".game-tab.selected")?.dataset.game || "VALORANT";
    renderRankings(selectedRankingGame);
  } catch (error) {
    sourceStatus.textContent = "API接続失敗";
    sourceSummary.textContent = "APIエラー・デモデータを表示中";
    console.error("Data could not be loaded; demo data remains visible.", error);
  }
}

loadLiquipediaPlayers();
// ============================================================================
// ⑤ お気に入り（比較トレイ）ローカル保存機能（LocalStorage永続化・横並び比較ドロワー）
// ============================================================================
const FAVORITES_STORAGE_KEY = "frag_saved_favorites_v1";

// 保存データ構造: { players: ["TenZ", "釈迦 (SHAKA)"], devices: ["Logicool G PRO X SUPERLIGHT 2"] }
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
  syncFavoriteButtonsState();
}

window.toggleFavoritePlayer = function (playerName, event) {
  if (event) event.stopPropagation();
  if (!playerName) return;
  const idx = favoritesState.players.indexOf(playerName);
  if (idx >= 0) {
    favoritesState.players.splice(idx, 1);
  } else {
    favoritesState.players.push(playerName);
  }
  saveFavoritesState();
  if (showOnlyFavoritePlayers) {
    renderPlayers();
  }
};

window.toggleFavoriteDevice = function (deviceName, event) {
  if (event) event.stopPropagation();
  if (!deviceName || deviceName === "データなし") return;
  const idx = favoritesState.devices.indexOf(deviceName);
  if (idx >= 0) {
    favoritesState.devices.splice(idx, 1);
  } else {
    favoritesState.devices.push(deviceName);
  }
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

// 画面上のカードやランキングに「★ 保存」ボタンを動的に注入・状態同期する関数
function syncFavoriteButtonsState() {
  // 1. プレイヤー検索の属性フィルターバーに「★ お気に入り選手のみ」ボタンを追加
  const filterBar = document.getElementById("creator-type-filter-bar");
  if (filterBar && !document.getElementById("fav-only-filter-btn")) {
    filterBar.insertAdjacentHTML(
      "beforeend",
      `<button type="button" id="fav-only-filter-btn"
         style="cursor: pointer; padding: 0.4rem 0.9rem; border-radius: 999px; font-size: 0.78rem; font-weight: bold; border: 1px solid rgba(250, 204, 21, 0.35); background: rgba(250, 204, 21, 0.08); color: #fde047; transition: all 0.2s; margin-left: auto;">
         ★ 保存済み (${favoritesState.players.length})
       </button>`
    );
    document.getElementById("fav-only-filter-btn").addEventListener("click", () => {
      showOnlyFavoritePlayers = !showOnlyFavoritePlayers;
      applyFavoritePlayerFilter();
    });
  }

  const favFilterBtn = document.getElementById("fav-only-filter-btn");
  if (favFilterBtn) {
    favFilterBtn.innerHTML = `★ 保存済み選手のみ (${favoritesState.players.length})`;
    favFilterBtn.style.background = showOnlyFavoritePlayers ? "rgba(250, 204, 21, 0.25)" : "rgba(250, 204, 21, 0.08)";
    favFilterBtn.style.borderColor = showOnlyFavoritePlayers ? "#facc15" : "rgba(250, 204, 21, 0.35)";
    favFilterBtn.style.color = showOnlyFavoritePlayers ? "#fff" : "#fde047";
  }

  // 2. 各プレイヤーカード＆感度マッチカードに「★ 選手を保存」ボタンを注入・更新
  document.querySelectorAll(".player-card, .match-card").forEach((card) => {
    const heading = card.querySelector("h3, h2");
    if (!heading) return;
    const playerName = heading.textContent.trim();
    if (!playerName) return;

    const isFav = favoritesState.players.includes(playerName);
    let favBtn = card.querySelector(".js-fav-player-btn");

    if (!favBtn) {
      const topRow = card.querySelector(".player-card-top, .match-player");
      if (topRow) {
        topRow.style.position = "relative";
        topRow.insertAdjacentHTML(
          "beforeend",
          `<button type="button" class="js-fav-player-btn"
             data-player-name="${escapeHtml(playerName)}"
             onclick="window.toggleFavoritePlayer(this.dataset.playerName, event)"
             style="margin-left: auto; cursor: pointer; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; transition: all 0.15s; white-space: nowrap;">
           </button>`
        );
        favBtn = topRow.querySelector(".js-fav-player-btn");
      }
    }

    if (favBtn) {
      favBtn.dataset.playerName = playerName;
      favBtn.innerHTML = isFav ? "★ 保存中" : "☆ 比較に保存";
      favBtn.style.border = isFav ? "1px solid #facc15" : "1px solid rgba(255,255,255,0.16)";
      favBtn.style.background = isFav ? "rgba(250, 204, 21, 0.2)" : "rgba(255,255,255,0.04)";
      favBtn.style.color = isFav ? "#fde047" : "#a1a1aa";
    }
  });

  // 3. デバイス行・ランキング行・相談結果に「★ デバイス保存」ミニボタンを注入・更新
  document.querySelectorAll("[data-device]").forEach((row) => {
    const deviceName = row.dataset.device;
    if (!deviceName || deviceName === "データなし") return;

    const isFav = favoritesState.devices.includes(deviceName);
    let devFavBtn = row.querySelector(".js-fav-device-btn");

    if (!devFavBtn) {
      // デバイス相談のボタン自身の場合は親カード内に追加
      if (row.tagName === "BUTTON") {
        const parent = row.parentElement;
        if (parent && !parent.querySelector(".js-fav-device-btn")) {
          parent.insertAdjacentHTML(
            "beforeend",
            `<button type="button" class="js-fav-device-btn"
               data-device-name="${escapeHtml(deviceName)}"
               onclick="window.toggleFavoriteDevice(this.dataset.deviceName, event)"
               style="cursor: pointer; width: 100%; padding: 0.35rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700; transition: all 0.15s;">
             </button>`
          );
          devFavBtn = parent.querySelector(".js-fav-device-btn");
        }
      } else {
        const targetSpan = row.querySelector(".rank-name > span:last-child") || row.querySelector("span:last-child");
        if (targetSpan) {
          targetSpan.insertAdjacentHTML(
            "beforeend",
            `<button type="button" class="js-fav-device-btn"
               data-device-name="${escapeHtml(deviceName)}"
               onclick="window.toggleFavoriteDevice(this.dataset.deviceName, event)"
               title="このデバイスをお気に入り比較トレイに保存"
               style="cursor: pointer; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.65rem; font-weight: 800; transition: all 0.15s;">
             </button>`
          );
          devFavBtn = targetSpan.querySelector(".js-fav-device-btn");
        }
      }
    } else if (row.tagName === "BUTTON" && row.parentElement) {
      devFavBtn = row.parentElement.querySelector(".js-fav-device-btn");
    }

    if (devFavBtn) {
      devFavBtn.dataset.deviceName = deviceName;
      devFavBtn.innerHTML = row.tagName === "BUTTON"
        ? (isFav ? "★ 欲しいものリスト保存中" : "☆ 欲しいものリストに保存")
        : (isFav ? "★" : "☆");
      devFavBtn.style.border = isFav ? "1px solid #facc15" : "1px solid rgba(255,255,255,0.18)";
      devFavBtn.style.background = isFav ? "rgba(250, 204, 21, 0.22)" : "rgba(255,255,255,0.05)";
      devFavBtn.style.color = isFav ? "#fde047" : "#d4d4d8";
    }
  });
}

function applyFavoritePlayerFilter() {
  const resultsEl = document.getElementById("player-results");
  if (!resultsEl) return;
  const cards = resultsEl.querySelectorAll(".player-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const nameEl = card.querySelector("h3");
    const name = nameEl ? nameEl.textContent.trim() : "";
    const shouldShow = !showOnlyFavoritePlayers || favoritesState.players.includes(name);
    card.style.display = shouldShow ? "" : "none";
    if (shouldShow) visibleCount++;
  });

  const countEl = document.getElementById("search-count");
  if (countEl) {
    countEl.textContent = `${String(visibleCount).padStart(2, "0")} PLAYERS`;
  }
  syncFavoriteButtonsState();
}

// 画面右下のフローティングバッジ ＆ 横並び比較ドロワーの描画
function renderCompareTrayUI() {
  let root = document.getElementById("frag-compare-tray-root");
  if (!root) {
    document.body.insertAdjacentHTML("beforeend", `<div id="frag-compare-tray-root"></div>`);
    root = document.getElementById("frag-compare-tray-root");
  }

  const totalCount = favoritesState.players.length + favoritesState.devices.length;

  // 保存されたプレイヤーの詳細オブジェクトを取得
  const savedPlayerObjects = favoritesState.players.map((name) =>
    players.find((p) => p?.name === name) || { name, game: "-", dpi: null, sens: null, devices: {} }
  );

  const playerComparisonCardsHtml = savedPlayerObjects.length > 0
    ? savedPlayerObjects.map((p) => {
        const dpi = Number(p?.dpi);
        const sens = Number(p?.sens);
        const cm = Number.isFinite(dpi) && Number.isFinite(sens) ? toCm360(dpi, sens, p?.game) : Number.NaN;
        const mouse = p?.devices?.["マウス"] || "データなし";
        const pad = p?.devices?.["マウスパッド"] || "データなし";
        const headset = p?.devices?.["ヘッドセット"] || "データなし";

        return `
          <div style="min-width: 240px; max-width: 280px; flex: 0 0 auto; padding: 1rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: space-between; gap: 0.65rem;">
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
              <div style="margin-top: 0.5rem; padding: 0.45rem 0.6rem; border-radius: 6px; background: rgba(212,255,51,0.08); border: 1px solid rgba(212,255,51,0.25); font-size: 0.78rem; color: #fff;">
                振り向き: <strong style="color:#d4ff33; font-size:0.9rem;">${Number.isFinite(cm) ? `${cm.toFixed(1)} cm` : "--"}</strong>
                <div style="font-size: 0.7rem; color: #a1a1aa; margin-top: 0.1rem;">${Number.isFinite(dpi) && Number.isFinite(sens) ? `${dpi} DPI / 感度 ${sens}` : "感度情報なし"}</div>
              </div>
              <div style="margin-top: 0.6rem; font-size: 0.75rem; color: #d4d4d8; display: grid; gap: 0.3rem;">
                <div>🖱 マウス: <strong style="color:#fff;">${escapeHtml(mouse)}</strong></div>
                <div>⬛ パッド: <strong style="color:#fff;">${escapeHtml(pad)}</strong></div>
                <div>🎧 音響: <strong style="color:#fff;">${escapeHtml(headset)}</strong></div>
              </div>
            </div>
            ${mouse !== "データなし" ? `<div style="padding-top: 0.45rem; border-top: 1px solid rgba(255,255,255,0.06);">${createAffiliateButtonsHtml(mouse, true)}</div>` : ""}
          </div>`;
      }).join("")
    : `<div style="font-size: 0.8rem; color: #a1a1aa; padding: 0.75rem 0;">まだ選手が保存されていません。各カードの「☆ 比較に保存」を押すとここで横並び比較できます。</div>`;

  const savedDeviceCardsHtml = favoritesState.devices.length > 0
    ? favoritesState.devices.map((devName) => {
        const spec = findMouseSpec(devName);
        const usersCount = players.filter((p) => Object.values(p?.devices || {}).includes(devName)).length;
        return `
          <div style="min-width: 230px; max-width: 270px; flex: 0 0 auto; padding: 0.9rem 1rem; border-radius: 10px; background: rgba(191,87,255,0.08); border: 1px solid rgba(191,87,255,0.35); display: flex; flex-direction: column; justify-content: space-between; gap: 0.6rem;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                <div style="font-size: 0.9rem; font-weight: 800; color: #fff; line-height: 1.35;">${escapeHtml(devName)}</div>
                <button type="button" data-device-name="${escapeHtml(devName)}"
                        onclick="window.toggleFavoriteDevice(this.dataset.deviceName, event)"
                        style="cursor: pointer; background: transparent; border: none; color: #a1a1aa; font-size: 0.85rem; padding: 0.1rem 0.3rem;"
                        title="トレイから外す">✕</button>
              </div>
              <div style="font-size: 0.74rem; color: #e9d5ff; margin-top: 0.35rem;">
                プロ・配信者採用数: <strong>${usersCount} 名</strong>
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

  root.innerHTML = `
    <!-- 右下フローティング起動ボタン -->
    <button type="button"
            onclick="window.toggleCompareTrayDrawer()"
            style="position: fixed; right: 1.5rem; bottom: 1.5rem; z-index: 9998; cursor: pointer; padding: 0.75rem 1.2rem; border-radius: 999px; background: ${totalCount > 0 ? 'linear-gradient(135deg, #d4ff33 0%, #a3e635 100%)' : 'rgba(24, 24, 27, 0.95)'}; color: ${totalCount > 0 ? '#09090b' : '#e4e4e7'}; border: 1px solid ${totalCount > 0 ? '#d4ff33' : 'rgba(255,255,255,0.2)'}; font-weight: 800; font-size: 0.85rem; box-shadow: 0 10px 25px rgba(0,0,0,0.65); display: flex; align-items: center; gap: 0.5rem; transition: transform 0.2s;">
      <span>★ お気に入り・比較トレイ</span>
      <span style="padding: 0.15rem 0.55rem; border-radius: 999px; background: ${totalCount > 0 ? '#09090b' : 'rgba(255,255,255,0.12)'}; color: ${totalCount > 0 ? '#d4ff33' : '#a1a1aa'}; font-size: 0.75rem;">
        ${totalCount}
      </span>
    </button>

    <!-- 下部スライドアップ比較ドロワー -->
    ${isCompareTrayOpen ? `
      <div style="position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999; max-height: 75vh; overflow-y: auto; background: rgba(12, 12, 16, 0.98); border-top: 2px solid #d4ff33; box-shadow: 0 -12px 40px rgba(0,0,0,0.85); padding: 1.5rem 2rem; backdrop-filter: blur(12px); box-sizing: border-box;">
        <div style="max-width: 1280px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div>
              <span class="eyebrow" style="color: #d4ff33;"><span class="eyebrow-line" style="background: #d4ff33;"></span>FAVORITES &amp; COMPARISON TRAY // ローカル自動保存</span>
              <h3 style="margin: 0.25rem 0 0; font-size: 1.1rem; color: #fff; font-weight: 800;">
                ピン留めしたプレイヤー（${favoritesState.players.length}名）＆ 欲しいデバイス（${favoritesState.devices.length}点）の横並び比較
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
              👤 保存したプレイヤーの感度・使用ギア比較（横スクロール）
            </div>
            <div style="display: flex; gap: 0.9rem; overflow-x: auto; padding-bottom: 0.5rem;">
              ${playerComparisonCardsHtml}
            </div>
          </div>

          <div>
            <div style="font-size: 0.78rem; font-weight: 700; color: #e9d5ff; margin-bottom: 0.6rem;">
              🛒 欲しいものリスト（保存したデバイス・スペック＆購入リンク）
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

// 画面内のカード描画やタブ切り替えを自動検知して「☆保存」ボタンを常時付与するObserver
const favMutationObserver = new MutationObserver(() => {
  syncFavoriteButtonsState();
});

favMutationObserver.observe(document.body, {
  childList: true,
  subtree: true
});

// 初回起動
renderCompareTrayUI();
syncFavoriteButtonsState();