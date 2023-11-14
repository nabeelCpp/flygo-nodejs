const { default: axios } = require('axios')
const commonController = require('../common/commonFuncs')
const sabreRequests = require('./sabre.requests')
const { body } = require('express-validator')
// Search flights based on booking form
exports.flights = async (req, res) => {
    let body = req.body
    try {
        const flightSearch = sabreRequests.shop_BFM(body)
        let APIResponse = await axios.post(`${process.env.SABRE_URL}/v4/offers/shop`, flightSearch, {
            headers: {
                Authorization: `Bearer ${req.sabreAccessToken}`
            }
        })
        return commonController.sendSuccess(res, 'Flight details fetched successfully', APIResponse.data)
    } catch (error) {
        return commonController.sendResponseWithError(res, error)
    }
}


/**
 * Revalidate the flight via flightnumber and other data.
 */
exports.revalidate = async (req, res) => {
    let body = req.body
    try {
        let revalidateRequest = sabreRequests.revalidate(body)
        // return res.send(revalidateRequest)
        let APIResponse = await axios.post(`${process.env.SABRE_URL}/v4/shop/flights/revalidate`, revalidateRequest, {
            headers: {
                Authorization: `Bearer ${req.sabreAccessToken}`
            }
        })
        return commonController.sendSuccess(res, 'Flight Validated details fetched successfully', APIResponse.data)
    } catch (error) {
        return commonController.sendResponseWithError(res, error)
    }
}


/**
 * Book (Create PNR) flow here
 */
exports.booking = async (req, res) => {
    try {
        let body = req.body
        let bookPnr = sabreRequests.createPnrBook(body)
        // return res.send(bookPnr)
        let APIResponse = await axios.post(`${process.env.SABRE_URL}/v2.4.0/passenger/records?mode=create`, bookPnr, {
            headers: {
                Authorization: `Bearer ${req.sabreAccessToken}`
            }
        })
        return commonController.sendSuccess(res, 'PNR/Booking Created successfully!', APIResponse.data)
    } catch (error) {
        return commonController.sendResponseWithError(res, error)
    }
}



/**
 * Fulfill (EnhancedAirTicket) flow here
 */
exports.airticket = async (req, res) => {
    try {
        let body = req.body
        let EnhancedAirTicket = sabreRequests.EnhancedAirTicket(body)
        return res.send(EnhancedAirTicket)
        let APIResponse = await axios.post(`${process.env.SABRE_URL}/v1.3.0/air/ticket`, EnhancedAirTicket, {
            headers: {
                Authorization: `Bearer ${req.sabreAccessToken}`
            }
        })
        return commonController.sendSuccess(res, 'Ticket booked successfully!', APIResponse.data)
    } catch (error) {
        return commonController.sendResponseWithError(res, error)
    }
}


// Get booking tickets.

exports.getBooking = async (req, res) => {
    try {
        let booking_id = req.params.booking_id
       
        let APIResponse = await axios.post(`${process.env.SABRE_URL}/v1/trip/orders/getBooking`, { confirmationId: booking_id }, {
            headers: {
                Authorization: `Bearer ${req.sabreAccessToken}`
            }
        })
        return commonController.sendSuccess(res, 'Ticket details fetched successfully!', APIResponse.data)
    } catch (error) {
        return commonController.sendResponseWithError(res, error)
    }
}

