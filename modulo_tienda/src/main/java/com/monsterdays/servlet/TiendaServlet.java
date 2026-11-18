package com.monsterdays.servlet;

import com.monsterdays.dao.MejoraDAO;
import com.monsterdays.modelo.Jugador;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/** Catálogo de mejoras. GET /tienda y GET /tienda?torre=mago para filtrar. */
@WebServlet(name = "TiendaServlet", urlPatterns = "/tienda")
public class TiendaServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final List<String> TORRETAS =
            List.of("arquero", "dardero", "mago", "catapulta", "lasser");

    @Override
    protected void doGet(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws ServletException, IOException {
        try {
            Optional<Jugador> jugador = SesionJugador.obtener(solicitud);
            if (jugador.isEmpty()) {
                respuesta.sendRedirect(solicitud.getContextPath() + "/entrar");
                return;
            }
            String torre = solicitud.getParameter("torre");
            if (torre != null) {
                torre = torre.trim().toLowerCase();
            }
            if (torre != null && !TORRETAS.contains(torre)) {
                torre = null;
            }
            SesionJugador.trasladarMensajes(solicitud);
            solicitud.setAttribute("jugador", jugador.get());
            solicitud.setAttribute("torre", torre);
            solicitud.setAttribute("torretas", TORRETAS);
            solicitud.setAttribute("mejoras",
                    new MejoraDAO().listar(jugador.get().getIdJugador(), torre));
            solicitud.getRequestDispatcher("/WEB-INF/jsp/tienda.jsp").forward(solicitud, respuesta);
        } catch (SQLException e) {
            throw new ServletException("No se pudo consultar la tienda.", e);
        }
    }
}
