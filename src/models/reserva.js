const {Schema, model} = require('mongoose');

const reservaSchema = new Schema({
    
    rut: { type: String,
         required: true,
    },
    numeroSesion: { type: Number,
        required: true
    },
    diaReserva: { type: Date,
        required: true
    },
    asistencia: { type: Boolean,
        required: false,
        default: false
    }
});

module.exports = model('Reserva', reservaSchema);