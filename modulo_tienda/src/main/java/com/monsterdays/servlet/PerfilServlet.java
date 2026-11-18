package com.monsterdays.servlet;

import com.monsterdays.dao.MejoraDAO;
import com.monsterdays.modelo.Jugador;
import com.monsterdays.modelo.MejoraTorreta;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/** Perfil del jugador: datos, saldo y mejoras compradas. GET /perfil. */
@WebServlet(name = "PerfilServlet", urlPatterns = "/perfil")
public class PerfilServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws ServletException, IOException {
        try {
            Optional<Jugador> jugador = SesionJugador.obtener(solicitud);
            if (jugador.isEmpty()) {
                respuesta.sendRedirect(solicitud.getContextPath() + "/entrar");
                return;
            }
            List<MejoraTorreta> compradas = new MejoraDAO()
                    .listar(jugador.get().getIdJugador(), null).stream()
                    .filter(m -> m.getNivelActual() > 0)
                    .toList();
            SesionJugador.trasladarMensajes(solicitud);
            solicitud.setAttribute("jugador", jugador.get());
            solicitud.setAttribute("compradas", compradas);
            solicitud.getRequestDispatcher("/WEB-INF/jsp/perfil.jsp").forward(solicitud, respuesta);
        } catch (SQLException e) {
            throw new ServletException("No se pudo consultar el perfil.", e);
        }
    }
}
