const sesionCtrl = {};

const Sesion = require('../models/sesion');
const Reserva = require('../models/reserva');
const Alumno = require('../models/alumno');
const SesionesDesactivada = require('../models/sesionesDesactivada');

const moment = require('moment');

sesionCtrl.getSesiones = async (req, res) => {
  const fecha = req.query.fecha;
  const inicioSemana = moment(fecha).startOf('isoWeek').toDate();
  const finSemana = moment(fecha).endOf('isoWeek').toDate();
  Sesion.aggregate([
    {
      $lookup: {
        from: 'reservas',
        let: { sesionNumero: '$numeroSesion' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$numeroSesion', '$$sesionNumero'] },
                  { $gte: ['$diaReserva', inicioSemana] },
                  { $lte: ['$diaReserva', finSemana] },
                ],
              },
            },
          },
        ],
        as: 'reservas',
      },
    },
    {
      $lookup: {
        from: 'sesionesdesactivadas',
        let: { sesionNumero: '$numeroSesion' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$numeroSesion', '$$sesionNumero'] },
                  { $gte: ['$dia', inicioSemana] },
                  { $lte: ['$dia', finSemana] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              desactivada: { $literal: true }, // Campo booleano para indicar que la sesión está desactivada
            },
          },
        ],
        as: 'sesionesDesactivadas',
      },
    },
    {
      $addFields: {
        count: { $size: '$reservas' },
        desactivada: { $cond: { if: { $gt: [{ $size: '$sesionesDesactivadas' }, 0] }, then: true, else: false } },
      },
    },
  ])
    .then((sesiones) => {
      res.json(sesiones);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};

sesionCtrl.getAlumnosBySesionNumber = async (req, res) => {
  try {
    const fecha = req.query.fecha;
    const inicioSemana = moment(fecha).startOf('isoWeek').toDate();
    const finSemana = moment(fecha).endOf('isoWeek').toDate();
    const numeroSesion = req.params.numeroSesion;

    // Buscar las reservas con el número de sesión especificado
    const reservas = await Reserva.find({
      numeroSesion: numeroSesion,
      diaReserva: {
        $gte: inicioSemana,
        $lte: finSemana
      }
    });

    // Obtener una lista de los ruts de los alumnos que tienen una reserva en la sesión especificada
    const rutsAlumnos = reservas.map(reserva => reserva.rut);

    // Buscar los alumnos correspondientes a los ruts encontrados
    const alumnos = await Alumno.find({ rut: { $in: rutsAlumnos } });

    // Agregar el campo de asistencia a cada alumno
    const alumnosConAsistencia = alumnos.map(alumno => {
      const reserva = reservas.find(reserva => reserva.rut === alumno.rut);
      const asistencia = reserva?.asistencia ?? false;
      return { rut: alumno.rut, nombre: alumno.nombre, id: alumno._id, asistencia: asistencia, reservaId: reserva._id, correo: alumno.correo };
    });

    res.send(alumnosConAsistencia);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener la lista de alumnos');
  }
};

sesionCtrl.updateAsistenciaByReservaId = async (req, res) => {
  try {
    const reservaId = req.params.id;
    const asistencia = req.body.asistencia; // Nuevo valor de asistencia

    // Actualizar la reserva con el nuevo valor de asistencia
    await Reserva.findByIdAndUpdate(reservaId, { asistencia: asistencia });

    res.status(200).send('Asistencia actualizada');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar la asistencia');
  }
};


sesionCtrl.createSesion = async (req, res) => {
  const { horaIni, horaFin, cantidadUsuarios, dia } = req.body;

// Convierte las cadenas de texto en objetos Date para facilitar la comparación
  //horaIni and HoraFin validate 00:00 format
  if(horaIni.length != 5 || horaFin.length != 5){
    return res.status(400).json({ error: 'Formato de hora incorrecto' });
  }

  // const currentDate = new Date();
  
  // const [horaIniHours, horaIniMinutes] = horaIni.split(':');
  // const [horaFinHours, horaFinMinutes] = horaFin.split(':');
  
  // const horaIniDate = new Date(currentDate.setHours(horaIniHours, horaIniMinutes, 0));
  // const horaFinDate = new Date(currentDate.setHours(horaFinHours, horaFinMinutes, 0));

  // console.log(horaIniDate, horaFinDate)

  const horaIniDate = new Date(`2023-09-13T${horaIni}`);
  const horaFinDate = new Date(`2023-09-13T${horaFin}`);


// Convierte las cadenas de texto en objetos Date para las sesiones existentes
  const existingSesiones = await Sesion.find({ dia });

// Verifica si hay alguna sesión existente que se superponga en el tiempo con la nueva sesión
  const overlappingSesion = existingSesiones.find(existingSesion => {
    const existingHoraIniDate = new Date(`2023-09-13T${existingSesion.horaIni}`);
    const existingHoraFinDate = new Date(`2023-09-13T${existingSesion.horaFin}`);

    // Extraer (hours, minutes, seconds) de los objetos Date
    const existingHoraIniTime = existingHoraIniDate.getHours() * 3600 + existingHoraIniDate.getMinutes() * 60 + existingHoraIniDate.getSeconds();
    const existingHoraFinTime = existingHoraFinDate.getHours() * 3600 + existingHoraFinDate.getMinutes() * 60 + existingHoraFinDate.getSeconds();
    const horaIniTime = horaIniDate.getHours() * 3600 + horaIniDate.getMinutes() * 60 + horaIniDate.getSeconds();
    const horaFinTime = horaFinDate.getHours() * 3600 + horaFinDate.getMinutes() * 60 + horaFinDate.getSeconds();

    // Comparar los tiempos de las sesiones y si existe alguna superposición
    return (
      (horaIniTime >= existingHoraIniTime && horaIniTime <= existingHoraFinTime) ||
      (horaFinTime >= existingHoraIniTime && horaFinTime <= existingHoraFinTime) ||
      (horaIniTime <= existingHoraIniTime && horaFinTime >= existingHoraFinTime)
    );
  });


  if (overlappingSesion) {
    return res.status(400).json({ error: 'La nueva sesión se superpone con una sesión existente.' });
  }
   // Paso 1: Buscar el número de sesión más alto en la base de datos
   const highestSession = await Sesion.findOne({}, { numeroSesion: 1 }, { sort: { numeroSesion: -1 } });

   // Inicializa el nuevo número de sesión
   let newNumeroSesion = 1;
 
   // Si se encontró el número de sesión más alto, incrementa en 1 para el nuevo
   if (highestSession) {
     newNumeroSesion = highestSession.numeroSesion + 1;
   }
  const newSesion = new Sesion({
    horaIni,
    horaFin,
    cantidadUsuarios,
    dia,
    numeroSesion: newNumeroSesion
  });

  try {
    await newSesion.save();
    res.json({ message: 'Sesión guardada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la sesión' });
  }
  
};

sesionCtrl.getSesion = async (req, res) => {
  const sesion = await Sesion.findById(req.params.id);
  res.json(sesion)
};

sesionCtrl.updateSesion = async (req, res) => {
  const { horaIni, horaFin, cantidadUsuarios, dia, numeroSesion } = req.body;
  await sesion.findByIdAndUpdate({ _id: req.params.id }, {
    horaIni,
    horaFin,
    cantidadUsuarios,
    dia,
    numeroSesion
  });
  res.json({ message: 'sesion actualizada' })
};

sesionCtrl.deleteSesion = async (req, res) => {
  try {
    
    // get id from params
    //buscar sesion con numero sesion igual a numero sesion de la sesion a eliminar
    const sesion = await Sesion.findOne({ numeroSesion: req.params.id });
    
    //eliminar sesion
    await sesion.deleteOne();
    //eliminar reservas de la sesion
    // await Reserva.deleteMany({ numeroSesion: req.params.id });

    //eliminar sesiones desactivadas de la sesion
    // await SesionesDesactivada.deleteMany({ numeroSesion: req.params.id });

    res.json({ message: 'sesion eliminada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la sesion' });
  }
};

sesionCtrl.desactivarSesion = async (req, res) => {
  try {
    const numeroSesion = req.params.numeroSesion;
    const { activar, fecha } = req.body;
    console.log(activar, fecha);
    const inicioSemana = moment(fecha).startOf('isoWeek').toDate();
    const finSemana = moment(fecha).endOf('isoWeek').toDate();

    if (activar) {
      await SesionesDesactivada.deleteMany({
        dia: {
          $gte: inicioSemana,
          $lte: finSemana
        },
        numeroSesion
      });
    } else {
      const newSesionDesactivada = new SesionesDesactivada({
        dia: moment(fecha).toDate(),
        numeroSesion
      });
      await newSesionDesactivada.save();
    }

    res.status(200).send('Sesion actualizada');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar la asistencia');
  }
};


module.exports = sesionCtrl;