package com.monsterdays.dao;

import com.monsterdays.conexion.ConexionBD;
import com.monsterdays.modelo.Progreso;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** Acceso a datos de la tabla progreso: operaciones CRUD con JDBC. */
public class ProgresoDAO {

    private static final String COLUMNAS =
            "id_progreso, id_jugador, mapa, nivel, estrellas, dificultad, fecha_registro";
    private static final String SQL_INSERTAR =
            "INSERT INTO progreso (id_jugador, mapa, nivel, estrellas, dificultad) VALUES (?, ?, ?, ?, ?)";
    private static final String SQL_CONSULTAR_POR_ID =
            "SELECT " + COLUMNAS + " FROM progreso WHERE id_progreso = ?";
    private static final String SQL_CONSULTAR_POR_JUGADOR =
            "SELECT " + COLUMNAS + " FROM progreso WHERE id_jugador = ? ORDER BY mapa, nivel";
    private static final String SQL_CONSULTAR_TODOS =
            "SELECT " + COLUMNAS + " FROM progreso ORDER BY id_jugador, mapa, nivel";
    private static final String SQL_ACTUALIZAR =
            "UPDATE progreso SET estrellas = ?, dificultad = ? WHERE id_progreso = ?";
    private static final String SQL_ELIMINAR =
            "DELETE FROM progreso WHERE id_progreso = ?";

    /**
     * CREATE: registra una misión superada.
     *
     * @return identificador generado por la base de datos
     * @throws java.sql.SQLIntegrityConstraintViolationException si el jugador no existe
     *         o ya tiene registrada esa misión en ese mapa
     */
    public int insertar(Progreso progreso) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia =
                     conexion.prepareStatement(SQL_INSERTAR, Statement.RETURN_GENERATED_KEYS)) {
            sentencia.setInt(1, progreso.getIdJugador());
            sentencia.setString(2, progreso.getMapa());
            sentencia.setInt(3, progreso.getNivel());
            sentencia.setInt(4, progreso.getEstrellas());
            sentencia.setString(5, progreso.getDificultad());
            sentencia.executeUpdate();
            try (ResultSet claves = sentencia.getGeneratedKeys()) {
                if (claves.next()) {
                    progreso.setIdProgreso(claves.getInt(1));
                }
            }
            return progreso.getIdProgreso();
        }
    }

    /** READ: busca un registro de progreso por su identificador. */
    public Optional<Progreso> consultarPorId(int idProgreso) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_CONSULTAR_POR_ID)) {
            sentencia.setInt(1, idProgreso);
            try (ResultSet resultado = sentencia.executeQuery()) {
                if (resultado.next()) {
                    return Optional.of(mapearProgreso(resultado));
                }
                return Optional.empty();
            }
        }
    }

    /** READ: lista el progreso de un jugador. */
    public List<Progreso> consultarPorJugador(int idJugador) throws SQLException {
        List<Progreso> lista = new ArrayList<>();
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_CONSULTAR_POR_JUGADOR)) {
            sentencia.setInt(1, idJugador);
            try (ResultSet resultado = sentencia.executeQuery()) {
                while (resultado.next()) {
                    lista.add(mapearProgreso(resultado));
                }
            }
        }
        return lista;
    }

    /** READ: lista todo el progreso registrado. */
    public List<Progreso> consultarTodos() throws SQLException {
        List<Progreso> lista = new ArrayList<>();
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_CONSULTAR_TODOS);
             ResultSet resultado = sentencia.executeQuery()) {
            while (resultado.next()) {
                lista.add(mapearProgreso(resultado));
            }
        }
        return lista;
    }

    /**
     * UPDATE: modifica las estrellas y la dificultad de un registro.
     *
     * @return true si el registro existía y fue actualizado
     */
    public boolean actualizar(Progreso progreso) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_ACTUALIZAR)) {
            sentencia.setInt(1, progreso.getEstrellas());
            sentencia.setString(2, progreso.getDificultad());
            sentencia.setInt(3, progreso.getIdProgreso());
            return sentencia.executeUpdate() > 0;
        }
    }

    /**
     * DELETE: elimina un registro de progreso.
     *
     * @return true si el registro existía y fue eliminado
     */
    public boolean eliminar(int idProgreso) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_ELIMINAR)) {
            sentencia.setInt(1, idProgreso);
            return sentencia.executeUpdate() > 0;
        }
    }

    private Progreso mapearProgreso(ResultSet resultado) throws SQLException {
        Progreso progreso = new Progreso();
        progreso.setIdProgreso(resultado.getInt("id_progreso"));
        progreso.setIdJugador(resultado.getInt("id_jugador"));
        progreso.setMapa(resultado.getString("mapa"));
        progreso.setNivel(resultado.getInt("nivel"));
        progreso.setEstrellas(resultado.getInt("estrellas"));
        progreso.setDificultad(resultado.getString("dificultad"));
        Timestamp fecha = resultado.getTimestamp("fecha_registro");
        if (fecha != null) {
            progreso.setFechaRegistro(fecha.toLocalDateTime());
        }
        return progreso;
    }
}

