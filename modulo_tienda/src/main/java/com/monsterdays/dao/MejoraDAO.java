package com.monsterdays.dao;

import com.monsterdays.conexion.ConexionBD;
import com.monsterdays.modelo.MejoraTorreta;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/** Acceso a datos del catálogo de mejoras y de las compras del jugador. */
public class MejoraDAO {

    private static final String SQL_LISTAR =
            "SELECT m.id_mejora, m.torreta, m.nombre, m.descripcion, m.costo, m.bonus, "
            + "m.nivel_maximo, COALESCE(c.nivel, 0) AS nivel_actual "
            + "FROM mejora_torreta m "
            + "LEFT JOIN compra_mejora c ON c.id_mejora = m.id_mejora AND c.id_jugador = ? "
            + "WHERE (? IS NULL OR m.torreta = ?) "
            + "ORDER BY m.torreta, m.id_mejora";
    private static final String SQL_SALDO =
            "SELECT monedas FROM jugador WHERE id_jugador = ? FOR UPDATE";
    private static final String SQL_MEJORA =
            "SELECT costo, nivel_maximo, nombre FROM mejora_torreta WHERE id_mejora = ?";
    private static final String SQL_NIVEL =
            "SELECT nivel FROM compra_mejora WHERE id_jugador = ? AND id_mejora = ?";
    private static final String SQL_DESCONTAR =
            "UPDATE jugador SET monedas = monedas - ? WHERE id_jugador = ?";
    private static final String SQL_INSERTAR_COMPRA =
            "INSERT INTO compra_mejora (id_jugador, id_mejora, nivel) VALUES (?, ?, 1)";
    private static final String SQL_SUBIR_NIVEL =
            "UPDATE compra_mejora SET nivel = nivel + 1 WHERE id_jugador = ? AND id_mejora = ?";

    /**
     * Lista el catálogo con el nivel que tiene el jugador en cada mejora.
     *
     * @param idJugador jugador consultado
     * @param torreta   filtro por torreta, o null para todas
     */
    public List<MejoraTorreta> listar(int idJugador, String torreta) throws SQLException {
        List<MejoraTorreta> mejoras = new ArrayList<>();
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_LISTAR)) {
            sentencia.setInt(1, idJugador);
            sentencia.setString(2, torreta);
            sentencia.setString(3, torreta);
            try (ResultSet resultado = sentencia.executeQuery()) {
                while (resultado.next()) {
                    MejoraTorreta mejora = new MejoraTorreta();
                    mejora.setIdMejora(resultado.getInt("id_mejora"));
                    mejora.setTorreta(resultado.getString("torreta"));
                    mejora.setNombre(resultado.getString("nombre"));
                    mejora.setDescripcion(resultado.getString("descripcion"));
                    mejora.setCosto(resultado.getInt("costo"));
                    mejora.setBonus(resultado.getInt("bonus"));
                    mejora.setNivelMaximo(resultado.getInt("nivel_maximo"));
                    mejora.setNivelActual(resultado.getInt("nivel_actual"));
                    mejoras.add(mejora);
                }
            }
        }
        return mejoras;
    }

    /**
     * Compra un nivel de una mejora en una sola transacción: valida saldo y
     * nivel máximo, descuenta las monedas y registra la compra.
     *
     * @return nombre de la mejora comprada
     * @throws TiendaException si no cumple una regla (mejora inexistente, nivel máximo, saldo)
     */
    public String comprar(int idJugador, int idMejora) throws SQLException, TiendaException {
        try (Connection conexion = ConexionBD.obtenerConexion()) {
            conexion.setAutoCommit(false);
            try {
                String nombre = ejecutarCompra(conexion, idJugador, idMejora);
                conexion.commit();
                return nombre;
            } catch (SQLException | TiendaException | RuntimeException e) {
                conexion.rollback();
                throw e;
            }
        }
    }

    private String ejecutarCompra(Connection conexion, int idJugador, int idMejora)
            throws SQLException, TiendaException {
        int saldo;
        try (PreparedStatement s = conexion.prepareStatement(SQL_SALDO)) {
            s.setInt(1, idJugador);
            try (ResultSet r = s.executeQuery()) {
                if (!r.next()) {
                    throw new TiendaException("El jugador no existe.");
                }
                saldo = r.getInt(1);
            }
        }
        int costo;
        int nivelMaximo;
        String nombre;
        try (PreparedStatement s = conexion.prepareStatement(SQL_MEJORA)) {
            s.setInt(1, idMejora);
            try (ResultSet r = s.executeQuery()) {
                if (!r.next()) {
                    throw new TiendaException("La mejora no existe.");
                }
                costo = r.getInt("costo");
                nivelMaximo = r.getInt("nivel_maximo");
                nombre = r.getString("nombre");
            }
        }
        int nivelActual = 0;
        try (PreparedStatement s = conexion.prepareStatement(SQL_NIVEL)) {
            s.setInt(1, idJugador);
            s.setInt(2, idMejora);
            try (ResultSet r = s.executeQuery()) {
                if (r.next()) {
                    nivelActual = r.getInt(1);
                }
            }
        }
        if (nivelActual >= nivelMaximo) {
            throw new TiendaException("La mejora \"" + nombre + "\" ya está en su nivel máximo.");
        }
        if (saldo < costo) {
            throw new TiendaException("Monedas insuficientes: tiene " + saldo
                    + " y la mejora cuesta " + costo + ".");
        }
        try (PreparedStatement s = conexion.prepareStatement(SQL_DESCONTAR)) {
            s.setInt(1, costo);
            s.setInt(2, idJugador);
            s.executeUpdate();
        }
        String sqlCompra = nivelActual == 0 ? SQL_INSERTAR_COMPRA : SQL_SUBIR_NIVEL;
        try (PreparedStatement s = conexion.prepareStatement(sqlCompra)) {
            s.setInt(1, idJugador);
            s.setInt(2, idMejora);
            s.executeUpdate();
        }
        return nombre;
    }
}
