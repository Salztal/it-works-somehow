# Phase 8 Mail — 一次資料台帳

確認日：2026-11-16。SMTP RFC 5321 / メッセージ RFC 5322 / IMAP4rev2 RFC 9051 / SPF RFC 7208 / DKIM RFC 6376 / DMARC RFC 9989 / 集計 RFC 9990。製品は構造説明のみで実環境は未構築。

## 資料名・版・適用範囲

### smtp: RFC 5321 — Simple Mail Transfer Protocol

- 発行元：IETF / RFC Editor
- 版：RFC 5321（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc5321)
- 確認日：2026-11-16
- 確認範囲・制約：§4応答・§4.5.4再送・§5配送先解決。RFC 2821を廃止。RFC EditorのUpdated byはRFC 7504（521/556）。Null MXはRFC 7505を併読。全拡張を実装する教材ではない。

### submission: RFC 6409 — Message Submission for Mail

- 発行元：IETF / RFC Editor
- 版：RFC 6409（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc6409)
- 確認日：2026-11-16
- 確認範囲・制約：SubmissionとRelayの分離。RFC 4409を廃止。TLSの利用者向け条件はRFC 8314を併読。

### format: RFC 5322 — Internet Message Format

- 発行元：IETF / RFC Editor
- 版：RFC 5322（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc5322)
- 確認日：2026-11-16
- 確認範囲・制約：ヘッダーと本文、Message-ID。RFC 2822を廃止。Updated byはRFC 6854（From/Senderのグループ構文）。国際化等の拡張は本教材の実装範囲外。

### imap: RFC 9051 — IMAP Version 4rev2

- 発行元：IETF / RFC Editor
- 版：RFC 9051（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc9051)
- 確認日：2026-11-16
- 確認範囲・制約：メールボックス、フラグ、FETCH。RFC 3501を廃止。教材は代表操作の概念モデルで全rev2準拠を主張しない。

### pop: RFC 1939 — Post Office Protocol Version 3

- 発行元：IETF / RFC Editor
- 版：RFC 1939（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc1939)
- 確認日：2026-11-16
- 確認範囲・制約：RFC 1725を廃止。Updated byはRFC 1957・2449・6186・8314。取得と削除、終了処理の区別。TLSを含む現代のアクセス要件はRFC 8314を併読。

### mime: RFC 2045 — MIME Part One

- 発行元：IETF / RFC Editor
- 版：RFC 2045（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc2045)
- 確認日：2026-11-16
- 確認範囲・制約：Content-Type、転送エンコード等。添付全形式のパーサーは実装しない。

### architecture: RFC 5598 — Internet Mail Architecture

- 発行元：IETF / RFC Editor
- 版：RFC 5598（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc5598)
- 確認日：2026-11-16
- 確認範囲・制約：MUA・MSA・MTA・MDAの論理的な役割と責任境界。Informational。

### dsn: RFC 3464 — Delivery Status Notifications

- 発行元：IETF / RFC Editor
- 版：RFC 3464（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc3464)
- 確認日：2026-11-16
- 確認範囲・制約：DSNの機械可読な配送状態。RFC 1894を廃止。通知の生成と到達は別。

### spf: RFC 7208 — Sender Policy Framework

- 発行元：IETF / RFC Editor
- 版：RFC 7208（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc7208)
- 確認日：2026-11-16
- 確認範囲・制約：SMTP識別子、IP照合、結果種別。RFC 4408を廃止。Updated byはRFC 7372（状態コード）・8553（DNSアンダースコア名）・8616（国際化）。include、DNS参照制限、全構文はモデル外。

### dkim: RFC 6376 — DKIM Signatures

- 発行元：IETF / RFC Editor
- 版：RFC 6376（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc6376)
- 確認日：2026-11-16
- 確認範囲・制約：d=とs=、署名対象の検証。RFC 4871を廃止。Updated byはRFC 8301・8463（暗号）・8553・8616。暗号更新も台帳に記録する。

### dkim-crypto: RFC 8301 — DKIM Cryptographic Algorithm and Key Usage Update

