# monster_days – Módulo Tienda de mejoras pasivas (web con servlets)
Evidencia GA7-220501096-AA2-EV02 · SENA – Análisis y Desarrollo de Software

Aplicación web (Jakarta Servlet 6 + JSP/JSTL + JDBC + MySQL) donde el jugador compra mejoras
permanentes para sus torretas (Arquero, Dardero, Mago, Catapulta, Lasser) con monedas.

## Requisitos
JDK 21 · Maven 3.9+ · Apache Tomcat 10.1 (Jakarta EE 10) · MySQL 8 / MariaDB 10.4+ (XAMPP sirve)

## Puesta en marcha
1. Base de datos (en este orden):
   `mysql -u root -p < ../modulo_jugadores/sql/monster_days_bd.sql`
   `mysql -u root -p < sql/tienda.sql`
2. Clave de MySQL: defina la variable de entorno `MONSTER_DB_CLAVE` (o edite `src/main/resources/db.properties` solo en su equipo; no suba la clave real).
3. Compilar: `mvn clean package` → genera `target/tienda.war`
4. Copiar `tienda.war` a `TOMCAT/webapps/` e iniciar Tomcat.
5. Abrir http://localhost:8080/tienda/

## Servlets, métodos y JSP
| URL | Servlet | Método | Vista JSP |
|---|---|---|---|
| /registro | RegistroServlet | GET (formulario) / POST (registrar) | registro.jsp |
| /entrar | EntrarServlet | GET (lista) / POST (elegir jugador → sesión) | entrar.jsp |
| /tienda?torre=mago | TiendaServlet | GET (catálogo y filtro) | tienda.jsp |
| /compra | CompraServlet | POST (valida saldo y nivel máximo) | redirige a /tienda |
| /perfil | PerfilServlet | GET | perfil.jsp |
| /salir | SalirServlet | GET | – |

Elementos JSP usados: directivas `page` y `taglib`, `<jsp:include>` (encabezado, mensajes, pie), EL `${}`, JSTL (`c:forEach`, `c:choose`, `c:if`, `c:out`), declaración `<%! %>` y expresión `<%= %>`.

## Estándar de codificación
Mismo de EV01 (`../modulo_jugadores/docs/ESTANDAR_CODIFICACION.md`): paquetes en minúscula, PascalCase/camelCase, `PreparedStatement` y try-with-resources, Javadoc, mensajes en español, capas servlet → dao → conexion y modelo que valida (`Jugador`).

## Decisiones de diseño
- Monedas: saldo inicial fijo de 500 por jugador (columna `jugador.monedas`).
- Acceso: se elige o registra un jugador y se guarda en la sesión (sin contraseña).
- Compra: una transacción (`MejoraDAO.comprar`) con `SELECT ... FOR UPDATE`; cada compra sube 1 nivel (máx. 3).

