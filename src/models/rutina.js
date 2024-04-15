const mongoose = require('mongoose');

// Definición del esquema de los detalles del ejercicio
const ejercicioSchema = new mongoose.Schema({
  numEjer: {type: Number, required: true},
  nombre: {type: String, required: true},
  repeticiones: {type: Number, required: true},
  series: {type: Number, required: true},
  peso: {type: Number, required: true},
  descanso: {type: Number, required: true},
  // Otros campos específicos del ejercicio
});

// Definición del esquema de la rutina
const rutinaSchema = new mongoose.Schema({
  nombre: {type: String, required: true},
  fecha: { type: Date, default: Date.now },
  diasDeSemana: {type: Array, required: true},
  instructor: {
    rut: {
      type: String, // Cambia el tipo de dato a String para almacenar el rut
      required: false
    },
    type: String, // Cambia el tipo de dato a String para almacenar el rut
    required: false
  },
  alumno: {
    rut: {
      type: String, // Cambia el tipo de dato a String para almacenar el rut
      required: true,
    },
    type: String, // Cambia el tipo de dato a String para almacenar el rut
  },
  cardioInicial: {type: Number, required: true},
  cardioFinal: {type: Number, required: true},
  calentamiento: { type: String, required: true},
  vueltaALaCalma: { type: String, required: true},
  ejercicios: [ejercicioSchema], // Campo de tipo arreglo que contiene los detalles de los ejercicios
});

// Modelo de la rutina
const Rutina = mongoose.model('Rutina', rutinaSchema);

module.exports = Rutina;
	