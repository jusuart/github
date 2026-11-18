@echo off
REM Se puede ejecutar con doble clic: primero se ubica en la carpeta modulo_jugadores.
REM Usa rutas relativas, asi funciona aunque la carpeta del proyecto tenga espacios.
cd /d "%~dp0.."
chcp 65001 >nul
if not exist out mkdir out
javac -encoding UTF-8 -sourcepath src\main\java -cp "lib/*" -d out src\main\java\com\monsterdays\Principal.java
if errorlevel 1 (
  echo.
  echo Error al compilar. Revise el mensaje de arriba.
  pause
  exit /b 1
)
java -Dfile.encoding=UTF-8 -cp "out;lib/*" com.monsterdays.Principal
pause

