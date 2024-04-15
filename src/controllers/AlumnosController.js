const bcrypt = require('bcrypt');

const alumnoCtrl = {};
const Alumno = require('../models/alumno');

function validarCorreoElectronico(correo) {
    const expresionRegular = /^[a-zA-Z0-9._%+-]+@(duocuc\.cl|profesor\.duoc\.cl|duoc\.cl)$/;
    return expresionRegular.test(correo);
}

function generatePassword(rut) {
    return rut.replace(/[-.]/g, '').slice(0, -1);
}

alumnoCtrl.getAlumnos = async (req, res) => {
    const pagina = parseInt(req.query.pagina) || 1; // número de página actual
    const limite = parseInt(req.query.limite) || 1000; // número de elementos por página
    const skip = (pagina - 1) * limite; // número de elementos que debemos saltar

    const count = await Alumno.countDocuments();
    const alumnos = await Alumno.find().select('nombre rut correo carrera jornada active tipoUsuario')
        .sort({ nombre: 1 }) // para ordenar de forma ascendente
        .skip(skip) // para saltar los elementos
        .limit(limite) // para devolver los elementos

        .exec(); // para ejecutar la consulta

    const paginas = Math.ceil(count / limite); // para calcular el número de páginas

    res.json({
        alumnos,
        totalPaginas: paginas,
        paginaActual: pagina,
    });
};
//funcion que busca un alumno por su rut  y que retorna un json con el alumno encontrado
alumnoCtrl.getAlumnoByRut = async (req, res) => {
    const rut = req.body;
    Alumno.findOne({ rut: rut }).then(alumno => {
        if (alumno) {
            return res.status(200).json({ message: 'Alumno Encontrado', alumno });
        }
        else {
            return res.status(400).json({ message: 'Alumno no encontrado' });
        }
    })
}

alumnoCtrl.createAlumno = async (req, res) => {
    const { nombre, rut, correo, carrera, jornada, active, tipoUsuario } = req.body;

    if (!nombre || !rut || !correo || !carrera || !jornada) {
        return res.status(400).json({ message: 'Por favor ingrese todos los campos' });
    }
    else if (!validarCorreoElectronico(correo)) {
        return res.status(400).json({ message: 'Por favor ingrese un correo valido' });

    }
    // else if(!dgv(rut)) {
    //     return res.status(400).json({ message: 'Por favor ingrese un RUT valido' });
    // }
    else {
        Alumno.findOne({$or: [{ correo: correo }, { rut: rut }]}).then(alumno => {
            if (alumno) {
                return res.status(400).json({ message: 'El correo o rut ya existe' });
            }
            else {
                const passwordSinEncriptar = generatePassword(rut);
                const password = bcrypt.hashSync(passwordSinEncriptar, 10);
                // const password =  bcrypt.hash(generatePassword(rut), 10);

                // const password = generatePassword(rut);
               
                const newAlumno = new Alumno({
                    nombre,
                    rut,
                    correo : correo.toLowerCase(),
                    carrera,
                    jornada,
                    password,
                    active,
                    tipoUsuario,
                })
                newAlumno.save();
                res.json({ message: 'alumno guardado', newAlumno })
            }
        }).catch(err => {
            return res.status(400).json({ message: 'El Correo o Rut ya estan en uso', err });
        });
    }
}

alumnoCtrl.login = async (req, res) => {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status().json({ message: 'Por favor ingrese todos los campos' });
    } else if (!validarCorreoElectronico(correo)) {
      return res.status(200).json({ message: 'Por favor ingrese un correo valido' });
    } else {
      try {
        const alumno = await Alumno.findOne({ correo: correo });
        if (!alumno) {
          return res.status(200).json({ success: false, message: 'Credenciales incorrectas' });
        }
        const comparePassword = await bcrypt.compare(password, alumno.password);
        if (!comparePassword) {
          return res.status(200).json({ success: false, message: 'Credenciales incorrectas' });
        }
        if (!alumno.active) {
          return res.status(200).json({ success: false, message: 'El usuario no esta activo', alumno });
        }
        const respAlumno = {
          nombre: alumno.nombre,
          correo: alumno.correo,
          rut: alumno.rut,
          tipoUsuario: alumno.tipoUsuario,
          carrera: alumno.carrera,
          jornada: alumno.jornada,
          active: alumno.active,
          password: alumno.password
        };
        return res.status(200).json({ success: true, message: 'Bienvenido', respAlumno });
      } catch (error) {
        return res.status(400).json({ message: 'Ocurrió un error al intentar iniciar sesión', error });
      }
    }
  };
  


// alumnoCtrl.createAlumno = async (req, res) => {
//     const { nombre, rut, correo, carrera, jornada, active, tipoUsuario } = req.body;
//     const password = generatePassword(rut);
//     const newAlumno = new Alumno({
//         nombre,
//         rut,
//         correo,
//         carrera,
//         jornada,
//         password,
//         active,
//         tipoUsuario
//     })
//     await newAlumno.save();
//     res.json({message: 'alumno guardado'})
// };

alumnoCtrl.getAlumno = async (req, res) => {
    const alumno = await Alumno.findById(req.params.id).select('nombre rut correo carrera jornada active tipoUsuario');
    res.json(alumno)
};

alumnoCtrl.updateAlumno = async (req, res) => {
    let { nombre, rut, correo, carrera, jornada, password, active, tipoUsuario } = req.body;
    password = bcrypt.hashSync(password, 10)
    await Alumno.findByIdAndUpdate({ _id: req.params.id }, {
        nombre,
        rut,
        correo,
        carrera,
        jornada,
        password,
        active,
        tipoUsuario
    });

    res.json({ message: 'alumno actualizado' })
};

alumnoCtrl.acceptAlumno = async (req, res) => {
    let { nombre, rut, correo, carrera, jornada, password, active, tipoUsuario } = req.body;
    await Alumno.findByIdAndUpdate({ _id: req.params.id }, {
        nombre,
        rut,
        correo,
        carrera,
        jornada,
        password,
        active,
        tipoUsuario
    });

    res.json({ message: 'alumno actualizado' })
};

alumnoCtrl.updateAlumnoByRut = async (req, res) => {
    let { nombre, correo, carrera, jornada, password, active, tipoUsuario } = req.body;
    const rut = req.params.rut;
    
    password = bcrypt.hashSync(password, 10)
    await Alumno.findOneAndUpdate({ rut: rut }, {
        nombre,
        correo,
        carrera,
        jornada,
        password,
        active,
        tipoUsuario
    });

    res.json({ message: 'alumno actualizado' })
};


alumnoCtrl.deleteAlumno = async (req, res) => {
    await Alumno.findByIdAndDelete(req.params.id);
    res.json({ message: 'alumno eliminado' })
};

module.exports = alumnoCtrl;
