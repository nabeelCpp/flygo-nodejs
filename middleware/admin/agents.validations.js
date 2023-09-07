const { body, validationResult } = require('express-validator');
/**
 * Used this agentAuthController to rollback the files uploaded either logo or ducuments if any error occured.
 */
const agentAuthController = require('../../controllers/agent.auth.controller')

exports.agentUpdateValidation = [
    body('mobile', 'Mobile number must be valid number!').isMobilePhone(),
    body('landline').optional(),
    body('country').optional(),
    body('city').optional(),
    body('travelAgentId', 'Travel Agent ID is required!').notEmpty(),
    body('representativeName', 'Representative Name is required!').isString().notEmpty(),
    body('akama', 'Akama is required!').notEmpty(),
    body('status', 'Status must be 0/1').isInt({ min: 0, max: 1 }),
    body('creditLimit', 'Credit Limit must be a float positive integer').isFloat({ min: 0 }),
    body('serviceCharges', 'Service Charges must be a float positive integer').isFloat({ min: 0 }),
    body('serviceChargesType').custom((value) => {
      if (value !== 'F' && value !== 'P') {
        throw new Error('Service charges type must be either "F": Flat or "P": Percentage');
      }
      return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]


exports.agentCreateValidations = [
  body('mobile', 'Mobile number must be valid number!').isMobilePhone(),
  body('landline').optional(),
  body('country').optional(),
  body('city').optional(),
  body('travelAgentId', 'Travel Agent ID is required!').notEmpty(),
  body('representativeName', 'Representative Name is required!').isString().notEmpty(),
  body('akama', 'Akama is required!').notEmpty(),
  body('password', 'Password must be strong. It should contain at least 8 characters, including uppercase, lowercase, and special characters.').isStrongPassword(),
  body('status', 'Status must be 0/1').isInt({ min: 0, max: 1 }),
  body('creditLimit', 'Credit Limit must be a float positive integer').isFloat({ min: 0 }),
  body('serviceCharges', 'Service Charges must be a float positive integer').isFloat({ min: 0 }),
  body('serviceChargesType').custom((value) => {
    if (value !== 'F' && value !== 'P') {
      throw new Error('Service charges type must be either "F": Flat or "P": Percentage');
    }
    return true;
  }),
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
          return res.status(400).json({ errors: errorsArr });
      }
      next();
  }
]