package com.monsterdays.conexion;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Administra la conexión JDBC con monster_days_bd.
 * Lee db.properties desde el classpath (src/main/resources), por lo que
 * funciona dentro de Tomcat. La clave puede venir de la variable de
 * entorno MONSTER_DB_CLAVE para no escribirla en el repositorio.
 */
public final class ConexionBD {

    private static final String ARCHIVO_CONFIGURACION = "db.properties";
    private static final String VARIABLE_CLAVE = "MONSTER_DB_CLAVE";

    private ConexionBD() {
        // Clase utilitaria: no se instancia.
    }

    /**
     * Abre una nueva conexión. Quien la solicita debe cerrarla.
     *
     * @return conexión abierta con la base de datos
     * @throws SQLException si no se puede leer la configuración o conectar
     */
    public static Connection obtenerConexion() throws SQLException {
        Properties propiedades = cargarPropiedades();
        String url = propiedades.getProperty("db.url");
        String usuario = propiedades.getProperty("db.usuario");
        String clave = System.getenv(VARIABLE_CLAVE);
        if (clave == null) {
            clave = propiedades.getProperty("db.clave", "");
        }
        if (url == null || usuario == null) {
            throw new SQLException("Falta db.url o db.usuario en " + ARCHIVO_CONFIGURACION);
        }
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("No se encontró el driver de MySQL.", e);
        }
        return DriverManager.getConnection(url, usuario, clave);
    }

    private static Properties cargarPropiedades() throws SQLException {
        Properties propiedades = new Properties();
        try (InputStream entrada = ConexionBD.class.getClassLoader()
                .getResourceAsStream(ARCHIVO_CONFIGURACION)) {
            if (entrada == null) {
                throw new SQLException("No se encontró " + ARCHIVO_CONFIGURACION + " en el classpath.");
            }
            propiedades.load(entrada);
        } catch (IOException e) {
            throw new SQLException("No se pudo leer " + ARCHIVO_CONFIGURACION, e);
        }
        return propiedades;
    }
}

