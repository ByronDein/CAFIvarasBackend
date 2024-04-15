const { Router } = require('express');
const router = Router();

const { actualizarLandingPage, getLandingPage } = require('../controllers/LandingPageController');

router.route('/landing-page')
  .put(actualizarLandingPage)
  .get(getLandingPage);

module.exports = router;
