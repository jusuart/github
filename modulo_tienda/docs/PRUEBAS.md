# Pruebas del módulo tienda – GA7-220501096-AA2-EV02

Ejecutar con Tomcat + MySQL en marcha (http://localhost:8080/tienda/). Anotar el resultado real y adjuntar capturas.

| N.º | Prueba | Método | Datos de entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|---|
| 1 | Registrar jugador válido | POST /registro | `heroe_01`, `heroe@correo.com` | Redirige a /perfil, 500 monedas | |
| 2 | Registrar nombre inválido | POST /registro | `a!`, correo válido | Vuelve al formulario con error | |
| 3 | Registrar duplicado | POST /registro | mismo nombre de la prueba 1 | Error "ya está registrado" | |
| 4 | Elegir jugador | POST /entrar | jugador de la lista | Redirige a /tienda | |
| 5 | Ver catálogo | GET /tienda | – | 10 mejoras | |
| 6 | Filtrar por torreta | GET /tienda?torre=mago | `torre=mago` | Solo 2 mejoras del Mago | |
| 7 | Filtro inválido | GET /tienda?torre=xx | `torre=xx` | Muestra todas (valor ignorado) | |
| 8 | Comprar con saldo | POST /compra | Puntería (40) | Saldo 460, nivel 1/3 | |
| 9 | Comprar hasta nivel máximo | POST /compra ×3 y un 4.º intento | misma mejora | 4.º: "nivel máximo" | |
| 10 | Saldo insuficiente | POST /compra | Núcleo de energía (160) repetido hasta agotar saldo | Error "Monedas insuficientes" | |
| 11 | Compra por GET | GET /compra | – | Redirige a /tienda sin comprar | |
| 12 | Sin sesión | GET /tienda | sin entrar | Redirige a /entrar | |
| 13 | Perfil | GET /perfil | – | Muestra compras y bonus total | |
