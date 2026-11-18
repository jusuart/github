<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:if test="${not empty mensaje}"><p class="aviso ok"><c:out value="${mensaje}"/></p></c:if>
<c:if test="${not empty error}"><p class="aviso error"><c:out value="${error}"/></p></c:if>
