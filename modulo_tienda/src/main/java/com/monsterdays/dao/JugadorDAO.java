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

/** Acceso a datos de la tabla jugador (versión web con monedas). */
public class JugadorDAO {

    private static final String COLUMNAS =
            "id_jugador, nombre_usuario, correo, fecha_registro, monedas";
    private static final String SQL_INSERTAR =
            "INSERT INTO jugador (nombre_usuario, correo) VALUES (?, ?)";
    private static final String SQL_CONSULTAR_POR_ID =
            "SELECT " + COLUMNAS + " FROM jugador WHERE id_jugador = ?";
    private static final String SQL_CONSULTAR_TODOS =
            "SELECT " + COLUMNAS + " FROM jugador ORDER BY nombre_usuario";

    /** CREATE: inserta un jugador (con el saldo inicial por defecto) y devuelve su id. */
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

    private Jugador mapearJugador(ResultSet resultado) throws SQLException {
        Jugador jugador = new Jugador();
        jugador.setIdJugador(resultado.getInt("id_jugador"));
        jugador.setNombreUsuario(resultado.getString("nombre_usuario"));
        jugador.setCorreo(resultado.getString("correo"));
        jugador.setMonedas(resultado.getInt("monedas"));
        Timestamp fecha = resultado.getTimestamp("fecha_registro");
        if (fecha != null) {
            jugador.setFechaRegistro(fecha.toLocalDateTime());
        }
        return jugador;
    }
}

