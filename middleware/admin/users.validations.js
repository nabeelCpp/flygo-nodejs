const { body, validationResult } = require('express-validator');

exports.userCreate = [
    body('firstName', 'First Name is required!').notEmpty(),
    body('lastName').optional(),
    body('email').isEmail(),
    body('password', 'Password must be strong. It should contain at least 8 characters, including uppercase, lowercase, and special characters.').isStrongPassword(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]

exports.userUpdate = [
    body('firstName', 'First Name is required!').notEmpty().optional(),
    body('lastName').optional(),
    body('email').isEmail().optional(),
    body('password', 'Password must be strong. It should contain at least 8 characters, including uppercase, lowercase, and special characters.').isStrongPassword().optional(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]