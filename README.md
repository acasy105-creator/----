# FRAG // GEAR INTELLIGENCE

FPSタイトル（VALORANT / Apex Legends / Overwatch 2）のプロゲーマーが使用するデバイス情報・感度設定を分析し、ユーザーに最適な環境を提案するフルスタックWebアプリケーションです。

## 🌐 デモURL
- **Frontend (GitHub Pages):** https://acasy105-creator.github.io/----/
- **Backend API (Render):** `https://backend-server-a1y2.onrender.com`

---

## ✨ 主な機能

1. **クロスゲーム感度マッチ（Sensitivity Match）**
   - 現在のプレイタイトル、DPI、ゲーム内感度から**振り向き（cm / 360°）**を自動算出。
   - 異なるゲームタイトル間で最も感覚（振り向き距離）が近いプロ選手を上位3名抽出し、使用デバイスと共に比較表示します。
2. **YouTube レビュー動画のリアルタイム連携**
   - マッチしたプロ選手が使用しているマウス名をキーにして、**YouTube Data API v3** から最新の製品レビュー動画を非同期で取得・表示。
   - 各選手カードの「PLAYER MOUSE」をクリックすることで、ページ遷移なしに他の選手のマウスレビュー動画へ動的に切り替え可能です。
3. **プレイヤー検索 / プロ使用率 / デバイス相談**
   - タイトルやロール別のプロ選手設定検索、使用率ランキングの集計、プレイスタイルに合わせたデバイス提案機能を搭載。

---

## 🛠 使用技術（Tech Stack）

### フロントエンド
- **HTML5 / CSS3 / Vanilla JavaScript (ES6+)**
  - フレームワークに依存せず、`fetch` APIを用いた非同期通信とDOM操作により高速なSPA風UIを実現。
  - CSS Grid / Flexbox を活用したレスポンシブかつ視認性の高いダークモードUI。

### バックエンド
- **Java 21 / Spring Boot**
  - RESTful APIの設計・実装（`/api/match`, `/api/youtube/reviews` 等）。
  - `HttpClient` と `Jackson` を用いた外部APIのJSONパースおよびWikitext解析処理。

### インフラ・外部API
- **GitHub Pages**（フロントエンドホスティング）
- **Render / Docker**（バックエンドコンテナのクラウドデプロイ）
- **Google YouTube Data API v3**（製品レビュー動画の検索・取得）
- **Liquipedia API**（プロ選手データの取得）

---

## 💡 工夫した点・技術的アプローチ（アピールポイント）

### 1. 外部APIのレート制限（HTTP 429）に対するフェイルセーフ設計
Liquipedia APIの厳格なレート制限（HTTP 429 Too Many Requests）や一時的な通信障害によってアプリケーション全体が停止（502 Bad Gateway）するのを防ぐため、バックエンドの `LiquipediaService` および `MatchService` に**フォールバック（安全装置）機構**を実装しました。
- **インメモリキャッシュ（TTL 24時間）とリクエスト間隔制御：** 外部APIへの過剰なリクエストを抑制。
- **ファストフェイル＆自動フォールバック：** API制限検知時は待機によるタイムアウトを防ぐため即座に通信を切り上げ、内蔵のフォールバックデータへシームレスに切り替えることで、**サービス稼働率（可用性）を維持**しています。

### 2. セキュリティとCORS設定・環境変数管理
- YouTube Data APIのAPIキーはソースコードにハードコードせず、Render上の環境変数（Environment Variables）およびSpring Bootの `@Value` アノテーションを介して安全に注入。
- フロントエンド（GitHub Pages）とバックエンド（Render）のクロスオリジン通信を安全に行うため、`WebConfiguration` にて適切なCORS（Cross-Origin Resource Sharing）設定を構成しています。

### 3. ゲームごとの視点係数（Yaw値）を用いた正確な振り向き計算
タイトルごとに異なる内部視点角度係数（VALORANT: `0.07`, Apex Legends: `0.022`, Overwatch 2: `0.0066`）をバックエンドの `Game` Enumで一元管理し、以下の計算式で正確な物理距離（cm/360°）への正規化を行っています。
- `cm/360° = (360.0 / (DPI × Sensitivity × Yaw)) × 2.54`