package com.monsterdays.conexion;

import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Administra la conexión JDBC con la base de datos monster_days_bd.
 * Los datos de conexión se leen de config/db.properties para no dejar
 * usuario ni clave escritos dentro del código.
 */
public final class ConexionBD {

    private static final String RUTA_CONFIGURACION = "config/db.properties";

    private ConexionBD() {
        // Clase utilitaria: no se instancia.
    }

    /**
     * Abre una nueva conexión. Quien la solicita debe cerrarla
     * (se recomienda try-with-resources).
     *
     * @return conexión abierta con la base de datos
     * @throws SQLException si no se puede leer la configuración o conectar
     */
    public static Connection obtenerConexion() throws SQLException {
        Properties propiedades = cargarPropiedades();
        String url = propiedades.getProperty("db.url");
        String usuario = propiedades.getProperty("db.usuario");
        String clave = propiedades.getProperty("db.clave", "");
        if (url == null || usuario == null) {
            throw new SQLException("Falta db.url o db.usuario en " + RUTA_CONFIGURACION);
        }
        return DriverManager.getConnection(url, usuario, clave);
    }

    private static Properties cargarPropiedades() throws SQLException {
        Properties propiedades = new Properties();
        try (FileInputStream entrada = new FileInputStream(RUTA_CONFIGURACION)) {
            propiedades.load(entrada);
        } catch (IOException e) {
            throw new SQLException("No se pudo leer " + RUTA_CONFIGURACION
                    + " (ejecute el programa desde la carpeta modulo_jugadores).", e);
        }
        return propiedades;
    }
}

