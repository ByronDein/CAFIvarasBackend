const { Router } = require('express')
const router = Router();

const { saveRutinas, getRutinas, deleteRutina, editRutinasById,  getRutinaById } = require('../controllers/RutinasController');

//ruta para pedir por params ID
router.route('/alumno/:id')
    .put(editRutinasById)
    .delete(deleteRutina)
    .get(getRutinaById);

router.route('/alumno/')
    .post(saveRutinas)
    .get(getRutinas)

module.exports = router;