const { authJwt, validations } = require("../middleware");

const userController = require('../controllers/user.controller')

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

  app.group("/api/user", (router) => {
    router.use([authJwt.verifyToken, authJwt.isUser]);
    router.get("/profile", userController.profile.index)
    router.patch("/profile", validations.user.userUpdate, userController.profile.update)
    /**
     * Update user's image
     */
    router.put("/profile/picture", upload.fields([{name: 'image', maxCount:1}]), validations.user.userPicture, userController.user.updateImage)
  });
};