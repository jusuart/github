<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Registro - monster_days</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/estilos.css">
</head>
<body>
<jsp:include page="encabezado.jsp"/>
<main>
  <h2>Registro de jugador</h2>
  <jsp:include page="mensajes.jsp"/>
  <form action="${pageContext.request.contextPath}/registro" method="post">
    <label for="nombreUsuario">Nombre de usuario (3 a 30 letras, números o _)</label>
    <input id="nombreUsuario" name="nombreUsuario" type="text" maxlength="30"
           pattern="[A-Za-z0-9_]{3,30}" required value="<c:out value='${nombreUsuario}'/>">
    <label for="correo">Correo electrónico</label>
    <input id="correo" name="correo" type="email" maxlength="100" required
           value="<c:out value='${correo}'/>">
    <button type="submit">Registrarme</button>
  </form>
  <p><a href="${pageContext.request.contextPath}/entrar">Volver</a></p>
</main>
<jsp:include page="pie.jsp"/>
</body>
</html>
