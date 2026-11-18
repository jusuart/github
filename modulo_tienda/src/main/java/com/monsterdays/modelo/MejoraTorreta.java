package com.monsterdays.modelo;

/** Mejora pasiva del catálogo (tabla mejora_torreta) con el nivel que tiene el jugador. */
public final class MejoraTorreta {

    private int idMejora;
    private String torreta;
    private String nombre;
    private String descripcion;
    private int costo;
    private int bonus;
    private int nivelMaximo;
    private int nivelActual;

    public int getIdMejora() {
        return idMejora;
    }

    public void setIdMejora(int idMejora) {
        this.idMejora = idMejora;
    }

    public String getTorreta() {
        return torreta;
    }

    public void setTorreta(String torreta) {
        this.torreta = torreta;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public int getCosto() {
        return costo;
    }

    public void setCosto(int costo) {
        this.costo = costo;
    }

    public int getBonus() {
        return bonus;
    }

    public void setBonus(int bonus) {
        this.bonus = bonus;
    }

    public int getNivelMaximo() {
        return nivelMaximo;
    }

    public void setNivelMaximo(int nivelMaximo) {
        this.nivelMaximo = nivelMaximo;
    }

    public int getNivelActual() {
        return nivelActual;
    }

    public void setNivelActual(int nivelActual) {
        this.nivelActual = nivelActual;
    }

    /** @return true si el jugador ya alcanzó el nivel máximo */
    public boolean isAlMaximo() {
        return nivelActual >= nivelMaximo;
    }

    /** @return bonus total acumulado (bonus por nivel x nivel actual) */
    public int getBonusTotal() {
        return bonus * nivelActual;
    }
}
