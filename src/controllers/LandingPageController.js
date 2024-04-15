const LandingPage = require("../models/landingPage");

const landingPageCtrl = {};

landingPageCtrl.actualizarLandingPage = async (req, res) => {
  const { titulo, descripcion, imagenBase64 } = req.body;

  try {
    let landingPage = await LandingPage.findOne();

    if (!landingPage) {
      // Si no se encuentra una landing page existente, se crea una nueva
      landingPage = new LandingPage({
        titulo,
        descripcion,
        imagenBase64,
      });
    } else {
      // Si se encuentra una landing page existente, se actualizan los campos según los valores proporcionados
      if (titulo) {
        landingPage.titulo = titulo;
      }
      if (descripcion) {
        landingPage.descripcion = descripcion;
      }
      if (imagenBase64) {
        landingPage.imagenBase64 = imagenBase64;
      }
    }

    await landingPage.save();

    res.json({ message: "Landing page actualizada", landingPage });
  } catch (error) {
    console.error("Error al actualizar la landing page:", error);
    res.status(500).json({ message: error});
  }
};

landingPageCtrl.getLandingPage = async (req, res) => {
  try {
    let landingPage = await LandingPage.findOne();

    if (!landingPage) {
      // Si no se encuentra una landing page existente, se crea una nueva
      throw new Error("No se encontró una landing page existente");
    }

    res.json(landingPage);
  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};


module.exports = landingPageCtrl;
