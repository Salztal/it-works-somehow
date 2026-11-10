<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TODO管理メニュー | TODO管理</title><link rel="stylesheet" href="<c:url value='/style.css'/>"></head><body><main>
<nav><a href="<c:url value='/index.jsp'/>">メニュー</a> / <a href="<c:url value='/view'/>">一覧</a></nav>
<h1>TODO管理メニュー</h1><c:if test="${not empty error}"><p class="error" role="alert"><c:out value="${error}"/></p></c:if>
<p>コンソール版と同じDBのタスクを操作します。</p><ul><li><a href="<c:url value='/register'/>">登録</a></li><li><a href="<c:url value='/view'/>">確認（一覧）</a></li><li><a href="<c:url value='/update'/>">更新</a></li><li><a href="<c:url value='/delete'/>">削除</a></li><li><a href="<c:url value='/deleteAll'/>">全件削除（追加課題）</a></li></ul></main></body></html>