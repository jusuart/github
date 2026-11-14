# Estándar de codificación – módulo de jugadores y progreso (monster_days)

Basado en las convenciones de código de Java (Oracle / Google Java Style), en español para mantener
coherencia con el resto del proyecto.

| Elemento | Regla | Ejemplos del proyecto |
|---|---|---|
| **Paquetes** | Minúsculas, sin guiones ni guion bajo, dominio inverso + capa. | `com.monsterdays.conexion`, `.modelo`, `.dao`, `.vista` |
| **Clases** | `PascalCase`, sustantivo en singular; los DAO terminan en `DAO`. | `Jugador`, `Progreso`, `JugadorDAO`, `ConexionBD`, `MenuConsola` |
| **Métodos** | `camelCase`, empiezan con un verbo. Operaciones CRUD: `insertar`, `consultar…`, `actualizar`, `eliminar`. | `insertar()`, `consultarPorId()`, `consultarTodos()`, `obtenerConexion()` |
| **Variables y atributos** | `camelCase`, nombres descriptivos, sin abreviaturas crípticas. | `idJugador`, `nombreUsuario`, `sentencia`, `conexion` |
| **Constantes** | `MAYUSCULAS_CON_GUION_BAJO`, `static final`. | `SQL_INSERTAR`, `NIVEL_MAXIMO`, `RUTA_CONFIGURACION` |
| **Tablas y columnas (BD)** | `snake_case` en minúsculas, tabla en singular. | `jugador`, `id_jugador`, `nombre_usuario` |
| **Restricciones (BD)** | Prefijo: `uk_` única, `fk_` foránea, `ck_` chequeo. | `uk_jugador_correo`, `fk_progreso_jugador` |

## Reglas adicionales
- Sangría de 4 espacios, llaves en la misma línea (`{`), una sentencia por línea, líneas de máximo ~110 caracteres.
- Una clase pública por archivo; el archivo se llama igual que la clase.
- Documentación Javadoc (`/** … */`) en clases y métodos públicos.
- Acceso a datos **solo** con `PreparedStatement` (evita inyección SQL) y `try-with-resources` (cierra conexiones).
- Credenciales fuera del código (`config/db.properties`).
- Separación por capas: `vista` → `dao` → `conexion`; `modelo` valida sus propios datos.
- Mensajes al usuario en español; identificadores sin tildes ni eñes.
- Commits de git en español, en infinitivo/imperativo y descriptivos (p. ej. `Agregar CRUD de jugadores`).
