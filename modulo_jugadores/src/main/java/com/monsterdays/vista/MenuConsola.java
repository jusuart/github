package com.monsterdays.vista;

import com.monsterdays.dao.JugadorDAO;
import com.monsterdays.dao.ProgresoDAO;
import com.monsterdays.modelo.Jugador;
import com.monsterdays.modelo.Progreso;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;

/** Interfaz de consola del módulo de jugadores y progreso de monster_days. */
public class MenuConsola {

    private final Scanner teclado = new Scanner(System.in);
    private final JugadorDAO jugadorDao = new JugadorDAO();
    private final ProgresoDAO progresoDao = new ProgresoDAO();

    /** Muestra el menú principal hasta que el usuario elija salir. */
    public void iniciar() {
        int opcion;
        do {
            System.out.println("\n===== monster_days · Gestión de jugadores =====");
            System.out.println("1. Jugadores");
            System.out.println("2. Progreso de misiones");
            System.out.println("0. Salir");
            opcion = leerEntero("Opción: ");
            switch (opcion) {
                case 1 -> menuJugadores();
                case 2 -> menuProgreso();
                case 0 -> System.out.println("¡Hasta pronto, defensor del reino!");
                default -> System.out.println("Opción no válida.");
            }
        } while (opcion != 0);
    }

    /* ---------------------------- Jugadores ---------------------------- */

    private void menuJugadores() {
        int opcion;
        do {
            System.out.println("\n--- Jugadores ---");
            System.out.println("1. Registrar   2. Listar   3. Buscar por id");
            System.out.println("4. Actualizar  5. Eliminar 0. Volver");
            opcion = leerEntero("Opción: ");
            switch (opcion) {
                case 1 -> registrarJugador();
                case 2 -> listarJugadores();
                case 3 -> buscarJugador();
                case 4 -> actualizarJugador();
                case 5 -> eliminarJugador();
                case 0 -> { }
                default -> System.out.println("Opción no válida.");
            }
        } while (opcion != 0);
    }

    private void registrarJugador() {
        try {
            Jugador jugador = new Jugador(leerTexto("Nombre de usuario: "), leerTexto("Correo: "));
            int id = jugadorDao.insertar(jugador);
            System.out.println("Jugador registrado con id " + id + ".");
        } catch (IllegalArgumentException e) {
            System.out.println("Datos inválidos: " + e.getMessage());
        } catch (SQLIntegrityConstraintViolationException e) {
            System.out.println("Ya existe un jugador con ese nombre de usuario o correo.");
        } catch (SQLException e) {
            mostrarErrorBaseDatos(e);
        }
    }

    private void listarJugadores() {
        try {
            List<Jugador> jugadores = jugadorDao.consultarTodos();
            if (jugadores.isEmpty()) {
                System.out.println("No hay jugadores registrados.");
            }
            jugadores.forEach(System.out::println);
        } catch (SQLException e) {
            mostrarErrorBaseDatos(e);
        }
    }

    private void buscarJugador() {
        try {
            Optional<Jugador> jugador = jugadorDao.consultarPorId(leerEntero("Id del jugador: "));
            System.out.println(jugador.map(Jugador::toString).orElse("No se encontró el jugador."));
        } catch (SQLException e) {
            mostrarErrorBaseDatos(e);
        }
    }

    private void actualizarJugador() {
        try {
            int id = leerEntero("Id del jugador a actualizar: ");
            Optional<Jugador> encontrado = jugadorDao.consultarPorId(id);
            if (encontrado.isEmpty()) {
                System.out.println("No se encontró el jugador.");
                return;
            }
            Jugador jugador = encontrado.get();
            jugador.setNombreUsuario(leerTexto("Nuevo nombre de usuario (" + jugador.getNombreUsuario() + "): "));
            jugador.setCorreo(leerTexto("Nuevo correo (" + jugador.getCorreo() + "): "));
            System.out.println(jugadorDao.actualizar(jugador) ? "Jugador actualizado." : "No se actualizó.");
        } catch (IllegalArgumentException e) {
            System.out.println("Datos inválidos: " + e.getMessage());
        } catch (SQLIntegrityConstraintViolationException e) {
            System.out.println("Ya existe otro jugador con ese nombre de usuario o correo.");
        } catch (SQLException e) {
            mostrarErrorBaseDatos(e);
        }
    }

