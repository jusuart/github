-- =====================================================================
-- monster_days - Módulo tienda de mejoras pasivas
-- Ejecutar DESPUÉS de modulo_jugadores/sql/monster_days_bd.sql
-- Uso: mysql -u root -p < sql/tienda.sql
-- =====================================================================
USE monster_days_bd;

DROP TABLE IF EXISTS compra_mejora;
DROP TABLE IF EXISTS mejora_torreta;

-- Saldo de monedas del jugador (saldo inicial fijo: 500)
ALTER TABLE jugador ADD COLUMN monedas INT NOT NULL DEFAULT 500;

-- Catálogo de mejoras pasivas por torreta
CREATE TABLE mejora_torreta (
  id_mejora    INT          NOT NULL AUTO_INCREMENT,
  torreta      VARCHAR(15)  NOT NULL,
  nombre       VARCHAR(40)  NOT NULL,
  descripcion  VARCHAR(150) NOT NULL,
  costo        INT          NOT NULL,   -- monedas por cada nivel
  bonus        INT          NOT NULL,   -- % de mejora por nivel
  nivel_maximo TINYINT      NOT NULL DEFAULT 3,
  PRIMARY KEY (id_mejora),
  UNIQUE KEY uk_mejora_torreta_nombre (torreta, nombre),
  CONSTRAINT ck_mejora_torreta CHECK (torreta IN ('arquero','dardero','mago','catapulta','lasser')),
  CONSTRAINT ck_mejora_costo   CHECK (costo > 0),
  CONSTRAINT ck_mejora_nivel   CHECK (nivel_maximo BETWEEN 1 AND 10)
) ENGINE=InnoDB;

-- Compras de cada jugador (nivel actual de cada mejora)
CREATE TABLE compra_mejora (
  id_compra      INT       NOT NULL AUTO_INCREMENT,
  id_jugador     INT       NOT NULL,
  id_mejora      INT       NOT NULL,
  nivel          TINYINT   NOT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_compra),
  UNIQUE KEY uk_compra_jugador_mejora (id_jugador, id_mejora),
  CONSTRAINT fk_compra_jugador FOREIGN KEY (id_jugador)
    REFERENCES jugador (id_jugador) ON DELETE CASCADE,
  CONSTRAINT fk_compra_mejora FOREIGN KEY (id_mejora)
    REFERENCES mejora_torreta (id_mejora) ON DELETE CASCADE,
  CONSTRAINT ck_compra_nivel CHECK (nivel >= 1)
) ENGINE=InnoDB;

INSERT INTO mejora_torreta (torreta, nombre, descripcion, costo, bonus, nivel_maximo) VALUES
  ('arquero',   'Puntería',          'Aumenta el daño del Arquero.',          40,  10, 3),
  ('arquero',   'Ojo de águila',     'Aumenta el alcance del Arquero.',       50,  8,  3),
  ('dardero',   'Veneno',            'Aumenta el daño del Dardero.',          55,  10, 3),
  ('dardero',   'Ráfaga',            'Aumenta la velocidad de ataque.',       60,  8,  3),
  ('mago',      'Poder arcano',      'Aumenta el daño del Mago.',             75,  10, 3),
  ('mago',      'Concentración',     'Aumenta el alcance del Mago.',          80,  8,  3),
  ('catapulta', 'Piedras pesadas',   'Aumenta el daño de la Catapulta.',      90,  12, 3),
  ('catapulta', 'Contrapeso',        'Aumenta la velocidad de ataque.',       95,  8,  3),
  ('lasser',    'Lente de cristal',  'Aumenta el daño del Lasser.',           150, 12, 3),
  ('lasser',    'Núcleo de energía', 'Aumenta el alcance del Lasser.',        160, 10, 3);
