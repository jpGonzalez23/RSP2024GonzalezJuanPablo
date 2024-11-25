export class Persona {
    id;
    nombre;
    apellido;
    fechaNacimiento;

    constructor(id, nombre, apellido, fechaNacimiento) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
    }

    toString() {
        return `id: ${this.id}, nombre: ${this.nombre}, apellido: ${this.apellido}, fecha de nacimiento: ${this.fechaNacimiento}`;
    }
}