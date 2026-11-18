package com.monsterdays.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

/** Cierra la sesión del jugador (GET /salir). */
@WebServlet(name = "SalirServlet", urlPatterns = "/salir")
public class SalirServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws IOException {
        HttpSession sesion = solicitud.getSession(false);
        if (sesion != null) {
            sesion.invalidate();
        }
        respuesta.sendRedirect(solicitud.getContextPath() + "/entrar");
    }
}

