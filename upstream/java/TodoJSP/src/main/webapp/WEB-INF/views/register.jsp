<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>タスクの登録 | TODO管理</title><link rel="stylesheet" href="<c:url value='/style.css'/>"></head><body><main>
<nav><a href="<c:url value='/index.jsp'/>">メニュー</a> / <a href="<c:url value='/view'/>">一覧</a></nav>
<h1>タスクの登録</h1><c:if test="${not empty error}"><p class="error" role="alert"><c:out value="${error}"/></p></c:if>
<form method="post" action="<c:url value='/register'/>"><input type="hidden" name="csrf" value="<c:out value="${csrf}"/>">
<label>タイトル（必須・100文字以内）<input name="title" value="<c:out value="${task.title}"/>" maxlength="100" required></label>
<label>詳細（1000文字以内）<textarea name="detail" maxlength="1000" rows="4"><c:out value="${task.detail}"/></textarea></label>
<button>登録する</button></form>
</main></body></html>
