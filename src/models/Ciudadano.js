import { Persona } from "./Persona.js";

export class Ciudadano extends Persona{
    dni;

    constructor(id, nombre, apellido, fechaNacimiento, dni) {
        super(id, nombre, apellido, fechaNacimiento);
        this.dni = dni;
    }

    toString() {
        return `${super.toString()}, DNI: ${this.dni}`;
    }
}