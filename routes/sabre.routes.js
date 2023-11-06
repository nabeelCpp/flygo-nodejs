const { validations } = require('../middleware');
const SabreController = require('../controllers/sabre.controller')

module.exports = function (app) {
  // CORS headers middleware
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // Group routes under "/api/agent"
  app.group('/api/sabre', (router) => {
    router.use([ validations.sabre.authToken ]);
    router.post('/flights', validations.sabre.offersShop, SabreController.AirShop.flights)
    router.post('/flights/revalidate', validations.sabre.revalidate, SabreController.AirShop.revalidate)
    router.post('/flights/book', validations.sabre.booking, SabreController.AirShop.booking)
  });
};
