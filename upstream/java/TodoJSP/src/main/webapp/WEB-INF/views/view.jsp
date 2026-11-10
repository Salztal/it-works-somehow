<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>タスク一覧 | TODO管理</title><link rel="stylesheet" href="<c:url value='/style.css'/>"></head><body><main>
<nav><a href="<c:url value='/index.jsp'/>">メニュー</a> / <a href="<c:url value='/view'/>">一覧</a></nav>
<h1>タスク一覧</h1><c:if test="${not empty error}"><p class="error" role="alert"><c:out value="${error}"/></p></c:if>

<c:if test="${not empty sessionScope.flash}"><p role="status"><c:out value="${sessionScope.flash}"/></p><c:remove var="flash" scope="session"/></c:if>
<p><a href="<c:url value='/register'/>">タスクを登録する</a></p>
<c:if test="${empty tasks and empty error}"><p>タスクはありません。</p></c:if>
<c:if test="${not empty tasks}"><div class="table-wrap"><table><caption>登録されたタスク</caption><thead><tr><th>ID</th><th>タイトル</th><th>詳細</th><th>状態</th><th>操作</th></tr></thead><tbody>
<c:forEach var="task" items="${tasks}"><tr>
<td><c:out value="${task.id}"/></td><td><c:out value="${task.title}"/></td><td class="detail"><c:out value="${task.detail}"/></td>
<td><c:choose><c:when test="${task.completed}">完了</c:when><c:otherwise>未完了</c:otherwise></c:choose></td>
<td><c:url var="updateUrl" value="/update"><c:param name="id" value="${task.id}"/></c:url><c:url var="deleteUrl" value="/delete"><c:param name="id" value="${task.id}"/></c:url><a href="<c:out value="${updateUrl}"/>">更新</a> <a href="<c:out value="${deleteUrl}"/>">削除</a></td>
</tr></c:forEach></tbody></table></div></c:if>

</main></body></html>
