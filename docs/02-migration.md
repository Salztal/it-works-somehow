# 移行内容と拡張設計

## Network

| 元のID | 新しいURL |
| --- | --- |
| network | `/network/basics/network/` |
| ip-subnet | `/network/basics/ip-subnet/` |
| routing | `/network/basics/routing/` |
| dns-port-http | `/network/basics/dns-port-http/` |
| firewall-nsg | `/network/basics/firewall-nsg/` |
| challenge | `/network/azure/challenge/` |
| web-db (M1) | `/network/exercises/web-db/` |
| web-flow (M2) | `/network/exercises/web-flow/` |
| diagram-reading (M3) | `/network/exercises/diagram-reading/` |

`js/lessons.js` とローカル追加版 `js/v02.js` の説明・用語・図・問題・正解index・解説を構造化JSONに抽出しました。23問の内訳は3・4・3・4・4・5問です。3ミッションの14問は元どおり参考回答式です。自動採点は選択問題のみです。

旧UIの英語の区切り見出しは日本語へ変更しました。HTML/CSS図の構造とラベルは保持し、見た目を共通CSSで再設計しました。復習5語は全Network章から共通で書込み・参照できます。調査6項目と5つの問いも保持しています。

選択肢は表示順のみランダム化します。正解は元のindexで判定し、再読込後も同じ選択を復元します。レッスン・ミッションの完了は自己判断で記録でき、取り消しも可能です。

## Java

18原稿の本文はそのまま保存し、生成時にリンク・コード参照だけを変換します。各ページの冒頭見出しは共通ヘッダーのH1として表示します。

| 原稿 | 新しいURL |
| --- | --- |
| index.md | `/java/lessons/index/` |
| setup.md | `/java/setup/` |
| console-input / console-menu / console-dto | `/java/lessons/<slug>/` |
| database / console-register / console-list / console-edit | `/java/lessons/<slug>/` |
| web-flow / web-register / web-crud | `/java/lessons/<slug>/` |
| extra / exercises | `/java/exercises/<slug>/` |
| troubleshooting / glossary / validation / publishing | `/java/lessons/<slug>/` |
| 全学習ZIP・manifest | `/downloads/java/<file>` |
| ダウンロード一覧 | `/java/downloads/` |

`validation`と`publishing`は移行元の記録であることを本文の前に明示します。今回の公開手順・検証結果はこの新リポジトリのREADME・docsに分離しています。

9開始ZIP＋完成版＋SQLキットの11 ZIPは、移行元の公開manifestとSHA-256・バイト数・エントリー数が**すべて一致**します。元スクリプトをコピー先で動かすため、元フォルダーのビルドやリリースは上書きしません。

## 編集元と安全性

`src/content/java/`をWeb原稿の編集元とします。`upstream/java/course/`は旧生成検査を保つための移行時スナップショットです。完成コードの編集元は安全な`upstream/java/Todo/`と`TodoJSP/`です。元ソースを修正して再移行する方式に切り替える場合は、コピー先での変更との競合をレビューしてください。

公開サイトにはdistの40 HTML・静的検索索引・CSS/JS・favicon・11学習ZIP・manifest・`.nojekyll`だけを配置します。元教材全体ZIP、講師メモ、実接続設定、JAR/class、ローカル実行データ、ソースマップは配置しません。

## 進捗の移行

新しい名前空間`technical-notes:v1:<base>`を使います。旧サイトの別origin／別URLのlocalStorageは自動で取得できません。新サイトの記録は学習記録ページからJSON書出し・読込みできます。base pathが変わる場合も書出し・読込みで移動します。

## Security追加時

今回Securityの本文・問題・未完成ページは生成していません。以下の小さな拡張で既存と同じ仕組みを利用できます。

1. `src/content/security/`へ原稿を追加し、Java同様のページ一覧JSONを作る。
2. `catalog.ts`へ分野・章・URLを登録し、area型と表示名を追加する。
3. prepareのMarkdown処理を分野共通関数に切り出す。Java固有のコード取込み・配布生成はJava側に残す。
4. `[...slug].astro`と検索索引のglobを新分野にも広げる。Shellの分野別章グループとヘッダー入口を追加する。
5. clientの分野集計を新分野へ拡張する。完了キーは既に`<分野>:<ID>`で分離しているため既存記録と衝突しない。
6. 出典、検索、パンくず、前後移動、スマホUI、base pathを検証する。

CIA等の未完成項目は、原稿が揃うまでcatalogや公開トップへ登録しない方針です。
