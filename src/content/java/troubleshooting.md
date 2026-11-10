# つまずき集

エラーの最後の1行だけで判断せず、最初の原因と対象ファイルを確認します。一度に設定をいくつも変えず、1つ変えて再実行します。

## Javaが動かない・ビルドできない

| 表示・現象 | 確認すること |
|---|---|
| java／javacが見つからない | JDKのbin、JAVA_HOME、PATH。Eclipse内のJRE設定とは別に確認する |
| JavaSE-17が見つからない | EclipseへJDK 17を登録し、実行環境JavaSE-17へ割り当てる |
| Scanner／TaskDtoを解決できない | import、パッケージ、開いたプロジェクト、ソースフォルダーを確認する |
| コンパイル結果と編集内容が違う | 保存、プロジェクトの更新、クリーン、実行構成の対象を確認する |
| UnsupportedOperationException：第○章 | 開始コードの意図した未実装箇所。該当するメソッドを課題どおりに実装する |

## DBへ接続できない

| 表示・現象 | 最初に確認すること |
|---|---|
| db.propertiesがクラスパスにありません | ソースフォルダー直下へ設定をコピーしたか。出力先のbin／WEB-INF/classesにコピーされたか |
| Connector/Jが見つかりません | 指定版のJARの配置、Eclipseのビルドパス、WebのWEB-INF/lib |
| Communications link failure／Connection refused | MySQLの起動、127.0.0.1、ポート番号 |
| Access denied for user | 同じhost・port・userでmysqlコマンドからログインできるか |
| Unknown database | kadaidbの作成、接続URLのDB名 |
| Table ... doesn't exist | 接続先DBとtasksの作成、大文字小文字の取り違え |
| Public Key Retrieval is not allowed | 認証と接続条件を講師へ確認。理由を理解せずURLへオプションを追加しない |

「接続できない」と「接続できたがテーブルがない」を分けるため、まずmysqlコマンドで同じ接続先へログインし、`SELECT DATABASE();`と`SHOW TABLES;`を確認します。

## 入力・SQLで困った

- 空白で文字が切れる：`next()`ではなく`nextLine()`か確認する。
- 数値入力直後に空行が入る：nextIntとnextLineを混在させていないか確認する。教材は行入力へ統一している。
- 日本語が文字化けする：ソース・実行構成・リクエスト・DB接続の各文字コードを確認する。EclipseはUTF-8、コマンド実行は`-Dfile.encoding=UTF-8`を使う。
- パラメータ番号のエラー：SQLの`?`の数と、1から始まるsetterの番号を比べる。
- 更新件数が0：指定IDが存在するかをSELECTで確認する。教材のURLでは通常、値が同じ場合も対象行として数える。独自に`useAffectedRows=true`を追加しない。
- IDが飛んでいる：自動採番の欠番は正常。採番をリセットしない。
- タイトルが長すぎる：教材はJavaのString.lengthで判定する。絵文字などは2として数える場合がある。

## Web版で困った

| 表示・現象 | 確認すること |
|---|---|
| 404 | Tomcatが起動しているか、TodoJSPを追加したか、コンテキストパスとURLが合うか |
| javax.servletを解決できない | ターゲットランタイムがTomcat 9か。Tomcat 10以降へ変更していないか |
| JSTLのURIが解決できない | API 1.2.1・実装1.2.5の2つのJARが配備されたか |
| 403 | 正規のGETフォームから開き直したか、セッションが変わっていないか。確認用トークンを削除しない |
| 500 | Tomcatのログで最初の原因を確認。JSPの閉じタグ、import、SQL、設定ファイルを切り分ける |
| 入力がnullになる | フォームのnameとgetParameterのキーが同じか |
| 更新しても表示が変わらない | POST後のURL、対象ID、DBの値、Eclipseの配備状態を確認する |

## 質問するときに伝えること

「第何章」「対象プロジェクトとファイル」「行った操作」「期待した結果」「実際の表示」「最初のエラー」を伝えます。パスワードや実際のdb.propertiesを貼り付ける必要はありません。
