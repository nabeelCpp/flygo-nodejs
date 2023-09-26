/**
 * Define models here
 */
const {User, sequelize} = require('../../../models')
const fs = require('fs')
const path = require('path')
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
            users.image = users.image?`${process.env.BASE_URL}/users/images/${users.image}`:users.image
        }else{
            /**
             * Find All users registered.
             */
            let allUsers = await User.findAll({
                attributes : {
                    exclude: ['password']
                },
                order: [
                    ['id', 'DESC']
                ],
            })

            var users = allUsers.map(user => {
                user.image = user.image?`${process.env.BASE_URL}/users/images/${user.image}`:user.image
                return user
            })
        }
        /**
         * Sending response back to admin.
         */
        return commonController.sendSuccess(res, "Users Fetched successfully!", users)
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
            firstName: body.firstName && body.firstName,
            lastName: body.lastName && body.lastName,
            email: body.email && body.email,
            mobile: body.mobile && body.mobile,
            password: body.password && body.password,
            image: null
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
        return commonController.sendSuccess(res, 'User updated successfully!', user)
    } catch (error) {
        /**
         * Roll back the db transaction
         */
        await dbTransaction.rollback()
        return commonController.catchError(res, error)
    }
}

exports.updateImage = async (req, res) => {
    /**
     * Initialize db transaction
     */
    const dbTransaction = await sequelize.transaction()
    try {
        /**
         * fetch id from request
        */
        const id = req.user ? req.user.id : req.params.id
        /**
         * Check if user exist or not
         */

        let user = await User.findByPk(id, { dbTransaction })
        if(!user) {
            return res.status(404).send({
                success: false,
                message: 'User not found!'
            })
        }
 
        
        
        /**
        * Move uploaded image to appropriate destinations and remove the old image if any.
        */
        if(req.files['image'] && req.files['image'].length > 0) {
            let imageFile = req.files['image'][0]
            var oldImage = user.image
            var imageTargetDir = imageFile.destination+'/users/images/'
            // Create the target directory if it doesn't exist
            let checkDir = fs.existsSync(imageTargetDir)
            if (!checkDir) {
                await fs.promises.mkdir(imageTargetDir, { recursive: true });
            }
            let image = imageFile.filename+path.extname(imageFile.originalname)
            await fs.promises.rename(imageFile.path,imageTargetDir+image) //Moving image
            user.image = image
            await user.save({ dbTransaction })
        }

        /**
         * Confirm transactions and save data to db
         */
        await dbTransaction.commit()

        /**
         * Remove old logo if exist
         */
        if(oldImage){
            fs.unlinkSync(imageTargetDir+oldImage)
        }

        /**
         * delete password string.
        */
         delete user.dataValues.password
         /**
          * Convert image to public url
          */
         user.image = user.image?`${process.env.BASE_URL}/users/images/${user.image}`:user.image
 
        /**
         * Send response
        */
        return commonController.sendSuccess(res, "User image updated successfully!", user)
    } catch (error) {
        /**
         * Roll back transactions if any error occured.
         */
        await dbTransaction.rollback()
        removeUploadedPicture(req)
        return commonController.catchError(res, error)
    }
}

const removeUploadedPicture = (req) => {
    if(req.files && req.files['image']) {
        let file = req.files['image'][0]
        fs.unlinkSync(file.path)
    }
}

exports.removeUploadedPicture = (req) => {
    removeUploadedPicture(req)
}