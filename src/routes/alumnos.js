const { Router } = require('express')
const router = Router();

const { getAlumnos, createAlumno, getAlumno, updateAlumnoByRut, updateAlumno, deleteAlumno, login, getAlumnoByRut, acceptAlumno } = require('../controllers/AlumnosController');

router.route('/')
    .get(getAlumnos)
    .post(createAlumno);

router.route('/:id')
    .get(getAlumno)
    .delete(deleteAlumno)
    .put(updateAlumno)

router.route('/login')
    .post(login);

router.route('/rut')
    .post(getAlumnoByRut);

router.route('/rut/:rut')
    .put(updateAlumnoByRut);

router.route('/aceptar/:id')
    .put(acceptAlumno);
    
module.exports = router;