type Source={title:string;publisher:string;version:string;url:string;checked:string;scope:string};
const r=(number:number,title:string,scope:string):Source=>({title:`RFC ${number} — ${title}`,publisher:'IETF / RFC Editor',version:`RFC ${number}（RFC Editorの更新関係を参照）`,url:`https://www.rfc-editor.org/rfc/rfc${number}`,checked:'2026-11-16',scope});
export const baseline='SMTP RFC 5321 / メッセージ RFC 5322 / IMAP4rev2 RFC 9051 / SPF RFC 7208 / DKIM RFC 6376 / DMARC RFC 9989 / 集計 RFC 9990。製品は構造説明のみで実環境は未構築。';
export const sources:Record<string,Source>={
smtp:r(5321,'Simple Mail Transfer Protocol','§4応答・§4.5.4再送・§5配送先解決。RFC 2821を廃止。RFC EditorのUpdated byはRFC 7504（521/556）。Null MXはRFC 7505を併読。全拡張を実装する教材ではない。'),
submission:r(6409,'Message Submission for Mail','SubmissionとRelayの分離。RFC 4409を廃止。TLSの利用者向け条件はRFC 8314を併読。'),
format:r(5322,'Internet Message Format','ヘッダーと本文、Message-ID。RFC 2822を廃止。Updated byはRFC 6854（From/Senderのグループ構文）。国際化等の拡張は本教材の実装範囲外。'),
imap:r(9051,'IMAP Version 4rev2','メールボックス、フラグ、FETCH。RFC 3501を廃止。教材は代表操作の概念モデルで全rev2準拠を主張しない。'),
pop:r(1939,'Post Office Protocol Version 3','RFC 1725を廃止。Updated byはRFC 1957・2449・6186・8314。取得と削除、終了処理の区別。TLSを含む現代のアクセス要件はRFC 8314を併読。'),
mime:r(2045,'MIME Part One','Content-Type、転送エンコード等。添付全形式のパーサーは実装しない。'),
architecture:r(5598,'Internet Mail Architecture','MUA・MSA・MTA・MDAの論理的な役割と責任境界。Informational。'),
dsn:r(3464,'Delivery Status Notifications','DSNの機械可読な配送状態。RFC 1894を廃止。通知の生成と到達は別。'),
spf:r(7208,'Sender Policy Framework','SMTP識別子、IP照合、結果種別。RFC 4408を廃止。Updated byはRFC 7372（状態コード）・8553（DNSアンダースコア名）・8616（国際化）。include、DNS参照制限、全構文はモデル外。'),
dkim:r(6376,'DKIM Signatures','d=とs=、署名対象の検証。RFC 4871を廃止。Updated byはRFC 8301・8463（暗号）・8553・8616。暗号更新も台帳に記録する。'),
'dkim-crypto':r(8301,'DKIM Cryptographic Algorithm and Key Usage Update','RFC 6376を更新。鍵長やSHA-1の扱いに注意。教材は実鍵を作らず暗号検証を実装しない。'),
'dkim-ed':r(8463,'A New Cryptographic Signature Method for DKIM','RFC 6376を更新しEd25519を追加。全受信実装の対応を保証しない。'),
dmarc:r(9989,'DMARC','2026年5月 Proposed Standard。RFC 7489・9091を廃止。§4.10 DNS Tree Walk、§7.4一般用途ドメインのrejectに関する注意、Appendix Cの変更点を主要基準とする。'),
aggregate:r(9990,'DMARC Aggregate Reporting','2026年5月 Proposed Standard。RFC 7489の集計部分を置換。XML集計と外部宛先の確認、プライバシー。実レポートは取得しない。'),
'failure-report':r(9991,'DMARC Failure Reporting','RFC 7489から分離された失敗レポート。集計レポートと異なりメッセージ由来の情報に特に注意。生成・受信は教材外。'),
'legacy-dmarc':r(7489,'DMARC（旧仕様）','2015年 Informational。現行の判定基準にはしない。RFC 9989・9990・9991で置換された旧解説の比較対象。'),
nullmx:r(7505,'Null MX','RFC 5321を更新。MX不在の暗黙MXと、受信しない宣言0 . を区別する。'),
tls:r(8314,'TLS for Email Submission and Access','利用者向けSubmissionとメールアクセスのTLS。RFC 6409等を更新。Updated byはRFC 8997（TLS 1.1廃止）。MTA間Relay全般の要件と混同しない。'),
'tls-minimum':r(8997,'Deprecation of TLS 1.1 for Email Submission and Access','2021年3月。RFC 8314を更新し、利用者向けSubmission・アクセスでの最低TLS推奨を1.2へ更新。古い8314解説のTLS 1.1をそのまま推奨しない。'),
'mta-sts':r(8461,'SMTP MTA Strict Transport Security','HTTPS方針・MX・証明書検証、キャッシュ、初回取得の条件。実STS取得はしない。'),
dane:r(7672,'SMTP DANE TLS','DNSSECで認証するTLSAに基づくSMTPのTLS。通常のTLS使用ログだけでDANE適用済みとは判断しない。'),
'tls-rpt':r(8460,'SMTP TLS Reporting','TLS配送障害の集計。TLSを強制する方式そのものではない。'),
'auth-results':r(8601,'Authentication-Results','RFC 7601を廃止。authserv-idと信頼境界。外部から持ち込まれたpassを信用しない。'),
postfix:{title:'Postfix Architecture Overview / Documentation',publisher:'Postfix Project',version:'公式オンライン資料（版番号のない構造説明、2026-11-16確認）',url:'https://www.postfix.org/OVERVIEW.html',checked:'2026-11-16',scope:'公式検索索引の本文でsmtpd・cleanup・qmgr・smtp・lmtpとキュー構造を照合。本文URLの直接取得は402応答で失敗。製品の実インストール・特定版の動作検証は未実施。'},
'postfix-queue':{title:'Postfix Bottleneck Analysis / qmgr(8)',publisher:'Postfix Project',version:'公式オンライン資料（2026-11-16検索索引照合）',url:'https://www.postfix.org/QSHAPE_README.html',checked:'2026-11-16',scope:'incoming・active・deferredの関係を公式検索索引で確認。直接取得は402。教材の24h刻みと72h期限はPostfixの既定値ではない。'},
dovecot:{title:'Dovecot CE Documentation',publisher:'Dovecot Project',version:'Community Edition 2.4.5（latest入口の表示版）',url:'https://doc.dovecot.org/2.4.5/',checked:'2026-11-16',scope:'IMAP・POP3・保存形式・認証の構造。2.3と2.4の設定差があるため構文を混在させない。動作環境は構築していない。'},
'dovecot-lmtp':{title:'Dovecot CE — LMTP',publisher:'Dovecot Project',version:'Community Edition 2.4.5',url:'https://doc.dovecot.org/2.4.5/core/config/delivery/lmtp.html',checked:'2026-11-16',scope:'Postfix等からの最終配送とIMAPアクセスの区別。実LMTPサーバーを起動しない。'},
gmail:{title:'メール送信者のガイドライン',publisher:'Google',version:'2026-11-16閲覧の継続更新資料（固定版なし）',url:'https://support.google.com/mail/answer/81126?hl=ja',checked:'2026-11-16',scope:'個人用Gmail宛。一般送信者と大量送信者の適用条件、正逆引き、認証、TLS、配信停止。実Gmailへの送信試験・到達率測定はしていない。'}
};
