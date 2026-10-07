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
    { value: "controller", text: "スモーク（コントローラー）" }
  ],
  apex: [
    { value: "igl", text: "IGL（オーダー）" },
    { value: "fragger", text: "フラッガー" },
    { value: "support", text: "サポート" }
  ],
  ow2: [
    { value: "tank", text: "タンク" },
    { value: "damage", text: "ダメージ（DPS）" },
    { value: "support", text: "サポート" }
  ]
};
const categoryLabels = ["マウス", "マウスパッド", "ヘッドセット"];
const pageNames = { consult: "デバイス相談", search: "プレイヤー検索", rankings: "プロ使用率", match: "感度マッチ" };
const toCm360 = (dpi, sensitivity, game) => 360 * 2.54 / (dpi * sensitivity * gameSpecs[game].yaw);
const getGameRoles = (game) => gameRoles[gameSpecs[game].roleKey];
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
  const filtered = players.filter((player) =>
    player.name.toLowerCase().includes(query) &&
    (!game || player.game === game) &&
    (!role || player.roles.includes(role))
  );
  document.getElementById("search-count").textContent = `${String(filtered.length).padStart(2, "0")} PLAYERS`;
  document.getElementById("player-results").innerHTML = filtered.length ? filtered.map((player) => `
    <article class="player-card">
      <div class="player-card-top"><span class="player-avatar">${escapeHtml(player.name.slice(0, 1))}</span><div><h3>${escapeHtml(player.name)}</h3><div class="player-game">${escapeHtml(gameSpecs[player.game].label)}</div></div></div>
      <div class="player-tags">${player.roles.map((item) => `<span class="tag">${escapeHtml(getGameRoles(player.game).find((roleOption) => roleOption.value === item)?.text || item)}</span>`).join("")}</div>
      <div class="device-list">${Object.entries(player.devices).map(([category, device]) => `<div class="device-row"><span>${escapeHtml(category)}</span><span>${escapeHtml(device)}</span></div>`).join("")}</div>
      <div class="player-sens">${Number.isFinite(player.dpi) && Number.isFinite(player.sens) ? `${toCm360(player.dpi, player.sens, player.game).toFixed(1)} cm / 360°` : "感度データなし"}</div>
      ${player.sourceUrl ? `<a class="player-source" href="${escapeHtml(player.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(player.source)} ↗</a>` : ""}
    </article>`).join("") : '<div class="no-results">条件に一致する選手が見つかりませんでした。</div>';
}

["player-query", "search-game", "search-role"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderPlayers);
  document.getElementById(id).addEventListener("change", renderPlayers);
});

function renderRankings(game) {
  const gamePlayers = players.filter((player) => player.game === game);
  document.getElementById("ranking-total").textContent = `${gamePlayers.length} PLAYERS · ${players === demoPlayers ? "DEMO DATA" : "LIQUIPEDIA"}`;
  document.getElementById("ranking-content").innerHTML = categoryLabels.map((category) => {
    const counts = new Map();
    let observedProfiles = 0;
    gamePlayers.forEach((player) => {
      if (player.devices[category]) {
        observedProfiles++;
        counts.set(player.devices[category], (counts.get(player.devices[category]) || 0) + 1);
      }
    });
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
    return `<article class="category-card"><div class="category-heading"><h3>${category}</h3><span>${ranked.length} MODELS</span></div>${ranked.length ? ranked.map(([name, count], index) => {
      const percentage = Math.round(count / observedProfiles * 100);
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
  document.getElementById("consult-result").innerHTML = `
    <div class="consult-result-content">
      <div class="analysis-top"><span class="eyebrow"><span class="eyebrow-line"></span>YOUR GEAR INSIGHT</span><span class="analysis-score">MATCH <strong>01</strong></span></div>
      <div class="analysis-title">${escapeHtml(recommendation.category)}を見直してみましょう。</div>
      <p class="analysis-description">${escapeHtml(game)} / ${escapeHtml(rank)} / ${escapeHtml(roleText)} のプレイ状況と「${escapeHtml(issue)}」という悩みから、次の観点を提案します。</p>
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

  // APIのベースURLを取得
  const apiBaseUrl = document.querySelector('meta[name="frag-api-base-url"]').content;
  
  // 通信中のローディング表示
  document.getElementById("match-result").innerHTML = '<div class="no-results">APIからマッチする選手を検索中...</div>';

  try {
    // 1. バックエンドの /api/match へリクエストを送信
    const url = new URL("/api/match", apiBaseUrl);
    url.searchParams.set("game", game);
    url.searchParams.set("dpi", dpi);
    url.searchParams.set("sens", sensitivity);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`APIエラー: ${response.status}`);
    }

    // 2. サーバーから送られてきた3人分のJSONデータを受け取る
    const matchedPlayers = await response.json();

    if (matchedPlayers.length === 0) {
      document.getElementById("match-result").innerHTML = '<div class="no-results">比較可能な選手が見つかりませんでした。</div>';
      return;
    }

    // ユーザー自身の振り向き値（画面表示用）
    const userDistance = toCm360(dpi, sensitivity, game);

    // 3. 受け取った3人分のデータを画面にカードとして並べる
    document.getElementById("match-result").innerHTML = matchedPlayers.map((player) => {
      const difference = Math.abs(player.cmPer360 - userDistance);
      const percent = difference / userDistance * 100;
      const matchQuality = percent < 5 ? "非常に近い" : percent < 15 ? "近い感度" : "参考候補";

      return `
        <article class="match-card" style="margin-bottom: 1.5rem;">
          <div class="match-card-head">
            <div>
              <span class="eyebrow"><span class="eyebrow-line"></span>YOUR SENS / ${escapeHtml(gameSpecs[game].label)}</span>
              <div class="match-distance">${userDistance.toFixed(1)}<small>cm / 360°</small></div>
              <div class="match-delta">差 ${difference.toFixed(1)} cm · ${percent.toFixed(1)}%</div>
            </div>
            <span class="match-badge">${matchQuality}</span>
          </div>
          <div class="match-player">
            <span class="player-avatar">${escapeHtml(player.name.slice(0, 1))}</span>
            <div>
              <h2>${escapeHtml(player.name)}</h2>
              <p>${escapeHtml(gameSpecs[player.game].label)} · ${escapeHtml(player.roles.join(" / ") || "プレイヤー")}</p>
            </div>
          </div>
          <p class="match-explanation">他のタイトルから振り向きが近いプロ選手を抽出しました。${escapeHtml(player.game)}で ${player.dpi} DPI / ${player.sens} （${player.cmPer360.toFixed(1)} cm / 360°）を使用しています。</p>
          <div class="match-devices">
            <div class="match-device"><span>PLAYER MOUSE</span><strong>${escapeHtml(player.devices["マウス"] || "データなし")}</strong></div>
            <div class="match-device"><span>PLAYER MOUSEPAD</span><strong>${escapeHtml(player.devices["マウスパッド"] || "データなし")}</strong></div>
          </div>
          ${player.sourceUrl ? `<a class="player-source" style="margin-top: 1rem; display: inline-block;" href="${escapeHtml(player.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(player.source)} ↗</a>` : ""}
        </article>`;
    }).join(""); // mapで作った複数のカードを連結

  } catch (error) {
    console.error("Match API通信エラー:", error);
    document.getElementById("match-result").innerHTML = '<div class="no-results">サーバーとの通信に失敗しました。</div>';
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
