# 9. フォームからDBへ登録する

## ゴール

フォームの入力値をDTOへ入れ、Serviceを呼び、登録後の一覧へ移動できます。エラーの入力はフォームへ戻します。

## 思い出す

- コンソール版の登録はDTO→Service→DAOの順でした。
- Web版の画面取得はdoGet、登録依頼はdoPostで受けます。
- DBの接続情報はWeb版にも配置します。

## 開始コード

[第9章開始ZIP](assets/downloads/09-web-register-start.zip)を使います。Webの登録POSTだけが未実装です。フォーム、Web版のDTO／Service／DAO、一覧表示は用意済みです。

今回の変更場所は`RegisterServlet.java`の`doPost`メソッドです。フォーム送信時の受付を実装します。

## 1. フォームと値の名前を合わせる

`WEB-INF/views/register.jsp`を開き、`method="post"`、`name="title"`、`name="detail"`を探します。`name`はJava側で値を取り出すときのキーです。

```java
request.setCharacterEncoding("UTF-8");
String title = request.getParameter("title");
String detail = request.getParameter("detail");
TaskDto task = new TaskDto();
task.setTitle(title);
task.setDetail(detail);
```

文字コードは最初のgetParameterより前に設定します。この順序を逆にすると、日本語の入力を正しく受け取れない場合があります。

## 2. 完成した受付を読む

以下で`doPost`全体を置き換えます。まず文字コード、DTO、Service、リダイレクトの4箇所を確認してください。

{{code:TodoJSP/com.todojsp/com/todojsp/controller/RegisterServlet.java|doPost}}

`WebSupport`はWebの共通処理です。フォームに入れた確認用トークンをセッションと照合します。これは講師が提供する部分で、今回の必須穴埋めにはしません。フォームを開き直さず、不正な送信だけを試すと403になります。

`request.setAttribute("task", task)`は、エラーになった場合も入力値を再表示できるようにする処理です。`IllegalArgumentException`は入力ルールの違反、`SQLException`はDB処理の失敗として分けます。

## 3. 登録後の移動を理解する

```text
GET /register → フォームを表示
POST /register → DBに登録 → redirect
GET /view → 一覧を表示
```

POST成功後にGETへ移すことで、一覧画面を再読み込みしても同じ登録POSTを繰り返しません。forwardはサーバー内部の受け渡しで、redirectはブラウザへ次のURLを開くよう依頼する点が違います。

## 小課題

1. コンソール版で登録したタスクをWebの一覧で確認してください。
2. Webから、途中に空白を含むタイトルを登録してください。
3. タイトルを空白だけにし、エラー後も詳細がフォームに残るか確認してください。
4. 正常登録の後に再読み込みし、同じ行が増えないか確認してください。

### ヒント1

ブラウザのrequiredだけでは、空白だけのタイトルを拒否できません。Service側のチェックが必要です。

### ヒント2

成功時はsendRedirect、入力エラー時はsetAttributeしてforwardする流れを比べます。

## 文字をHTMLとして解釈させない

タイトルへ`<b>テスト</b>`と入力します。太字になるのではなく、記号を含む文字として表示されるのが正しい結果です。JSPではユーザーの入力やDBの値に`c:out`を使います。

```jsp
<c:out value="${task.title}"/>
```

このタグを使うためにJSTLのAPIと実装JARを配置しています。ELの`${task.title}`だけをHTMLへ出す方法へ置き換えないでください。

## 完成条件

入力→DTO→Service→DAO→DBと、DB→一覧の流れを確認できます。入力エラー・DB失敗・再読み込み・HTML記号を含む入力も扱えます。
