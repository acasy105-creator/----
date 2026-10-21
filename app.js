const demoPlayers = [
  { name: "RAY", game: "VALORANT", roles: ["duelist"], dpi: 800, sens: 0.32, devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Zero", "ヘッドセット": "HyperX Cloud II" } },
  { name: "MIO", game: "VALORANT", roles: ["sentinel", "controller"], dpi: 800, sens: 0.28, devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Vaxee PA", "ヘッドセット": "Logicool G PRO X" } },
  { name: "KAI", game: "VALORANT", roles: ["initiator"], dpi: 1600, sens: 0.16, devices: { "マウス": "Ninjutso Sora V2", "マウスパッド": "Artisan Ninja FX Hayate Otsu", "ヘッドセット": "Razer BlackShark V2" } },
  { name: "NOVA", game: "VALORANT", roles: ["duelist"], dpi: 800, sens: 0.4, devices: { "マウス": "ZOWIE EC2-CW", "マウスパッド": "SteelSeries QcK Heavy", "ヘッドセット": "HyperX Cloud Alpha" } },
  { name: "SORA", game: "VALORANT", roles: ["controller"], dpi: 400, sens: 0.7, devices: { "マウス": "Lamzu Atlantis", "マウスパッド": "Lethal Gaming Gear Saturn Pro", "ヘッドセット": "Logicool G PRO X 2" } },
  { name: "KITE", game: "Apex Legends", roles: ["fragger", "support"], dpi: 800, sens: 1.2, devices: { "マウス": "Finalmouse UltralightX", "マウスパッド": "Artisan Ninja FX Zero", "ヘッドセット": "SteelSeries Arctis Nova Pro" } },
  { name: "LUNA", game: "Apex Legends", roles: ["fragger"], dpi: 1600, sens: 0.55, devices: { "マウス": "Logicool G PRO X SUPERLIGHT 2", "マウスパッド": "Artisan Ninja FX Hayate Otsu", "ヘッドセット": "HyperX Cloud II" } },
  { name: "ACE", game: "Apex Legends", roles: ["igl"], dpi: 800, sens: 1.6, devices: { "マウス": "Razer DeathAdder V3 Pro", "マウスパッド": "ZOWIE G-SR-SE", "ヘッドセット": "Razer BlackShark V2 Pro" } },
  { name: "ZEN", game: "Apex Legends", roles: ["fragger"], dpi: 800, sens: 1.0, devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Wallhack SP-004", "ヘッドセット": "Logicool G PRO X" } },
  { name: "YUKI", game: "Overwatch 2", roles: ["damage"], dpi: 800, sens: 4.5, devices: { "マウス": "Logicool G PRO X SUPERLIGHT", "マウスパッド": "Artisan Ninja FX Zero", "ヘッドセット": "HyperX Cloud II" } },
  { name: "REI", game: "Overwatch 2", roles: ["support"], dpi: 1600, sens: 2.2, devices: { "マウス": "Razer Viper V3 Pro", "マウスパッド": "Vaxee PA", "ヘッドセット": "SteelSeries Arctis Nova 7" } },
  { name: "SHIN", game: "Overwatch 2", roles: ["tank"], dpi: 800, sens: 5.2, devices: { "マウス": "Logitech G PRO X SUPERLIGHT 2", "マウスパッド": "SteelSeries QcK Heavy", "ヘッドセット": "Logicool G PRO X" } }
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

// ============================================================================
// 💡 全ページ共通：YouTubeレビュー動画取得＆描画関数
// ============================================================================
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

  const headingLabel = titlePrefix ? `${escapeHtml(titlePrefix)} 「${escapeHtml(deviceName)}」 のレビュー動画` : `「${escapeHtml(deviceName)}」 のYouTubeレビュー動画`;

  ytSection.innerHTML = `
    <div style="margin-bottom: 1.25rem;">
      <span class="eyebrow" style="color: #bf57ff;"><span class="eyebrow-line" style="background: #bf57ff;"></span>YOUTUBE REVIEWS</span>
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

      if (validVideos.length > 0) {
        ytSection.innerHTML = `
          <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span class="eyebrow" style="color: #bf57ff;"><span class="eyebrow-line" style="background: #bf57ff;"></span>YOUTUBE REVIEWS</span>
              <h3 style="font-size: 1.1rem; margin-top: 0.4rem; color: #fff; font-weight: 700;">
                ${headingLabel}
              </h3>
            </div>
            ${hintText ? `<span style="font-size: 0.75rem; color: #a1a1aa;">${escapeHtml(hintText)}</span>` : ""}
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
        ytSection.innerHTML = `<div class="no-results" style="text-align:center; padding: 1rem;">「${escapeHtml(deviceName)}」のレビュー動画が見つかりませんでした。</div>`;
      }
    }
  } catch (ytError) {
    console.error("YouTube API取得エラー:", ytError);
    ytSection.innerHTML = `<div class="no-results" style="text-align:center; padding: 1rem;">動画の取得に失敗しました。</div>`;
  }
}

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

