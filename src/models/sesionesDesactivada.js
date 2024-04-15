const {Schema, model} = require('mongoose');

const sesionesDesactivadaSchema = new Schema({
    numeroSesion: {type: Number,
        require: true
    },
    dia: { type: Date,
        required: true
    },
});

//sesionesDesactivadas
module.exports = model('SesionesDesactivada', sesionesDesactivadaSchema);