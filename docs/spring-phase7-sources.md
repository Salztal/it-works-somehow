# Phase 7：一次資料・適用版と確認範囲

公式資料確認日：2026-11-16。本文・図・例題は独自の架空事例で、文章や図の大量転載はしていない。

| 責務 | 説明基準 | 確認根拠 |
| --- | --- | --- |
| 起動・依存管理 | Spring Boot 3.5.7 | [固定タグの依存管理](https://github.com/spring-projects/spring-boot/blob/v3.5.7/spring-boot-project/spring-boot-dependencies/build.gradle) |
| DI・MVC・Transaction | Spring Framework 6.2.12 | [同タグgradle.properties](https://github.com/spring-projects/spring-boot/blob/v3.5.7/gradle.properties) |
| Repository支援 | Spring Data JPA 3.5.5 | [Data BOM 2025.0.5](https://github.com/spring-projects/spring-data-bom/blob/2025.0.5/bom/pom.xml) |
| Servletセキュリティ | Spring Security 6.5.6 | Bootの固定タグBOM |
| Persistence実装 | Hibernate ORM 6.6.33.Final | Bootの固定タグBOM |
| Persistence規範仕様 | Jakarta Persistence 3.1 | [固定版仕様](https://jakarta.ee/specifications/persistence/3.1/jakarta-persistence-spec-3.1) |
| スキーマ変更管理 | Flyway 11.7.2 | Bootの固定タグBOM、Redgateの概念資料 |

この基準は最新推奨版の提示や実機確認済み構成ではない。Boot・Framework・Data JPA・Security・Hibernateの系列別Referenceは継続更新されるため、閲覧時の表示版（それぞれ3.5.16 / 6.2.19 / 3.5.13 / 6.5.11 / 6.6.59.Final）と説明基準を分けて台帳に記載する。パッチ版間の全挙動が同一であるとは主張しない。教材では安定した基礎概念を扱い、版固有の実装コードや実行成功の主張を掲載しない。

## 論点別の照合

- Bootの[自動設定](https://docs.spring.io/spring-boot/3.5/reference/using/auto-configuration.html)と[外部設定](https://docs.spring.io/spring-boot/3.5/reference/features/external-config.html)：依存の導入と条件付き設定を区別。設定順位は通常起動の一部だけを例示。
- Frameworkの[DI](https://docs.spring.io/spring-framework/reference/6.2/core/beans/dependencies/factory-collaborators.html)、[MVC](https://docs.spring.io/spring-framework/reference/6.2/web/webmvc/mvc-controller.html)、[Validation](https://docs.spring.io/spring-framework/reference/6.2/web/webmvc/mvc-controller/ann-validation.html)：Bean登録、引数への変換、形式検証、業務判断を分ける。
- Data JPAの[Entity保存](https://docs.spring.io/spring-data/jpa/reference/3.5/jpa/entity-persistence.html)：saveのpersist/merge委譲。nullable Version優先、ID判定、Persistableによる上書きを区別。
- Jakarta仕様と[Hibernate 6.6 User Guide](https://docs.hibernate.org/orm/6.6/userguide/html_single/)：ライフサイクル、mergeの戻り値、同期と確定、同一性、flush時刻・識別子方式・fetchの実装条件を区別。
- Frameworkの[Transactional](https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/annotations.html)、[rollback規則](https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/rolling-back.html)、[伝播](https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/tx-propagation.html)：proxy modeの外部/自己呼出し、標準のRuntimeException/Error規則、checkedとrollbackFor、catchとrollback-only、REQUIRED/REQUIRES_NEW。6.2の全例外rollbackの全体設定は模型では無効。
- Securityの[Servlet構成](https://docs.spring.io/spring-security/reference/6.5/servlet/architecture.html)と[CSRF](https://docs.spring.io/spring-security/reference/6.5/servlet/exploits/csrf.html)：最初にマッチするChain、認証・認可・CSRFの違い、APIの401と画面ログインのリダイレクト差。
- Flywayの[Versioned migrations](https://documentation.red-gate.com/flyway/flyway-concepts/migrations/versioned-migrations)と[clean](https://documentation.red-gate.com/flyway/reference/commands/clean)：履歴・checksum・適用済み原稿を維持する変更、破壊的初期化の危険。DDL失敗の挙動をDB非依存に断定しない。
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)：HTTPの冪等性とステータス。Operation IDの保存・指紋・一意制約・結果再利用は架空アプリの設計契約であり、Spring標準の自動機能として説明しない。

各講義の出典キーと、公開される`/spring/sources/`の台帳は`src/content/spring/sources.ts`に集約している。技術説明が依存する版・前提を追跡できる。

## 実機照合の限界

Javaのコンパイル、Boot起動、DB接続、SQLログ、Migration適用、Security実環境、Testcontainers、外部APIは未実施。ブラウザ模型のPASSをSpring実機のPASSとして扱わない。特定構成でのSQL発行時刻、プロキシの適用可否、例外変換、DB分離/ロック、DDLの原子性は実環境で確認が必要。
