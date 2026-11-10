# 用語集

| 用語 | この教材での意味 | 登場する場所 |
|---|---|---|
| 変数 | 値に名前を付けて保持するもの | Mainのtitle |
| 型 | 扱う値の種類 | String、int、boolean |
| メソッド | 名前を付けた処理のまとまり | registService |
| 引数 | メソッドを呼ぶときに渡す値 | insertTask(task)のtask |
| 戻り値 | メソッドから呼び出し元へ返す値 | 登録件数1 |
| クラス | データと処理の定義 | TaskDto |
| インスタンス | クラスから作った個別の実体 | new TaskDto() |
| フィールド | インスタンスなどが保持する値 | DTOのtitle |
| getter／setter | フィールドを取り出す／設定するメソッド | getTitle／setTitle |
| DTO | 値をまとめて運ぶクラス | TaskDto |
| Service | 入力規則を確認し、操作の流れを組み立てる担当 | TaskService |
| DAO | DBへのSQL実行を担当するクラス | TaskDao |
| JDBC | JavaからDBを利用するためのAPI | java.sql |
| Connector/J | JDBCでMySQLにつなぐためのドライバ | mysql-connector-jのJAR |
| Connection | DBとの接続 | Serviceで取得・終了 |
| PreparedStatement | 値を後から渡してSQLを実行する道具 | DAO |
| プレースホルダー | SQLで値を渡す位置を示す記号 | ? |
| ResultSet | SELECTの結果を読む道具 | rs.next() |
| List | 複数の値を順に保持する入れ物 | List<TaskDto> |
| 主キー | 行を区別する値 | tasks.id |
| CRUD | 登録・取得・更新・削除 | アプリの必須機能 |
| 例外 | 通常どおり処理できないことを伝える仕組み | SQLException |
| try-with-resources | 使用後に接続などを閉じる書き方 | try (Connection ...) |
| autoCommit | SQLごとに変更を確定する設定 | この教材は有効 |
| Servlet | HTTPリクエストをJavaで受ける担当 | RegisterServlet |
| JSP | 値を受け取りHTMLを作る表示の担当 | view.jsp |
| JSTL | JSPで繰り返しや安全な文字出力を行うタグ群 | c:forEach／c:out |
| EL | JSPで属性の値を参照する書き方 | ${task.title} |
| forward | サーバー内部で処理を渡すこと | Servlet→JSP |
| redirect | ブラウザに別URLを開くよう依頼すること | POST成功→一覧 |
| セッション | 同じブラウザからの複数の依頼にまたがる値の保持 | 完了メッセージ・確認用トークン |
| エスケープ | 記号をHTMLとして解釈させず文字として出すこと | c:out |
