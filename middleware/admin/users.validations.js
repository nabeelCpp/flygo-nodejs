const { body, validationResult } = require('express-validator');

const userController = require('../../controllers/userPanel/modules/users.module')
const commonController = require('../../controllers/common/commonFuncs')

exports.userCreate = [
    body('firstName', 'First Name is required!').notEmpty(),
    body('lastName').optional(),
    body('email', 'Invalid email!').isEmail(),
    body('mobile', 'Please provide a valid mobile phone number!').isMobilePhone(),
    body('password', 'Password must be strong. It should contain at least 8 characters, including uppercase, lowercase, and special characters.').isStrongPassword(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return commonController.catchError(res, errors.array(), 400)
        }
        next();
    }
]

exports.userUpdate = [
    body('firstName', 'First Name is required!').notEmpty().optional(),
    body('lastName').optional(),
    body('email', 'Invalid email!').isEmail().optional(),
    body('mobile', 'Please provide a valid mobile phone number!').isMobilePhone().optional(),
    body('password', 'Password must be strong. It should contain at least 8 characters, including uppercase, lowercase, and special characters.').isStrongPassword().optional(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return commonController.catchError(res, errors.array(), 400)
        }
        next();
    }
]

/**
 * Validation for updating user's picture.
 */
exports.userPicture = [
    (req, res, next) => {
        const errors = validationResult(req);
        let errorsArr = errors.array()
        console.log(req.files)
        if(!req.files || !req.files.image) {
            errorsArr.push({
                type: "file",
                msg: "Picture file is required.",
                path: "image",
                location: "body"
            })
        }
        if (!errors.isEmpty() || errorsArr.length ) {
          userController.removeUploadedPicture(req)
          return commonController.catchError(res, errorsArr, 400)
        }
        next();
    }
  ]