# Phase 8 Mail — 調査と設計

作業日：2026-11-16。対象は `technical-notes`（origin: Salztal/it-works-somehow）。開始時の作業ツリーはclean。当初はローカル実装・検証のみ。その後のユーザー指示「本番に上げてから確認で良いです」により、今回の変更のCommit・通常Push・Pages公開と公開後のブラウザ確認へ範囲を更新した。履歴改変や永続Git設定変更は行わない。

## 既存構造と採用方針

Astroの共通 `[...slug].astro`、Shell、catalog、検索JSON、TestQuestions、v1進捗を再利用する。Spring/Webの表示パターンを継承し、Mailのデータ・モデル・クライアント・CSSだけを分離する。依存パッケージとlockfileは追加・更新しない。

15講義はML01〜ML15、各Unitに3講義。ミッションはM1〜M5。保存IDは `mail-ml01`〜`mail-ml15` / `mail-m1`〜`mail-m5`、完了キーは `mail:<id>`。回答キーは既存仕様の `<id>:<question-index>`。localStorageの `technical-notes:v1:<base>`、version 1、バックアップ構造、既存IDは維持する。共有clientの進捗集計対象と進捗ページにMailを加える。

## 新規資産

| 配置 | 役割 |
|---|---|
| src/content/mail/course.ts | 15講義・45問・図・比較表・関連講義 |
| src/content/mail/missions.ts | 独立した架空案件5件・15問・残存リスク |
| src/content/mail/labs.ts | 8ラボの前提・入力・操作・限界 |
| src/content/mail/diagnosis.ts | 症状別15症例・合成ログ・危険操作 |
| src/content/mail/comparisons.ts | 調査場面を伴う16比較 |
| src/content/mail/glossary.ts | 34語の解説・関連講義 |
| src/content/mail/sources.ts | 一次資料名・版・URL・日付・適用条件 |
| src/lib/mail-model.ts | 外部通信・保存を持たない純粋な遷移モデル |
| src/lib/mail-client.ts | 前後の状態表・ログ・経路の現在位置 |
| src/lib/mail-diagnosis-client.ts | 症例の文字列検索・選択・深いリンク |
| src/components/Mail*.astro | 講義・ミッション・入口・ラボ表示 |
| src/pages/mail/ | 8ラボ・一覧・診断・比較・出典・用語 |
| scripts/prepare-mail.mjs | 既存catalog向けの派生データ生成 |
| scripts/fixtures/mail-expectations.json | モデルとは別に手書きした固定期待値 |
| scripts/check-mail.mjs | 内容・判定・遷移・保存互換・索引の検査 |

## 操作モデル

1. 配送追跡：作成 → SubmissionのEHLO/MAIL/RCPT/DATA/本文受付 → incoming → MX → 接続/TLS → 宛先受理 → LMTP保存 → IMAP PEEK → 既読更新。送信側S8A01と受信側R8B02を区別する。
2. SMTP：コマンド順、本文終端、RCPT応答、421の接続終了。順序違反は503で受理状態を進めない。
3. DNS：数値の小さいMXを優先、同順位の固定表示、暗黙MX、Null MX、SERVFAIL、NXDOMAIN、交換ホストのアドレス不備、候補接続。
4. キュー：incoming/active/deferred、時刻前の再試行拒否、24h刻み・72h期限、250/451/550、DSN生成と到達の分離。
5. IMAP：サーバー保存・フラグ・フォルダーと端末キャッシュを分ける。PEEKは既読にせず、STOREは本文取得を意味しない。フォルダー変更は実験状態を保持し、明示同期で表示を更新。
6. 認証：固定SPF IPとall、DKIM検証結果の仮定、認証結果とstrict/relaxed Alignment、少なくとも一方の整合pass。組織境界は架空DNSで確定した入力事実。
7. TLS：587 STARTTLS/465 Implicit/25 Relay、証明書検証と暗号化、AUTHの順序、Opportunisticと必須方針。
8. ヘッダー：固定合成Received/Authentication-Resultsと送受信ログ。信頼境界外の偽passを含め、Queue IDとMessage-IDを照合。

配送追跡には12障害。qmgr停止は未試行のincoming滞留とし、宛先の一時拒否によるdeferredと区別する。受信側が受理した後の容量不足は受信側キューが保持し、送信側sentを巻き戻さない。IMAP失敗でも保存済み状態を維持する。

DMARC障害は、受付後の外部配信用のEnvelope/署名ドメイン書換を入力条件として明示し、受信側が評価するMAIL FROM・d=・Fromを表示する。元のSubmission Envelopeとの違いを隠さない。実署名・実転送処理ではない。

## 既存教材への接続

NetworkのDNS・TCP・障害調査、Securityのメール認証・TLS、WebのTLS・調査、Springの認証・再送、Test Designの状態・依存、Javaの業務Web処理へ相互リンクを追加する。既存原稿は書き換えず、共通ページの関連リンクとして追加する。Gitは教材・IDを維持する。

M5は独立した架空旅行サービス「Orbit Trip」。HTTP 202の要求登録、SMTP認証失敗、別要求のSMTP受付後の宛先拒否を分ける。Foil Travelの実コード・非公開資料・既存サーバーは参照・変更しない。

## UI・公開範囲

既存配色・読み物レイアウト・キーボード対応のbutton/select/detailsを継承。図、DNS、ログ、状態表は局所横スクロール。フィールドは幅に応じて折返す。390px/325pxは設計対象だが、実ブラウザ確認の成否は検証記録に分けて記載する。

公開物はAstroのdistのみ。検証ログは.gitignore対象の.local、開発文書はdocs。個人情報・実メール・認証情報・実秘密鍵を取得しない。メール送信・外部認証・DNS変更の経路をモデルに持たせない。
