const { body, validationResult } = require('express-validator');

const agentAuthController = require('../controllers/agent.auth.controller')
/**
 * Validation for User login
 */
const commonController = require('../controllers/common/commonFuncs')
exports.login = [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return commonController.catchError(res, errors.array(), 400)
        }
        next();
    }
]


/**
 * Validations for user going to be registered.
 */

exports.register = [
    body('firstName', 'First Name is required!').notEmpty(),
    body('lastName').optional(),
    body('email').isEmail(),
    body('password', 'Password must be strong. It should contain at least 8 characters, including uppercase, lowercase, and special characters.').isStrongPassword(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return commonController.catchError(res, errors.array(), 400)
        }
        next();
    }
]

/**
 * Validation for Agent login
 */
exports.agentLogin = [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return commonController.catchError(res, errors.array(), 400)
        }
        next();
    }
]


/**
 * Validation for Admin login
 */
exports.adminLogin = [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return commonController.catchError(res, errors.array(), 400)
        }
        next();
    }
]

/**
 * Agent register validations
 */
exports.agentRegister = [
    body('mobile', 'Mobile is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('travelAgentId', 'Travel Agent Id is required').not().isEmpty(),
    body('companyName', 'Company Name is required').not().isEmpty(),
    body('representativeName', 'Representative Name is required').not().isEmpty(),
    body('akama', 'Akama is required').not().isEmpty(),
    body('password', 'Password must be strong. It should contain at least 8 characters, including uppercase, lowercase, and special characters.').isStrongPassword(),
    (req, res, next) => {
        const errors = validationResult(req);
        let errorsArr = errors.array()
        if(!req.files.logo) {
            errorsArr.push({
                type: "file",
                msg: "Please include logo file.",
                path: "logo",
                location: "body"
            })
        }
        if (!errors.isEmpty() || errorsArr.length ) {
            agentAuthController.removeFilesUploaded(req)
            return commonController.catchError(res, errorsArr, 400)
        }
        next();
    }
]