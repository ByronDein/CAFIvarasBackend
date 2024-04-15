const {Schema, model} = require('mongoose');

const usuarioSchema = new Schema({
    nombreUsuario: { type: String, 
        required: true, 
        trim: true,
        unique: true
    },

});

//alumnos
module.exports = model('Usuario', usuarioSchema);