const { Router } = require('express')
const router = Router();

const { getUsuarios, createUsuario, getUsuario, updateUsuario, deleteUsuario } = require('../controllers/UsuariosController');

router.route('/')
    .get(getUsuarios)
    .post(createUsuario);

router.route('/:id')
    .get(getUsuario)
    .put(updateUsuario)
    .delete(deleteUsuario)

module.exports = router;