const multer = require('multer')

/**
 * Import authJwt middleware as this controller is authenticated controller for admins only.
 */
const { authJwt, validations } = require("../middleware");

/**
 * 
 * Require admin controller.  
 */


const adminController = require('../controllers/admin.controller')

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

  app.group("/api/admin", (router) => {
    router.use([authJwt.verifyToken, authJwt.isAdmin]);
    router.get("/test", (req, res) => {
        return res.send({
            message: true
        })
    })


    /****************************************************************************************************
     *                                      Agents Routes starts here.
    ****************************************************************************************************/

    /**
     * Route to get all the agents and display them as json array.
     */
    router.get("/agents", adminController.agents.index)

    /**
     * Agent by id
     */
    router.get("/agents/(:id)", adminController.agents.index)

    /**
     * Update agent data.
     */

    router.patch("/agents/(:id)", validations.admin.agents.agentUpdateValidation, adminController.agents.update)
    
    /**
     * Delete Agent data.
     */

    router.delete("/agents/(:id)", adminController.agents.delete)


    /**
     * Create agent
     */
    router.post("/agents", upload.fields([{name: 'logo', maxCount:1}, {name: 'documents', maxCount: 5}]),validations.admin.agents.agentCreateValidations, adminController.agents.create)

    /**
     * Update agent Logo 
     */
    router.put("/agents/logo/(:id)", upload.fields([{name: 'logo', maxCount:1}]),validations.admin.agents.agentLogo, adminController.agents.logoUpdate)

    /**
     * Agent documents crud
     */

    /**
     * Upload New Document
     */

    router.put("/agents/documents/(:agent_id)", upload.fields([{name: 'documents', maxCount:5}]),validations.admin.agents.agentDocs, adminController.agentDocuments.create)

    /**
     * Remove Document
     */

    router.delete("/agents/documents/(:agent_id)/(:document_id)", adminController.agentDocuments.remove)
    
    /**
     * Get all documents based on agent id
     */
    router.get("/agents/documents/(:agent_id)", adminController.agentDocuments.index)



    /****************************************************************************************************
     *                                      User Routes starts here.
    ****************************************************************************************************/
    /**
     * Fetch All users.
     */
    router.get("/users", adminController.users.index)
    /**
     * Fetch user by id.
     */
    router.get("/users/(:id)", adminController.users.index)
    /**
     * Update specific user
     */
    router.patch("/users/(:id)", validations.admin.users.userUpdate, adminController.users.update)

    /**
     * Update user's image
     */
    router.put("/users/(:id)", upload.fields([{name: 'image', maxCount:1}]), validations.admin.users.userPicture, adminController.users.updateImage)
    /**
     * Creat new user
     */
    router.post("/users", validations.admin.users.userCreate, adminController.users.store)
    /**
     * Remove user by id.
     */
    router.delete("/users/(:id)", adminController.users.delete)
  });
};