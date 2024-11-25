import { Persona } from './models/Persona.js';
import { Ciudadano } from './models/Ciudadano.js';
import { Extranjero } from './models/Extranjero.js';

let dataPersonas = [];
let modeOperacion = "agregar";

window.onload = function () {
    document.getElementById("btnAgregar").addEventListener("click", () => modeFormulario("agregar"));
    document.getElementById("btnCancelar").addEventListener("click", () => modeFormulario("cancelar"));
    document.getElementById('selectTipo').addEventListener('change', () => habiliarCampos);
    document.getElementById("btnAceptar").addEventListener("click", () => {
        if (modeOperacion === "agregar") alta();
    });
    cargar();
}

function mostrarSpinner() {
    document.getElementById("spinner").style.display = "flex";
}

function ocultarSpinner() {
    document.getElementById("spinner").style.display = "none";
}

function modeFormulario(modo = "agregar") {
    mostrarSpinner();
    habiliarCampos();

    modeOperacion = modo;

    let formListado = document.getElementById("form-datos");
    let formAbm = document.getElementById("form-abm");

    setTimeout(() => {
        if (formListado.style.display === 'none') {
            formListado.style.display = 'block';
            formAbm.style.display = 'none';
            limpiarCampos();
        }
        else {
            formListado.style.display = 'none';
            formAbm.style.display = 'block';
            if (modo === "modificar") {
                document.getElementById("accion-titulo").textContent = "Formulario de Modificacion";
            }
            else if (modo === "eliminar") {
                document.getElementById("accion-titulo").textContent = "Formulario de Eliminacion";
            }
            else {
                document.getElementById("accion-titulo").textContent = "Formulario de Alta";
            }
        }

        if (modo === "cancelar") {
            limpiarCampos();
        }
        ocultarSpinner();
    }, 500);
}


function cargar() {
    mostrarSpinner();
    var xhttp = new XMLHttpRequest();
    let url = 'https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero';
    xhttp.open("GET", url);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            ocultarSpinner();
            if (xhttp.status == 200) {
                let jsonResponse = JSON.parse(xhttp.responseText);
                if (dataPersonas.length === 0) {
                    dataPersonas = jsonResponse.map(p => {
                        if (p.dni !== undefined) {
                            return new Ciudadano(p.id, p.nombre, p.apellido, p.fechaNacimiento, p.dni);
                        }
                        else if (p.paisOrigen !== undefined) {
                            return new Extranjero(p.id, p.nombre, p.apellido, p.fechaNacimiento, p.paisOrigen);
                        }
                    });
                }
                mostrarListado();
            }
            else {
                alert("no se pudo cargar: " + url + "\nError: " + xhttp.status);
            }
        }
    }
}

function mostrarListado() {
    let tabla = document.getElementById("tbody-persona");
    tabla.innerHTML = "";

    dataPersonas.forEach(p => {
        let fila = tabla.insertRow();

        fila.insertCell().innerHTML = p.id;
        fila.insertCell().innerHTML = p.nombre;
        fila.insertCell().innerHTML = p.apellido;
        fila.insertCell().innerHTML = p.fechaNacimiento;
        fila.insertCell().innerHTML = p instanceof Ciudadano ? p.dni : "N/A";
        fila.insertCell().innerHTML = p instanceof Extranjero ? p.paisOrigen : "N/A";

        const modificarBtn = document.createElement("button");
        modificarBtn.textContent = "Modificar";
        modificarBtn.addEventListener("click", () => mostrarModificacionDeDatos(p.id));
        fila.insertCell().appendChild(modificarBtn);

        const eliminarBtn = document.createElement("button");
        eliminarBtn.textContent = "Eliminar";
        eliminarBtn.addEventListener("click", () => mostrarEliminacionDeDatos(p.id));
        fila.insertCell().appendChild(eliminarBtn);
    });
}

async function enviarPost(persona) {
    try {
        mostrarSpinner();
        let url = 'https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero';
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(persona)
        });
        if (response.status === 200) {
            let jsonResponse = await response.json();
            return jsonResponse;
        }
        else {
            alert("no se pudo enviar: " + url + "\nError: " + response.status);
            return false;
        }
    }
    catch (error) {
        alert("no se pudo enviar: " + url + "\nError: " + error);
        return false;
    }
}

