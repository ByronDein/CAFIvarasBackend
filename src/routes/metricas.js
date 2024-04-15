const { Router } = require('express')
const router = Router();

const { getMetricas, createMetrica, getMetrica, updateMetrica, deleteMetrica, getMetricaByRut, getMetricasReporte } = require('../controllers/MetricasController');

router.route('/')
    .get(getMetricas)
    .post(createMetrica);

router.route('/:id')
    .get(getMetrica)
    .put(updateMetrica)
    .delete(deleteMetrica)

router.route('/alumno')
    .post(getMetricaByRut)

router.route('/reporte')
    .post(getMetricasReporte)
    
module.exports = router;