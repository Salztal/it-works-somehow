const checked='2026-11-16';
const source=(title:string,publisher:string,version:string,url:string,scope:string)=>({title,publisher,version,url,scope,checked});
export const baseline='Spring Boot 3.5.7 / Spring Framework 6.2.12 / Spring Data JPA 3.5.5（BOM 2025.0.5）/ Spring Security 6.5.6 / Hibernate ORM 6.6.33.Final / Jakarta Persistence 3.1 / Flyway 11.7.2';
export const sources:Record<string,ReturnType<typeof source>>={
 bom:source('Spring Boot 3.5.7 dependency management','Spring','3.5.7 固定タグ','https://github.com/spring-projects/spring-boot/blob/v3.5.7/spring-boot-project/spring-boot-dependencies/build.gradle','説明対象の依存版。Frameworkの版は同タグgradle.properties、Data JPAはData BOM 2025.0.5で確認。最新推奨構成や実行検証済み構成を意味しない。'),
 frameworkVersion:source('Spring Boot build properties','Spring','v3.5.7','https://github.com/spring-projects/spring-boot/blob/v3.5.7/gradle.properties','springFrameworkVersion=6.2.12を確認。'),
 dataVersion:source('Spring Data BOM','Spring','2025.0.5 固定タグ','https://github.com/spring-projects/spring-data-bom/blob/2025.0.5/bom/pom.xml','Spring Data JPA 3.5.5の対応を確認。'),
 boot:source('Auto-configuration','Spring Boot','3.5系参照（閲覧時3.5.16）','https://docs.spring.io/spring-boot/3.5/reference/using/auto-configuration.html','Starter・自動設定の考え方。教材基準3.5.7との差分に依存するAPI例は掲載しない。'),
 config:source('Externalized Configuration','Spring Boot','3.5系参照（閲覧時3.5.16）','https://docs.spring.io/spring-boot/3.5/reference/features/external-config.html','設定源の順序・外部設定。教材は通常起動の設定ファイル＜環境変数＜コマンドラインの抜粋。全設定源の順位は公式表を参照。'),
 di:source('Dependency Injection','Spring Framework','6.2系参照（閲覧時6.2.19）','https://docs.spring.io/spring-framework/reference/6.2/core/beans/dependencies/factory-collaborators.html','IoCコンテナとコンストラクタ注入。Beanのスコープ全種類はモデル対象外。'),
 mvc:source('Annotated Controllers','Spring Framework','6.2系参照','https://docs.spring.io/spring-framework/reference/6.2/web/webmvc/mvc-controller.html','Servlet MVCのリクエストマッピングと責務。WebFluxとは区別。'),
 validation:source('Validation','Spring Framework','6.2系参照','https://docs.spring.io/spring-framework/reference/6.2/web/webmvc/mvc-controller/ann-validation.html','@RequestBody・@Validとメソッド検証の区別。例外種別は適用方式によって異なる。'),
 jpa:source('Persisting Entities','Spring Data JPA','3.5系参照（閲覧時3.5.13）','https://docs.spring.io/spring-data/jpa/reference/3.5/jpa/entity-persistence.html','saveが新規判定によりpersist/mergeへ委譲すること、nullable Version優先・ID・Persistableの判定。'),
 persistence:source('Jakarta Persistence Specification','Jakarta EE','3.1 固定仕様','https://jakarta.ee/specifications/persistence/3.1/jakarta-persistence-spec-3.1','§3.2 Entityライフサイクル・merge・同期、§3.3コンテキスト、§3.4ロック。規範仕様とHibernateの実装説明を分ける。'),
 hibernate:source('Hibernate ORM User Guide','Hibernate','6.6系参照（閲覧時6.6.59.Final）','https://docs.hibernate.org/orm/6.6/userguide/html_single/','Persistence Context・Flushing・Fetching。識別子方式、AUTO flush、Dirty Checking、N+1は設定依存。基準6.6.33.Finalの実機照合は未実施。'),
 tx:source('Using @Transactional','Spring Framework','6.2系参照','https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/annotations.html','proxy mode・外部呼出し・自己呼出し・readOnly。6.2の全例外rollback既定変更オプションは教材では無効。'),
 rollback:source('Rolling Back a Declarative Transaction','Spring Framework','6.2系参照','https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/rolling-back.html','未捕捉例外に対する標準のRuntimeException/Error rollback、checked exceptionは既定で対象外、rollbackFor。'),
 propagation:source('Transaction Propagation','Spring Framework','6.2系参照','https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/tx-propagation.html','REQUIREDの物理/論理境界、rollback-only、UnexpectedRollbackException、REQUIRES_NEW。'),
 security:source('Servlet Architecture','Spring Security','6.5系参照（閲覧時6.5.11）','https://docs.spring.io/spring-security/reference/6.5/servlet/architecture.html','DelegatingFilterProxy・FilterChainProxy・SecurityFilterChain。認証方式ごとの応答差を明示。'),
 csrf:source('Cross Site Request Forgery','Spring Security','6.5系参照','https://docs.spring.io/spring-security/reference/6.5/servlet/exploits/csrf.html','Cookieセッションと状態変更要求。CSRF、認証、認可を別々に確認する。'),
 flyway:source('Versioned migrations','Redgate Flyway','継続更新資料（最終更新2024-12-23）/ 教材基準11.7.2','https://documentation.red-gate.com/flyway/flyway-concepts/migrations/versioned-migrations','Versioned migration・Schema History・checksum・適用順序の概念。DBごとのDDL失敗/rollback差は再現しない。'),
 clean:source('Clean','Redgate Flyway','継続更新資料（最終更新2026-11-12）','https://documentation.red-gate.com/flyway/reference/commands/clean','構成対象スキーマ内のオブジェクトを削除する破壊的操作。本番で使わない。教材にも実行機能はない。'),
 http:source('HTTP Semantics','IETF','RFC 9110 §9.2.2・§15','https://www.rfc-editor.org/rfc/rfc9110.html','メソッドの冪等性と応答の意味。Operation IDの永続化・競合制御は本教材の架空アプリ契約でありSpring標準機能ではない。'),
};
