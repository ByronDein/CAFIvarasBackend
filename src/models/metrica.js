const { Schema, model } = require('mongoose');

const metricaSchema = new Schema({
    edad: {
        type: String,

    },
    altura: {
        type: String,
    },
    peso: {
        type: String,
    },
    imc: {
        type: String,
    },
    porcentajeGrasaCorporal: {
        type: String,
    },
    grasaVisceral: {
        type: String,
    },
    porcentajeGrasaMuscular: {
        type: String,
    },
    rut: {
        type: String,
    },
    fecha: { type: Date, default: Date.now }

});

//metricas
module.exports = model('Metrica', metricaSchema);