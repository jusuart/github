-- =====================================================================
-- monster_days - Script de base de datos (MySQL 8 / MariaDB 10.4+)
-- Módulo: Gestión de jugadores y progreso
-- Uso:  mysql -u root -p < sql/monster_days_bd.sql
-- =====================================================================
CREATE DATABASE IF NOT EXISTS monster_days_bd
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE monster_days_bd;

DROP TABLE IF EXISTS progreso;
DROP TABLE IF EXISTS jugador;

-- Jugadores registrados en el juego
CREATE TABLE jugador (
  id_jugador     INT          NOT NULL AUTO_INCREMENT,
  nombre_usuario VARCHAR(30)  NOT NULL,
  correo         VARCHAR(100) NOT NULL,
  fecha_registro TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_jugador),
  UNIQUE KEY uk_jugador_nombre (nombre_usuario),
  UNIQUE KEY uk_jugador_correo (correo)
) ENGINE=InnoDB;

-- Progreso por misión (equivale a las claves 'monster_days_progreso' y
-- 'monster_days_estrellas' que el juego guarda hoy en localStorage).
CREATE TABLE progreso (
  id_progreso    INT          NOT NULL AUTO_INCREMENT,
  id_jugador     INT          NOT NULL,
  mapa           VARCHAR(10)  NOT NULL,   -- 'base' | 'infernal'
  nivel          TINYINT      NOT NULL,   -- misión 1..4
  estrellas      TINYINT      NOT NULL,   -- 1..3
  dificultad     VARCHAR(10)  NOT NULL DEFAULT 'normal', -- facil | normal | dificil
  fecha_registro TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_progreso),
  UNIQUE KEY uk_progreso_mision (id_jugador, mapa, nivel),
  CONSTRAINT fk_progreso_jugador FOREIGN KEY (id_jugador)
    REFERENCES jugador (id_jugador) ON DELETE CASCADE,
  CONSTRAINT ck_progreso_mapa       CHECK (mapa IN ('base', 'infernal')),
  CONSTRAINT ck_progreso_nivel      CHECK (nivel BETWEEN 1 AND 4),
  CONSTRAINT ck_progreso_estrellas  CHECK (estrellas BETWEEN 1 AND 3),
  CONSTRAINT ck_progreso_dificultad CHECK (dificultad IN ('facil', 'normal', 'dificil'))
) ENGINE=InnoDB;

-- Datos de ejemplo
INSERT INTO jugador (nombre_usuario, correo) VALUES
  ('caballero_azul', 'caballero@example.com'),
  ('maga_roja',      'maga@example.com');
INSERT INTO progreso (id_jugador, mapa, nivel, estrellas, dificultad) VALUES
  (1, 'base', 1, 3, 'normal'),
  (1, 'base', 2, 2, 'normal'),
  (2, 'infernal', 1, 1, 'dificil');
