package com.monsterdays.dao;

import com.monsterdays.conexion.ConexionBD;
import com.monsterdays.modelo.Jugador;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** Acceso a datos de la tabla jugador: operaciones CRUD con JDBC. */
public class JugadorDAO {

    private static final String SQL_INSERTAR =
            "INSERT INTO jugador (nombre_usuario, correo) VALUES (?, ?)";
    private static final String SQL_CONSULTAR_POR_ID =
            "SELECT id_jugador, nombre_usuario, correo, fecha_registro FROM jugador WHERE id_jugador = ?";
    private static final String SQL_CONSULTAR_TODOS =
            "SELECT id_jugador, nombre_usuario, correo, fecha_registro FROM jugador ORDER BY id_jugador";
    private static final String SQL_ACTUALIZAR =
            "UPDATE jugador SET nombre_usuario = ?, correo = ? WHERE id_jugador = ?";
    private static final String SQL_ELIMINAR =
            "DELETE FROM jugador WHERE id_jugador = ?";

    /**
     * CREATE: inserta un jugador y le asigna el identificador generado.
     *
     * @return identificador generado por la base de datos
     */
    public int insertar(Jugador jugador) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia =
                     conexion.prepareStatement(SQL_INSERTAR, Statement.RETURN_GENERATED_KEYS)) {
            sentencia.setString(1, jugador.getNombreUsuario());
            sentencia.setString(2, jugador.getCorreo());
            sentencia.executeUpdate();
            try (ResultSet claves = sentencia.getGeneratedKeys()) {
                if (claves.next()) {
                    jugador.setIdJugador(claves.getInt(1));
                }
            }
            return jugador.getIdJugador();
        }
    }

    /** READ: busca un jugador por su identificador. */
    public Optional<Jugador> consultarPorId(int idJugador) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_CONSULTAR_POR_ID)) {
            sentencia.setInt(1, idJugador);
            try (ResultSet resultado = sentencia.executeQuery()) {
                if (resultado.next()) {
                    return Optional.of(mapearJugador(resultado));
                }
                return Optional.empty();
            }
        }
    }

    /** READ: lista todos los jugadores. */
    public List<Jugador> consultarTodos() throws SQLException {
        List<Jugador> jugadores = new ArrayList<>();
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_CONSULTAR_TODOS);
             ResultSet resultado = sentencia.executeQuery()) {
            while (resultado.next()) {
                jugadores.add(mapearJugador(resultado));
            }
        }
        return jugadores;
    }

    /**
     * UPDATE: modifica nombre de usuario y correo.
     *
     * @return true si el jugador existía y fue actualizado
     */
    public boolean actualizar(Jugador jugador) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_ACTUALIZAR)) {
            sentencia.setString(1, jugador.getNombreUsuario());
            sentencia.setString(2, jugador.getCorreo());
            sentencia.setInt(3, jugador.getIdJugador());
            return sentencia.executeUpdate() > 0;
        }
    }

    /**
     * DELETE: elimina un jugador (su progreso se borra en cascada).
     *
     * @return true si el jugador existía y fue eliminado
     */
    public boolean eliminar(int idJugador) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_ELIMINAR)) {
            sentencia.setInt(1, idJugador);
            return sentencia.executeUpdate() > 0;
        }
    }

    private Jugador mapearJugador(ResultSet resultado) throws SQLException {
        Jugador jugador = new Jugador();
        jugador.setIdJugador(resultado.getInt("id_jugador"));
        jugador.setNombreUsuario(resultado.getString("nombre_usuario"));
        jugador.setCorreo(resultado.getString("correo"));
        Timestamp fecha = resultado.getTimestamp("fecha_registro");
        if (fecha != null) {
            jugador.setFechaRegistro(fecha.toLocalDateTime());
        }
        return jugador;
    }
}

