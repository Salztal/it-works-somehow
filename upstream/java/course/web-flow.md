# 8. ブラウザからJavaを呼ぶ

## ゴール

ブラウザ→Servlet→JSPの流れを追えます。コンソール版で学んだService・DAO・DTOの役割がWeb版でも使えると分かります。

## 思い出す

コンソール版ではMainが入力を受け、Serviceを呼び、結果を出力していました。Web版では受付をServlet、表示をJSPが担当します。

| コンソール版 | Web版 |
|---|---|
| Scanner | HTMLフォームとリクエストパラメータ |
| Mainの分岐 | ServletのURLとdoGet／doPost |
| println | JSP |
| DTO・Service・DAO | 同じ役割のDTO・Service・DAO |

## 最初に知る言葉

- リクエスト：ブラウザからサーバーへの依頼。
- レスポンス：サーバーからブラウザへの返事。
- GET：画面や情報を取得する依頼。
- POST：フォームの内容を送り、登録や更新を依頼する方法。
- forward：サーバー内部で、JSPなどへ処理を渡す。

ブラウザにはJSPのソースコードがそのまま届くのではなく、サーバーで作られたHTMLが届きます。

## 開始コード

[第8章開始ZIP](assets/downloads/08-web-flow-start.zip)の`TodoJSP`をTomcat 9で起動します。この章の開始コードでは、各ServletはJSPへforwardするところまでです。DB操作とフォーム送信はまだ行いません。

`com.todojsp/com/todojsp/controller/RegisterServlet.java`を開きます。

```java
@WebServlet("/register")
public class RegisterServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("/WEB-INF/views/register.jsp")
               .forward(request, response);
    }
}
```

`@WebServlet`は受付URLの対応です。`/TodoJSP/register`へのGETをこのServletが受け、JSPへ渡します。コンテキストパス`/TodoJSP`はWebアプリの場所です。

## 一緒に確かめる

1. メニューの登録リンクを押す。
2. URLの末尾が`/register`になることを確認する。
3. `WEB-INF/views/register.jsp`の文言を変え、再読み込みする。
4. URLに`WEB-INF/views/register.jsp`を直接指定しても、通常は直接開けないことを確かめる。

表示用JSPはWEB-INFの中に置き、Servletを入口にします。DBアクセスをJSPへ書き足さないようにします。

## 小課題

`view.jsp`の本文を「ここは一覧画面です。次の章でDBの値を表示します。」へ変え、メニューへ戻るリンクを追加してください。

### ヒント1

Webアプリ名を文字列で固定せず、現在のコンテキストパスからリンクを作ります。

### ヒント2

この章では`<a href="${pageContext.request.contextPath}/index.jsp">メニューへ戻る</a>`を使えます。ここで表示している値はサーバーのコンテキストパスです。入力された文字列を表示する際のエスケープは次章で学びます。

## 完成条件

メニューから各画面へ移動でき、画面の変更が反映されます。GETで画面を開いてもデータは増減しません。

## 最後に説明する

Mainに相当する受付と、printlnに相当する表示は、それぞれどのファイルへ分かれましたか。ブラウザからMySQLへ直接接続しているでしょうか。
