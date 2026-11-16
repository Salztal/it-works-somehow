# Phase 7：Spring Boot・業務アプリ設計 調査・設計

作業日：2026-11-16。対象：`technical-notes`（originはSalztal/it-works-somehow）。開始時のmainは`a9c48d2`、作業ツリーに変更なし。既存README・ルート・生成物はNetwork / Java / Security / Git / Test Design / HTTP・Webの6カテゴリ、208 HTML、201検索文書。公開済みPhase 6の構成・検証記録を基準に、既存ファイルの原稿とIDを維持する。

## 実装の範囲

- `/spring/`に4 Unit、S01〜S15、M1〜M5を追加。S01〜S07は起動・DI・要求・JPAへの導線、S08・S09は各9問と重点説明、S10以降は既存設計の調査へ進める。
- 全編同じ架空の注文API。前提知識、学習箇所、事象、原因、概念図、比較、操作、判断問題、全選択肢の理由、出典を表示する。
- 8操作教材はDI、要求追跡、JPA、Transaction、Security、Flyway、楽観ロック、冪等性。Java・DB・外部APIは起動/接続しない。
- 14比較、8つの疑問別入口、講義間の前後リンク、Java / HTTP・Web / Security / Test Designとの双方向リンクを追加。既存原稿は書き換えず外側の関連欄を拡張する。将来のSQL・DBカテゴリは未作成URLを生成せずJavaのDB教材へ接続する。

## 状態と表示

JPAは元参照、管理コピー、管理状態、発行予定SQL、発行済みSQL、Transaction内DB、確定済みDBを別々に表示する。mergeの元参照と戻り値、detach前の発行済みSQLを区別。Transactionは開始、注文、flush有無、例外判定、在庫、最終判定を一段ずつ進める。catchで発生した例外と呼出し元への伝播も別表示にする。

各操作は純粋な状態遷移を返す。不正操作は例外としてUIで捕捉し、既存状態を保持する。前後表・順序ログ・条件・リセットを全教材で共通化。条件変更で初期化するが、冪等性ラボだけは再送比較のため記録を保持する。実験状態は再読込みで消え、学習記録とは別。

JPAとTransactionの独立期待値は` scripts/fixtures/spring-expectations.json `。モデルの結果を計算して期待値を生成しない。SQLの時刻、Context寿命、外側境界、例外の観測箇所は各教材に明示し、完全なSpring実装を再現しない。

## 互換性

既存URL・問題ID・原稿・Java配布・操作教材は保持。新教材のIDは`spring-s01`等、完了/メモキーは`spring:spring-s01`等、回答キーは既存規約の`spring-s01:0`等。保存先`technical-notes:v1:${base}`、version 1の6フィールド、バックアップ形式、全既存キーは変更しない。検索と進捗の対象へ新教材を追加する。

baseは既存の`href()`とAstro設定を利用し、ハードコードしたリポジトリ名を新規UIに入れない。幅の広い表と図を領域内でスクロール可能にする。新規HTMLは37、検索文書は42を追加する。

## 公開方針

以下は当初のローカル実装範囲。2026-11-16のユーザー指示で、Phase 7のCommit・mainへの通常Push・GitHub Pages公開が追加承認された。検証ログ・スクリーンショット・秘密情報・一時ファイルを含めず、既存のAuthor/Committer設定とGit履歴を維持する。

ローカル実装・検証まで。作業リポジトリのCommit、Push、本番公開、Git履歴改変、Author/Committerの永続設定変更は行わない。既存Git教材の回帰は試験専用の新規一時リポジトリ内だけで行う。Springプロジェクト・Maven/Gradle配布・実DB・実Migrationは作らない。
