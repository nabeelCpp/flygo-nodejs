const {User, sequelize} = require('../models');
const config = require("../config/auth.config");
const bcrypt = require('bcrypt');
const  jwt = require('jsonwebtoken');
/**
 * Call common controller with all functions.
 */

const commonController = require('./common/commonFuncs')
exports.login = async (req, res) => {
    try {
        /**
         * fetch body from request
        */
        const body = req.body
    
        /**
         * Fetch user based on email
        */
        const user = await User.findOne({
            where: {
                email: body.email
            }
        })
        if(!user) {
            return commonController.catchError(res, "User not registered!", 404)
        }
        /**
         * Check if password matches or not.
         */
        if(!bcrypt.compareSync(body.password, user.password)) {
            return commonController.catchError(res, "Invalid email/password combination", 400)
        }

        /**
         * Send user detail to function generateToken() to get jwt token
         */
        user.dataValues.accessToken = await generateToken(user)
        /**
         * Send response
        */
        delete user.dataValues.password

        /**
         * Assign role to user.
         */

        user.dataValues.role = 'user'
        /**
         * Send response
        */
        return commonController.sendSuccess(res, "User Loggedin successfully!", user)
    } catch (error) {
        return commonController.catchError(res, error)
    }
}

exports.register = async (req, res) => {
    /**
     * Start db transactions for data integrity and if any error is there then rollback db changes.
     */
    const dbTransaction = await sequelize.transaction()
    try {
       /**
        * fetch body from request
       */
       const body = req.body
   
       /**
        * CHeck if password matches or not.
        */
       if(body.password !== body.confirm_password) { 
            return commonController.catchError(res, "Passwords doesnt match!", 409)
       }
       /**
        * Hash the password
        */
       body.password = await bcrypt.hash(body.password, 12)
       
       /**
        * Create User and save it to db
        */
       let user = await User.create({
            firstName: body.firstName && body.firstName,
            lastName: body.lastName && body.lastName,
            email: body.email && body.email,
            mobile: body.mobile && body.mobile,
            password: body.password,
            image: null
       }, { dbTransaction })

       /**
        * Confirm transactions and save data to db
        */
       await dbTransaction.commit()


   
        /**
         * Send user detail to function generateToken() to get jwt token
         */
        user.dataValues.accessToken = await generateToken(user)
        delete user.dataValues.password

        /**
         * Assign role to user.
         */

        user.dataValues.role = 'user'

        /**
         * Send response
        */

        return commonController.sendSuccess(res, "User registered successfully!", user)
   } catch (error) {
        /**
         * Roll back transactions if any error occured.
         */
        await dbTransaction.rollback()
        return commonController.catchError(res, error)       
   }
}


const generateToken = async (user) => {
    return jwt.sign({ id: user.id, role: "user" }, config.secret, {
        expiresIn: 2*24*60*60 // 2 days
    });
}