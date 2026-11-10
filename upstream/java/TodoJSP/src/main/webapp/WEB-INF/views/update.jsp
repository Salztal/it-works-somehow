<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>タスクの更新 | TODO管理</title><link rel="stylesheet" href="<c:url value='/style.css'/>"></head><body><main>
<nav><a href="<c:url value='/index.jsp'/>">メニュー</a> / <a href="<c:url value='/view'/>">一覧</a></nav>
<h1>タスクの更新</h1><c:if test="${not empty error}"><p class="error" role="alert"><c:out value="${error}"/></p></c:if>
<form method="get"><label>対象ID<input name="id" type="number" min="1" required></label><button>対象を確認する</button></form>
<c:if test="${not empty task}"><p>ID：<c:out value="${task.id}"/></p>
<form method="post" action="<c:url value='/update'/>"><input type="hidden" name="csrf" value="<c:out value="${csrf}"/>"><input type="hidden" name="id" value="<c:out value="${task.id}"/>">
<label>タイトル（必須・100文字以内）<input name="title" value="<c:out value="${task.title}"/>" maxlength="100" required></label>
<label>詳細（1000文字以内）<textarea name="detail" maxlength="1000" rows="4"><c:out value="${task.detail}"/></textarea></label>

<label>完了状態<select name="completed"><option value="0" ${task.completed ? '' : 'selected'}>未完了</option><option value="1" ${task.completed ? 'selected' : ''}>完了</option></select></label><button>更新する</button></form></c:if>
</main></body></html>