async function alta() {
    mostrarSpinner();

    let nombre = document.getElementById("txtNombre").value;
    let apellido = document.getElementById("txtApellido").value;
    let fechaNacimiento = document.getElementById("numFechaNacimiento").value;
    let dni;
    let paisOrigen;
    let persona;

    if (!validar(nombre, apellido, fechaNacimiento)) {
        ocultarSpinner();
        return;
    }

    if (document.getElementById("selectTipo").value === "Ciudadano") {
        dni = document.getElementById("numDni").value;
        if (!validarCiudadano(dni)) {
            ocultarSpinner();
            return;
        }

        persona = { nombre, apellido, fechaNacimiento, dni };
        console.log(persona);
    }
    else if (document.getElementById("selectTipo").value === "Extranjero") {
        paisOrigen = document.getElementById("txtPaisOrigen").value;
        if (!validarExtranjero(paisOrigen)) {
            ocultarSpinner();
            return;
        }

        persona = { nombre, apellido, fechaNacimiento, paisOrigen };
    }

    let respuesta = await enviarPost(persona);

    if (respuesta) {
        persona.id = respuesta.id;

        if (document.getElementById("selectTipo").value === "Ciudadano") {
            let ciudadano = new Ciudadano(persona.id, persona.nombre, persona.apellido, persona.fechaNacimiento, persona.dni);
            dataPersonas.push(ciudadano);
        }
        else {
            let extranjero = new Extranjero(persona.id, persona.nombre, persona.apellido, persona.fechaNacimiento, persona.paisOrigen);
            dataPersonas.push(extranjero);
        }
        modeFormulario();
        mostrarListado();
    }
    else {
        ocultarSpinner();
        modeFormulario();
        alert("No se pudo agregar la persona");
    }
}

function mostrarModificacionDeDatos(id) {
    habiliarCampos();
    let persona;

    dataPersonas.forEach(p => {
        if (p.id === id) {
            persona = p;
        }
    });

    if (persona) {
        document.getElementById("txtId").value = persona.id;
        document.getElementById("txtNombre").value = persona.nombre;
        document.getElementById("numFechaNacimiento").value = persona.fechaNacimiento;
        
        if (persona instanceof Ciudadano) {
            document.getElementById("numDni").value = persona.dni;
        }
        else if (persona instanceof Extranjero) {
            document.getElementById("txtPaisOrigen").value = persona.paisOrigen;
        }

        modeFormulario("modificar");
        document.getElementById('btnAceptar').onclick = () => modificar(persona);
    }
    else {
        alert("no se pudo encontrar a la persona");
    }
}

async function enviarPut(persona) {
    let url = 'https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero';
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(persona)
    })
        .then(response => {
            if (response.status === 200) {
                return true;
            }
            else {
                alert("no se pudo enviar: " + url + "\nError: " + response.status);
                modeFormulario();
                return false;
            }
        })
        .catch(error => {
            alert(error.message);
            modeFormulario();
            return false;
        });
}

function modificar(persona) {
    mostrarSpinner();
    enviarPut(persona)
        .then(respuesta => {
            if (respuesta) {
                let nombre = document.getElementById("txtNombre").value;
                let apellido = document.getElementById("txtApellido").value;
                let fechaNacimiento = document.getElementById("numFechaNacimiento").value;

                if (!validar(nombre, apellido, fechaNacimiento)) {
                    ocultarSpinner();
                    return;
                }

                let newPersonar;

                if (document.getElementById("selectTipo").value === "Ciudadano") {
                    let dni = document.getElementById("numDni").value;

                    if (!validarCiudadano(dni)) {
                        ocultarSpinner();
                        return;
                    }
                    newPersonar = new Ciudadano(persona.id, nombre, apellido, fechaNacimiento, dni);
                }
                else if (document.getElementById("selectTipo").value === "Extranjero") {
                    let paisOrigen = document.getElementById("txtPaisOrigen").value;

                    if (!validarExtranjero(paisOrigen)) {
                        ocultarSpinner();
                        return;
                    }

                    newPersonar = new Extranjero(persona.id, nombre, apellido, fechaNacimiento, paisOrigen);
                }

                let index = dataPersonas.findIndex(p => p.id === persona.id);

                if (index !== -1) {
                    dataPersonas[index] = newPersonar;
                }
                modeFormulario();
                mostrarListado();
                document.getElementById('btnAceptar').onclick = null;
            }
            else {
                mostrarListado();
                document.getElementById('btnAceptar').onclick = null;
            }
        })
        .catch(error => {
            alert(error.message);
            ocultarSpinner();
            modeFormulario();
            mostrarListado();
        });
}

