const { Router } = require('express')
const router = Router();

const { getReservas, getReservasByRut, createReserva, createReservas, getReserva, updateReserva, deleteReserva, getReservasReporte } = require('../controllers/ReservasController');

router.route('/')
    .get(getReservas)
    .post(createReservas);

router.route('/:id')
    .get(getReserva)
    .put(updateReserva)
    .delete(deleteReserva)

router.route('/alumno')
    .post(getReservasByRut);

router.route('/reporte')
    .post(getReservasReporte);
module.exports = router;