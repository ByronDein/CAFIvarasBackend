const {Schema, model} = require('mongoose');

const sesionSchema = new Schema({
    horaIni: { type: String, 
        required: true, 
        trim: true
    },
    horaFin: { type: String, 
        required: true, 
        trim: true
    },
    cantidadUsuarios: { type: Number, 
        required: true, 
    },
    dia: {type: String,
         require: false
    },
    numeroSesion: {type: Number,
        require: true
    },
    desactivado: {type: Boolean,
    }
});

//sesions
module.exports = model('Sesion', sesionSchema);