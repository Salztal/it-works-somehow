# Phase 7：実装・検証結果

実施日：2026-11-16（Asia/Tokyo）。以下はローカル実装・検証完了時点の記録。その後、同日のユーザー指示でPhase 7のCommit・通常Push・GitHub Pages公開が承認された。公開結果は対象CommitのGitHub Actionsで確認する。

## 作成した教材

| 項目 | 結果 |
| --- | --- |
| 講義 | S01〜S15、4 Unit、15本 |
| 実践ミッション | M1〜M5、5件。背景・事象・証拠・調査対象・判断問題・理由・未確認事項・関連講義付き |
| 確認・判断問題 | 72問、全288選択肢に個別解説。S08とS09は各9問、他は各3問 |
| 操作教材 | 8種類、全てブラウザ内の架空データ |
| 比較教材 | 14件、定義と実務で違いが重要になる場面付き |
| 新規ページ | 37（既存208 → 全245） |
| 検索文書 | 42追加（既存201 → 全243）。講義/ミッション20、操作教材8、比較14 |

Bean・DI、要求追跡、JPA、Transaction、Security FilterChain、Flyway、楽観ロック、冪等性を実装。各教材に前提、前後表、実行順序、リセット、不正操作の拒否、関連講義を設けた。条件切替は原則初期化し、冪等性ラボは再送比較のため記録を保持する。

S01〜S07は前提知識・到達目標・共通の注文APIの学習箇所を示し、S08・S09へ順につなぐ。Java・HTTP・Security・Test Designとのリンクを本文外から双方向に追加。既存原稿の大幅改稿はしていない。将来のSQL・DBカテゴリには未作成URLを作らず、JavaのDB教材を接続先とした。

## S08・S09の重点内容

S08はEntityのnew/managed/detached/removed、Contextと1次キャッシュ、同一性、persist/merge/save、新規判定、Dirty Checking、SQL時刻、flushとcommit、遅延ロード・N+1、Context終了後を扱う。元参照とmergeの管理コピーを分け、Java値・管理値・発行予定/済みSQL・Transaction内DB・確定済みDBを並べる。flush後rollback、detach後の変更無視、flush済みSQLはdetachでは取消されないことも確認できる。

S09は注文登録と在庫減算を題材に、ACID、Service境界、AOPプロキシと自己呼出し、開始/確定/取消し、標準の例外規則、rollbackFor、REQUIRED、readOnly、flush、catch、外部APIやファイルの副作用を区別する。S12でrollback-only、UnexpectedRollbackException、REQUIRES_NEWと試験設計へ発展させる。

## 自動検証

| 検査 | 結果・範囲 |
| --- | --- |
| `node scripts/verify.mjs` | PASS。型検査、ビルド、公開物、全既存カテゴリ、新Spring、実Git照合を実行 |
| Astro型検査 | 140ファイル、エラー0・警告0・ヒント0 |
| ビルド | 静的245ページ |
| 参照・アンカー・ID・公開物検査 | PASS。14,998参照、887アセット参照、秘密情報パターン・不要ファイル検査を含む |
| コンテンツ・出典・検索 | 15講義/5ミッション、72問/288分岐、出典キー・日付・版、関連ID、重複IDと検索索引を確認 |
| S08独立期待値 | 8操作系列・38時点を固定期待値表と照合。モデルから期待値を算出しない |
| S09独立期待値 | 固定24条件 × flush有無 × catch有無 = 96条件。途中の未確定状態も確認 |
| その他の操作教材 | 初期値、正常/不正操作、全条件選択肢、状態変化、入力状態の非破壊性、リセットを確認 |
| 学習記録 | 旧6カテゴリとSpring混在のversion 1 JSON往復。完了・回答・メモ・自由記述・lastを保持 |
| `node scripts/check-base.mjs` | `/` と `/it-works-somehow/` のビルド、全カテゴリ、リンク、ZIP、HTTP検査がPASS |
| HTTP配信 | 各baseで生成276ファイルのバイト一致と404を確認 |
| 最終root復元 | prepare → build → check → check:springを再実行しPASS。サブパス生成後のJava原稿もroot用に再生成 |
| `git diff --check` | PASS |

初回の実Git照合はsandboxの一時`.git/config`書込み拒否、初回のHTTP照合はloopback接続のEACCESで停止した。権限付きの同じローカル検証で再実行し、最終のverifyとcheck-baseは成功した。既存Git試験は専用の新規一時リポジトリで44時点を照合し、作業リポジトリや永続Git設定には触れていない。

