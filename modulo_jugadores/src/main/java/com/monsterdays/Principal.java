package com.monsterdays;

import com.monsterdays.vista.MenuConsola;

/** Punto de entrada del módulo de jugadores y progreso de monster_days. */
public final class Principal {

    private Principal() {
        // Clase de arranque: no se instancia.
    }

    public static void main(String[] args) {
        new MenuConsola().iniciar();
    }
}

