const {Schema, model} = require('mongoose');

const alumnoSchema = new Schema({
    nombre: { type: String, 
        required: true, 
        trim: true
    },
    rut: { type: String,
         required: true,
          unique: true
    },
    correo: { type: String, 
        required: true
    },
    carrera: { type: String, 
        required: true
    },
    jornada: {type: String,
        required: true
    },
    password: { type: String, 
        required: true
    },
    active: {type: Boolean
    },
    tipoUsuario: {type: String,
        required: true  
    }

});

//alumnos
module.exports = model('Alumno', alumnoSchema);