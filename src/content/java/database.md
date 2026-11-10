# 4. SQLでタスクを操作する

## ゴール

Javaを動かす前に、SQLで登録・一覧・更新・削除ができます。JavaのコードとSQLの問題を分けて調べられるようにします。

## 思い出す

タスク1件にはID、タイトル、詳細、完了状態があります。テーブルの1行がタスク1件、列が各項目に対応します。

## テーブルを読む

```sql
USE kadaidb;
DESCRIBE tasks;
```

| 列 | 意味 | ルール |
|---|---|---|
| id | タスクを区別する番号 | 主キー、自動採番 |
| title | タイトル | 必須、最大100文字 |
| detail | 詳細 | 最大1000文字、未入力は空文字 |
| completed | 完了したか | 登録時はFALSE |

IDはタイトルが同じタスク同士を区別するためにも使います。IDを自分で振り直す必要はありません。

## 一緒に実行する

```sql
INSERT INTO tasks (title, detail, completed)
VALUES ('Java の 復習', '条件分岐を確認する', FALSE);

SELECT id, title, detail, completed FROM tasks ORDER BY id ASC;
```

一覧に増えた行のIDをメモします。次の例の`123`は、実際に表示されたIDへ置き換えます。

```sql
SELECT id, title, detail, completed FROM tasks WHERE id = 123;
UPDATE tasks SET title = '復習できた', detail = '', completed = TRUE WHERE id = 123;
SELECT id, title, detail, completed FROM tasks WHERE id = 123;
DELETE FROM tasks WHERE id = 123;
SELECT id, title, detail, completed FROM tasks WHERE id = 123;
```

更新前・削除前に、同じ`WHERE`を付けたSELECTで対象を確認しましょう。`WHERE`がなければすべての行が対象になります。

## 小課題

`買い物`というタスクを1件登録し、その1件だけを完了へ変更してください。変更後の一覧で、他のタスクが変わっていないことを確認します。

### ヒント1

INSERT→SELECTでIDを確認→WHERE付きUPDATE→SELECTの順です。

### ヒント2

変更する列は`completed`、条件の列は`id`です。

## 完成条件

- 登録すると1行増える。
- 対象のIDを指定して更新・削除できる。
- 存在しないIDのSELECT結果が0件になる。

## よくある疑問

`DELETE`した後にIDが飛んでいても正常です。自動採番は欠番のない順番を保証するものではありません。`completed`はMySQLで0／1と表示される場合があります。

Javaから使うSQLの`?`は、第5章で値を渡す場所として学びます。MySQLの画面へそのまま`?`を書いたSQLを貼り付ける演習ではありません。
