# Lista de chequeo – GA7-220501096-AA2-EV01

| No. | Indicador de logro | Cumple | Evidencia / observaciones |
|---|---|:---:|---|
| 1 | Realiza conexiones con bases de datos utilizando JDBC | SÍ | `conexion/ConexionBD.java` usa `DriverManager.getConnection`; los DAO usan `Connection`, `PreparedStatement` y `ResultSet`. Script en `sql/monster_days_bd.sql`. |
| 2 | Aplica el CRUD | SÍ | `JugadorDAO` y `ProgresoDAO`: `insertar` (Create), `consultarPorId/consultarTodos/consultarPorJugador` (Read), `actualizar` (Update), `eliminar` (Delete). Interfaz en `vista/MenuConsola.java`. |
| 3 | Utiliza herramientas de versionamiento para el proyecto | SÍ | Repositorio Git con commits por funcionalidad (carpeta `.git` incluida y enlace en `ENLACE_REPOSITORIO.txt`). |
| 4 | Utiliza un estándar de codificación definido | SÍ | `docs/ESTANDAR_CODIFICACION.md`: nombres de paquetes, clases, métodos y variables. |

## Relación con los artefactos del proyecto
- **Historias de usuario / casos de uso:** el jugador puede registrarse y consultar, modificar o borrar su progreso de misiones.
- **Diagrama de clases:** `Jugador` (1) —— (N) `Progreso`; en la BD, `progreso.id_jugador` es clave foránea de `jugador`.
- **Prototipo / diseño:** los valores válidos (mapas `base`/`infernal`, misiones 1–4, 1–3 estrellas, dificultad
  fácil/normal/difícil) son los mismos del front-end del juego (`index.html` y `js/juego.js`).

