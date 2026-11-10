# 5. 入力したタスクをDBへ登録する

## ゴール

コンソールで入力したタイトルと詳細を、MySQLの`tasks`へ保存できます。今回の講義試作の中心です。

## 思い出す

1. DTOからタイトルを取り出すメソッドは何ですか。
2. INSERT文の中で、タイトルと詳細はどの順に並びますか。
3. DBの接続先、ユーザー、パスワードはどこへ設定しますか。

答えは`getTitle()`、`title, detail`の順、`db.properties`です。分からなかった項目は[第3章](console-dto.md)・[第4章](database.md)・[環境構築](setup.md)へ戻って確認します。

## 今回の通り道

```text
入力 → Main.RegistTodo
          ↓ TaskDto
       TaskService.registService  入力を検査し接続を作る
          ↓ 同じTaskDto
       TaskDao.insertTask        SQLへ値を渡す
          ↓ INSERT
       tasksテーブル
          ↑ 更新件数1
       Mainが「登録完了」を表示する
```

## 開始状態を確認する

[第5章開始ZIP](assets/downloads/05-register-start.zip)を使います。環境構築のJAR取得とDB設定を行い、`Main.java`を実行してください。DB登録部分だけが未実装のため、1で登録を選ぶと「第5章：insertTaskを実装してください」と表示されます。DTO・入力確認・接続処理は用意済みです。

## 1. 接続の担当を読む

`service/TaskService.java`の`registService`を開きます。

{{code:Todo/com.todo/service/TaskService.java|registService}}

`validateTask`がタイトルと詳細を確認します。`openConnection()`はBaseServiceを経由してDbUtilへ接続を依頼します。`try (Connection con = ...)`は、このブロックを出るときに接続を閉じます。成功した場合も例外が起きた場合も閉じるための書き方です。

ここではSQL1文ごとに変更を確定するautoCommitを有効にしています。複数のSQLをまとめて確定する処理は今回扱いません。

## 2. DAOへSQLを書く

`Todo/com.todo/dao/TaskDao.java`の`insertTask`メソッド全体を次で置き換えます。他のメソッドとimportは残します。

{{code:Todo/com.todo/dao/TaskDao.java|insertTask}}

`con.prepareStatement(sql)`は、値を後から渡せるSQLの実行準備です。1番目の`?`はタイトル、2番目は詳細です。番号は1から数えます。利用者の文字列をSQLへ直接連結しません。

`executeUpdate()`の戻り値は、変更された行の件数です。登録では通常1が返ります。Statementはこのメソッドで閉じ、渡されたConnectionはServiceが閉じます。

## 3. 実行してDBで確かめる

```text
1:登録  2:確認  3:更新  4:削除  5:全件削除（追加）  6:終了
使用する機能を選択してください：1
タイトルを入力してください：Java の 復習
詳細を入力してください（省略可）：INSERT文を確認する
タスクの登録が完了しました。
```

MySQLで、保存された行を確認します。

```sql
SELECT id, title, detail, completed FROM tasks ORDER BY id DESC;
```

タイトルの途中の空白、詳細、日本語がそのまま入っていれば成功です。一度アプリを終了しても、この行はDBに残ります。

## 小課題

1. 詳細未入力で登録し、空文字で保存できることを確認してください。
2. タイトルを空にした場合、登録件数が増えないことを確認してください。
3. 演習前後の一覧を比較し、登録成功が何件の増加に当たるか説明してください。

### ヒント1

タイトルの規則を扱うのはServiceです。DAOのSQLを書き換えて入力チェックを追加する必要はありません。

### ヒント2

`validateTask`で例外になれば、接続やINSERTへは進みません。

## DBに接続できない場合を試す

講師の案内で、`db.properties`のポートを一時的に未使用の値へ変え、再ビルド・再実行します。「登録完了」ではなくDBエラーになることを確認した後、元に戻します。設定を変えたのに結果が変わらない場合、出力先の`bin/db.properties`が更新されたか確認してください。

## 完成条件

- 正しい入力は1件保存される。
- タイトルの入力不備では保存されない。
- DB接続失敗を登録成功として扱わない。
- Main→Service→DAO→DBの順を説明できる。

## つまずきの入口

`No suitable driver`や`Connector/Jが見つかりません`はJAR、`Access denied`は接続先と認証、`Table ... doesn't exist`はテーブルを確認します。詳細は[つまずき集](troubleshooting.md)へ進みます。
