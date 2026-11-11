# Phase 2 実装・検証記録

実施日: 2026-11-11。対象は既存 `Salztal/it-works-somehow` のローカル作業ツリー。Push・本番公開・コミットは行っていない。Gitの作者設定や履歴も変更していない。

## 実装

- Security 10ユニット・30レッスン。BASIC18、ADVANCED9、LUNATIC3。全レッスンに前提、目標、複数節の本文、比較表/フロー、具体例、誤解、3問、全4選択肢の理由、関連教材と一次出典。
- 合計90問・360選択肢。採点には既存UIを利用し、正答と選択した誤答の理由を表示。全選択肢の理由はdetailsでも確認でき、JavaScript無効時も読める。
- 原稿は `src/content/security/{basic-01-03,basic-04-06,advanced,lunatic}.json`。版・発行年月・確認日付きの資料を各ページに表示。出典照合は `security-sources.md`。
- 10種類の操作教材: AES-GCM、SHA-256、ECDSA、FW/IDS/IPS、TLSシーケンス、証明書検証条件、strict DMARC、脆弱性優先度、架空ログ、DNSSEC信頼チェーン。秘密を外部送信せず、鍵はメモリ上で保持。非対応環境・入力不正・改ざん失敗・初期化を扱う。
- 合成TLS外形PCAPとJSONを決定的に生成。実通信・有効なAEAD暗号文ではなく、復号や接続成功を確認する用途ではない。
- 既存Shell/一覧/配色/ナビを再利用。Security本文の文字を読みやすくし、表を横スクロール可能に、操作部品を44px以上、キーボードで使える標準button/inputにした。目次の現在位置表示を追加。レスポンシブCSSの実機表示は未確認。
- 既存URLを維持。新規は `/security/{basics,advanced,lunatic}/sNN-NN/`。Network/JavaとSecurity間に双方向の導線を追加。
- 保存領域 `technical-notes:v1:${BASE_URL}` とversion 1を維持。Securityは追加キーだけなのでschema移行は不要。検索57教材。JavaScriptへ全Security本文を埋め込まず、軽い目次データは生成物に分けた。

## 実施した検査

| 検査 | 結果・範囲 |
|---|---|
| Node 22.23.4で `scripts/verify.mjs` | PASS。CI指定版と同じNode。型検査0 errors / 0 warnings / 0 hints、74ページ生成 |
| root / `/it-works-somehow/` | `scripts/check-base.mjs` PASS。両方でビルド・参照・原本・Security・HTTP配信を検査 |
| 内部リンク・アンカー・公開物 | PASS。74 HTML、リンク/アンカー、270アセット参照、11 ZIP/264内包エントリ。秘密情報パターン・不要ファイルも既存検査で確認 |
| HTTP配信 | PASS。各baseで95生成ファイルのステータスと全バイト一致、404、base外404 |
| Network回帰 | PASS。原本ハッシュの全106ファイル照合に加え、6レッスン/23問/3ミッション/14参考回答/5復習語を保持 |
| Java回帰 | PASS。18原稿、5メソッドの正確な展開、11配布ZIPと既存manifestの一致 |
| 教材・採点 | PASS。10ユニット/30レッスン、18/9/3、90問、360通りの選択判定、本文・全問題/理由・出典が公開HTMLに存在 |
| 学習記録 | PASS（純粋関数）。旧v1バックアップとSecurity混在版のJSON往復、既存回答・メモ保持、不正schema/値/キーの処理 |
| 検索 | PASS（実索引＋共通関数）。Network/Java/Security、NFKC全角、AND語、空語・一致なし |
| FW/DMARC/チェーン | PASS。先頭一致とルール順、ポート異常値、16組のSPF/DKIM pass×整合、ドメイン異常値、信頼断絶箇所 |
| Web Crypto共通実装 | PASS（Node Web Crypto）。AES-GCMで空文字/日本語/上限入力の往復、同じ鍵で新規IV、1bit改ざん拒否、SHA-256既知値、ECDSAの正常/本文変更/署名変更、秘密鍵export不可、上限超過拒否 |
| PCAP | PASS。4フレームの長さ、IP/TCP checksum、Hello長と拡張、TLS1.3選択値、X25519、レコード境界を独自パーサーで検査 |
| Git差分 | `git diff --check` PASS。元教材の原稿と過去履歴を変更していない |
| GitHub Actionsへの組込 | `verify`/`check:base`と本番baseでのbuild検査にSecurityを追加。リモートでのActions実行は未実施 |

HTTP検査は最初サンドボックスのloopback接続がEACCESで拒否されたため、許可後に再実行してPASSした。これはアプリのHTTP障害とは区別する。

## 未実施と制約

- ブラウザ実操作、スクリーンショットによるPC/スマートフォンの視覚確認、実ブラウザのlocalStorage保存・JSONファイル選択/ダウンロード・リロード・キーボード操作は未検証。連携ブラウザiabが利用できず、Windows Chrome取得も「現在URLを十分な確信で確認できない」というComputer Use側の制限で停止した。ブラウザを別手段で自動操作して制限を回避していない。
- したがって共通関数と生成HTML/配信の成功を、ブラウザE2E合格やアクセシビリティ監査合格とは報告しない。ブラウザ内でのWeb Crypto対応状況・モバイル描画も追加確認が必要。
- X.509/DNSSEC/メールの操作教材は条件と判断のモデルであり、本物の署名検証・DNS・SMTP通信はしない。DMARCはstrict限定、FWはTCP新規着信の先頭一致限定。
- 合成PCAPはSYN交換を含まない外形教材で、暗号化領域はダミーバイト。Wiresharkでの実表示は未確認。実際の接続を再現したい場合は、許可済みローカル環境で別途採取する教材を将来追加できる。
- 外部URLは確認日に一次ページ/公式ミラーの内容を照合した。将来の到達性は保証せず、毎ビルドのオンラインリンクチェッカーは設けていない。CISA canonicalの403等の制約は出典記録に明記。
- 依存ライブラリの追加・リモートPush・公開は行っていない。サイトの実公開結果やGitHub Actionsのリモート成功は未確認。

## 継続編集

原稿JSONを編集して `pnpm verify` と `pnpm check:base` を実行する。新しいレッスンでは関連キーの解決と出典の更新状況も確認。`src/generated/` と `public/samples/security/` は生成物のため直接編集しない。デモ追加は `security.ts` のID対応、SecurityLab、security-client/model/cryptoで行う。外部に送信する処理を追加しない。
