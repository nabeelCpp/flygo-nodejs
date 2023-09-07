const { authJwt } = require("../middleware");

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
    router.get("/test", (req, res) => {
        return res.send({
            message: true
        })
    })

  });
};