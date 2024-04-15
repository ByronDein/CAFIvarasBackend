const mongoose = require("mongoose");

// Definir el esquema del modelo
const landingPageSchema = new mongoose.Schema({
  titulo: {
    type: String,
},
  descripcion: { 
    type: String, 
},
  imagenBase64: { 
    type: String, 
},
});

// Crear el modelo a partir del esquema
const LandingPage = mongoose.model("LandingPage", landingPageSchema);

module.exports = LandingPage;
