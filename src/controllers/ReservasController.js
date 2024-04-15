const reservaCtrl = {};

const Reserva = require("../models/reserva");

const moment = require("moment");

const XLSX = require("xlsx");

const _ = require("lodash");
const reserva = require("../models/reserva");
const Alumno = require("../models/alumno");

reservaCtrl.getReservas = async (req, res) => {
  const reservas = await Reserva.find();
  res.json(reservas);
};

reservaCtrl.getReservasReporte = async (req, res) => {
  //const orderBy = [{ order: "orderByRut", direction: "desc" }];
  //TODO: Extraer orderBy del cuerpo de la solicitud

  const { orderBy, startDate, endDate } = req.body;
  console.log("orderBy", orderBy, startDate, endDate);
  
  const reservas = await getReservas(startDate, endDate);
  console.log("reservas", reservas);
  for (let i = 0; i < reservas.length; i++) {
    const reserva = reservas[i];
    const alumno = await encontrarNombre(reserva);
    reserva.nombre = alumno?.nombre?? "";
    reserva.rut = alumno?.rut?? "";
    reserva.asistencia = reserva.asistencia ? "Si" : "No";
    
  }
  const workbook = generateAttendanceSheet(reservas, orderBy); //generar reporte

  // Conviertes el workbook a formato binario
  const binaryWorkbook = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "binary",
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
  res.send(Buffer.from(binaryWorkbook, "binary"));
};
async function getReservasByRut(rut, fecha = new Date()) {
  const startOfWeek = moment(fecha).startOf("week").toDate();
  const endOfWeek = moment(fecha).endOf("week").toDate();

  const reservasSemana = await Reserva.aggregate([
    {
      $match: {
        rut: rut,
        diaReserva: {
          $gte: startOfWeek,
          $lte: endOfWeek,
        },
      },
    },
    {
      $lookup: {
        from: "sesions",
        localField: "numeroSesion",
        foreignField: "numeroSesion",
        as: "sesion",
      },
    },
  ]);
  return reservasSemana;
}

reservaCtrl.getReservasByRut = async (req, res) => {
  const reservasSemana = await getReservasByRut(req.body.rut, req.body.fecha);
  res.json(reservasSemana);
};

reservaCtrl.createReserva = async (req, res) => {
  const { rut, numeroSesion, diaReserva } = req.body;
  const newReserva = new Reserva({
    rut,
    numeroSesion,
    diaReserva,
  });
  await newReserva.save();
  res.json({ message: "Reserva creada" });
};

reservaCtrl.createReservas = async (req, res) => {
  const { rut, sesiones, fecha } = req.body;
  const nuevasReservas = [];
  const reservasEliminadas = [];
  const reservasAntiguas = await getReservasByRut(rut, fecha);
  const sesionesAlumnos = reservasAntiguas.map((r) => r?.sesion[0]);
  const reservasAsistidas = reservasAntiguas.filter((reserva) => reserva.asistencia === true);
  const reservasNoAsistidas = reservasAntiguas.filter((reserva) => reserva.asistencia !== true);
  for (let i = 0; i < sesiones.length; i++) {
    const newReserva = new Reserva({
      rut,
      numeroSesion: sesiones[i].id,
      diaReserva: new Date(sesiones[i].start),
    });
    const yaAsistido = reservasAsistidas.some((reserva) => reserva.numeroSesion === newReserva.numeroSesion);
    if(!yaAsistido){
    nuevasReservas.push(newReserva);}
  }
  reservasNoAsistidas.forEach((reserva) => {
    reservasEliminadas.push(reserva._id);
  });
  console.log("reservas", nuevasReservas);
  //console.log("reservasNoAsistidas",reservasNoAsistidas);
  await Reserva.deleteMany({ _id: { $in: reservasEliminadas } });
  await Reserva.insertMany(nuevasReservas);
  res.json({ message: "Reservas creadas", reservas: nuevasReservas });
};

reservaCtrl.getReserva = async (req, res) => {
  const reserva = await Reserva.find({ rut: req.params.id, asistencia: false });
  res.json(reserva);
};

reservaCtrl.updateReserva = async (req, res) => {
  const { rut, numeroSesion, diaReserva } = req.body;
  await reserva.findByIdAndUpdate(
    { _id: req.params.id },
    {
      rut,
      numeroSesion,
      diaReserva,
      fecha,
    }
  );
  res.json({ message: "Reserva actualizada" });
};

reservaCtrl.deleteReserva = async (req, res) => {
  await Reserva.findByIdAndDelete(req.params.id);
  res.json({ message: "reserva eliminada" });
};

const generateAttendanceSheet = (
  reservas = [],
  orderBy = { order: "orderByRut", direction: "asc" }
) => {
  let reservasOrdenadas = [...reservas];
  console.log("orderBy", orderBy);
  console.log("reservasOrdenadas", reservasOrdenadas);
  reservasOrdenadas.sort((a, b) => {
    let valueA, valueB;
    let momentA, momentB;
    
    if (orderBy.order === "orderByRut") {
      valueA = a.rut;
      valueB = b.rut;
    } else if (orderBy.order === "orderByDate") {
      momentA = moment(a.diaReserva, "YYYY/MM/DD");
      momentB = moment(b.diaReserva, "YYYY/MM/DD");
      valueA = momentA.isValid() ? momentA.valueOf() : null;
      valueB = momentB.isValid() ? momentB.valueOf() : null;
    } else {
      return 0;
    }

    if (valueA < valueB) {
      return orderBy.direction === "asc" ? -1 : 1;
    } else if (valueA > valueB) {
      return orderBy.direction === "asc" ? 1 : -1;
    } else {
      return 0;
    }
  });
 
  let sortedStudents = [];

  const worksheetData = [];
  

  reservasOrdenadas.forEach((reserva) => {
    if (reserva.nombre === "" || reserva.rut === "")  {
      return;
    }
    
    const row = {
      Nombre: reserva.nombre,
      Rut: reserva.rut,
      Asistencia: reserva?.asistencia? "Si" : "No",
      Fecha: moment(reserva.diaReserva).format("DD/MM/YYYY")
    };
    
    worksheetData.push(row);
  });
  
  
  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
  return workbook;
};
async function encontrarNombre(reserva) {
  const alumno = await Alumno.findOne({ rut: reserva.rut });
  return alumno;
}
async function getReservas(startDate, endDate) {
  try {
    const query = {};

    if (startDate && endDate) {
      query.diaReserva = {
        $gte: startDate,
        //$lte: endDate,
        $lte: moment(endDate).add(1, 'day').toDate(),
      };
    }

    const reservas = await Reserva.find(query);
   

    return reservas;
  } catch (err) {
    console.error(err);
    return [];
  }
}
module.exports = reservaCtrl;