    private void eliminarJugador() {
        try {
            int id = leerEntero("Id del jugador a eliminar: ");
            String confirmacion = leerTexto("Se borrará también su progreso. ¿Confirma? (s/n): ");
            if (!confirmacion.equalsIgnoreCase("s")) {
                System.out.println("Operación cancelada.");
                return;
            }
            System.out.println(jugadorDao.eliminar(id) ? "Jugador eliminado." : "No se encontró el jugador.");
        } catch (SQLException e) {
            mostrarErrorBaseDatos(e);
        }
    }

    /* ---------------------------- Progreso ----------------------------- */

    private void menuProgreso() {
        int opcion;
        do {
            System.out.println("\n--- Progreso de misiones ---");
            System.out.println("1. Registrar   2. Listar todo   3. Listar por jugador");
            System.out.println("4. Actualizar  5. Eliminar      0. Volver");
            opcion = leerEntero("Opción: ");
            switch (opcion) {
                case 1 -> registrarProgreso();
                case 2 -> listarProgreso();
                case 3 -> listarProgresoPorJugador();
                case 4 -> actualizarProgreso();
                case 5 -> eliminarProgreso();
                case 0 -> { }
                default -> System.out.println("Opción no válida.");
            }
        } while (opcion != 0);
    }

    private void registrarProgreso() {
        try {
            Progreso progreso = new Progreso(
                    leerEntero("Id del jugador: "),
                    leerTexto("Mapa (base/infernal): "),
                    leerEntero("Misión (1-4): "),
                    leerEntero("Estrellas (1-3): "),
                    leerTexto("Dificultad (facil/normal/dificil): "));
            int id = progresoDao.insertar(progreso);
            System.out.println("Progreso registrado con id " + id + ".");
        } catch (IllegalArgumentException e) {
            System.out.println("Datos inválidos: " + e.getMessage());
        } catch (SQLIntegrityConstraintViolationException e) {
            System.out.println("El jugador no existe o ya tiene registrada esa misión en ese mapa.");
        } catch (SQLException e) {
            mostrarErrorBaseDatos(e);
        }
    }

    private void listarProgreso() {
        try {
            List<Progreso> lista = progresoDao.consultarTodos();
            if (lista.isEmpty()) {
                System.out.println("No hay progreso registrado.");
            }
            lista.forEach(System.out::println);
        } catch (SQLException e) {
            mostrarErrorBaseDatos(e);
        }
    }

    private void listarProgresoPorJugador() {
        try {
            List<Progreso> lista = progresoDao.consultarPorJugador(leerEntero("Id del jugador: "));
            if (lista.isEmpty()) {
                System.out.println("Ese jugador no tiene progreso registrado.");
            }
            lista.forEach(System.out::println);
        } catch (SQLException e) {
            mostrarErrorBaseDatos(e);
        }
    }

    private void actualizarProgreso() {
        try {
            int id = leerEntero("Id del progreso a actualizar: ");
            Optional<Progreso> encontrado = progresoDao.consultarPorId(id);
            if (encontrado.isEmpty()) {
                System.out.println("No se encontró el registro.");
                return;
            }
            Progreso progreso = encontrado.get();
            progreso.setEstrellas(leerEntero("Nuevas estrellas (1-3): "));
            progreso.setDificultad(leerTexto("Nueva dificultad (facil/normal/dificil): "));
            System.out.println(progresoDao.actualizar(progreso) ? "Progreso actualizado." : "No se actualizó.");
        } catch (IllegalArgumentException e) {
            System.out.println("Datos inválidos: " + e.getMessage());
        } catch (SQLException e) {
            mostrarErrorBaseDatos(e);
        }
    }

    private void eliminarProgreso() {
        try {
            int id = leerEntero("Id del progreso a eliminar: ");
            System.out.println(progresoDao.eliminar(id) ? "Progreso eliminado." : "No se encontró el registro.");
        } catch (SQLException e) {
            mostrarErrorBaseDatos(e);
        }
    }

    /* ------------------------- Utilidades de consola ------------------- */

    private String leerTexto(String mensaje) {
        System.out.print(mensaje);
        return teclado.nextLine().trim();
    }

    private int leerEntero(String mensaje) {
        while (true) {
            try {
                return Integer.parseInt(leerTexto(mensaje));
            } catch (NumberFormatException e) {
                System.out.println("Escriba un número entero.");
            }
        }
    }

    private void mostrarErrorBaseDatos(SQLException e) {
        System.out.println("Error de base de datos: " + e.getMessage());
    }
}

