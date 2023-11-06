const { authJwt, validations } = require("../middleware");

const agentController = require('../controllers/agent.controller')
const multer = require('multer')
/**
 * initialize upload directory
 */
const upload = multer({ dest: 'public/' });

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.group("/api/agent", (router) => {
    router.use([authJwt.verifyToken, authJwt.isAgent]);
    router.get("/profile", agentController.agent.index)
    router.patch("/profile", validations.agent.agentUpdateValidation, agentController.agent.update)
    /**
     * Update agent Logo 
     */
    router.put("/logo", upload.fields([{name: 'logo', maxCount:1}]),validations.agent.agentLogo, agentController.agent.logoUpdate)

    /**
     * Remove agent Logo 
     */
    router.delete("/logo", agentController.agent.logoRemove)

    /***************************************************************************************************
     *                                          Agent documents crud
     **************************************************************************************************/

    /**
     * Upload New Document
     */

    router.post("/documents", upload.fields([{name: 'documents', maxCount:5}]),validations.agent.agentDocs, agentController.agentDocuments.create)

    /**
     * Remove Document
     */

    router.delete("/documents/(:document_id)", agentController.agentDocuments.remove)
    
    /**
     * Get all documents based on agent id
     */
    router.get("/documents", agentController.agentDocuments.index)

    /**
     * Sabre API calls.
     */
    
  });
};