// ============================================================================
// 1. プレイヤー検索（プロ / ストリーマー / VTuber フィルター＆バッジ＆動画連携）
// ============================================================================
let currentCreatorTypeFilter = "all"; // "all" | "pro" | "streamer" | "vtuber"

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
    // 選手名だけでなく、デバイス名（「Superlight」「Artisan」など）でも検索ヒットするように強化！
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
             style="${hasValidDevice ? 'cursor: pointer; transition: background 0.2s; border-radius: 4px; padding: 0.25rem 0.4rem;' : ''}"
             ${hasValidDevice ? 'title="クリックしてこのデバイスのレビュー動画を表示"' : ''}>
          <span>${escapeHtml(category)}</span>
          <span style="display: flex; align-items: center; gap: 0.4rem;">
            ${escapeHtml(device || "データなし")}
            ${hasValidDevice ? '<small style="color: #bf57ff; font-size: 0.65rem; font-weight: bold;">▶ 動画</small>' : ''}
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
        hintText: "※各カードの「▶ 動画」をクリックで動画切り替え"
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
      hintText: "※各カードの「▶ 動画」をクリックで動画切り替え"
    });
  }
}

["player-query", "search-game", "search-role"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderPlayers);
  document.getElementById(id).addEventListener("change", renderPlayers);
});
// ============================================================================
// 2. プロ使用率（ランキングのデバイス名クリックでレビュー動画を表示）
// ============================================================================
function renderRankings(game) {
  const normalizedGame = normalizeGameName(game);
  const gamePlayers = Array.isArray(players) ? players.filter((player) => normalizeGameName(player?.game) === normalizedGame) : [];
  const sourceLabel = players === demoPlayers ? "DEMO DATA" : "LIQUIPEDIA";
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
        <div class="rank-row js-ranking-yt-trigger" data-device="${escapeHtml(name)}" style="cursor: pointer; padding: 0.35rem; border-radius: 6px; transition: background 0.2s;" title="クリックしてレビュー動画を表示">
          <span class="rank-num">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <div class="rank-name" style="display: flex; justify-content: space-between; align-items: center;">
              <span>${escapeHtml(name)}</span>
              <small style="color: #bf57ff; font-size: 0.65rem; font-weight: bold;">▶ 動画</small>
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
        hintText: "※ランキングの各モデルをクリックで動画切り替え"
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
      hintText: "※ランキングの各モデルをクリックで動画切り替え"
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
// 3. デバイス相談（悩みに合わせたプロ採用デバイスのピックアップ＆動画表示）
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
  let fallbackSearchKeyword = "Logicool G PRO X SUPERLIGHT 2";

  if (/足音|聞こえ|音|定位|sound|footstep/.test(normalized)) {
    recommendation = {
      category: "ヘッドセット・音響",
      title: "音の方向がわかりやすい環境づくり",
      detail: "まずゲーム内のHRTF・立体音響設定とOS側の空間オーディオを確認。定位の聞き分けを優先するなら開放型、環境音を遮りたいなら密閉型を試聴して選ぶのがおすすめです。",
      reason: "音の聞こえ方は装着感や耳の形でも変わるため、可能なら試着して比較しましょう。"
    };
    targetDeviceCategory = "ヘッドセット";
    fallbackSearchKeyword = "ゲーミングヘッドセット FPS";
  } else if (/滑り|止まら|パッド|摩擦/.test(normalized)) {
    recommendation = {
      category: "マウスパッド",
      title: "ストッピングと滑走バランスの最適化",
      detail: "視点が止まりにくい場合はコントロール系マウスパッド、追いエイムが引っかかる場合はスピード・バランス系マウスパッドへの変更が効果的です。",
      reason: "湿度やソールとの相性でも滑りが変わるため、プロ使用率の高い定番モデルから試すのが安全です。"
    };
    targetDeviceCategory = "マウスパッド";
    fallbackSearchKeyword = "Artisan Ninja FX Zero";
  } else if (/ブレ|重い|疲れ|手|エイム|aim|振り/.test(normalized)) {
    recommendation = {
      category: "マウス・マウスパッド",
      title: "操作感を安定させる組み合わせ",
      detail: "軽量マウス（目安 55〜65g）とコントロール寄りのパッドを比較候補に。軽さは取り回しに役立つ一方、安定感は持ち方や腕・手首の使い方でも変わります。",
      reason: "センチネルやコントローラーなど、細かな置きエイムが多い役割では止めやすさも試す価値があります。"
    };
    targetDeviceCategory = "マウス";
    fallbackSearchKeyword = "Logicool G PRO X SUPERLIGHT 2";
  } else {
    recommendation = {
      category: "プレイ環境全体",
      title: "まずは悩みの原因を切り分ける",
      detail: "現在の悩みに合わせてマウスの形状・重量、パッドの滑走特性、音響環境のどこに違和感があるかを一つずつ比較しましょう。",
      reason: "デバイス変更前にゲーム内設定や練習環境を記録すると、変化を判断しやすくなります。"
    };
    targetDeviceCategory = "マウス";
    fallbackSearchKeyword = "Razer Viper V3 Pro";
  }

  // 該当ゲーム・ロールのプロ選手が実際に使っている人気モデルを抽出して動画候補にする
  const normalizedGame = normalizeGameName(game);
  const candidatePlayers = players.filter((p) => normalizeGameName(p?.game) === normalizedGame);
  const candidateDevices = [...new Set(
    candidatePlayers
      .map((p) => p?.devices?.[targetDeviceCategory])
      .filter((d) => d && d !== "データなし" && !/軽量ワイヤレス|左右対称|エルゴノミクス|開放型|密閉型|コントロール|バランス|スピード/.test(d))
  )];

  if (candidateDevices.length === 0) {
    if (targetDeviceCategory === "マウス") candidateDevices.push("Logicool G PRO X SUPERLIGHT 2", "Razer Viper V3 Pro", "Ninjutso Sora V2");
    else if (targetDeviceCategory === "マウスパッド") candidateDevices.push("Artisan Ninja FX Zero", "Vaxee PA", "SteelSeries QcK Heavy");
    else candidateDevices.push("HyperX Cloud II", "Logicool G PRO X 2", "Razer BlackShark V2 Pro");
  }

  const topCandidateDevices = candidateDevices.slice(0, 3);

  const roleText = getGameRoles(game).find((roleOption) => roleOption.value === role)?.text || role;
  const roleHint = ["duelist", "fragger", "damage"].includes(role) ? "素早い視点移動と小さな修正の両立" : ["sentinel", "support", "tank"].includes(role) ? "安定したエイムと状況把握" : "細かな操作の安定性";
  const safeGameName = escapeHtml(game || "ゲーム");
  const safeRank = escapeHtml(rank || "ランクなし");
  const safeRoleText = escapeHtml(roleText || "ロール");
  const safeIssue = escapeHtml(issue || "不明");

  const consultResultEl = document.getElementById("consult-result");
  consultResultEl.innerHTML = `
    <div class="consult-result-content">
      <div class="analysis-top"><span class="eyebrow"><span class="eyebrow-line"></span>YOUR GEAR INSIGHT</span><span class="analysis-score">MATCH <strong>01</strong></span></div>
      <div class="analysis-title">${escapeHtml(recommendation.category)}を見直してみましょう。</div>
      <p class="analysis-description">${safeGameName} / ${safeRank} / ${safeRoleText} のプレイ状況と「${safeIssue}」という悩みから、次の観点を提案します。</p>
      <div class="recommendation"><div class="recommendation-head"><span>01 / CATEGORY</span><span>推奨カテゴリ</span></div><h3>${escapeHtml(recommendation.title)}</h3><p>${escapeHtml(recommendation.detail)}</p></div>
      <div class="recommendation"><div class="recommendation-head"><span>02 / PLAYSTYLE</span><span>${escapeHtml(roleText)}</span></div><h3>${escapeHtml(roleHint)}を意識</h3><p>${escapeHtml(recommendation.reason)}</p></div>
      <div class="recommendation">
        <div class="recommendation-head"><span>03 / PRO MODELS</span><span>プロ採用の定番モデル（クリックで動画切替）</span></div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;">
          ${topCandidateDevices.map((dev, idx) => `
            <button type="button" class="js-consult-yt-trigger" data-device="${escapeHtml(dev)}"
              style="cursor: pointer; padding: 0.5rem 0.85rem; border-radius: 6px; font-size: 0.8rem; font-weight: bold; color: #fff; border: 1px solid ${idx === 0 ? '#bf57ff' : 'rgba(255,255,255,0.15)'}; background: ${idx === 0 ? 'rgba(191, 87, 255, 0.2)' : 'rgba(255,255,255,0.04)'}; transition: all 0.2s;">
              ▶ ${escapeHtml(dev)}
            </button>
          `).join("")}
        </div>
      </div>
      <p class="result-warning">※ ランクだけを根拠にデバイス性能を断定することはできません。購入前に持ち方・サイズ・装着感を確認してください。</p>
    </div>`;

  const triggers = consultResultEl.querySelectorAll(".js-consult-yt-trigger");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      triggers.forEach((t) => {
        t.style.borderColor = "rgba(255,255,255,0.15)";
        t.style.background = "rgba(255,255,255,0.04)";
      });
      trigger.style.borderColor = "#bf57ff";
      trigger.style.background = "rgba(191, 87, 255, 0.2)";
      renderYouTubeSection({
        sectionId: "consult-youtube-section",
        anchorElement: consultResultEl,
        position: "afterend",
        titlePrefix: `提案カテゴリ（${targetDeviceCategory}）の定番モデル`,
        deviceName: trigger.dataset.device,
        hintText: "※上のモデルボタンをクリックで動画切り替え"
      });
    });
  });

  renderYouTubeSection({
    sectionId: "consult-youtube-section",
    anchorElement: consultResultEl,
    position: "afterend",
    titlePrefix: `提案カテゴリ（${targetDeviceCategory}）の定番モデル`,
    deviceName: topCandidateDevices[0] || fallbackSearchKeyword,
    hintText: "※上のモデルボタンをクリックで動画切り替え"
  });
});

// ============================================================================
// 4. 感度マッチ（プロ選手マッチング＆マウス動画切替）
// ============================================================================
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

  const existingYt = document.getElementById("youtube-reviews-section");
  if (existingYt) existingYt.remove();

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
            <span class="player-avatar">${escapeHtml(player.name.slice(0, 1))}</span>
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
          titlePrefix: `${trigger.dataset.player} 選手の使用マウス`,
          deviceName: trigger.dataset.mouse,
          hintText: "※各選手の「PLAYER MOUSE」をクリックで動画切り替え"
        });
      });
    });

    await renderYouTubeSection({
      sectionId: "youtube-reviews-section",
      anchorElement: resultContainer,
      position: "afterend",
      titlePrefix: `${matchedPlayers[0].name} 選手の使用マウス`,
      deviceName: matchedPlayers[0].devices?.["マウス"],
      hintText: "※各選手の「PLAYER MOUSE」をクリックで動画切り替え"
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