- 発行元：IETF / RFC Editor
- 版：RFC 8301（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc8301)
- 確認日：2026-11-16
- 確認範囲・制約：RFC 6376を更新。鍵長やSHA-1の扱いに注意。教材は実鍵を作らず暗号検証を実装しない。

### dkim-ed: RFC 8463 — A New Cryptographic Signature Method for DKIM

- 発行元：IETF / RFC Editor
- 版：RFC 8463（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc8463)
- 確認日：2026-11-16
- 確認範囲・制約：RFC 6376を更新しEd25519を追加。全受信実装の対応を保証しない。

### dmarc: RFC 9989 — DMARC

- 発行元：IETF / RFC Editor
- 版：RFC 9989（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc9989)
- 確認日：2026-11-16
- 確認範囲・制約：2026年5月 Proposed Standard。RFC 7489・9091を廃止。§4.10 DNS Tree Walk、§7.4一般用途ドメインのrejectに関する注意、Appendix Cの変更点を主要基準とする。

### aggregate: RFC 9990 — DMARC Aggregate Reporting

- 発行元：IETF / RFC Editor
- 版：RFC 9990（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc9990)
- 確認日：2026-11-16
- 確認範囲・制約：2026年5月 Proposed Standard。RFC 7489の集計部分を置換。XML集計と外部宛先の確認、プライバシー。実レポートは取得しない。

### failure-report: RFC 9991 — DMARC Failure Reporting

- 発行元：IETF / RFC Editor
- 版：RFC 9991（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc9991)
- 確認日：2026-11-16
- 確認範囲・制約：RFC 7489から分離された失敗レポート。集計レポートと異なりメッセージ由来の情報に特に注意。生成・受信は教材外。

### legacy-dmarc: RFC 7489 — DMARC（旧仕様）

- 発行元：IETF / RFC Editor
- 版：RFC 7489（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc7489)
- 確認日：2026-11-16
- 確認範囲・制約：2015年 Informational。現行の判定基準にはしない。RFC 9989・9990・9991で置換された旧解説の比較対象。

### nullmx: RFC 7505 — Null MX

- 発行元：IETF / RFC Editor
- 版：RFC 7505（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc7505)
- 確認日：2026-11-16
- 確認範囲・制約：RFC 5321を更新。MX不在の暗黙MXと、受信しない宣言0 . を区別する。

### tls: RFC 8314 — TLS for Email Submission and Access

- 発行元：IETF / RFC Editor
- 版：RFC 8314（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc8314)
- 確認日：2026-11-16
- 確認範囲・制約：利用者向けSubmissionとメールアクセスのTLS。RFC 6409等を更新。Updated byはRFC 8997（TLS 1.1廃止）。MTA間Relay全般の要件と混同しない。

### tls-minimum: RFC 8997 — Deprecation of TLS 1.1 for Email Submission and Access

- 発行元：IETF / RFC Editor
- 版：RFC 8997（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc8997)
- 確認日：2026-11-16
- 確認範囲・制約：2021年3月。RFC 8314を更新し、利用者向けSubmission・アクセスでの最低TLS推奨を1.2へ更新。古い8314解説のTLS 1.1をそのまま推奨しない。

### mta-sts: RFC 8461 — SMTP MTA Strict Transport Security

- 発行元：IETF / RFC Editor
- 版：RFC 8461（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc8461)
- 確認日：2026-11-16
- 確認範囲・制約：HTTPS方針・MX・証明書検証、キャッシュ、初回取得の条件。実STS取得はしない。

### dane: RFC 7672 — SMTP DANE TLS

- 発行元：IETF / RFC Editor
- 版：RFC 7672（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc7672)
- 確認日：2026-11-16
- 確認範囲・制約：DNSSECで認証するTLSAに基づくSMTPのTLS。通常のTLS使用ログだけでDANE適用済みとは判断しない。

### tls-rpt: RFC 8460 — SMTP TLS Reporting

- 発行元：IETF / RFC Editor
- 版：RFC 8460（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc8460)
- 確認日：2026-11-16
- 確認範囲・制約：TLS配送障害の集計。TLSを強制する方式そのものではない。