## 既存教材の回帰

Network、Java、Security、Git、Test Design、HTTP・Webの全既存チェッカーがPASS。106ソースハッシュ、Java原稿18本、既存メソッド取込み5箇所、旧Network教材と問題・参考回答を保持。Javaの11学習用ZIP・264収録エントリ・ハッシュ・公開物検査もPASS。既存の操作モデル、検索、v1バックアップを再検証した。

公開済みサイトのホームも実ブラウザで読み、既存6カテゴリと従来の導線を確認した。公開サイトへ変更操作は行っていない。

## ブラウザ検証

ChatGPT in-app browserでローカル静的プレビューを検証。

- 8教材すべての初期表示と代表操作。DI生成成功/欠落、要求201/入力400、JPAの不正操作拒否・flush/rollback・mergeコピー・新規save、Transactionのchecked/rollbackFor/自己呼出し、Securityの権限403/CSRF403、Flyway V1〜V3/checksum不一致、楽観ロック競合/リセット、冪等な再送/内容不一致を確認。
- S08の回答・完了・メモ・自由記述を保存し、再読込み後に復元。JSONを書出し、その同じJSONを画面から読み込んだ後も記録が一致。既存HTTP側の完了表示も保持。
- 「Dirty Checking」の本文検索でS08を表示。
- 実CSS幅390pxと325pxを`window.innerWidth`で確認。S08本文とTransactionの条件UIにページ全体の横はみ出しなし。JPA表は幅570pxを領域内スクロールとし、本文の図もoverflow:auto。ブラウザの表示倍率が120%だったため、viewport指定値ではなく測定したCSS幅を基準とした。
- 既存6カテゴリの見出し・教材一覧が表示されることを確認。最終Springページでconsole errorなし。
- 検証後にviewportの一時変更を解除。

検証スクリーンショットはローカル保存のみとし、リリース指示に従ってCommit・公開物には含めない。

ブラウザで全96条件を個別にクリックしたわけではない。全分岐は独立期待値を用いた自動検証、ブラウザでは代表操作とUI接続を確認した。実機スマートフォン、Safari/Firefox、全支援技術でのアクセシビリティ、本番Pagesへの新教材反映は未実施。

## 説明基準・簡略化・未検証

説明基準はBoot 3.5.7、Framework 6.2.12、Data JPA 3.5.5、Security 6.5.6、Hibernate 6.6.33.Final、Jakarta Persistence 3.1、Flyway 11.7.2。[資料と版の根拠](spring-phase7-sources.md)と公開教材の台帳で追跡できる。確認日2026-11-16。系列別Referenceの閲覧時版と固定BOM版は別々に記載する。

JPAは単一行・単一Transaction・書込み可・transaction-scoped Context・OSIV/2次キャッシュなし。採番SQLとクエリ前AUTO flush、IDENTITYの早期INSERT、制約/commit失敗を省略。mergeは既存注文の操作に限定し、関連cascadeや全ライフサイクルは再現しない。確定済みDB欄は他接続の分離レベルを再現したSELECTではない。

Transactionは外側境界なし、標準proxy mode、単一DB、正常なDBで発生するアプリ例外。自己呼出し時はRepositoryが個別確定する仮定、内部catchはrollback-onlyなしの通常復帰だけ。S12のrollback-onlyやREQUIRES_NEWは本文の説明でありラボの実行モデル外。Securityは単一Chain、Flywayは架空構造変更、楽観ロックは版照合、冪等性は一意確保と原子的な記録を前提にした模型。

Javaのコンパイル、Spring Bootの起動、実DB、SQLログ、Flyway Migrationの実行、Security実環境、実API、Testcontainers、外部副作用は全て未実施。実行可能なJavaプロジェクトや模範実装の配布は作成していない。

**上記PASSはAstro上の教材と指定前提のモデルの検証結果であり、Spring Boot実機の動作検証PASSではない。**

## Gitと公開

実装開始時の作業ツリーはクリーン、HEADは`a9c48d2`。ローカル検証完了時点では未コミットだった。その後、2026-11-16のユーザー指示で今回のPhase 7変更のCommit・mainへの通常Push・GitHub Pages公開が承認された。`.local/`、検証スクリーンショット、秘密情報、一時ファイルを除外し、既存Author/Committer設定を維持する。force push、rebase、履歴改変、永続設定変更は行わない。
