# FRAG // GEAR INTELLIGENCE

FPSタイトル（VALORANT / Apex Legends / Overwatch 2）のプロゲーマー・人気ストリーマー・VTuber 計85名が使用するデバイス情報・感度設定を分析し、ユーザーに最適な環境を提案するフルスタックWebアプリケーションです。

## 🌐 デモURL
- **Frontend (GitHub Pages):** https://acasy105-creator.github.io/----/
- **Backend API (Render):** `https://backend-server-a1y2.onrender.com`

---

## ✨ 主な機能

1. **プレイヤー＆デバイス逆引き検索（プロ / ストリーマー / VTuber 対応）**
   - 3タイトル計85名のデータベースから、タイトル・ロールに加えて**「🏆 プロ選手」「🎙 ストリーマー」「✨ VTuber」**の属性フィルターでワンクリック絞り込みが可能。
   - プレイヤー名だけでなく、使用デバイス名（例：`SUPERLIGHT 2`, `Artisan`, `SHURE SE215` など）からの逆引き検索にも対応。
2. **クロスゲーム感度マッチ（Sensitivity Match）**
   - 現在のプレイタイトル、DPI、ゲーム内感度から**振り向き（cm / 360°）**を自動算出。
   - 異なるゲームタイトル間で最も感覚（振り向き距離）が近いプロ選手や配信者を上位3名抽出し、使用デバイスと共に比較表示します。
3. **全ページ連動 YouTube レビュー動画プレイヤー**
   - **YouTube Data API v3** と連携し、各プレイヤーが使用しているマウス・マウスパッド・ヘッドセットの最新レビュー動画を非同期で取得・表示。
   - 「感度マッチ」「プレイヤー検索」「プロ使用率」「デバイス相談」の全4ページにおいて、デバイス名をクリックするだけでページ遷移なしにレビュー動画を動的に切り替え可能です。
4. **プロ使用率ランキング / デバイス相談**
   - カテゴリ別の使用率ランキング自動集計と、プレイスタイルや悩み（エイム・定位感など）に合わせたデバイス提案機能を搭載。

---

## 🛠 使用技術（Tech Stack）

### フロントエンド
- **HTML5 / CSS3 / Vanilla JavaScript (ES6+)**
  - フレームワークに依存せず、`fetch` APIを用いた非同期通信とDOM操作により高速なSPA風UIを実現。
  - CSS Grid / Flexbox を活用した視認性の高いダークモードUI。

### バックエンド
- **Java / Spring Boot**
  - RESTful APIの設計・実装（`/api/match`, `/api/youtube/reviews`, `/api/liquipedia/players`）。
  - `Jackson` を用いたJSONデータセットのシリアライズおよび外部API連携処理。

### インフラ・外部API
- **GitHub Pages**（フロントエンドホスティング）
- **Render / Docker**（バックエンドコンテナのクラウドデプロイ）
- **Google YouTube Data API v3**（製品レビュー動画のリアルタイム検索・取得）
- **Liquipedia / Pro & Creator Gear Dataset**（85名のプロ・配信者データの統合管理）

---

## 💡 工夫した点・技術的アプローチ

### 1. 高可用性を実現するハイブリッド・データセット＆キャッシュ設計
外部API（Liquipedia API）の厳格なレート制限（HTTP 429 Too Many Requests）やクラウド環境での通信タイムアウト（502 Bad Gateway）によるサービス停止を防ぐため、`LiquipediaService` に**データセットバンドル方式とインメモリキャッシュ（TTL 24時間）**を実装しました。外部通信の状況に左右されず、常に85名分のデータをミリ秒単位で高速にレスポンスし、サービス稼働率（可用性）を維持します。

### 2. セキュリティとCORS設定・環境変数管理
- YouTube Data APIのAPIキーはソースコードにハードコードせず、Render上の環境変数（Environment Variables）およびSpring Bootの `@Value` アノテーションを介して安全に注入。
- フロントエンド（GitHub Pages）とバックエンド（Render）のクロスオリジン通信を安全に行うため、`WebConfiguration` にてCORS（Cross-Origin Resource Sharing）設定を構成しています。

### 3. ゲームごとの視点係数（Yaw値）を用いた正確な振り向き計算
タイトルごとに異なる内部視点角度係数（VALORANT: `0.07`, Apex Legends: `0.022`, Overwatch 2: `0.0066`）をバックエンドの `Game` Enumで一元管理し、以下の計算式で正確な物理距離（cm/360°）への正規化を行っています。
- `cm/360° = (360.0 / (DPI × Sensitivity × Yaw)) × 2.54`