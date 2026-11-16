type Comparison={id:string;title:string;left:string;right:string;when:string;lesson:string;source:string};
const c=(id:string,title:string,left:string,right:string,when:string,lesson:string,source:string):Comparison=>({id,title,left,right,when,lesson:`mail-ml${lesson}`,source});
export const comparisons=[
c('protocols','SMTP / IMAP / POP3','SMTP：メッセージの受付・中継。','IMAP：サーバー状態の操作・同期。POP3：主に取得と指定による削除。','送信・保存・端末表示のどこで止まったかを切り分ける。IMAP失敗だけでSMTPを再送しない。','03','imap'),
c('roles','MUA / MSA / MTA / MDA','MUAは利用者の作成・閲覧。MSAはSubmissionの受付。','MTAは中継・経路選択。MDAはローカル保存。','単一ホストでも役割は異なる。観測ログと責任の引継ぎ点を構成図へ書き込む。','01','architecture'),
c('submission-relay','Submission / SMTP Relay','利用者からMSAへの受付。代表は587・465。','MTA間中継。代表は25。一般に利用者AUTHを要求しない。','SMTP認証の失敗を、外部MTAの受信ポリシー拒否と混ぜない。','02','submission'),
c('products','Postfix / Dovecot','Postfix：SMTP受付・配送・キュー等。','Dovecot：IMAP・POP3・保存・認証等。LMTP連携も可能。','smtpのsentがあっても、LMTP保存とIMAPアクセスの証拠を別に確認する。全基盤がこの構成ではない。','05','dovecot'),
c('envelope','SMTP Envelope / メールヘッダー','MAIL FROM・RCPT TOは配送用の指定。','From・To等はDATAに含むメッセージの一部。','Bcc・転送・不達通知の調査で、画面上の宛先だけから配送先を決めない。','02','smtp'),
c('from-return-path','From / Return-Path','FromはRFC5322の著者を示す表示ヘッダー。','Return-Pathは最終配送時に記録する逆配送先の情報。空の場合もある。','SPF・DMARCとバウンス先を調べる際、Return-Pathを表示著者の本人確認として扱わない。','08','smtp'),
c('ids','Message-ID / Queue ID','Message-IDはメッセージ側の識別情報。再利用・欠落・偽装の可能性もある。','Queue IDは各MTAが局所的に付ける追跡用識別子。','ホスト・時刻・送受信者・応答も照合し、IDの一致だけで全経路を断定しない。','12','format'),
c('reply','4xx / 5xx','4xxは標準的には一時失敗。','5xxは同一要求の無条件再送で成功を期待しない恒久失敗。','拒否段階と応答文・ポリシーを確認する。コードだけでディスク故障等の根本原因を決めない。','02','smtp'),
c('failures','一時失敗 / 恒久失敗','一時失敗は保持して期限内に再試行する。','恒久失敗は不達処理や要求の修正が必要。','再送待ちと廃棄・通知を区別する。恒久失敗でも設定を修正した後の再送判断は別に行う。','06','dsn'),
c('boundaries','送信受付 / 配送完了 / 閲覧確認','送信受付はそのホップが配送責任を引き受けた状態。','配送完了は対象を明記する。次ホップ引渡し、最終保存、閲覧は別。','送信側250やsentを人の閲覧証明として報告しない。ログの配送エージェントと次ホップを見る。','01','smtp'),
c('authentication','SPF / DKIM / DMARC','SPFはIPとSMTP識別子。DKIMは署名とd=。','DMARCはFromと整合した認証、およびドメイン所有者の方針。','どのドメインが認証されたかを列挙し、Fromとの整合を独立に判定する。','08','dmarc'),
c('spf-dmarc','SPF pass / DMARC pass','SPF passは接続元がMAIL FROM等の方針で許可された結果。','DMARC passにはFromに整合したSPFまたはDKIMの成功が必要。','外部配信・転送でSPF passだけを確認しても、表示Fromの整合を見落とす。','08','spf'),
c('tls-modes','STARTTLS / Implicit TLS','STARTTLSはSMTP開始後にTLSへ切り替え、再EHLOする。','Implicit TLSは接続直後からTLS。465 Submissionが代表。','接続方式の不一致と証明書検証失敗を分け、エラー回避で平文AUTHを使わない。','09','tls'),
c('e2e','TLS / エンドツーエンド暗号化','TLSは対象ホップの通信路を保護する。','E2Eは利用者間の内容保護を目指し、鍵管理も異なる。','中継サーバーの処理や保存データはTLSだけで秘匿されるとは限らない。','09','tls'),
c('placement','送信ドメイン認証 / 迷惑メール判定','認証はドメイン利用とFromの整合を評価する。','配置判定は評判・量・苦情・内容・受信側方針等も使う。','全認証がpassでも、受信側のフォルダー配置の理由は別の証拠で確認する。','11','gmail'),
c('logs-headers','配送ログ / Receivedヘッダー','配送ログはそのサーバーが観測した接続・キュー・配送状態。','Receivedは各ホップの追加情報。外部の偽行が混じり得る。','局所ログと信頼境界を照合する。ヘッダーだけで全経路や本文の安全性を断定しない。','14','auth-results')
];
