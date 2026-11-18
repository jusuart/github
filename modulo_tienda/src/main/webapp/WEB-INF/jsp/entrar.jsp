<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Entrar - monster_days</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/estilos.css">
</head>
<body>
<jsp:include page="encabezado.jsp"/>
<main>
  <h2>Elegir jugador</h2>
  <jsp:include page="mensajes.jsp"/>
  <c:choose>
    <c:when test="${empty jugadores}">
      <p>Aún no hay jugadores. <a href="${pageContext.request.contextPath}/registro">Regístrese</a>.</p>
    </c:when>
    <c:otherwise>
      <form action="${pageContext.request.contextPath}/entrar" method="post">
        <label for="idJugador">Jugador</label>
        <select id="idJugador" name="idJugador" required>
          <c:forEach var="j" items="${jugadores}">
            <option value="${j.idJugador}"><c:out value="${j.nombreUsuario}"/> (<c:out value="${j.monedas}"/> monedas)</option>
          </c:forEach>
        </select>
        <button type="submit">Entrar a la tienda</button>
      </form>
      <p>¿Jugador nuevo? <a href="${pageContext.request.contextPath}/registro">Crear cuenta</a></p>
    </c:otherwise>
  </c:choose>
</main>
<jsp:include page="pie.jsp"/>
</body>
</html>
