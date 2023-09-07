/**
 * Define models here
 */
const {User, sequelize} = require('../../../models')

/**
 * Call common controller with all functions.
 */

const commonController = require('../../common/commonFuncs')

const bcrypt = require('bcrypt')


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns all users or user by id stored in db.
 */
exports.index = async (req, res) => {
    try {
        let id = req.params?.id
        if(id) { 
            /**
             * Find user by id.
             */
            var users = await User.findByPk(id, {
                attributes : {
                    exclude: ['password']
                }
            })
            if(!users) {
                return commonController.catchError(res, '404 user not found!', 404)
            }
        }else{
            /**
             * Find All users registered.
             */
            var users = await User.findAll({
                attributes : {
                    exclude: ['password']
                }
            })
        }
        /**
         * Sending response back to admin.
         */
        return res.send(users)
    } catch (error) {
        return commonController.catchError(res, error)
    }
}

/**
 * Delete user from db
 */
exports.delete = async (req, res) => {
    /**
     * begin db transaction
     */
    const dbTransaction = await sequelize.transaction()
    try {
        let id = req.params.id
        /**
         * Find User by id.
         */
        let user = await User.findByPk(id, { dbTransaction })

        /**
         * Check if user exist or not
         */
        if(!user) {
            return commonController.catchError(res, "User not found!", 404)
        }
        /**
         * Destroy user if exist.
         */
        await user.destroy({ dbTransaction })

        /**
         * Run transaction
         */
        await dbTransaction.commit()
        return commonController.sendSuccess(res, `User ${user.firstName}${user.lastName?' '+user.lastName:''} deleted successfully!`)

    } catch (error) {
        /**
         * Rollback the db transaction
         */
        await dbTransaction.rollback()
        return commonController.catchError(res, error)
    }
}


/**
 * Create user
 */
exports.store = async (req, res) => {
    /**
     * initialize db transaction
     */

    const dbTransaction = await sequelize.transaction()
    try {
        /**
         * Get body from request
         */
        let body = req.body

        if(body.password){
            body.password = await bcrypt.hash(body.password, 12)
        }

        let user = await User.create({
            firstName: body.firstName&&body.firstName,
            lastName: body.lastName&&body.lastName,
            email: body.email&&body.email,
            password: body.password&&body.password
        }, { dbTransaction })

        /**
         * Commit the changes to db
         */
        await dbTransaction.commit()
        /**
         * Send success response to the admin
         */
        delete user.dataValues.password
        return commonController.sendSuccess(res, 'User created successfully!', user)
    } catch (error) {
        /**
         * roll back changes to db
         */
        await dbTransaction.rollback()
        return commonController.catchError(res, error)
    }
}



/**
 * Update user
 */
exports.update = async (req, res) => {
    /**
     * start db transaction
     */
    const dbTransaction = await sequelize.transaction()

    try {
        let body = req.body
        let id = req.params.id
        /**
         * fetch user based on id
         */
        let user = await User.findByPk(id, { dbTransaction })

        if(body.password) {
            body.password = await bcrypt.hash(body.password, 12)
        }
        /**
         * Update the data recieved from request body
         */
        user.firstName = body.firstName ? body.firstName : user.firstName
        user.lastName = body.lastName ? body.lastName : user.lastName
        user.email = body.email ? body.email : user.email
        user.password = body.password ? body.password : user.password

        /**
         * Save updated data to db
         */
        await user.save({ dbTransaction })

        /**
         * commit the data to db
         */
        await dbTransaction.commit()

        /**
         * remove password and send other data as response.
         */
        delete user.dataValues.password
        return commonController.sendSuccess(res, 'User updated successfully!', user)
    } catch (error) {
        /**
         * Roll back the db transaction
         */
        await dbTransaction.rollback()
        return commonController.catchError(res, error)
    }
}