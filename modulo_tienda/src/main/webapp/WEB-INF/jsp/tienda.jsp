<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tienda - monster_days</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/estilos.css">
</head>
<body>
<jsp:include page="encabezado.jsp"/>
<main>
  <h2>Tienda de mejoras pasivas</h2>
  <jsp:include page="mensajes.jsp"/>

  <form action="${pageContext.request.contextPath}/tienda" method="get" class="filtro">
    <label for="torre">Filtrar por torreta</label>
    <select id="torre" name="torre">
      <option value="">Todas</option>
      <c:forEach var="t" items="${torretas}">
        <option value="${t}" ${t == torre ? 'selected' : ''}><c:out value="${t}"/></option>
      </c:forEach>
    </select>
    <button type="submit">Filtrar</button>
  </form>

  <table>
    <thead>
      <tr><th>Torreta</th><th>Mejora</th><th>Descripción</th><th>Bonus</th><th>Nivel</th><th>Costo</th><th>Acción</th></tr>
    </thead>
    <tbody>
      <c:forEach var="m" items="${mejoras}">
        <tr>
          <td><c:out value="${m.torreta}"/></td>
          <td><c:out value="${m.nombre}"/></td>
          <td><c:out value="${m.descripcion}"/></td>
          <td>+<c:out value="${m.bonus}"/>% por nivel</td>
          <td><c:out value="${m.nivelActual}"/> / <c:out value="${m.nivelMaximo}"/></td>
          <td>🪙 <c:out value="${m.costo}"/></td>
          <td>
            <c:choose>
              <c:when test="${m.alMaximo}">Máximo</c:when>
              <c:otherwise>
                <form action="${pageContext.request.contextPath}/compra" method="post">
                  <input type="hidden" name="idMejora" value="${m.idMejora}">
                  <input type="hidden" name="torre" value="<c:out value='${torre}'/>">
                  <button type="submit">Comprar</button>
                </form>
              </c:otherwise>
            </c:choose>
          </td>
        </tr>
      </c:forEach>
      <c:if test="${empty mejoras}"><tr><td colspan="7">No hay mejoras para mostrar.</td></tr></c:if>
    </tbody>
  </table>
</main>
<jsp:include page="pie.jsp"/>
</body>
</html>

