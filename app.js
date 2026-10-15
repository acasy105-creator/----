const demoPlayers = [
  { name: "RAY", game: "VALORANT", roles: ["duelist"], dpi: 800, sens: 0.32, devices: { "マウス": "軽量ワイヤレス 54g", "マウスパッド": "コントロール / XL", "ヘッドセット": "開放型" } },
  { name: "MIO", game: "VALORANT", roles: ["sentinel", "controller"], dpi: 800, sens: 0.28, devices: { "マウス": "左右対称ワイヤレス 60g", "マウスパッド": "バランス / XL", "ヘッドセット": "開放型" } },
  { name: "KAI", game: "VALORANT", roles: ["initiator"], dpi: 1600, sens: 0.16, devices: { "マウス": "軽量ワイヤレス 58g", "マウスパッド": "スピード / XL", "ヘッドセット": "密閉型" } },
  { name: "NOVA", game: "VALORANT", roles: ["duelist"], dpi: 800, sens: 0.4, devices: { "マウス": "エルゴノミクス 63g", "マウスパッド": "コントロール / XL", "ヘッドセット": "密閉型" } },
  { name: "SORA", game: "VALORANT", roles: ["controller"], dpi: 400, sens: 0.7, devices: { "マウス": "軽量ワイヤレス 55g", "マウスパッド": "バランス / XL", "ヘッドセット": "開放型" } },
  { name: "KITE", game: "Apex Legends", roles: ["fragger", "support"], dpi: 800, sens: 1.2, devices: { "マウス": "軽量ワイヤレス 55g", "マウスパッド": "スピード / XL", "ヘッドセット": "密閉型" } },
  { name: "LUNA", game: "Apex Legends", roles: ["fragger"], dpi: 1600, sens: 0.55, devices: { "マウス": "左右対称ワイヤレス 59g", "マウスパッド": "バランス / XL", "ヘッドセット": "開放型" } },
  { name: "ACE", game: "Apex Legends", roles: ["igl"], dpi: 800, sens: 1.6, devices: { "マウス": "エルゴノミクス 65g", "マウスパッド": "コントロール / XL", "ヘッドセット": "密閉型" } },
  { name: "ZEN", game: "Apex Legends", roles: ["fragger"], dpi: 800, sens: 1.0, devices: { "マウス": "軽量ワイヤレス 52g", "マウスパッド": "スピード / XL", "ヘッドセット": "開放型" } },
  { name: "YUKI", game: "Overwatch 2", roles: ["damage"], dpi: 800, sens: 4.5, devices: { "マウス": "軽量ワイヤレス 57g", "マウスパッド": "バランス / XL", "ヘッドセット": "開放型" } },
  { name: "REI", game: "Overwatch 2", roles: ["support"], dpi: 1600, sens: 2.2, devices: { "マウス": "左右対称ワイヤレス 61g", "マウスパッド": "コントロール / XL", "ヘッドセット": "密閉型" } },
  { name: "SHIN", game: "Overwatch 2", roles: ["tank"], dpi: 800, sens: 5.2, devices: { "マウス": "エルゴノミクス 66g", "マウスパッド": "バランス / XL", "ヘッドセット": "開放型" } }
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
    { value: "igl", text: "オーダー" },
    { value: "fragger", text: "フラッガー" },
    { value: "support", text: "サポート" }
  ],
  ow2: [
    { value: "tank", text: "タンク" },
    { value: "damage", text: "ダメージ" },
    { value: "support", text: "サポート" }
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
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function populateRoleOptions(select, game, includeAll = false) {
  const roleSets = game ? [getGameRoles(game)] : Object.values(gameRoles);
  const roles = [...new Map(roleSets.flat().map((role) => [role.value, role])).values()];
  select.innerHTML = includeAll ? '<option value="">すべてのロール</option>' : "";
  select.insertAdjacentHTML("beforeend", roles.map((role) =>
    `<option value="${escapeHtml(role.value)}">${escapeHtml(role.text)}</option>`
  ).join(""));
}

const consultGameSelect = document.getElementById("consult-game");
const consultRoleSelect = document.getElementById("consult-role");
populateRoleOptions(consultRoleSelect, consultGameSelect.value);
consultGameSelect.addEventListener("change", () => {
  populateRoleOptions(consultRoleSelect, consultGameSelect.value);
});

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

function renderPlayers() {
  const query = document.getElementById("player-query").value.trim().toLowerCase();
  const game = document.getElementById("search-game").value;
  const role = document.getElementById("search-role").value;
  const filtered = players.filter((player) => {
    const playerName = typeof player?.name === "string" ? player.name : "";
    const normalizedGame = normalizeGameName(player?.game);
    const hasText = playerName.toLowerCase().includes(query);
    const matchesGame = !game || normalizedGame === normalizeGameName(game);
    const matchesRole = !role || (Array.isArray(player?.roles) && player.roles.includes(role));
    return hasText && matchesGame && matchesRole;
  });
  document.getElementById("search-count").textContent = `${String(filtered.length).padStart(2, "0")} PLAYERS`;
  document.getElementById("player-results").innerHTML = filtered.length ? filtered.map((player) => {
    const playerName = typeof player?.name === "string" ? player.name : "選手";
    const spec = getGameSpec(player?.game);
    const deviceEntries = Object.entries(player?.devices || {}).map(([category, device]) => `<div class="device-row"><span>${escapeHtml(category)}</span><span>${escapeHtml(device || "データなし")}</span></div>`).join("");
    const dpi = Number(player?.dpi);
    const sens = Number(player?.sens);
    const cmValue = Number.isFinite(dpi) && Number.isFinite(sens) ? toCm360(dpi, sens, player?.game) : Number.NaN;
    const playerRoleText = (Array.isArray(player?.roles) ? player.roles : []).map((item) => `<span class="tag">${escapeHtml(getGameRoles(player?.game).find((roleOption) => roleOption.value === item)?.text || item)}</span>`).join("");
    return `
      <article class="player-card">
        <div class="player-card-top"><span class="player-avatar">${escapeHtml(playerName.slice(0, 1))}</span><div><h3>${escapeHtml(playerName)}</h3><div class="player-game">${escapeHtml(spec ? spec.label : String(player?.game || ""))}</div></div></div>
        <div class="player-tags">${playerRoleText || "<span class=\"tag\">ロールなし</span>"}</div>
        <div class="device-list">${deviceEntries || '<div class="device-row"><span>デバイス</span><span>データなし</span></div>'}</div>
        <div class="player-sens">${Number.isFinite(cmValue) ? `${cmValue.toFixed(1)} cm / 360°` : "感度データなし"}</div>
        ${player?.sourceUrl ? `<a class="player-source" href="${escapeHtml(player.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(player.source || "出典")} ↗</a>` : ""}
      </article>`;
  }).join("") : '<div class="no-results">条件に一致する選手が見つかりませんでした。</div>';
}

["player-query", "search-game", "search-role"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderPlayers);
  document.getElementById(id).addEventListener("change", renderPlayers);
});

function renderRankings(game) {
  const normalizedGame = normalizeGameName(game);
  const gamePlayers = Array.isArray(players) ? players.filter((player) => normalizeGameName(player?.game) === normalizedGame) : [];
  const sourceLabel = players === demoPlayers ? "DEMO DATA" : "LIQUIPEDIA";
  document.getElementById("ranking-total").textContent = `${gamePlayers.length} PLAYERS · ${sourceLabel}`;
  document.getElementById("ranking-content").innerHTML = categoryLabels.map((category) => {
    const counts = new Map();
    let observedProfiles = 0;
    gamePlayers.forEach((player) => {
      const device = player?.devices && player.devices[category];
      if (device) {
        observedProfiles++;
        counts.set(device, (counts.get(device) || 0) + 1);
      }
    });
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
    return `<article class="category-card"><div class="category-heading"><h3>${category}</h3><span>${ranked.length} MODELS</span></div>${ranked.length ? ranked.map(([name, count], index) => {
      const percentage = observedProfiles ? Math.round(count / observedProfiles * 100) : 0;
      return `<div class="rank-row"><span class="rank-num">${String(index + 1).padStart(2, "0")}</span><div><div class="rank-name">${escapeHtml(name)}</div><div class="rank-bar-wrap"><div class="rank-bar" style="width:${percentage}%"></div></div></div><span class="rank-percent">${percentage}%</span></div>`;
    }).join("") : '<p class="ranking-empty">このカテゴリのデータはありません。</p>'}</article>`;
  }).join("");
}

document.querySelectorAll(".game-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".game-tab").forEach((tab) => tab.classList.toggle("selected", tab === button));
    renderRankings(button.dataset.game);
  });
});

document.getElementById("consult-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const game = document.getElementById("consult-game").value;
  const rank = document.getElementById("consult-rank").value;
  const role = document.getElementById("consult-role").value;
  const issue = document.getElementById("consult-issue").value.trim();
  const normalized = issue.toLowerCase();
  let recommendation;
  if (/足音|聞こえ|音|定位|sound|footstep/.test(normalized)) {
    recommendation = {
      category: "ヘッドセット・音響",
      title: "音の方向がわかりやすい環境づくり",
      detail: "まずゲーム内のHRTF・立体音響設定とOS側の空間オーディオを確認。定位の聞き分けを優先するなら開放型、環境音を遮りたいなら密閉型を試聴して選ぶのがおすすめです。",
      reason: "音の聞こえ方は装着感や耳の形でも変わるため、可能なら試着して比較しましょう。"
    };
  } else if (/ブレ|重い|疲れ|手|エイム|aim|止まら|振り|滑り/.test(normalized)) {
    recommendation = {
      category: "マウス・マウスパッド",
      title: "操作感を安定させる組み合わせ",
      detail: "軽量マウス（目安 55〜65g）とコントロール寄りのパッドを比較候補に。軽さは取り回しに役立つ一方、安定感は持ち方や腕・手首の使い方でも変わります。",
      reason: "センチネルやコントローラーなど、細かな置きエイムが多い役割では止めやすさも試す価値があります。"
    };
  } else {
    recommendation = {
      category: "プレイ環境全体",
      title: "まずは悩みの原因を切り分ける",
      detail: "現在の悩みに合わせてマウスの形状・重量、パッドの滑走特性、音響環境のどこに違和感があるかを一つずつ比較しましょう。",
      reason: "デバイス変更前にゲーム内設定や練習環境を記録すると、変化を判断しやすくなります。"
    };
  }
  const roleText = getGameRoles(game).find((roleOption) => roleOption.value === role)?.text || role;
  const roleHint = ["duelist", "fragger", "damage"].includes(role) ? "素早い視点移動と小さな修正の両立" : ["sentinel", "support", "tank"].includes(role) ? "安定したエイムと状況把握" : "細かな操作の安定性";
  const safeGameName = escapeHtml(game || "ゲーム");
  const safeRank = escapeHtml(rank || "ランクなし");
  const safeRoleText = escapeHtml(roleText || "ロール");
  const safeIssue = escapeHtml(issue || "不明");
  document.getElementById("consult-result").innerHTML = `
    <div class="consult-result-content">
      <div class="analysis-top"><span class="eyebrow"><span class="eyebrow-line"></span>YOUR GEAR INSIGHT</span><span class="analysis-score">MATCH <strong>01</strong></span></div>
      <div class="analysis-title">${escapeHtml(recommendation.category)}を見直してみましょう。</div>
      <p class="analysis-description">${safeGameName} / ${safeRank} / ${safeRoleText} のプレイ状況と「${safeIssue}」という悩みから、次の観点を提案します。</p>
      <div class="recommendation"><div class="recommendation-head"><span>01 / CATEGORY</span><span>推奨カテゴリ</span></div><h3>${escapeHtml(recommendation.title)}</h3><p>${escapeHtml(recommendation.detail)}</p></div>
      <div class="recommendation"><div class="recommendation-head"><span>02 / PLAYSTYLE</span><span>${escapeHtml(roleText)}</span></div><h3>${escapeHtml(roleHint)}を意識</h3><p>${escapeHtml(recommendation.reason)}</p></div>
      <p class="result-warning">※ ランクだけを根拠にデバイス性能を断定することはできません。購入前に持ち方・サイズ・装着感を確認してください。</p>
    </div>`;
});

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

  // 既存のYouTubeレビュー帯があれば消去
  const existingYt = document.getElementById("youtube-reviews-section");
  if (existingYt) existingYt.remove();

  // 💡 指定した選手のマウス動画を非同期で取得・描画する関数
  async function loadYoutubeReviews(playerName, mouseName) {
    let ytSection = document.getElementById("youtube-reviews-section");
    if (!ytSection) {
      resultContainer.insertAdjacentHTML(
        "afterend",
        '<section id="youtube-reviews-section" style="grid-column: 1 / -1; width: 100%; margin-top: 2rem; padding: 1.75rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; box-sizing: border-box;"></section>'
      );
      ytSection = document.getElementById("youtube-reviews-section");
    }

    if (!mouseName || mouseName === "データなし") {
      ytSection.innerHTML = `<div class="no-results" style="text-align:center; padding: 1rem;">${escapeHtml(playerName)} 選手のマウスデータがありません。</div>`;
      return;
    }

    ytSection.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <span class="eyebrow" style="color: #bf57ff;"><span class="eyebrow-line" style="background: #bf57ff;"></span>YOUTUBE REVIEWS</span>
        <h3 style="font-size: 1.1rem; margin-top: 0.4rem; color: #fff; font-weight: 700;">
          ${escapeHtml(playerName)} 選手の使用マウス 「${escapeHtml(mouseName)}」 のレビュー動画を取得中...
        </h3>
      </div>`;

    try {
      const ytUrl = new URL("/api/youtube/reviews", apiBaseUrl);
      ytUrl.searchParams.set("device", mouseName);
      const ytResponse = await fetch(ytUrl);

      if (ytResponse.ok) {
        const videos = await ytResponse.json();
        const validVideos = Array.isArray(videos) ? videos.filter((v) => v && v.videoId) : [];

        if (validVideos.length > 0) {
          ytSection.innerHTML = `
            <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span class="eyebrow" style="color: #bf57ff;"><span class="eyebrow-line" style="background: #bf57ff;"></span>YOUTUBE REVIEWS</span>
                <h3 style="font-size: 1.1rem; margin-top: 0.4rem; color: #fff; font-weight: 700;">
                  ${escapeHtml(playerName)} 選手の使用マウス 「${escapeHtml(mouseName)}」 のレビュー動画
                </h3>
              </div>
              <span style="font-size: 0.75rem; color: #a1a1aa;">※各選手の「PLAYER MOUSE」をクリックで動画切り替え</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
              ${validVideos.map((v) => `
                <a href="https://www.youtube.com/watch?v=${encodeURIComponent(v.videoId)}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; background: rgba(0,0,0,0.35); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); transition: transform 0.2s, border-color 0.2s; box-sizing: border-box;" onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='rgba(255,255,255,0.15)'" onmouseout="this.style.transform='none'; this.style.borderColor='rgba(255,255,255,0.06)'">
                  <div style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden;">
                    <img src="${escapeHtml(v.thumbnailUrl || "")}" alt="${escapeHtml(v.title || "動画タイトル")}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                  </div>
                  <div style="padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size: 0.85rem; font-weight: bold; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.75rem; color: #f4f4f5;">
                      ${escapeHtml(v.title || "動画タイトル")}
                    </div>
                    <div style="font-size: 0.75rem; color: #a1a1aa; display: flex; align-items: center; justify-content: space-between;">
                      <span>${escapeHtml(v.channelTitle || "YouTube")}</span>
                      <span style="color: #ff0000; font-weight: 500; font-size: 0.7rem;">▶ WATCH</span>
                    </div>
                  </div>
                </a>
              `).join("")}
            </div>`;
        } else {
          ytSection.innerHTML = `<div class="no-results" style="text-align:center; padding: 1rem;">「${escapeHtml(mouseName)}」のレビュー動画が見つかりませんでした。</div>`;
        }
      }
    } catch (ytError) {
      console.error("YouTube API取得エラー:", ytError);
      ytSection.innerHTML = `<div class="no-results" style="text-align:center; padding: 1rem;">動画の取得に失敗しました。</div>`;
    }
  }

  try {
    // 1. バックエンドの /api/match へリクエストを送信
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

    const userDistance = toCm360(dpi, sensitivity, game);

    // 2. 3人分の選手カードを並べる（マウス欄をクリック可能なトリガーに設定）
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
      const userDistance = Number.isFinite(toCm360(dpi, sensitivity, game)) ? toCm360(dpi, sensitivity, game) : Number.NaN;
      const playerDistance = Number.isFinite(playerCm) ? playerCm : (Number.isFinite(playerDpi) && Number.isFinite(playerSens) && playerSpec ? toCm360(playerDpi, playerSens, playerGame) : Number.NaN);
      const difference = Number.isFinite(playerDistance) && Number.isFinite(userDistance) ? Math.abs(playerDistance - userDistance) : Number.NaN;
      const percent = Number.isFinite(difference) && Number.isFinite(userDistance) && userDistance !== 0 ? (difference / userDistance) * 100 : Number.NaN;
      const matchQuality = Number.isFinite(percent) ? (percent < 5 ? "非常に近い" : percent < 15 ? "近い感度" : "参考候補") : "参考候補";
      const mouseName = typeof safeDevices["マウス"] === "string" && safeDevices["マウス"].trim() ? safeDevices["マウス"] : "データなし";
      const isFirst = index === 0;

      return `
        <article class="match-card" style="box-sizing: border-box;">
          <div class="match-card-head">
            <div>
              <span class="eyebrow"><span class="eyebrow-line"></span>YOUR SENS / ${escapeHtml(playerSpec ? playerSpec.label : (gameSpecs[game]?.label || game || "GAME"))}</span>
              <div class="match-distance">${Number.isFinite(userDistance) ? userDistance.toFixed(1) : "--"}<small>cm / 360°</small></div>
              <div class="match-delta">${Number.isFinite(difference) ? `差 ${difference.toFixed(1)} cm · ${percent.toFixed(1)}%` : "感度差を計算できません"}</div>
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
          <p class="match-explanation" style="font-size: 0.85rem; line-height:1.5;">${playerSpec ? `他のタイトルから振り向きが近いプロ選手を抽出しました。${escapeHtml(playerGame)}で ${Number.isFinite(playerDpi) && Number.isFinite(playerSens) ? `${playerDpi} DPI / ${playerSens}` : "感度情報なし"} （${Number.isFinite(playerDistance) ? `${playerDistance.toFixed(1)} cm / 360°` : "cm / 360° データなし"}）を使用しています。` : "選手の感度データが一部欠けているため参考情報を表示しています。"}</p>
          <div class="match-devices" style="margin-top: auto;">
            <div class="match-device js-yt-trigger"
                 data-player="${escapeHtml(playerName)}"
                 data-mouse="${escapeHtml(mouseName)}"
                 style="cursor: pointer; transition: all 0.2s; border: 1px solid ${isFirst ? '#bf57ff' : 'rgba(255,255,255,0.08)'}; background: ${isFirst ? 'rgba(191, 87, 255, 0.12)' : 'transparent'}; border-radius: 6px; padding: 0.5rem;"
                 title="クリックしてこのマウスのレビュー動画を表示">
              <span style="display: flex; justify-content: space-between; align-items: center;">
                PLAYER MOUSE
                <small style="color: #bf57ff; font-size: 0.65rem; font-weight: bold;">▶ 動画切替</small>
              </span>
              <strong>${escapeHtml(mouseName)}</strong>
            </div>
            <div class="match-device" style="padding: 0.5rem;">
              <span>PLAYER MOUSEPAD</span>
              <strong>${escapeHtml(typeof safeDevices["マウスパッド"] === "string" && safeDevices["マウスパッド"].trim() ? safeDevices["マウスパッド"] : "データなし")}</strong>
            </div>
          </div>
          ${safePlayer.sourceUrl ? `<a class="player-source" style="margin-top: 1rem; display: inline-block;" href="${escapeHtml(safePlayer.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(safePlayer.source || "出典")} ↗</a>` : ""}
        </article>`;
    }).join("");

    // 3. 各カードの「PLAYER MOUSE」ボックスにクリックイベントを設定
    const triggers = resultContainer.querySelectorAll(".js-yt-trigger");
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        // 全カードのハイライトを一度リセット
        triggers.forEach((t) => {
          t.style.borderColor = "rgba(255,255,255,0.08)";
          t.style.background = "transparent";
        });
        // クリックされたカードだけ紫にハイライト
        trigger.style.borderColor = "#bf57ff";
        trigger.style.background = "rgba(191, 87, 255, 0.12)";

        // 該当選手のマウス動画を読み込む
        loadYoutubeReviews(trigger.dataset.player, trigger.dataset.mouse);
      });
    });

    // 4. 初期表示として1人目の選手のマウス動画を読み込む
    await loadYoutubeReviews(matchedPlayers[0].name, matchedPlayers[0].devices["マウス"]);

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
  sourceStatus.textContent = "Liquipedia取得中";
  sourceSummary.textContent = "公式APIからデータ取得中";

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
        throw new Error("Liquipedia APIから不正なデータ形式が返されました。");
      }
      importedPlayers.push(...gamePlayers);
    }

    if (importedPlayers.length === 0) {
      sourceStatus.textContent = "該当データなし";
      sourceSummary.textContent = "API応答済み・表示データなし";
      console.warn("Liquipedia API responded successfully but no supported gear profiles were found; demo data remains visible.");
      return;
    }

    players = importedPlayers;
    sourceStatus.textContent = "LIQUIPEDIA DATA";
    sourceSummary.textContent = "Liquipedia APIデータを表示中";
    document.getElementById("search-data-hint").textContent = `${players.length} API PROFILES`;
    document.getElementById("ranking-disclaimer").innerHTML = '<strong>データ出典・範囲</strong><br>Liquipedia公式MediaWiki APIから各タイトルのCategory:Players先頭50件を取得。現役プロに限定された一覧ではなく、この範囲からの集計はプロ全体の使用率を示しません。出典: Liquipedia / CC BY-SA 3.0。';
    renderPlayers();
    const selectedRankingGame = document.querySelector(".game-tab.selected")?.dataset.game || "VALORANT";
    renderRankings(selectedRankingGame);
  } catch (error) {
    sourceStatus.textContent = "API接続失敗";
    sourceSummary.textContent = "APIエラー・デモデータを表示中";
    console.error("Liquipedia data could not be loaded; demo data remains visible.", error);
  }
}

loadLiquipediaPlayers();