function mostrarEliminacionDeDatos(personaId) {
    let persona;
    dataPersonas.forEach(p => {
        if (p.id === id) {
            persona = p;
        }
    });

    if(persona) {
        document.getElementById("txtId").value = persona.id;
        document.getElementById("txtNombre").value = persona.nombre;
        document.getElementById("txtNombre").disabled = true;
        document.getElementById("txtApellido").value = persona.apellido;
        document.getElementById("txtApellido").disabled = true;
        document.getElementById("numFechaNacimiento").value = persona.fechaNacimiento;
        document.getElementById("numFechaNacimiento").disabled = true;
        
        if (persona instanceof Ciudadano) {
            document.getElementById("numDni").value = persona.dni;
            document.getElementById("numDni").disabled = true;
        }
        else if (persona instanceof Extranjero) {
            document.getElementById("txtPaisOrigen").value = persona.paisOrigen;
            document.getElementById("txtPaisOrigen").disabled = true;
        }

        modeFormulario("eliminar");
        deshabiliarCampos();
        document.getElementById('btnAceptar').onclick = () => enviarDelete(personaId);
    }
    else {
        alert("no se pudo encontrar a la persona");
    }
}

async function enviarDelete(personaId) {
    try {
        mostrarSpinner();
        let url = 'https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero/';
        let response = await fetch(url,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(personaId)
        });

        if (response.status === 200) {
            if (confirm("¿Desea eliminar la persona?")) {
                dataPersonas = dataPersonas.filter(p => p.id !== personaId);
                modeFormulario();
                mostrarListado();
            }
            else {
                modeFormulario();
            }
        }
        else {
            modeFormulario();
            mostrarListado();
            alert("no se pudo enviar: " + url + "\nError: " + response.status);
        }
    }
    catch (error) {
        alert("Error: " + url + "\nError: " + error.message);
    }
}

function validar(nombre, apellido, fechaNacimiento) {
    if (!nombre) {
        alert("Debe ingresar el nombre");
        return;
    }

    if (!apellido) {
        alert("Debe ingresar el apellido");
        return;
    }

    if (isNaN(fechaNacimiento)) {
        alert("Debe ingresar la fecha de nacimiento");
        return;
    }

    return true;
}

function validarCiudadano(dni) {
    if (isNaN(dni) > 0) {
        alert("Debe ingresar el DNI mayor a 0");
        return;
    }

    return true;
}

function validarExtranjero(paisOrigen) {
    if (!paisOrigen) {
        alert("Debe ingresar el pais de origen");
        return;
    }

    return true;
}

function habiliarCampos() {
    let tipo = document.getElementById("selectTipo").value;
    
    document.getElementById('txtNombre').disabled = false;
    document.getElementById('txtApellido').disabled = false;
    document.getElementById('numFechaNacimiento').disabled = false;
    document.getElementById('selectTipo').disabled = false;

    if (tipo === "Ciudadano") {
        document.getElementById('numDni').disabled = false;
        document.getElementById('txtPaisOrigen').disabled = true;
        document.getElementById('txtPaisOrigen').value = "";
    } else if (tipo === "Extranjero") {
        document.getElementById('txtPaisOrigen').disabled = false;
        document.getElementById('numDni').disabled = true;
        document.getElementById('numDni').value = "";
    }
}

function deshabiliarCampos() {
    document.getElementById('txtNombre').disabled = true;
    document.getElementById('txtApellido').disabled = true;
    document.getElementById('numFechaNacimiento').disabled = true;
    document.getElementById('numDni').disabled = true;
    document.getElementById('txtPaisOrigen').disabled = true;
    document.getElementById('selectTipo').disabled = true;
}

function limpiarCampos() {
    document.getElementById("txtId").value = "";
    document.getElementById("txtNombre").value = "";
    document.getElementById("txtApellido").value = "";
    document.getElementById("numFechaNacimiento").value = "";
    document.getElementById("numDni").value = "";
    document.getElementById("txtPaisOrigen").value = "";
    habiliarCampos();
}