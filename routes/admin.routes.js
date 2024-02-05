const multer = require("multer");
const { authJwt, validations } = require("../middleware");
const adminController = require("../controllers/admin.controller");
const upload = multer({ dest: "public/" });

module.exports = function (app) {
  // CORS headers middleware
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Group routes under "/api/admin"
  app.group("/api/admin", (router) => {
    // Middleware for authentication and admin role
    router.use([authJwt.verifyToken, authJwt.isAdmin]);

    // Agents Routes
    router.group("/agents", (agentsRouter) => {
      // Get all agents
      agentsRouter.get("/", adminController.agents.index);

      // Get agent by ID
      agentsRouter.get("/:id", adminController.agents.index);

      // Update agent data
      agentsRouter.patch(
        "/:id",
        validations.admin.agents.agentUpdateValidation,
        adminController.agents.update
      );

      // Delete agent
      agentsRouter.delete("/:id", adminController.agents.delete);

      /**
       * Agent accout topup
       */
      agentsRouter.post(
        "/topup",
        validations.admin.agents.agentTopUp,
        adminController.agents.topup
      );

      // Create agent
      agentsRouter.post(
        "/",
        upload.fields([
          { name: "logo", maxCount: 1 },
          { name: "documents", maxCount: 5 },
        ]),
        validations.admin.agents.agentCreateValidations,
        adminController.agents.create
      );

      // Update agent logo
      agentsRouter.put(
        "/logo/:id",
        upload.fields([{ name: "logo", maxCount: 1 }]),
        validations.admin.agents.agentLogo,
        adminController.agents.logoUpdate
      );

      // Remove agent logo
      agentsRouter.delete("/logo/:id", adminController.agents.logoRemove);

      // Agent documents CRUD
      agentsRouter.group("/documents", (agentDocsRouter) => {
        // Upload new document
        agentDocsRouter.put(
          "/:agent_id",
          upload.fields([{ name: "documents", maxCount: 5 }]),
          validations.admin.agents.agentDocs,
          adminController.agentDocuments.create
        );

        // Remove document
        agentDocsRouter.delete(
          "/:agent_id/:document_id",
          adminController.agentDocuments.remove
        );

        // Get all documents based on agent ID
        agentDocsRouter.get("/:agent_id", adminController.agentDocuments.index);
      });
    });

    // User Routes
    router.group("/users", (usersRouter) => {
      // Fetch all users
      usersRouter.get("/", adminController.users.index);

      // Fetch user by ID
      usersRouter.get("/:id", adminController.users.index);

      // Update specific user
      usersRouter.patch(
        "/:id",
        validations.admin.users.userUpdate,
        adminController.users.update
      );

      // Update user's image
      usersRouter.put(
        "/:id",
        upload.fields([{ name: "image", maxCount: 1 }]),
        validations.admin.users.userPicture,
        adminController.users.updateImage
      );

      // Create new user
      usersRouter.post(
        "/users",
        validations.admin.users.userCreate,
        adminController.users.store
      );

      // Remove user by ID
      usersRouter.delete("/:id", adminController.users.delete);
    });
  });
};
