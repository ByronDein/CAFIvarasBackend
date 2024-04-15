const usuarioCtrl = {};

const Usuario = require('../models/usuario');

usuarioCtrl.getUsuarios = async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios)
};

usuarioCtrl.createUsuario = async (req, res) => {
    const { nombreUsuario } = req.body;
    const newUsuario = new Usuario({
        nombreUsuario,
    })
    await newUsuario.save();
    res.json({message: 'Usuario guardado'})
};

usuarioCtrl.getUsuario = async (req, res) =>  {
    const usuario = await Usuario.findById(req.params.id);
    res.json(usuario)
};

usuarioCtrl.updateUsuario = async (req, res) => {
    const { nombreUsuario } = req.body;
    await Usuario.findByIdAndUpdate({_id: req.params.id}, {
        nombreUsuario,
    });
    res.json({message: 'Usuario actualizado'})
};

usuarioCtrl.deleteUsuario = async (req, res) => {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({message: 'Usuario eliminado'})
};

module.exports = usuarioCtrl;