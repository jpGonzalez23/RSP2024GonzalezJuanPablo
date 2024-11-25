import { Persona } from "./Persona.js";

export class Extranjero extends Persona {
    paisOrigen;

    constructor(id, nombre, apellido, fechaNacimiento, paisOrigen) {
        super(id, nombre, apellido, fechaNacimiento);
        this.paisOrigen = paisOrigen;
    }

    toString() {
        return `${super.toString()}, pais de origen: ${this.paisOrigen}`;
    }
}