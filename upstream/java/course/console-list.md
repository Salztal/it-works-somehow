# 6. 複数のタスクを一覧にする

## ゴール

DBから複数行を読み、`List<TaskDto>`として返して表示できます。0件の場合にも対応します。

## 思い出す

- INSERTなどの変更は`executeUpdate()`を使いました。
- SELECTは`executeQuery()`を使い、結果を`ResultSet`で読みます。
- タスク1件はDTOにまとめられます。

## 開始コード

[第6章開始ZIP](assets/downloads/06-list-start.zip)の`dao/TaskDao.java`を開きます。`selectAll`だけが未実装です。他の処理は用意済みなので、今回触るメソッドへ集中します。

## 一緒に作る骨組み

`selectAll`の中で、まずSQLと空のListを作ります。Listは複数のDTOを順番に入れる入れ物です。

```java
String sql = "SELECT id, title, detail, completed FROM tasks ORDER BY id ASC";
List<TaskDto> tasks = new ArrayList<>();
try (PreparedStatement stmt = con.prepareStatement(sql);
     ResultSet rs = stmt.executeQuery()) {
    // ここへ各行を読む処理を書く。
}
return tasks;
```

メソッドの宣言は`public List<TaskDto> selectAll() throws SQLException`を維持します。

## 小課題：空欄を埋める

コメント部分へ、行がある間繰り返し、ListへDTOを追加する処理を書いてください。

```java
while (/* 次の行があるか */) {
    tasks.add(/* 今の行をDTOにする */);
}
```

### ヒント1

`rs.next()`は次の行へ移動し、読み取る行があるとtrueを返します。最初の呼び出しより前は、まだ1行目を読んでいません。

### ヒント2

このDAOに用意済みの`toTask(rs)`は現在の1行をDTOに変換します。`while (rs.next()) { tasks.add(toTask(rs)); }`の形になります。

## 行からDTOへの変換を読む

{{code:Todo/com.todo/dao/TaskDao.java|toTask}}

列名で値を読み取り、DTOに設定しています。取り出す型を、DBの定義と対応させて読みましょう。

## 一緒に確かめる

1. 異なるタイトルを2件登録する。
2. メニューの2を選び、2件とも表示されることを確認する。
3. 実際の件数は演習前の行数を含むので、MySQLのSELECTと比べる。
4. 講師が用意した空の学習用DBで、「タスクはありません」を確認する。

データを消して0件にする必要がある場合は、他の演習のデータが不要か確認します。0件では空のListを返します。nullを返さないことで、呼び出し側が同じループで処理できます。

## 完成条件

- ID昇順で複数行が表示される。
- 詳細と完了状態も確認できる。
- 0件でも例外にならない。

## 最後に説明する

`while`を`if`へ変えると、2行目以降はどうなりますか。Listへ追加するDTOは、どのタイミングで新しく作られていますか。
