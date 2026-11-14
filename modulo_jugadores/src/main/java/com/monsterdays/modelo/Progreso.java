package com.monsterdays.modelo;

import java.time.LocalDateTime;
import java.util.List;

/** Resultado de una misión superada por un jugador (tabla progreso). */
public final class Progreso {

    public static final List<String> MAPAS_VALIDOS = List.of("base", "infernal");
    public static final List<String> DIFICULTADES_VALIDAS = List.of("facil", "normal", "dificil");
    public static final int NIVEL_MINIMO = 1;
    public static final int NIVEL_MAXIMO = 4;
    public static final int ESTRELLAS_MINIMAS = 1;
    public static final int ESTRELLAS_MAXIMAS = 3;

    private int idProgreso;
    private int idJugador;
    private String mapa;
    private int nivel;
    private int estrellas;
    private String dificultad = "normal";
    private LocalDateTime fechaRegistro;

    public Progreso() {
    }

    public Progreso(int idJugador, String mapa, int nivel, int estrellas, String dificultad) {
        setIdJugador(idJugador);
        setMapa(mapa);
        setNivel(nivel);
        setEstrellas(estrellas);
        setDificultad(dificultad);
    }

    public int getIdProgreso() {
        return idProgreso;
    }

    public void setIdProgreso(int idProgreso) {
        this.idProgreso = idProgreso;
    }

    public int getIdJugador() {
        return idJugador;
    }

    public void setIdJugador(int idJugador) {
        this.idJugador = idJugador;
    }

    public String getMapa() {
        return mapa;
    }

    /** @throws IllegalArgumentException si el mapa no es "base" ni "infernal" */
    public void setMapa(String mapa) {
        if (mapa == null || !MAPAS_VALIDOS.contains(mapa.trim().toLowerCase())) {
            throw new IllegalArgumentException("El mapa debe ser: " + MAPAS_VALIDOS);
        }
        this.mapa = mapa.trim().toLowerCase();
    }

    public int getNivel() {
        return nivel;
    }

    /** @throws IllegalArgumentException si la misión no está entre 1 y 4 */
    public void setNivel(int nivel) {
        if (nivel < NIVEL_MINIMO || nivel > NIVEL_MAXIMO) {
            throw new IllegalArgumentException(
                    "La misión debe estar entre " + NIVEL_MINIMO + " y " + NIVEL_MAXIMO + ".");
        }
        this.nivel = nivel;
    }

    public int getEstrellas() {
        return estrellas;
    }

    /** @throws IllegalArgumentException si las estrellas no están entre 1 y 3 */
    public void setEstrellas(int estrellas) {
        if (estrellas < ESTRELLAS_MINIMAS || estrellas > ESTRELLAS_MAXIMAS) {
            throw new IllegalArgumentException("Las estrellas deben estar entre "
                    + ESTRELLAS_MINIMAS + " y " + ESTRELLAS_MAXIMAS + ".");
        }
        this.estrellas = estrellas;
    }

    public String getDificultad() {
        return dificultad;
    }

    /** @throws IllegalArgumentException si no es facil, normal o dificil */
    public void setDificultad(String dificultad) {
        if (dificultad == null || !DIFICULTADES_VALIDAS.contains(dificultad.trim().toLowerCase())) {
            throw new IllegalArgumentException("La dificultad debe ser: " + DIFICULTADES_VALIDAS);
        }
        this.dificultad = dificultad.trim().toLowerCase();
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    @Override
    public String toString() {
        return String.format("[%d] jugador=%d mapa=%s misión=%d estrellas=%d dificultad=%s",
                idProgreso, idJugador, mapa, nivel, estrellas, dificultad);
    }
}
