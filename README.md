# 技術学習ノート

Azure Network BasicsとJava Studyを統合し、Securityを追加した日本語の静的学習サイトです。Astro / TypeScript / CSSで構築し、バックエンドや外部検索サービスは使いません。移行元のフォルダーは変更していません。

Networkは24レッスン・77問の確認問題・7ミッション（追加ミッションの判断問題12問、自由記述12題）・5語の記述復習。既存6章を維持し、TCP/IPをUnit A〜Fの18章と8種類の操作教材で深めます。Javaは原稿18本、9つの開始コード、完成版、SQL・設定キットを収録しています。Securityは10ユニット・30レッスン（BASIC18 / ADVANCED9 / LUNATIC3）・独自問題90問と10種類の操作教材。生成ページは102、本文検索の対象は79教材です。

Network Phase 3の[調査・設計](docs/network-phase3-design.md)、[一次資料・仕様更新](docs/network-phase3-sources.md)、[実装・検証結果と制約](docs/network-phase3-verification.md)を参照してください。Commit・Push・公開は別途指示されるまで行いません。

Securityの[調査・設計](docs/security-design.md)、[出典・仕様更新の確認](docs/security-sources.md)、[実装・検証結果と制約](docs/security-verification.md)を参照してください。個人の非商用学習用で、IPAの公式教材ではありません。

## 開発環境

