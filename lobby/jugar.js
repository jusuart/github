const botonNivel = document.getElementById("botonNivel");
const panelNiveles = document.getElementById("panelNiveles");
const cerrarNiveles = document.getElementById("cerrarNiveles");
const botonAnillo = document.getElementById("botonAnillo");
const btnBack = document.getElementById("btnBack");


// ABRIR PANEL DE NIVELES

botonNivel.addEventListener("click", function() {

    panelNiveles.classList.add("activo");
    botonAnillo.classList.add("activo");

});


// CERRAR PANEL DE NIVELES

cerrarNiveles.addEventListener("click", function() {

    panelNiveles.classList.remove("activo");
    botonAnillo.classList.remove("activo");

});



btnBack.addEventListener("click", function() {

history.back();

});
