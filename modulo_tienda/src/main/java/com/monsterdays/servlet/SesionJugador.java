package com.monsterdays.servlet;

import com.monsterdays.dao.JugadorDAO;
import com.monsterdays.modelo.Jugador;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.sql.SQLException;
import java.util.Optional;

/** Utilidad para guardar y leer el jugador activo en la sesión HTTP (sin contraseña). */
final class SesionJugador {

    static final String ATRIBUTO_ID = "idJugador";
    static final String ATRIBUTO_MENSAJE = "mensaje";
    static final String ATRIBUTO_ERROR = "error";

    private SesionJugador() {
        // Clase utilitaria: no se instancia.
    }

    /** Guarda el jugador activo en una sesión nueva (evita reutilizar sesiones previas). */
    static void iniciar(HttpServletRequest solicitud, int idJugador) {
        HttpSession anterior = solicitud.getSession(false);
        if (anterior != null) {
            anterior.invalidate();
        }
        solicitud.getSession(true).setAttribute(ATRIBUTO_ID, idJugador);
    }

    /** @return el jugador activo, o vacío si no ha entrado o ya no existe */
    static Optional<Jugador> obtener(HttpServletRequest solicitud) throws SQLException {
        HttpSession sesion = solicitud.getSession(false);
        if (sesion == null || sesion.getAttribute(ATRIBUTO_ID) == null) {
            return Optional.empty();
        }
        return new JugadorDAO().consultarPorId((Integer) sesion.getAttribute(ATRIBUTO_ID));
    }

    /** Guarda un mensaje de una sola vez (se muestra tras la redirección y se borra). */
    static void avisar(HttpServletRequest solicitud, String atributo, String texto) {
        solicitud.getSession(true).setAttribute(atributo, texto);
    }

    /** Pasa los mensajes de la sesión a la solicitud y los borra de la sesión. */
    static void trasladarMensajes(HttpServletRequest solicitud) {
        HttpSession sesion = solicitud.getSession(false);
        if (sesion == null) {
            return;
        }
        for (String atributo : new String[] {ATRIBUTO_MENSAJE, ATRIBUTO_ERROR}) {
            Object valor = sesion.getAttribute(atributo);
            if (valor != null) {
                solicitud.setAttribute(atributo, valor);
                sesion.removeAttribute(atributo);
            }
        }
    }
}
