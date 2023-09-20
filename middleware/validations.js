/**
 * All Admin validations
 */
const admin = require('./admin')

/**
 * Users validations are inside this file
 */
const user = require('./admin/users.validations')

/**
 * Agent validations are inside this file
 */
const agent = require('./admin/agents.validations')
module.exports = {
    admin, 
    user,
    agent
}