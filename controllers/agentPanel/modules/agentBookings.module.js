const { FlightBookings } = require("../../../models")
/**
 * Call common controller with all functions.
 */

const commonController = require('../../common/commonFuncs')
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.index = async (req, res) => {
    try {
        let bookings = await FlightBookings.findAll({
            where: {
                agent_id: req.agent.id
            }
        })
        return commonController.sendSuccess(res, 'Bookings of agents', bookings)
    } catch (error) {
        return commonController.catchError(res, error)
    }
}