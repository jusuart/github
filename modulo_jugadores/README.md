# Módulo de jugadores y progreso – monster_days (Java + JDBC + MySQL)

Aplicación stand-alone de consola que guarda en una base de datos MySQL los jugadores del juego y su
progreso por misión, con operaciones CRUD (insertar, consultar, actualizar y eliminar).

## Estructura
```
modulo_jugadores/
├── config/db.properties        Conexión (url, usuario, clave)
├── sql/monster_days_bd.sql     Creación de la base de datos, tablas y datos de ejemplo
├── lib/                        Aquí va el driver mysql-connector-j-X.jar
├── scripts/                    compilar_y_ejecutar.sh / .bat
├── docs/                       Estándar de codificación y lista de chequeo
└── src/main/java/com/monsterdays/
    ├── Principal.java          Punto de entrada
    ├── conexion/ConexionBD     Conexión JDBC
    ├── modelo/                 Jugador, Progreso (con validaciones)
    ├── dao/                    JugadorDAO, ProgresoDAO (CRUD)
    └── vista/MenuConsola       Menú de consola
```

## Requisitos
JDK 17 o superior · MySQL 8 o MariaDB (XAMPP sirve) · driver MySQL Connector/J en `lib/`.

## Pasos
1. Inicie MySQL y ejecute el script:  `mysql -u root -p < sql/monster_days_bd.sql`
   (o impórtelo desde phpMyAdmin).
2. Ajuste `config/db.properties` con su usuario y clave.
3. Copie `mysql-connector-j-8.x.jar` en `lib/`.
4. Desde la carpeta `modulo_jugadores`, ejecute `bash scripts/compilar_y_ejecutar.sh`
   (en Windows: `scripts\compilar_y_ejecutar.bat`). Con Maven: `mvn compile`.