- Node.js **22.23.4**（`.nvmrc`）、pnpm **11.25.0**（package.json）。Astro 7.4.7を固定。
- Node 22.23.4と24.22.1で検証。元教材のJava実行環境はJava 17 / MySQL 8.0.20 / Tomcat 9。
- GitHub: [Salztal/it-works-somehow](https://github.com/Salztal/it-works-somehow) / ブランチ `main`。
- 公開先: [技術学習ノート](https://salztal.github.io/it-works-somehow/)（初回デプロイの状態はGitHub Actionsで確認）。

```powershell
cd E:\work\Study\technical-notes
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

pnpmがPATHにある環境では`corepack`を省略できます。CorepackのないNode配布では、`npm install --global pnpm@11.25.0`で用意してください。通常の開発URLは起動時の表示を参照します（既定 `http://127.0.0.1:4321/`）。

この端末では依存のインストールは済んでいます。パッケージマネージャーを介さず起動する場合:

```powershell
node scripts/prepare.mjs
node scripts/astro.mjs dev --host 127.0.0.1
```

## ビルド・検証・プレビュー

```powershell
pnpm verify
pnpm check:base
pnpm build
pnpm preview
```

- `verify`: 元Javaの配布生成・検査、型検査、静的ビルド、全参照・アンカー・秘密情報パターン・ZIP・移行内容、Security全教材と問題・判定・v1バックアップ・Web Crypto、Network追加教材・全採点分岐・TCP6事例・CIDR境界・VLAN/DHCP/ルート/PAT/DNS/障害判定の照合。
- `check:base`: `/` と `/it-works-somehow/` の両方でビルド・参照・ZIP・Security・HTTP配信を検査。最後は配下パス用のdistになるので、通常プレビュー前に`pnpm build`で戻します。
- `build`: `dist/`へ公開物を生成。Java ZIPは毎回安全な原本から再生成します。
- `preview`: 生成済みdistを127.0.0.1:4321で配信。Ctrl+Cで停止。ポートは環境変数`PORT`で変更できます。
- `check:types`、`check`、`check:content`、`check:security`、`check:network`を個別にも実行できます。`node scripts/check-http.mjs`は生成ファイルのHTTP取得とバイト一致を検査します。ブラウザ実操作とは別の検査です。

リポジトリ配下パスを手元で確認する例（実リポジトリ名の設定ではありません）:

```powershell
$env:BASE_PATH='/phase1-path-check/'
pnpm build
pnpm check
pnpm check:content
pnpm preview
# http://127.0.0.1:4321/phase1-path-check/
```

通常設定に戻すときはサーバーを止めて`Remove-Item Env:BASE_PATH`、`pnpm build`を実行します。

## 構造と編集対象

```text
src/content/java/          講義Markdown（編集対象）
src/content/java-pages.json 章名・順序・所属・説明
src/content/network/       原本どおりの構造化教材・図・問題・解答
src/content/security/      30レッスンの独自原稿・図解データ・問題・全選択肢理由・出典
src/lib/catalog.ts         URL・分野・目次の定義
src/lib/client.ts          検索・記録・問題判定の小さな共通処理
src/lib/progress.ts        v1記録形式の検証・問題判定（純粋関数）
src/lib/security-*.ts      操作教材の表示制御・判定モデル・Web Crypto処理
src/layouts/              共通レイアウト
src/components/           教材本文・一覧
src/styles/site.css       共通CSS
src/generated/            原稿の派生物（編集・Git管理しない）
upstream/network/         移行元の参照スナップショットとMITライセンス
upstream/java/            公開許可リストでコピーした完成コード・生成検査処理
public/downloads/java/    自動生成する学習用ZIP（Git管理しない）
public/samples/security/  自動生成する合成TLS外形PCAP（実通信・有効な暗号文ではない）
scripts/                  統合生成と検証
docs/                     調査・移行・UI検収・検証記録
migration-manifest.json   ファイルごとの由来・元ハッシュ
```

元Javaの`package.mjs`、`check.mjs`は`upstream/java/`内で実行します。元作業フォルダーはビルド時に参照しません。生成される旧docs・releaseはGit対象外で、distへも入りません。`scripts/import-assets.mjs`は初回移行用です。再実行すると原稿を上書きするため、通常更新で実行しないでください。

## 教材を追加・変更する

Javaの新しいページは`src/content/java/<slug>.md`へ追加し、`java-pages.json`へ`[slug, 目次名, 章番号, 所属, 説明]`を追加します。所属は`lessons`か`exercises`です。ページ内の相対Markdownリンクと`assets/downloads/...`はprepareがbase付きURLへ変換します。未知の原稿リンクではビルドを停止します。

既存の`{{code:Todo/.../File.java|methodName}}`記法は、安全な公開ソースのメソッドを取り込みます。コード変更時は`upstream/java/`の完成コード・講義・配布物を一緒に確認してください。配布の対象や章別ZIPを増やす場合は既存`upstream/java/scripts/package.mjs`を拡張します。

`migration-manifest.json`はPhase 1の原本照合用です。既存の移行ファイルを意図的に変更すると`check:content`が停止します。原ハッシュは失わず変更の理由と新ハッシュを変更記録へ残し、検証基準も同じ変更として更新してください。新規教材を追加するだけなら既存原本のハッシュ更新は不要です。

Networkの既存原稿は`src/content/network/course.json`に維持します。移行した23問・3ミッションは原本照合を行うため、既存内容の変更は教材レビューと検証基準の更新を伴います。新規の編集対象は`foundations.json`（07〜24章）、`missions.json`（M4〜M7）、`sources.json`（資料台帳）、`src/lib/network-model.ts`（操作判定）、`network-client.ts`（表示制御）、`NetworkFoundation.astro`と`NetworkLab.astro`です。問題の正解indexは選択肢の元の順番を基準にし、IDと問題順は進捗キーとして維持してください。共通のv1保存形式は変更していません。

詳しくは[移行・拡張設計](docs/02-migration.md)を参照してください。

## 公開前の確認

1. `pnpm verify`、`pnpm check:base`を実行する。
2. PCとスマホで代表教材、検索、選択問題、進捗、Javaダウンロードを確認する。
3. distとZIPの検査が通ることを確認する。実接続設定、講師メモ、JAR/class、検証データは持ち込まない。
4. Java Studyの公開ライセンスを所有者が確認する（元教材はライセンス未指定）。NetworkのMIT表記を維持する。
5. 公開先とブランチを確認し、コミットのAuthor・CommitterがGitHubのnoreplyを使用していることを確認する。

## GitHub Pagesへ公開する

このフォルダーだけを新リポジトリのルートとして使います。元2フォルダーを一緒にpushしないでください。

```powershell
git add .
git commit -m "Initial commit: integrate Network and Java study materials"
# origin: https://github.com/Salztal/it-works-somehow.git
git push -u origin main
```

GitHubのSettings → Pages → Sourceを**GitHub Actions**にします。`.github/workflows/pages.yml`はPRで検査し、mainへのpushまたは手動実行で検査後にPagesへデプロイします。実際のoriginとbase pathは`configure-pages`の出力から取得するため、リポジトリ名のハードコードはありません。カスタムドメインにも対応する設定です。初回登録時の検査と個人情報保護の方針は[公開準備記録](docs/05-publication.md)を参照してください。

公式仕様: [AstroのPagesデプロイ](https://docs.astro.build/en/guides/deploy/github/)、[GitHub configure-pages](https://github.com/actions/configure-pages)。

## 検証資料と制約

- [資産調査・設計判断](docs/01-asset-audit.md)
- [移行内容・将来拡張](docs/02-migration.md)
- [UI検収と画面キャプチャ](docs/03-ui-review.md)
- [実施した検証と未検証事項](docs/04-validation.md)

進捗はブラウザとbase pathごとに保存します。旧URLのlocalStorageは自動取得できません。JSONの書出し・読込みを用意しています。実MySQLのCRUD・Tomcat上でのHTTP/JSP動作、実機Safari、実GitHub Pages上の公開は今回の再検証に含みません。今回のNetwork操作教材は教育用の限定モデルです。新規PCAPは追加せず、通信例は合成テキストとして区別しています。
