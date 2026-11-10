# 使用する外部ソフトウェア

| ソフトウェア | 教材の基準 | 用途・取得元 |
|---|---|---|
| JDK | 17系 | [Eclipse Temurin](https://adoptium.net/temurin/releases/?version=17) |
| MySQL Community Server | 8.0.20 | [MySQL Archives](https://downloads.mysql.com/archives/community/) |
| Eclipse IDE | Enterprise Java and Web Developers、Java 17実行環境を設定 | [Eclipse](https://www.eclipse.org/downloads/packages/) |
| Apache Tomcat | 9.0.118（検証用固定版） | [Apache Archive](https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.118/bin/) |
| MySQL Connector/J | 8.0.33 | [公式リリースノート](https://dev.mysql.com/doc/relnotes/connector-j/en/news-8-0-33.html) |
| JSTL API | javax.servlet.jsp.jstl-api 1.2.1 | [Maven Central](https://repo.maven.apache.org/maven2/javax/servlet/jsp/jstl/javax.servlet.jsp.jstl-api/1.2.1/) |
| JSTL実装 | org.glassfish.web:javax.servlet.jsp.jstl 1.2.5 | [Maven Central](https://repo.maven.apache.org/maven2/org/glassfish/web/javax.servlet.jsp.jstl/1.2.5/) |
| Node.js | 22以降 | サイト生成・配布物作成・検証用。受講者によるJavaの実行には不要 |

JARはリポジトリと教材ZIPに同梱せず、`scripts/dependencies.ps1`で取得する。各ソフトウェアの著作権・ライセンスは提供元に帰属する。教材自体の公開ライセンスは所有者が決定するまで設定しない。

MySQL・Tomcatはこの教材のローカル学習環境として使う。JavaアプリはGitHub Pagesでは実行されない。
