<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<header class="encabezado">
  <h1>⚔ monster_days</h1>
  <nav>
    <c:choose>
      <c:when test="${not empty jugador}">
        <a href="${pageContext.request.contextPath}/tienda">Tienda</a>
        <a href="${pageContext.request.contextPath}/perfil">Perfil</a>
        <span class="monedas">🪙 <c:out value="${jugador.monedas}"/></span>
        <a href="${pageContext.request.contextPath}/salir">Salir (<c:out value="${jugador.nombreUsuario}"/>)</a>
      </c:when>
      <c:otherwise>
        <a href="${pageContext.request.contextPath}/entrar">Entrar</a>
        <a href="${pageContext.request.contextPath}/registro">Registrarse</a>
      </c:otherwise>
    </c:choose>
  </nav>
</header>
