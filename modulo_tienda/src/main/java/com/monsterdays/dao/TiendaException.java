package com.monsterdays.dao;

/** Error de regla de negocio de la tienda (saldo insuficiente, nivel máximo, etc.). */
public class TiendaException extends Exception {

    private static final long serialVersionUID = 1L;

    public TiendaException(String mensaje) {
        super(mensaje);
    }
}

