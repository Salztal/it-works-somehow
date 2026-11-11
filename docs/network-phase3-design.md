# Phase 3 Network：調査と設計

作業日・資料確認日：2026-11-11（Asia/Tokyo）。ローカル `technical-notes`、origin `https://github.com/Salztal/it-works-somehow.git`。開始時の作業ツリーは変更なし。Commit・Push・公開は行わない。

## 調査した既存契約

- Astro 7.4.7 / TypeScript / 静的出力、Node 22.23.4以上。既存の依存を使用し追加依存なし。
- `course.json` の6講義ID：`network`, `ip-subnet`, `routing`, `dns-port-http`, `firewall-nsg`, `challenge`。23問と既存3ミッション・14自由記述・5復習語を原本照合する。
- 既存ミッションID：`web-db`, `web-flow`, `diagram-reading`。URLはcatalogで定義済みのものを変更しない。
- 保存：`technical-notes:v1:${BASE_URL}`、version=1、completed/answers/recall/notes/last。完了キーは`network:<id>`、問題は`<id>:<zero-based index>`。共通clientの採点・シャッフル・記録をそのまま使う。新規キーは未使用の`n07-...`〜`n24-...`、`nm4-...`〜`nm7-...`。
- Java 18原稿と11 ZIP、Security 30講義・90問・操作モデルは編集しない。原本ハッシュとZIPの検査を継続する。
- 検索は全catalogから`search.json`を生成。新規本文・問題・誤答理由・出典・ミッションの自由記述も検索対象に含める。
- `href`でbaseを付ける。Astroの動的静的ルート生成、共通Shell・CSS・進捗UIを利用する。

## 追加データと学習順

`foundations.json`に18講義・54問、`missions.json`にM4〜M7・12問・12自由記述。既存77問相当（23+54）の講義確認問題と、追加ミッション12問は分けて数える。合計24講義、77確認問題、7ミッション（追加判断問題12問）。

初学者向け入門01〜05 → Unit A〜Fの07〜24 → 既存06 Azure応用 → 7ミッションを推奨。既存番号・URLを優先し、番号順と推奨順の違いを概要で説明する。既存のIP・経路・DNSは概論、新規は動作・計算・観測の詳説として関連付ける。既存章からも共通の関連リンクを付ける。

Unit A〜Fごとの一覧とサイドバーを追加。概要にTCP操作への入口、SecurityのTLS/PKI関連を置く。Mail・Server・Web基盤・基盤共通サービスは別Phaseで、本格的な内容・空のコース・未実装リンクを作らない。

## 操作教材

`network-model.ts`をブラウザと検査で共有。外部送信・サーバ・実ネットワークを必須にしない。

|教材|入力・モデル|範囲と異常系|
|---|---|---|
|Subnet|IPv4/CIDR・範囲・マスク・候補|/0〜/32、/31 P2P、/32単一。先頭余分0・範囲・CIDR不正を拒否|
|VLAN|1〜4094、L3/GW/往復経路/許可の前提|タグ設定・MACエージング等は完全再現しない|
|DHCP|DORA段階、リレー、リースと経過|初期取得と更新を区別、T1/T2は既定割合、サーバ無応答の更新例|
|Route|宛先、最大32経路|最長一致、該当なし、非境界・同プレフィックス重複を拒否。ECMPは対象外|
|PAT|内部2タプルと固定外側ポート、往復|TCP・相手固定の対応表。未知の応答を配送しない。割当方式を一般化しない|
|DNS|TTL/経過、TC、TCP許可|通常の正キャッシュ、serve-stale・負キャッシュ・DoH等は省略|
|TCP|6シナリオ・任意ステップ|下記。ネットワーク実装ではなく仕様に沿った代表的な教育トレース|
|障害|5ケースのログと調査先|DNS設定・境界拒否・戻り経路・TLS名・上流アプリを比較、理由を表示|

操作にはラベル付き入力、エラー結果、live region、ボタン、キーボード操作を用意。TCPは左右/Home/Endで段階移動し、selectで任意段階へ移動可能。select入力中の矢印操作は奪わない。自動再生や待ち時間なし。横長表は名前付きスクロール領域に限定し、モバイルの状態表示は縦に並べる。JSなしでも本文・表・問題解説を読むことができる。

## TCPの重要な境界

RFC 9293 §3.3・3.4・3.5・3.10、タイマーはRFC 6298を参照。

- 説明用絶対ISN 1000/9000、データなし。SYN/FINは1消費、純粋ACKは0。再送は同じ番号。
- passive OPENはLISTEN。ClientがSYN/ACKを受理した処理でESTABLISHEDとなりACKを形成する（§3.10.7.3）。受信・送信を観察上分けるが、ClientをACK送信までSYN-SENTに留めない。
- Serverは最終ACK受信でESTABLISHED。ACK損失時の両端の状態を分ける。ServerのSYN/ACK再送にClientが再ACKする例を表示。
- SYN/ACK損失はServerの再送が先に処理される一例。Client SYN再送の競合順序を普遍化しない。
- 通常FINはFIN-WAIT-1/2、CLOSE-WAIT、LAST-ACK、TIME-WAITも表示。ClientはServer FIN受信でTIME-WAITを開始し、最後のACK送信では状態を進めない。
- 最後のACK損失ではServerがFIN再送、Clientが再ACKし2 MSLを再開始。純粋ACK専用の再送タイマーを架空実装しない。
- RSTはSEQ=RCV.NXTで受理できるアプリABORT例。偽RSTが無条件で受理されるモデルではない。
- RTO 1→2→4秒・2回再送後の打切りは教材のポリシー。標準で固定された回数とはしない。2 MSLの秒数も固定しない。
- 同時オープン/同時終了・データ転送・TCPオプション・輻輳制御の実装は対象外。18章でバイト列・SACK・rwnd/cwndを文章説明する。
- TCPとTLSの目的を分離し、TLS確立/証明書/close_notifyをTCPフラグと混同しない。

Network用PCAPは追加しない。21章とM5のログは「合成テキスト」と明記し、WiresharkでPCAPの解析を検証したという主張をしない。既存SecurityのPCAPは既存回帰検査を継続。
