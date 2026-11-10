# 専用パブリックリポジトリへの移行手順

## 1. 公開物を生成する

作業フォルダーのルートで実行します。

```powershell
node scripts/package.mjs
node scripts/check.mjs
```

Node.js 22以降を使用します。npmパッケージのインストールは不要です。`release/java-study-public/`または`release/java-study-public.zip`が移行用です。

## 2. 内容を確認する

公開対象：Todo・TodoJSPの完成版、講義原稿、生成サイト、章別開始コード、SQL例、検証・生成スクリプト。

除外対象：`.local/`・`.tools/`・`instructor-private/`・実際の`db.properties`・`*.local.sql`・class・JAR・WAR・昨年度のバックアップ。

開始コードと完成版を公開し、講師メモは公開しない方針を採用しています。公開前に所有者が教材のライセンスを選び、必要ならLICENSEを追加してください。

## 3. 専用リポジトリへ移す

新しいパブリックリポジトリを作成し、公開用フォルダーの**中身**をリポジトリのルートへ移します。元の作業フォルダー全体や、releaseフォルダー自体を入れる必要はありません。

リポジトリ作成・送信はまだ行っていません。リポジトリ名は任意で、サイトのパスには固定していません。

## 4. Pagesを有効にする

GitHubのSettings → Pages → Build and deploymentで次を選びます。

- Source：Deploy from a branch
- Branch：main
- Folder：`/docs`

`docs/index.html`が入口で、`docs/.nojekyll`により生成済みの静的ファイルを使います。サイトはMarkdown原稿をブラウザ上で変換する方式ではありません。

[GitHub公式の作成手順](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## 5. 公開後に確認する

1. トップから環境構築・DB登録・Web登録へ移動する。
2. CSSと目次の表示、狭い画面の目次ボタンを確認する。
3. 開始ZIP・完成版ZIPが取得できることを確認する。
4. 公開URLがリポジトリ名を含む場合も、画像・リンク・ZIPが切れていないことを確認する。

## 6. 更新するとき

原稿は`course/*.md`、アプリはTodo／TodoJSPのJavaソースを編集します。`node scripts/package.mjs`と`node scripts/check.mjs`を実行し、生成された公開内容を更新してください。Javaを変更した場合はビルドと動作確認も必要です。

`package.mjs`は公開対象を明示してコピーします。以前のエクスポートに今回の対象外ファイルが残っている場合、`check.mjs`が停止します。その場合は古いエクスポートを別の場所へ移して、新しく生成してください。
