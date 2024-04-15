const { Router } = require('express');
const router = Router();

const { createEjercicio, getEjercicios, deleteEjercicio, modificarEjercicio } = require('../controllers/ejerciciosController');

router.route('/')
    .post(createEjercicio)
    .get(getEjercicios)

router.route('/:id')
    .delete(deleteEjercicio)
    .put(modificarEjercicio)

module.exports = router;