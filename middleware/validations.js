/**
 * All Admin validations
 */
const admin = require('./admin')

/**
 * Users validations are inside this file
 */
const user = require('./admin/users.validations')
module.exports = {
    admin, 
    user
}