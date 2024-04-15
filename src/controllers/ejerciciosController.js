const ejercicioCtrl = {};
const Ejercicio = require('../models/ejercicio');

ejercicioCtrl.getEjercicios = async (req, res) => {
    const ejercicios = await Ejercicio.find();
    res.json(ejercicios);
};
ejercicioCtrl.createEjercicio = async (req, res) => {
  try {
    const { ejercicios } = req.body;
    
    // Itera sobre las propiedades del objeto 'ejercicios' y guarda cada ejercicio
    for (const key in ejercicios) {
      if (ejercicios.hasOwnProperty(key)) {
        const ejercicio = ejercicios[key];
        const nombre = ejercicio.nombre;

        if (nombre && nombre.trim() !== '') {
          const ejercicioExistente = await Ejercicio.findOne({ nombre });

          if (!ejercicioExistente) {
            const newEjercicio = new Ejercicio({ nombre });
            await newEjercicio.save();
          } else {
            console.log(`Ejercicio ${nombre} ya existe, no se guarda duplicado`);
          }
        } else {
          console.log(`El nombre del ejercicio está vacío en la entrada ${key}`);
        }
      }
    }

    res.json({ message: 'Ejercicios guardados' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar los ejercicios', error: error.message });
  }
};

  
  
ejercicioCtrl.deleteEjercicio = async (req, res) => {
    await Ejercicio.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ejercicio eliminado' });
};
ejercicioCtrl.modificarEjercicio = async (req, res) => {
  const { _id, nombre } = req.body;

  try {
    // Usar findByIdAndUpdate para actualizar un ejercicio por su ID
    await Ejercicio.findByIdAndUpdate(_id, { nombre });
    res.json({ message: 'Ejercicio modificado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al modificar el ejercicio', error: error.message });
  }
  };
  



module.exports = ejercicioCtrl;