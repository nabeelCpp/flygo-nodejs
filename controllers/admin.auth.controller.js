const {Admin, sequelize} = require('../models');
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
         * Fetch admin based on email
        */
        const admin = await Admin.findOne({
            where: {
                email: body.email
            }
        })
        if(!admin) {
            return res.status(400).send({
                success: false,
                message: "Invalid email/password combination"
            })
        }
        /**
         * Check if password matches or not.
         */
        if(!bcrypt.compareSync(body.password, admin.password)) {
            return res.status(400).send({
                success: false,
                message: "Invalid email/password combination"
            })
        }

        /**
         * Send admin detail to function generateToken() to get jwt token
         */
        let token = await generateToken(admin)

        /**
         * Send response
        */
        return res.send({
            success: true,
            message: "Loggedin successfully!",
            data: {
                accessToken: token,
                id: admin.id,
                email: admin.email,
                name: admin.name
            }
        })
    } catch (error) {
        return commonController.catchError(res, error)
    }
}



const generateToken = async (admin) => {
    return jwt.sign({ id: admin.id, role: "admin" }, config.secret, {
        expiresIn: 2*24*60*60 // 2 days
    });
}