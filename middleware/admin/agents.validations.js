const { body, validationResult } = require('express-validator');
/**
 * Used this agentAuthController to rollback the files uploaded either logo or ducuments if any error occured.
 */
const agentAuthController = require('../../controllers/agent.auth.controller')
const commonController = require('../../controllers/common/commonFuncs')

exports.agentUpdateValidation = [
    body('mobile', 'Mobile number must be valid number!').isMobilePhone().optional(),
    body('email', 'Please include a valid email').isEmail().optional(),
    body('landline').optional(),
    body('country').optional(),
    body('city').optional(),
    body('travelAgentId', 'Travel Agent ID is required!').notEmpty().optional(),
    body('companyName', 'Company Name is required').notEmpty().optional(),
    body('representativeName', 'Representative Name is required!').isString().notEmpty().optional(),
    body('akama', 'Akama is required!').notEmpty().optional(),
    body('status', 'Status must be 0/1').isInt({ min: 0, max: 1 }).optional(),
    body('creditLimit', 'Credit Limit must be a float positive integer').isFloat({ min: 0 }).optional(),
    body('serviceCharges', 'Service Charges must be a float positive integer').isFloat({ min: 0 }).optional(),
    body('serviceChargesType').custom((value) => {
      if (value !== 'F' && value !== 'P') {
        throw new Error('Service charges type must be either "F": Flat or "P": Percentage');
      }
      return true;
    }).optional(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return commonController.catchError(res, errors.array(), 400)
        }
        next();
    }
]


exports.agentCreateValidations = [
  body('mobile', 'Mobile number must be valid number!').isMobilePhone(),
  body('email', 'Please include a valid email').isEmail(),
  body('landline').optional(),
  body('country').optional(),
  body('city').optional(),
  body('travelAgentId', 'Travel Agent ID is required!').notEmpty(),
  body('companyName', 'Company Name is required').not().isEmpty(),
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
      if(!req.files || !req.files.logo) {
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


/**
 * Middleware to upload logo
 */
exports.agentLogo = [
  (req, res, next) => {
      const errors = validationResult(req);
      let errorsArr = errors.array()
      if(!req.files || !req.files.logo) {
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


/**
 * Middleware to upload docs
 */
exports.agentDocs = [
  (req, res, next) => {
      const errors = validationResult(req);
      let errorsArr = errors.array()
      if(!req.files || !req.files.documents) {
          errorsArr.push({
              type: "file",
              msg: "Please include atleast 1 document.",
              path: "documents",
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


/**
 * Agent topup 
 */

exports.agentTopUp = [
  body('agent_id', 'Agent id is required!').isInt(),
  body('description').optional(),
  body('balance', 'non-zero Balance must be provided').isFloat({ min: 0 }),
  body('type').custom((value) => {
    if (value !== 'credit' && value !== 'debit') {
      throw new Error('Transaction type must be either credited or debited.');
    }
    return true;
  }),
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return commonController.catchError(res, errors.array(), 200)
      }
      next();
  }
]