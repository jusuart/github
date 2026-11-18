package com.monsterdays.servlet;

import com.monsterdays.dao.JugadorDAO;
import com.monsterdays.modelo.Jugador;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;

/** Registro de jugador. GET: muestra el formulario. POST: valida con Jugador y guarda. */
@WebServlet(name = "RegistroServlet", urlPatterns = "/registro")
public class RegistroServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final String VISTA = "/WEB-INF/jsp/registro.jsp";

    @Override
    protected void doGet(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws ServletException, IOException {
        solicitud.getRequestDispatcher(VISTA).forward(solicitud, respuesta);
    }

    @Override
    protected void doPost(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws ServletException, IOException {
        solicitud.setCharacterEncoding("UTF-8");
        String nombre = solicitud.getParameter("nombreUsuario");
        String correo = solicitud.getParameter("correo");
        try {
            Jugador jugador = new Jugador(nombre, correo);
            int idJugador = new JugadorDAO().insertar(jugador);
            SesionJugador.iniciar(solicitud, idJugador);
            SesionJugador.avisar(solicitud, SesionJugador.ATRIBUTO_MENSAJE,
                    "¡Bienvenido, " + jugador.getNombreUsuario() + "! Recibió 500 monedas.");
            respuesta.sendRedirect(solicitud.getContextPath() + "/perfil");
        } catch (IllegalArgumentException e) {
            mostrarError(solicitud, respuesta, nombre, correo, e.getMessage());
        } catch (SQLIntegrityConstraintViolationException e) {
            mostrarError(solicitud, respuesta, nombre, correo,
                    "Ese nombre de usuario o correo ya está registrado.");
        } catch (SQLException e) {
            throw new ServletException("No se pudo registrar el jugador.", e);
        }
    }

    private void mostrarError(HttpServletRequest solicitud, HttpServletResponse respuesta,
            String nombre, String correo, String mensaje) throws ServletException, IOException {
        solicitud.setAttribute("error", mensaje);
        solicitud.setAttribute("nombreUsuario", nombre);
        solicitud.setAttribute("correo", correo);
        solicitud.getRequestDispatcher(VISTA).forward(solicitud, respuesta);
    }
}

