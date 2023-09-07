/**
 * Add neccessary packages . ie multer to upload files and logos
 */
const multer = require('multer')
const authController = require('../controllers/auth.controller');
const agentAuthController = require('../controllers/agent.auth.controller');
const adminAuthController = require('../controllers/admin.auth.controller');
const {authValidations} = require('../middleware');

/**
 * initialize upload directory
 */
const upload = multer({ dest: 'public/' });


/**
 * 
 * @param {*} app
 * export routes to the application. 
 */
module.exports = (app) => {
    app.use((req, res, next) => {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    /**
     * User registration & login API.
     */
    app.post('/api/user/register', authValidations.register, authController.register)
    app.post('/api/user/login',authValidations.login, authController.login)

    /**
     * Register & login agent
     */
    app.post('/api/agent/register', upload.fields([{name: 'logo', maxCount:1}, {name: 'documents', maxCount: 5}]) , authValidations.agentRegister, agentAuthController.register)
    app.post('/api/agent/login',authValidations.agentLogin, agentAuthController.login)

    /**
     * Admin Login Post api.
    */
    app.post('/api/admin/login',authValidations.adminLogin, adminAuthController.login)
    
}