package com.monsterdays.servlet;

import com.monsterdays.dao.MejoraDAO;
import com.monsterdays.dao.TiendaException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;

/** Compra de una mejora. Solo POST: valida saldo y nivel máximo y redirige a la tienda. */
@WebServlet(name = "CompraServlet", urlPatterns = "/compra")
public class CompraServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws IOException {
        // Una compra cambia datos: no se permite por GET.
        respuesta.sendRedirect(solicitud.getContextPath() + "/tienda");
    }

    @Override
    protected void doPost(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws ServletException, IOException {
        HttpSession sesion = solicitud.getSession(false);
        if (sesion == null || sesion.getAttribute(SesionJugador.ATRIBUTO_ID) == null) {
            respuesta.sendRedirect(solicitud.getContextPath() + "/entrar");
            return;
        }
        int idJugador = (Integer) sesion.getAttribute(SesionJugador.ATRIBUTO_ID);
        String torre = solicitud.getParameter("torre");
        try {
            int idMejora = Integer.parseInt(solicitud.getParameter("idMejora"));
            String nombre = new MejoraDAO().comprar(idJugador, idMejora);
            SesionJugador.avisar(solicitud, SesionJugador.ATRIBUTO_MENSAJE,
                    "Compra realizada: " + nombre + ".");
        } catch (NumberFormatException e) {
            SesionJugador.avisar(solicitud, SesionJugador.ATRIBUTO_ERROR, "Mejora no válida.");
        } catch (TiendaException e) {
            SesionJugador.avisar(solicitud, SesionJugador.ATRIBUTO_ERROR, e.getMessage());
        } catch (SQLException e) {
            throw new ServletException("No se pudo registrar la compra.", e);
        }
        String destino = solicitud.getContextPath() + "/tienda";
        if (torre != null && !torre.isBlank()) {
            destino += "?torre=" + URLEncoder.encode(torre.trim(), StandardCharsets.UTF_8);
        }
        respuesta.sendRedirect(destino);
    }
}
