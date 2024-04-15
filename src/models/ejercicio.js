const mongoose = require("mongoose");
const ejercicioSchema = new mongoose.Schema({
    nombre: { type: String, required: true }
});
const ejercicio = mongoose.model("ejercicio", ejercicioSchema);
module.exports = ejercicio;