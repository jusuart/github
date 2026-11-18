package com.monsterdays.modelo;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

/** Jugador registrado en monster_days (tabla jugador). */
public final class Jugador {

    private static final Pattern PATRON_NOMBRE = Pattern.compile("^[A-Za-z0-9_]{3,30}$");
    private static final Pattern PATRON_CORREO = Pattern.compile("^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$");
    private static final int LONGITUD_MAXIMA_CORREO = 100;

    private int idJugador;
    private String nombreUsuario;
    private String correo;
    private LocalDateTime fechaRegistro;
    private int monedas;

    public Jugador() {
    }

    public Jugador(String nombreUsuario, String correo) {
        setNombreUsuario(nombreUsuario);
        setCorreo(correo);
    }

    public int getIdJugador() {
        return idJugador;
    }

    public void setIdJugador(int idJugador) {
        this.idJugador = idJugador;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    /** @throws IllegalArgumentException si no tiene entre 3 y 30 letras, números o guion bajo */
    public void setNombreUsuario(String nombreUsuario) {
        if (nombreUsuario == null || !PATRON_NOMBRE.matcher(nombreUsuario.trim()).matches()) {
            throw new IllegalArgumentException(
                    "El nombre de usuario debe tener de 3 a 30 letras, números o guion bajo.");
        }
        this.nombreUsuario = nombreUsuario.trim();
    }

    public String getCorreo() {
        return correo;
    }

    /** @throws IllegalArgumentException si el correo no tiene un formato válido */
    public void setCorreo(String correo) {
        if (correo == null || correo.trim().length() > LONGITUD_MAXIMA_CORREO
                || !PATRON_CORREO.matcher(correo.trim()).matches()) {
            throw new IllegalArgumentException("El correo electrónico no es válido.");
        }
        this.correo = correo.trim().toLowerCase();
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public int getMonedas() {
        return monedas;
    }

    public void setMonedas(int monedas) {
        this.monedas = monedas;
    }

    @Override
    public String toString() {
        return String.format("[%d] %s <%s> (registrado: %s)",
                idJugador, nombreUsuario, correo, fechaRegistro);
    }
}
