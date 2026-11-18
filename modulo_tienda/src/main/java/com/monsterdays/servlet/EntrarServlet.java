package com.monsterdays.servlet;

import com.monsterdays.dao.JugadorDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;

/** Elegir jugador. GET: muestra el formulario. POST: guarda el jugador en la sesión. */
@WebServlet(name = "EntrarServlet", urlPatterns = "/entrar")
public class EntrarServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws ServletException, IOException {
        try {
            SesionJugador.trasladarMensajes(solicitud);
            solicitud.setAttribute("jugadores", new JugadorDAO().consultarTodos());
            solicitud.getRequestDispatcher("/WEB-INF/jsp/entrar.jsp").forward(solicitud, respuesta);
        } catch (SQLException e) {
            throw new ServletException("No se pudo consultar los jugadores.", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws ServletException, IOException {
        try {
            int idJugador = Integer.parseInt(solicitud.getParameter("idJugador"));
            if (new JugadorDAO().consultarPorId(idJugador).isEmpty()) {
                throw new NumberFormatException("jugador inexistente");
            }
            SesionJugador.iniciar(solicitud, idJugador);
            respuesta.sendRedirect(solicitud.getContextPath() + "/tienda");
        } catch (NumberFormatException e) {
            SesionJugador.avisar(solicitud, SesionJugador.ATRIBUTO_ERROR, "Elija un jugador válido.");
            respuesta.sendRedirect(solicitud.getContextPath() + "/entrar");
        } catch (SQLException e) {
            throw new ServletException("No se pudo iniciar la sesión del jugador.", e);
        }
    }
}
