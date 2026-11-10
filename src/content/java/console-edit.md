# 7. IDで更新・削除する

## ゴール

指定した1件だけを更新・削除できます。文字のID、存在しないID、削除の取り消しを扱えます。

## 思い出す

1. タイトルが同じでもタスクを区別できる列は何ですか。
2. UPDATE・DELETEで対象を絞る句は何ですか。

答えはIDとWHEREです。

## 開始コード

[第7章開始ZIP](assets/downloads/07-edit-start.zip)を使います。`TaskDao.updateTask`と`deleteTask`が未実装です。ID入力・対象取得・確認画面に相当するコンソール表示は用意済みです。

## 1. 対象を探す処理を読む

{{code:Todo/com.todo/dao/TaskDao.java|selectById}}

`id = ?`にIDを渡します。見つからない場合はnullです。DBの失敗はSQLExceptionなので、対象なしと区別できます。

Mainの`inputId`では、`Integer.parseInt`で文字列を整数へ変えます。変換できない場合はNumberFormatExceptionとなり、1以上の整数を再入力するよう案内します。Serviceでも0以下を拒否します。

## 2. 更新を実装する

SQLは次を使います。

```sql
UPDATE tasks SET title = ?, detail = ?, completed = ? WHERE id = ?
```

`insertTask`と同じくPreparedStatementをtry-with-resourcesで作り、次の順で値を渡してください。

| 番号 | DTOから取り出す値 | setter |
|---|---|---|
| 1 | タイトル | setString |
| 2 | 詳細 | setString |
| 3 | 完了状態 | setBoolean |
| 4 | ID | setInt |

最後に`executeUpdate()`の結果を返します。メソッド宣言と他のimportは残します。

## 小課題：削除も作る

`deleteTask(int id)`を実装してください。SQLは`DELETE FROM tasks WHERE id = ?`です。値を渡す箇所は1つです。

### ヒント1

登録・更新と同じ骨組みで、SQLとsetterの数だけを変えます。

### ヒント2

`stmt.setInt(1, id);`の後で`return stmt.executeUpdate();`とします。

## 動作確認の順序

1. 2件登録し、それぞれのIDをメモする。
2. 1件目のタイトル・詳細・状態を更新する。詳細を空にした場合も試す。
3. 2件目が変わっていないことを一覧で確認する。
4. 1件目の削除で`n`を入力し、残ることを確認する。
5. 同じ対象を`y`で削除し、1件だけ減ることを確認する。
6. 存在しないIDと`abc`を入力し、案内を確認する。

更新フォーム相当の入力では、全項目を入力し直します。空の詳細は「今の値を残す」ではなく「詳細を空にする」です。

## 完成条件

対象以外のタスクが変わらず、対象がないときに成功表示しません。値を変えずに更新した場合も、存在する行の更新として扱えます。

## 最後に説明する

IDをSQL文字列へ直接連結せずsetIntで渡す理由と、更新・削除の戻り値が0だった場合の表示を説明してください。
