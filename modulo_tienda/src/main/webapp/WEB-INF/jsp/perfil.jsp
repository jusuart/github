<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Perfil - monster_days</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/estilos.css">
</head>
<body>
<jsp:include page="encabezado.jsp"/>
<main>
  <h2>Perfil del jugador</h2>
  <jsp:include page="mensajes.jsp"/>
  <ul>
    <li><strong>Usuario:</strong> <c:out value="${jugador.nombreUsuario}"/></li>
    <li><strong>Correo:</strong> <c:out value="${jugador.correo}"/></li>
    <li><strong>Monedas:</strong> <c:out value="${jugador.monedas}"/></li>
    <li><strong>Registrado:</strong> <c:out value="${jugador.fechaRegistro}"/></li>
  </ul>
  <h3>Mejoras compradas</h3>
  <c:choose>
    <c:when test="${empty compradas}">
      <p>Aún no ha comprado mejoras. <a href="${pageContext.request.contextPath}/tienda">Ir a la tienda</a></p>
    </c:when>
    <c:otherwise>
      <table>
        <thead><tr><th>Torreta</th><th>Mejora</th><th>Nivel</th><th>Bonus total</th></tr></thead>
        <tbody>
          <c:forEach var="m" items="${compradas}">
            <tr>
              <td><c:out value="${m.torreta}"/></td>
              <td><c:out value="${m.nombre}"/></td>
              <td><c:out value="${m.nivelActual}"/> / <c:out value="${m.nivelMaximo}"/></td>
              <td>+<c:out value="${m.bonusTotal}"/>%</td>
            </tr>
          </c:forEach>
        </tbody>
      </table>
    </c:otherwise>
  </c:choose>
</main>
<jsp:include page="pie.jsp"/>
</body>
</html>
