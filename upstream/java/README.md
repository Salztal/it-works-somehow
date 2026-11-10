# Java Study — Java 17 + MySQL 講義教材

初学者が小さな実装と動作確認を重ね、コンソール版からWeb版へ進むための講義・演習教材です。昨年度のMain／Servlet・Service・DAO・DTO・DbUtilという構成を維持しています。

| プロジェクト | 内容 |
|---|---|
| `Todo` | コンソール操作＋MySQL。登録・一覧・更新・単件削除・終了 |
| `TodoJSP` | Servlet／JSP＋同じMySQL。フォーム登録・一覧・更新・単件削除 |

両版に全件削除の追加課題も含みます。完成版は公開解答として閲覧できます。

## 教材を読む

- [講義サイト](docs/index.html)：環境構築、第1〜10章、追加課題、用語集、つまずき集など全18ページ
- [演習と配布物](docs/exercises.html)：章別の開始コード9個、完成版、SQL・設定一式
- [環境構築](docs/setup.html)：Eclipseへの読込、学習用DB、JAR、接続設定、起動
- [検証記録](VALIDATION.md)：実行環境、実施した確認、未検証の範囲

HTMLはローカルでブラウザに開いて読めます。HTTPでプレビューする場合はNode.js 22以降を用意し、ルートで以下を実行します。npm installは不要です。

```powershell
node scripts/preview.mjs
```

表示された`http://127.0.0.1:4173/java-study-preview/`を開きます。終了はCtrl+Cです。

## アプリを動かす

基準環境はJDK 17・MySQL 8.0.20・Tomcat 9。Connector/J 8.0.33とJSTLの固定版を使用します。詳細は[依存ソフトウェア一覧](DEPENDENCIES.md)を参照してください。

1. [環境構築ページ](docs/setup.html)に沿って、新しい学習用DBとユーザーを作る。
2. `scripts/dependencies.ps1`で依存JARを取得する。
3. 両版のソースフォルダー直下の`db.properties.example`を`db.properties`へコピーし、自分の接続先を設定する。
4. Eclipseに既存プロジェクトとして読み込む。TodoはMain、TodoJSPはTomcat 9で実行する。

JavaアプリとDBは手元のPCで動かします。GitHub Pagesは講義資料だけを配信します。

## 教材を更新・公開準備する

```powershell
node scripts/package.mjs
node scripts/check.mjs
```

Markdown原稿`course/`と実際のJavaコードからサイトを生成し、演習ZIP、完成版ZIP、公開用エクスポートを更新します。

- `release/java-study-public/`：専用のパブリックリポジトリへ移す内容
- `release/java-study-public.zip`：同じ内容をまとめたZIP
- [公開手順](PUBLISHING.md)：GitHub Pagesでmainブランチの`/docs`を公開する手順

公開用エクスポートには、実際のDB設定・JAR・class・検証用DB・講師メモ・昨年度のバックアップを含めません。元の作業フォルダーをそのまま手動アップロードせず、生成した公開用フォルダーを使用してください。

## 構成

| フォルダー | 内容 |
|---|---|
| `Todo/`・`TodoJSP/` | 完成版のアプリ |
| `course/` | 講義Markdown原稿 |
| `docs/` | 生成済みサイト、CSS／JS、配布ZIP |
| `sql/` | DB定義、ユーザー設定例、サンプルデータ |
| `scripts/` | 依存JAR取得、ビルド、サイト生成、公開物作成、検証 |
| `verification/` | 制作者向けの再現可能な検証コードと手順 |
| `planning/` | 制作初期の仕様・修正方針と進捗 |

ローカル制作環境だけに存在する`instructor-private/`は講師メモ、`.local/`はバックアップと検証結果、`.tools/`は検証用ソフトウェアです。これらは公開用エクスポートから除外されます。

## 制作状況

2026年10月20日：段階B〜Fの制作とローカル検証を完了。受講者PCでのEclipse操作と授業での実地評価は別途必要です。段階Gのリポジトリ作成・送信・Pages公開は未実施です。

教材の公開ライセンスは所有者が決定してください。外部ソフトウェアには各提供元のライセンスが適用されます。
