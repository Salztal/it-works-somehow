# 動作確認の再実行

受講者の通常演習ではなく、教材制作者向け。MySQLに新しい検証用DB`java_course_verify`を作り、`sql/01-schema.sql`のDB名を置き換えた定義を適用する。両版のローカル`db.properties`をそのDBへ向ける。

## DB連携

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File verification/integration.ps1 -JavaHome C:/tools/jdk-17 -TomcatHome C:/tools/apache-tomcat-9.0.118
```

Javaテストは、DB名が`java_course_verify`であることを確認してからテストデータを消去する。両版各28項目を確認する。通常のkadaidbで実行しない。

## HTTP／JSP

上記の検証用設定で作ったWARを、専用のTomcatで127.0.0.1:38080に配置する。ほかのアプリのTomcatへ変更せずに実行する。

```powershell
$env:TODO_TEST_DATABASE = 'java_course_verify'
node verification/web-checks.mjs
```

この検証は全件削除も実行する。HTTPだけでは接続先のDB名を確認できないため、デプロイしたWARが検証用DBを使っていることを実行者が確認する。通常のkadaidbへ向けたWARでは実行しない。

## サイトとZIP

```powershell
node scripts/package.mjs
node scripts/check.mjs
node scripts/check-exercises.mjs -JavaHome C:/tools/jdk-17 -TomcatHome C:/tools/apache-tomcat-9.0.118
```

`check-exercises.mjs`は開始ZIPを一時展開して、Java 17向けにすべてコンパイルする。DB接続設定は追加しない。

到達状態は講義のコードと完成ソースを適用して作り、基礎課題は入力付きで実行する。`-WithDatabase`を追加すると、両版のローカル設定をコピーしてDB課題の到達状態も各28項目で検証する。検証用DB名のガードはJava側で確認する。

プレビューサーバーを起動している場合は、別のターミナルから`node verification/site-checks.mjs`で、リポジトリ名付きURLでHTML・CSS／JS・配布ZIPの取得結果を原本と照合できる。
