# Phase 6 調査・設計

対象は既存 `technical-notes`（Astro / TypeScript / GitHub Pages）。作業開始時のmainは `9a304fa`、作業ツリーは未変更。Network・Java・Security・Git・Test Designの原稿や進捗の構造は維持する。

## 学習構成

- `/web/` に「何をしたいか」の入口。5 Unit・15講義H01〜H15と5ミッションM1〜M5。各3問、計60問・240選択肢理由。
- `/web/lab/` に8種類の操作教材。講義とミッションにも同じ教材を埋め込む。
- `/web/diagnosis/` は症状から13症例へ進む。最初の情報・候補・手順・追加証拠・禁止操作・断定できない条件・関連教材を収録。
- `/web/comparisons/` に12比較。実務で必要な状況と一次資料を付ける。
- `/web/sources/` と各講義に資料名・版・確認日・URL・適用範囲を表示。

`src/content/web/` が原稿、`src/lib/web-model.ts` が純粋な判定モデル、`web-client.ts` が表示・操作、`WebLab.astro` がフォームと出力。新しいパッケージ、バックエンド、実Cookieや外部APIは追加しない。HTTP表示は模擬、時刻は決定的な仮想値と明記する。

## モデルの境界

- 追跡: Browser→DNS/TCP/TLS→CDN/LB→nginx→アプリ→DB。正常＋11障害。DNS・TLS・ブラウザ接続失敗はstatusなし。CORSはHTTP200とJS参照不可を併記。500/502/504の生成層と原因候補を分ける。単一観測APIの応答はシナリオ契約であり、任意APIの実装を予測しない。
- 要求組立: 固定の架空注文API。GET/HEAD/POST/PUT/PATCH/DELETE、JSON解析・入力検証・件数・AcceptとContent-Typeを比較。204・HEADは本文なし。
- リダイレクト: 301/302/303/307/308、POST→GETの互換差、本文の除去、同一URL＋メソッド再訪と10hop上限。
- Cookie: 限定ドメイン、Domain・Path・Secure・HttpOnly・明示SameSite、Max-Age優先、発行・ID更新・期限・削除・ログアウト。第三者Cookie制限、Partitioned、省略時Lax例外は対象外。
- CORS: 固定safelistプリセットとJSON・Authorization等。Preflight、実送信、参照可否を分離。include＋wildcardを拒否。資格情報送信の適格性とCookie送信・業務認可は別判定。
- Cache: 単一GET・ETag。保存済み応答の鮮度、200/304/通信なし、private/no-cache/no-store、時間と版更新。Age・Vary・Service Workerの完全モデルは対象外。
- nginx: 通常prefix location、正規化済みASCII URI。URIあり/なし、クエリ、Host、転送先。正規表現・変数・rewrite・複数location・実nginx起動は対象外。
- LB: A/Bの実稼働とヘルスチェック認識を分離。Stickyとローカル/共有セッション、停止・検出・復帰。共有ストア自体の障害は対象外。

## 互換性と検査

既存のカタログ・動的ルート・検索・共通問題UIを拡張する。キーは`web:web-h01`等、問題キーは`web-h01:0`等。保存先`technical-notes:v1:${base}`とversion 1のスキーマは変更しない。NetworkのTCP/DNS、SecurityのTLS/認証/CSRF、JavaのServlet、Test Designの結合/回帰、Gitの差分へ双方向リンクを表示し、移行原稿は書き換えない。

`scripts/check-web.mjs` は固定の独立正解表とモデル別の期待値で検証する。期待値を実装から計算しない。既存verify・check:base・Pages検査に追加する。資料台帳は `src/content/web/sources.ts`、検証結果は `web-phase6-verification.md`。