### auth-results: RFC 8601 — Authentication-Results

- 発行元：IETF / RFC Editor
- 版：RFC 8601（RFC Editorの更新関係を参照）
- URL：[公式資料](https://www.rfc-editor.org/rfc/rfc8601)
- 確認日：2026-11-16
- 確認範囲・制約：RFC 7601を廃止。authserv-idと信頼境界。外部から持ち込まれたpassを信用しない。

### postfix: Postfix Architecture Overview / Documentation

- 発行元：Postfix Project
- 版：公式オンライン資料（版番号のない構造説明、2026-11-16確認）
- URL：[公式資料](https://www.postfix.org/OVERVIEW.html)
- 確認日：2026-11-16
- 確認範囲・制約：公式検索索引の本文でsmtpd・cleanup・qmgr・smtp・lmtpとキュー構造を照合。本文URLの直接取得は402応答で失敗。製品の実インストール・特定版の動作検証は未実施。

### postfix-queue: Postfix Bottleneck Analysis / qmgr(8)

- 発行元：Postfix Project
- 版：公式オンライン資料（2026-11-16検索索引照合）
- URL：[公式資料](https://www.postfix.org/QSHAPE_README.html)
- 確認日：2026-11-16
- 確認範囲・制約：incoming・active・deferredの関係を公式検索索引で確認。直接取得は402。教材の24h刻みと72h期限はPostfixの既定値ではない。

### dovecot: Dovecot CE Documentation

- 発行元：Dovecot Project
- 版：Community Edition 2.4.5（latest入口の表示版）
- URL：[公式資料](https://doc.dovecot.org/2.4.5/)
- 確認日：2026-11-16
- 確認範囲・制約：IMAP・POP3・保存形式・認証の構造。2.3と2.4の設定差があるため構文を混在させない。動作環境は構築していない。

### dovecot-lmtp: Dovecot CE — LMTP

- 発行元：Dovecot Project
- 版：Community Edition 2.4.5
- URL：[公式資料](https://doc.dovecot.org/2.4.5/core/config/delivery/lmtp.html)
- 確認日：2026-11-16
- 確認範囲・制約：Postfix等からの最終配送とIMAPアクセスの区別。実LMTPサーバーを起動しない。

### gmail: メール送信者のガイドライン

- 発行元：Google
- 版：2026-11-16閲覧の継続更新資料（固定版なし）
- URL：[公式資料](https://support.google.com/mail/answer/81126?hl=ja)
- 確認日：2026-11-16
- 確認範囲・制約：個人用Gmail宛。一般送信者と大量送信者の適用条件、正逆引き、認証、TLS、配信停止。実Gmailへの送信試験・到達率測定はしていない。

## 主要な更新関係の照合

RFC EditorのAbout this RFCと、DMARC Appendix C、対象本文を確認。RFC 5321のUpdated byは7504。5322は6854、6409は8314、7208は7372・8553・8616、6376は8301・8463・8553・8616、1939は1957・2449・6186・8314。9051は3501を廃止。8314は8997で更新される。これら全拡張を教材が実装するわけではない。

RFC 9989/9990は2026年5月のProposed Standard。旧7489はInformational。9989は7489と9091を廃止し、集計・失敗レポートは9990/9991へ分離。DNS Tree Walk、組織境界、psd・np・t、pct・rf・riの削除、一般用途ドメインに対するrejectの注意を説明へ反映する。モデルではDNS Tree Walkを近似計算せず、確定済みの架空境界を使う。

Postfix公式本文URLは直接取得が402で失敗したが、公式ドメインの検索索引本文によりArchitecture Overview、Bottleneck Analysis、qmgrの構造を照合した。取得成功や特定版の実機検証と表現しない。Dovecot latest入口の表示はCE 2.4.5で、教材台帳のリンクは2.4.5へ固定した。Gmailガイドラインは継続更新資料で、個人用Gmail宛と送信量・種別等の適用条件を明記する。

実サーバー、実DNS、実鍵、実認証、実メール到達の検証は行わない。
