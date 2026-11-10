# 0. 環境を準備する

## ゴール

Javaの出力、MySQLへの接続、コンソール版、Web版を順に確認できます。最初からすべてを同時に直そうとせず、各確認が成功してから次へ進みます。

## 使うもの

| ソフトウェア | 基準 | 確認方法 |
|---|---|---|
| JDK | 17系 | `java -version`と`javac -version` |
| MySQL Community Server | 8.0.20 | `SELECT VERSION();` |
| Eclipse | Enterprise Java and Web Developers | Java実行環境をJavaSE-17にする |
| Tomcat | 9.0.118を検証に使用 | EclipseのServer RuntimeでTomcat 9を選ぶ |
| Connector/J | 8.0.33 | JAR名を確認する |
| JSTL | API 1.2.1・実装1.2.5 | Web版のWEB-INF/libを確認する |

取得先：[Temurin JDK 17](https://adoptium.net/temurin/releases/?version=17)、[MySQL Archives](https://downloads.mysql.com/archives/community/)、[Eclipse](https://www.eclipse.org/downloads/packages/)、[Tomcat 9.0.118](https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.118/bin/)。MySQLはアーカイブで8.0.20とWindows x64を選びます。既に学習用DBが用意されている場合は講師の案内に従います。

以降の例はWindows・PowerShellを想定します。JavaのフォルダーとTomcatのフォルダーは自分の配置先に読み替えます。

## 1. Javaだけを確認する

```powershell
java -version
javac -version
```

どちらも17系であることを確認します。異なる場合、Eclipseの「設定→Java→インストール済みのJRE」にJDK 17を追加します。プロジェクトのJREシステムライブラリーもJavaSE-17にします。Eclipse自体の起動用Javaと、教材を実行するJavaは別に設定できる点に注意しましょう。

Eclipseのワークスペースと各Java実行構成の文字コードはUTF-8にします。「実行の構成→共通→エンコード」でUTF-8を選びます。

## 2. DBとテーブルを準備する

管理者としてMySQLへログインします。`mysql`が見つからなければMySQLのbinフォルダーにある`mysql.exe`を指定します。パスワードは`-p`の後に直接書かず、表示される入力欄に入力します。

```powershell
mysql -u root -p --default-character-set=utf8mb4
```

MySQLの画面で次を確認します。

```sql
SELECT VERSION();
SHOW DATABASES;
```

[SQL・設定・スクリプトZIP](assets/downloads/setup-kit.zip)を展開して、`sql`フォルダーのSQLを順に使います。教材を`E:/work/JavaStudy`へ展開した場合の例です。

```sql
SOURCE E:/work/JavaStudy/sql/01-schema.sql;
```

すでに`tasks`がある場合は停止し、講師と`SHOW CREATE TABLE kadaidb.tasks;`で内容を確認します。既存データを削除してやり直さないでください。

`sql/02-user.example.sql`を自分のローカル用にコピーし、`CHANGE_ME_LOCAL`を自分のパスワードへ置き換えて実行します。例のファイルはユーザーがまだ存在しない前提です。管理者ではなく、この学習用ユーザーをアプリの接続に使います。

```sql
SOURCE E:/work/JavaStudy/sql/02-user.local.sql;
```

別のPowerShellで、アプリと同じ接続先へログインします。

```powershell
mysql --host=127.0.0.1 --port=3306 --user=kadaiuser -p --default-character-set=utf8mb4
```

```sql
USE kadaidb;
SHOW TABLES;
SELECT id, title, detail, completed FROM tasks;
```

行が0件でも、エラーがなければ準備できています。サンプルが必要なら`sql/03-sample-data.sql`を実行します。再実行すると同じ内容が追加されます。

## 3. プロジェクトとJARを準備する

[完成版ZIP](assets/downloads/completed.zip)を展開し、Eclipseの「インポート→既存プロジェクトをワークスペースへ」で`Todo`と`TodoJSP`を読み込みます。演習用ZIPも同じプロジェクト名なので、同時に読み込まず、別のワークスペースまたは別の作業フォルダーで扱います。

展開先のルートで、依存JARを取得します。

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/dependencies.ps1
```

次の配置を確認し、Eclipseでプロジェクトを更新（F5）します。

```text
Todo/lib/mysql-connector-j-8.0.33.jar
TodoJSP/src/main/webapp/WEB-INF/lib/mysql-connector-j-8.0.33.jar
TodoJSP/src/main/webapp/WEB-INF/lib/javax.servlet.jsp.jstl-api-1.2.1.jar
TodoJSP/src/main/webapp/WEB-INF/lib/javax.servlet.jsp.jstl-1.2.5.jar
```

ネットワーク接続が制限される授業では、講師が同じ版を提供する方法を別途案内します。

## 4. 接続設定を配置する

`Todo/com.todo/db.properties.example`を同じフォルダーの`db.properties`へコピーします。`TodoJSP/com.todojsp/`でも同じ作業をします。

```properties
db.url=jdbc:mysql://127.0.0.1:3306/kadaidb?characterEncoding=UTF-8&serverTimezone=Asia/Tokyo
db.user=kadaiuser
db.password=CHANGE_ME_LOCAL
```

パスワードを自分の学習用パスワードへ変更します。設定値はproperties形式なので、初版では半角英数字の学習用パスワードを使い、空白・バックスラッシュを避けます。実際の`db.properties`とローカルユーザー設定SQLは公開しません。

## 5. コンソール版を実行する

Eclipseで`Todo/com.todo/main/Main.java`をJavaアプリケーションとして実行します。登録→確認の順に試し、MySQLで同じ行が見えることを確認します。終了は6です。

PowerShellからのビルド例も用意しています。

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1 -JavaHome C:/tools/jdk-17 -ConsoleOnly
java '-Dfile.encoding=UTF-8' -cp "Todo/bin;Todo/lib/*" main.Main
```

## 6. Web版を実行する

EclipseのServersビューからTomcat 9を追加し、実行JREにJDK 17を設定します。`TodoJSP`のターゲットランタイムをそのTomcat 9へ合わせ、サーバーへ追加して起動します。ポート8080を使う例では、ブラウザで`http://localhost:8080/TodoJSP/`を開きます。

Tomcat 10以降へ読み替えないでください。この教材は既存コードと同じ`javax.servlet`とTomcat 9を使用します。[Tomcat 9の対応仕様](https://tomcat.apache.org/migration-9.html)

Eclipseを使わない場合は、次の手順でWARを作れます。

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1 -JavaHome C:/tools/jdk-17 -TomcatHome C:/tools/apache-tomcat-9.0.118
```

`.local/TodoJSP.war`をTomcatの`webapps`へ配置し、JDK 17を設定してTomcatを起動します。WARにはローカル設定が含まれるため、公開配布には使いません。

## 確認

- JavaだけのエラーとDB接続のエラーを区別できましたか。
- コンソールで登録したタスクがWebの一覧にも出ましたか。
- `db.properties`の配置先を説明できますか。

接続できないときは[つまずき集](troubleshooting.md)の該当する表示から確認します。
