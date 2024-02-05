const { authJwt, validations } = require('../middleware');
const agentController = require('../controllers/agent.controller');
const multer = require('multer');

// Initialize upload directory
const upload = multer({ dest: 'public/' });

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
  app.group('/api/agent', (router) => {
    // Middleware for verifying token and checking if the user is an agent
    router.use([authJwt.verifyToken, authJwt.isAgent]);

    // Agent Profile Routes
    router.get('/profile', agentController.agent.index);
    router.get('/wallet', (req, res) => {
      return res.send({balance: req.agent.wallet})
    });
    router.patch('/profile', validations.agent.agentUpdateValidation, agentController.agent.update);

    // Agent Logo Routes
    router.group('/logo', (logoRouter) => {
      // Update agent logo
      logoRouter.put('/', upload.fields([{ name: 'logo', maxCount: 1 }]), validations.agent.agentLogo, agentController.agent.logoUpdate);

      // Remove agent logo
      logoRouter.delete('/', agentController.agent.logoRemove);
    });

    // Agent Documents CRUD Routes
    router.group('/documents', (documentsRouter) => {
      // Upload New Document
      documentsRouter.post('/', upload.fields([{ name: 'documents', maxCount: 5 }]), validations.agent.agentDocs, agentController.agentDocuments.create);

      // Remove Document by ID
      documentsRouter.delete('/:document_id', agentController.agentDocuments.remove);

      // Get all documents based on agent ID
      documentsRouter.get('/', agentController.agentDocuments.index);
    });

    /**
     * Agent Flight bookings
     */
    router.group('/bookings', (bookingsRouter) => {
      bookingsRouter.get('/', agentController.agentBookings.index);
      // bookingsRouter.delete('/:document_id', agentController.agentDocuments.remove);
    });

  });
};
