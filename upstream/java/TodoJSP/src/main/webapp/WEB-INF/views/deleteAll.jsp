<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>全件削除（追加課題） | TODO管理</title><link rel="stylesheet" href="<c:url value='/style.css'/>"></head><body><main>
<nav><a href="<c:url value='/index.jsp'/>">メニュー</a> / <a href="<c:url value='/view'/>">一覧</a></nav>
<h1>全件削除（追加課題）</h1><c:if test="${not empty error}"><p class="error" role="alert"><c:out value="${error}"/></p></c:if>
<p>この学習用DBのすべてのタスクが対象です。取り消せません。</p><c:if test="${count ne null}"><p>現在の件数：<c:out value="${count}"/></p></c:if><form method="post" action="<c:url value='/deleteAll'/>"><input type="hidden" name="csrf" value="<c:out value="${csrf}"/>"><label>確認欄に DELETE ALL と入力してください<input name="confirmation" required autocomplete="off"></label><button>全件削除を実行する</button> <a href="<c:url value='/view'/>">取り消す</a></form>
</main></body></html>
