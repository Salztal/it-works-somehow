# 演習と配布物

## 配布物の使い方

演習ごとに新しいフォルダーへ展開します。同じプロジェクト名を含むので、Eclipseへ同時に重複インポートしないでください。開始コードはその章の対象だけを未実装にした独立した教材です。前の章のZIPへ上書きして進める方式ではありません。

DB連携以降はJAR取得とdb.propertiesの配置が必要です。実際の接続設定・パスワード・class・JARはZIPに含みません。環境構築用のスクリプトは各アプリのZIPに含まれています。

| 章 | 開始コード | 変更する箇所 | 完成条件 |
|---|---|---|---|
| 1 | [入力](assets/downloads/01-input-start.zip) | Main.main | タイトル・詳細を受け取り表示する |
| 2 | [メニュー](assets/downloads/02-menu-start.zip) | Main.main | メニューを繰り返し6で終える |
| 3 | [DTO](assets/downloads/03-dto-start.zip) | Main.main／showTask | DTOで値を渡して表示する |
| 4 | [SQLと設定](assets/downloads/setup-kit.zip) | MySQLのSQL入力 | IDでCRUDできる |
| 5 | [DB登録](assets/downloads/05-register-start.zip) | TaskDao.insertTask | INSERTで1行増える |
| 6 | [一覧](assets/downloads/06-list-start.zip) | TaskDao.selectAll | 複数行・0件を扱える |
| 7 | [更新・削除](assets/downloads/07-edit-start.zip) | TaskDao.updateTask／deleteTask | 指定した1件だけ変更する |
| 8 | [Web画面遷移](assets/downloads/08-web-flow-start.zip) | JSP | メニューから画面へ移動する |
| 9 | [Web登録](assets/downloads/09-web-register-start.zip) | RegisterServlet.doPost | 入力を保存して一覧へ移る |
| 10 | [WebのCRUD](assets/downloads/10-web-crud-start.zip) | Web版TaskDaoの3メソッド | 一覧・更新・削除が動く |

## 完成版との比較

[完成版ソースZIP](assets/downloads/completed.zip)にはコンソール版・Web版・DB準備SQL・ビルドスクリプトが入っています。完成コードは公開しています。まず自分の対象メソッドと動作を確認し、その後で差分を比べる使い方を勧めます。

開始状態と完成版は同じ配布物生成スクリプトから作られています。開始状態の未実装メソッドは、コンパイルエラーではなく「第○章：実装してください」という案内になります。

## 全体の確認

- 登録・更新・単件削除ができる。
- 再起動してもDBにデータが残る。
- 日本語と途中の空白が保持される。
- 入力不備、対象なし、DB失敗を区別している。
- Webの入力値がHTMLとして解釈されない。
- Webの登録後に再読み込みしても行が増えない。
- どのクラスがSQLを実行しているか説明できる。

## 動作確認記録

制作時の確認内容と検証の限界は、[検証結果](validation.md)を参照してください。受講者のPCで同じ結果を確認することも、環境構築演習の一部です。
