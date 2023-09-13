/**
 * import the models
 */
const { User, sequelize } = require('../../../models')

/**
 * Import common controller for generalized responses.
 */
const commonController = require('../../common/commonFuncs')
/**
 * Export Profile package
 */

exports.index = async (req, res) => {
    try {
        /**
         * Fetch user details from intial logged in user request.
         */
        let user = req.user
        /**
         * Conver image to url.
         */
        user.image = user.image ? `${process.env.BASE_URL}/users/images/${user.image}` : user.image
        return commonController.sendSuccess(res, "Profile details fetched successfully!", user) 
    } catch (error) {
        return commonController.catchError(res, error)
    }
}


/**
 * Exports Profile Update package.
 * User's profile will be updated here.
 */

exports.update = async (req, res) => {
    /**
     * start db transaction
     */
    const dbTransaction = await sequelize.transaction()

    try {
        let body = req.body
        /**
         * Get user from initial request.
         */
        let user = req.user

        if(!user) {
            return commonController.catchError(res, "User not found!", 404)
        }

        if(body.password) {
            body.password = await bcrypt.hash(body.password, 12)
            user.password = body.password ? body.password : user.password
        }
        /**
         * Update the data recieved from request body
         */
        user.firstName = body.firstName ? body.firstName : user.firstName
        user.lastName = body.lastName ? body.lastName : user.lastName
        user.email = body.email ? body.email : user.email
        user.mobile = body.mobile ? body.mobile : user.mobile

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
        return commonController.sendSuccess(res, 'Profile updated successfully!', user)
    } catch (error) {
        /**
         * Roll back the db transaction
         */
        await dbTransaction.rollback()
        return commonController.catchError(res, error)
    }
}