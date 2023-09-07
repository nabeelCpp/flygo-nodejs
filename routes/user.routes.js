const { authJwt } = require("../middleware");

module.exports = function(app) {

    /**
     * @swagger
     * tags:
     *   name: User-Dashboard
     *   description: User Secured APIs
     * securityDefinitions:
     *   bearerToken:
     *     type: string
     *     name: Authorization
     *     in: header
     *     description: Bearer Token in the format 'Bearer <token>'
    */
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.group("/api/user", (router) => {
    router.use([authJwt.verifyToken, authJwt.isUser]);

    /**
     * @swagger
     * /api/user/test:
     *  get:
     *      summary: Test authenticated api
     *      tags: [User-Dashboard]
     *      security:
     *        bearerToken: []
     *      description: Test authenticated api
     *      responses: 
     *          200:
     *              description: Successfull response 
     */
    router.get("/test", (req, res) => {
        return res.send({
            message: true
        })
    })

  });
};