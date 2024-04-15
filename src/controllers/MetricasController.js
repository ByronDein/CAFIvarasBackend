const metricaCtrl = {};

const moment = require('moment');
const Metrica = require('../models/metrica');
const XLSX = require("xlsx");
const Alumno = require('../models/alumno')
metricaCtrl.getMetricas = async (req, res) => {
  try {
    const { rut } = req.query;
    const metrica = await Metrica.find({ rut: rut });

    if (!metrica) {
      throw new Error('No se encontraron métricas para el alumno con el rut proporcionado');
    } else {
      res.json(metrica); // devolver la métrica más reciente
      return metrica; // devolver la métrica más reciente
    }
  } catch (error) {
    console.error(error);
  }
};


metricaCtrl.getMetricasReporte = async (req, res) => {
  const { orderBy, startDate, endDate, rutFiltro } = req.body;
  const metricas = await getMetricasReporteFiltro(startDate, endDate, rutFiltro); // Pasa rutFiltro a la función
  const workbook = await generateMetricsSheet(metricas, orderBy);

  const binaryWorkbook = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "binary",
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=" + "MetricsReport.xlsx");
  res.send(Buffer.from(binaryWorkbook, "binary"));
};
async function getMetricasReporteFiltro(startDate, endDate, rutFiltro) {
  try {
    const query = {};

    if (rutFiltro) {
      query.rut = rutFiltro;
    }

    if (startDate && endDate) {
      query.fecha = {
        $gte: startDate,
        $lte: moment(endDate).add(1, 'day').toDate(),
      };
    }

    const metricas = await Metrica.find(query);
    return metricas;
  } catch (err) {
    console.error(err);
    return [];
  }
};
async function getNombreAlumnoPorRut(rut) {
  try {
    const alumno = await Alumno.findOne({ rut }); // Busca al alumno por el RUT

    if (!alumno) {
      return 'Alumno no encontrado'; // Retorna un valor predeterminado si el alumno no se encuentra
    }

    return alumno.nombre; // Retorna el nombre del alumno
  } catch (error) {
    console.error('Error obteniendo el nombre del alumno:', error);
    return 'Error al obtener el nombre del alumno';
  }
};


metricaCtrl.getMetricaByRut = async (req, res) => {
  try {
    const { rut } = req.body;
    const metrica = await Metrica.findOne({ rut: rut }).sort({ fecha: -1 }).limit(1);

    if (!metrica) {
      throw new Error('No se encontraron métricas para el alumno con el rut proporcionado');
    } else {
      res.json(metrica); // devolver la métrica más reciente
      return metrica; // devolver la métrica más reciente
    }
  } catch (error) {
    console.error(error);
  }
};



metricaCtrl.createMetrica = async (req, res) => {
  const date =moment().format('LLLL');
    const {  edad, altura, peso, imc, porcentajeGrasaCorporal, grasaVisceral, porcentajeGrasaMuscular, rut, } = req.body;
    const newMetrica = new Metrica({
        edad: edad + 'años',
        altura: altura + 'mts',
        peso: peso + 'kg',
        imc,
        porcentajeGrasaCorporal: porcentajeGrasaCorporal + '%',
        grasaVisceral: grasaVisceral + 'cm',
        porcentajeGrasaMuscular: porcentajeGrasaMuscular + '%',
        rut,
        fecha: date,
        
    })
    await newMetrica.save();
    res.json({message: 'Metrica guardada'})
};

metricaCtrl.getMetrica = async (req, res) =>  {
    const metrica = await Metrica.findById(req.params.id);
    res.json(metrica)
};

metricaCtrl.updateMetrica = async (req, res) => {
    const { rut, edad, altura, peso, imc, porcentajeGrasaCorporal, grasaViceral, porcentajeGrasaMuscular } = req.body;
    
    await Metrica.findByIdAndUpdate({_id: req.params.id}, {
        rut,
        edad,
        altura,
        peso,
        imc,
        porcentajeGrasaCorporal,
        grasaViceral,
        porcentajeGrasaMuscular,
    });
    res.json({message: 'Metrica actualizada'})
};

metricaCtrl.deleteMetrica = async (req, res) => {
    await Metrica.findByIdAndDelete(req.params.id);
    res.json({message: 'Metrica eliminada'})
};
const generateMetricsSheet = async (
  metricas = [],
  orderBy = { order: "orderByRut", direction: "asc" }) => {
  let metricasOrdenadas = [...metricas];
  // console.log("orderBy", orderBy);
  // console.log("metricasOrdenadas", metricasOrdenadas);
  metricasOrdenadas.sort((a, b) => {
    let valueA, valueB;
    let momentA, momentB;
    
    if (orderBy.order === "orderByRut") {

      //12 caracteres
      valueA = a.rut;
      valueB = b.rut;
    } else if (orderBy.order === "orderByDate") {
      //console.log(a.fecha, b.fecha)
      momentA = moment(a.fecha, "YYYY/MM/DD"); // Cambiado el formato a "DD/MM/YYYY"
      momentB = moment(b.fecha, "YYYY/MM/DD"); // Cambiado el formato a "DD/MM/YYYY"
      valueA = momentA.isValid() ? momentA.valueOf() : null;
      valueB = momentB.isValid() ? momentB.valueOf() : null;
    } else {
      //console.log("valueA", valueA)
      return 0;
    }
      // console.log("valueA", valueA)
      // console.log("valueB", valueB)
    if (valueA < valueB) {
      //console.log(momentA.valueOf())
      return orderBy.direction === "asc" ? -1 : 1;
    } else if (valueA > valueB) {
      //console.log(momentB.valueOf())
      return orderBy.direction === "asc" ? 1 : -1;
    } else {
      return 0;
    }

  });
  //console.log("metricasOrdenadas", metricasOrdenadas.map((metrica) => metrica.fecha));
  const worksheetData = [];

  for (const metrica of metricasOrdenadas) {
    if (metrica.rut === "") {
      return;
    }

    try {
      const nombreAlumno = await getNombreAlumnoPorRut(metrica.rut);
      //console.log("nombre alumno", nombreAlumno);
      const row = {
        Nombre: nombreAlumno,
        RutAlumno: metrica.rut,
        FechaValor: moment(metrica.fecha).format("DD/MM/YYYY"),
        Edad: "Edad",
        EdadAlumno: metrica.edad,
        Altura: "Altura",
        AlturaAlumno: metrica.altura,
        Peso: "Peso",
        PesoAlumno: metrica.peso,
        IMC: "IMC",
        IMCAlumno: metrica.imc,
        PorcentajeGrasaCorporal: "PGC",
        porcentajeGrasaCorporal: metrica.porcentajeGrasaCorporal,
        GrasaVisceral: "GV",
        GrasaVisceral: metrica.grasaVisceral,
        PorcentajeGrasaMuscular: "PGM",
        PorcentajeGrasaMuscular: metrica.porcentajeGrasaMuscular,
      };

      worksheetData.push(row);
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Metrics');
  return workbook;
};



module.exports = metricaCtrl;