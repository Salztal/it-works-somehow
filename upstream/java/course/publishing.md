# 制作者向け：GitHub Pages公開の準備

## 公開するもの

講義サイト、開始コード、完成版コード、SQLの例、制作・検証スクリプトを公開対象にします。講師メモ、実際のDB設定、JAR、ビルド結果、昨年度のバックアップ、検証DBは含めません。

ルートフォルダー全体をそのままアップロードせず、生成された`release/java-study-public`を専用リポジトリの初期内容として使う方法を推奨します。Gitのignoreは、手動アップロードや過去に追跡済みのファイルを自動で保護するものではありません。

## 手順

1. Node.js 22以降を用意する。外部npmパッケージのインストールは不要。
2. ルートで`node scripts/package.mjs`を実行し、配布物・サイト・公開用フォルダーを生成する。
3. `node scripts/check.mjs`でリンク・配布物・公開除外対象を確認する。
4. `release/java-study-public`の内容を専用のパブリックリポジトリへ移す。
5. GitHubのSettings→Pagesで、Deploy from a branch、main、`/docs`を選ぶ。
6. 公開後にトップ、各章、画像・CSS・ZIPの取得を確認する。

サイトはMarkdown原稿から生成済みのHTMLを使用し、`docs/.nojekyll`を含みます。すべてのサイト内リンクは相対パスなので、リポジトリ名を含むURLにも対応します。[GitHub公式の作成手順](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## 更新する場合

`course/*.md`を編集して、再び`node scripts/package.mjs`と`node scripts/check.mjs`を実行します。生成先の`docs/*.html`だけを直接編集しないでください。ソースのコード例は生成時に実際のJavaファイルから取り込んでいます。

Javaのソースを変更した場合は、ビルド・動作確認を行ってから公開物を更新します。ライセンスは公開前に教材所有者が決定し、必要ならLICENSEを追加してください。

## この段階の範囲

リポジトリの作成、git push、Pagesの有効化はまだ行っていません。このページは公開時に使う手順です。
