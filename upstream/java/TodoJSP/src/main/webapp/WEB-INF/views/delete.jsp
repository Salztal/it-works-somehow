<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>タスクの削除 | TODO管理</title><link rel="stylesheet" href="<c:url value='/style.css'/>"></head><body><main>
<nav><a href="<c:url value='/index.jsp'/>">メニュー</a> / <a href="<c:url value='/view'/>">一覧</a></nav>
<h1>タスクの削除</h1><c:if test="${not empty error}"><p class="error" role="alert"><c:out value="${error}"/></p></c:if>
<form method="get"><label>対象ID<input name="id" type="number" min="1" required></label><button>対象を確認する</button></form>
<c:if test="${not empty task}"><p>ID：<c:out value="${task.id}"/> ／ <c:out value="${task.title}"/></p><p>このタスクを削除します。</p>
<form method="post" action="<c:url value='/delete'/>"><input type="hidden" name="csrf" value="<c:out value="${csrf}"/>"><input type="hidden" name="id" value="<c:out value="${task.id}"/>"><button>削除を実行する</button> <a href="<c:url value='/view'/>">取り消す</a></form></c:if>
</main></body></html>
