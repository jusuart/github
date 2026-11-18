#!/usr/bin/env bash
# Ejecutar desde la carpeta modulo_jugadores:  bash scripts/compilar_y_ejecutar.sh
set -e
mkdir -p out
javac -encoding UTF-8 -cp "lib/*" -d out $(find src -name "*.java")
java -Dfile.encoding=UTF-8 -cp "out:lib/*" com.monsterdays.Principal

