# 3. タスク1件をDTOにまとめる

## ゴール

タイトルと詳細を`TaskDto`へ入れ、別のメソッドから取り出せます。

## 思い出す

- 変数は値を保持します。
- メソッドの引数は、呼び出す側から値を受け取る場所です。
- `new`でクラスからインスタンスを作ります。

## 1件をまとめる理由

タイトルと詳細が別々の変数だと、渡す項目が増えるたびにメソッドの引数も増えます。`TaskDto`にタスク1件の値をまとめると、その1件をまとめて渡せます。DTO自身はDB接続や表示を担当しません。

## 開始コード

[第3章開始ZIP](assets/downloads/03-dto-start.zip)の`Main.java`と`dto/TaskDto.java`を開きます。DTOには4項目のフィールドとgetter／setterが用意されています。

`Main.main`の入力処理の後に追加します。

```java
TaskDto task = new TaskDto();
task.setTitle(title);
task.setDetail(detail);
showTask(task);
```

`showTask`は`main`メソッドの外、`Main`クラスの中に書きます。

```java
private static void showTask(TaskDto task) {
    System.out.println("タイトル：" + task.getTitle());
    System.out.println("詳細：" + task.getDetail());
}
```

## 一緒に確かめる

`title`に`Javaの復習`を入れたとき、次の順に指で追います。

```text
変数title → setTitleの引数 → DTOのtitleフィールド
DTOのtitleフィールド → getTitleの戻り値 → println
```

getterは値を取り出し、setterは値を設定します。`private`のフィールドへ別クラスから直接書き込まず、メソッドを通して操作します。

## 小課題

表示へ完了状態を加えてください。`task.setCompleted(true);`を呼ぶ場合と呼ばない場合で比較します。`true`なら`完了`、`false`なら`未完了`と表示します。

### ヒント1

値を取り出すメソッドは`getCompleted()`です。戻り値はbooleanです。

### ヒント2

`if (task.getCompleted())`で表示を分けられます。

## 完成条件

- Mainの入力値がDTOを経由して表示される。
- setterの値を変えると表示が変わる。
- 状態の表示をtrue／falseで切り替えられる。

## 最後に説明する

DTOに入れただけでDBへ保存されたでしょうか。ここではまだJavaのメモリー内の値です。次の章から保存先となるDBを学びます。
