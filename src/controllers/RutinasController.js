const rutinaCtrl = {};
const Rutina = require('../models/rutina');

rutinaCtrl.saveRutinas = async (req, res) => {
  const { nombre, diasDeSemana, instructorId, alumnoId, cardioInicial, cardioFinal, calentamiento, vueltaALaCalma, ejercicios } = req.body;
  
  console.log(req.body)
  try {
    // Buscar si existe una rutina con el mismo nombre y el ID del alumno
    const rutinaExistente = await Rutina.findOne({ nombre, alumno: alumnoId });
    // Si ya existe una rutina con ese nombre, retornar un mensaje de error
    if (rutinaExistente) {
      return res.status(400).json({ message: 'Ya existe una rutina con ese nombre' });
    }

    const rutinasExistentes = await Rutina.find({ alumno: alumnoId });
    if (rutinasExistentes.length >= 3) {
      return res.status(400).json({ message: 'No se pueden crear más rutinas para este alumno' });
    }
    console.log(ejercicios)
    // if (rutinasExistentes) {
    //   return res.status(400).json({ message: 'Ya existe una rutina con ese nombre' });
    // }

    //
    // Obtener el número de la próxima rutina
    // Encontrar el número de la siguiente rutina disponible
    //const maxRoutines = 3;
    //let newRoutineNumber = 1;

    // for (let i = 1; i <= maxRoutines; i++) {
    //   if (!rutinasExistentes.find((rutina) => rutina.nombre === `Rutina ${i}`)) {
    //     newRoutineNumber = i;
    //     break;
    //   }
    // }

    // Crear el nombre de la nueva rutina
    //const newRoutineName = `Rutina ${newRoutineNumber}`;
    // let siguienteNumero = 1;
    // while (numerosDeRutina.includes(siguienteNumero)) {
    //   siguienteNumero++;
    // }
    // Crear la nueva rutina
    const rutina = new Rutina({
      nombre: nombre,
      diasDeSemana: diasDeSemana || [],
      fecha: Date.now(),
      instructor: instructorId || '',
      alumno: alumnoId,
      cardioInicial: cardioInicial || 0,
      cardioFinal: cardioFinal,
      calentamiento: calentamiento || '',
      vueltaALaCalma: vueltaALaCalma || '',
      ejercicios: ejercicios,
    });

    // Guardar la nueva rutina en la base de datos
    await rutina.save();
    res.json({ message: 'Rutina guardada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar la rutina' });
  }
};

// rutinaCtrl.getRutinasById = async (req, res) => {
//   const rutAlumno = req.query.rutAlumno;
//   try {
//     const rutinas = await Rutina.find({ alumno: rutAlumno });
//     res.json(rutinas);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error al obtener las rutinas por el rut del alumno' });
//   }
// };

rutinaCtrl.getRutinas = async (req, res) => {
  const rutAlumno = req.query.rutAlumno;
  const day = req.query.day;

  try {
    const rutinas = await Rutina.find({ alumno: rutAlumno });
    // get rutinas equals to day
    const rutinasByDay = rutinas.filter((rutina) => rutina.diasDeSemana.includes(day));
    if(day) {
      res.json(rutinasByDay);
    } else {
      res.json(rutinas);
    }    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las rutinas por el rut del alumno' });
  }

};
//get rutina para modificar
rutinaCtrl.getRutinaById = async (req, res) => {
  const rutinaId = req.params.id; // Se espera que el ID de la rutina a obtener se pase como parámetro en la URL
  console.log("aqui toy", rutinaId);

  try {
    // Buscar la rutina por su ID
    const rutina = await Rutina.findById(rutinaId);
    res.json(rutina);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la rutina por su ID' });
  }
};

// Editar rutinas por id
rutinaCtrl.editRutinasById = async (req, res) => {
  const { nombre, diasDeSemana, instructorId, alumnoId, cardioInicial, cardioFinal, calentamiento, vueltaALaCalma, ejercicios } = req.body;
  const rutinaId = req.params.id;
  try {
    await Rutina.findByIdAndUpdate(rutinaId, {
      nombre: nombre,
      diasDeSemana: diasDeSemana,
      fecha: new Date(),
      instructor: instructorId,
      alumno: alumnoId,
      cardioInicial: cardioInicial,
      cardioFinal: cardioFinal,
      calentamiento: calentamiento,
      vueltaALaCalma: vueltaALaCalma,
      ejercicios: ejercicios,
    });
    res.json({ message: 'Rutina actualizada' });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la rutina' });
  }
}

rutinaCtrl.deleteRutina = async (req, res) => {
  const rutinaId = req.params.id; // Se espera que el ID de la rutina a eliminar se pase como parámetro en la URL

  try {
    // Eliminar la rutina seleccionada por su ID
    await Rutina.deleteOne({ _id: rutinaId });

    res.json({ message: 'Rutina eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la rutina' });
  }
};
module.exports = rutinaCtrl;