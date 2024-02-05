const { default: axios } = require('axios')
const commonController = require('../common/commonFuncs')
const sabreRequests = require('./sabre.requests')
const customerResponseGeneratedFromSabre = require('./sabre.responses')
const { body } = require('express-validator')
const { FlightBookings, sequelize, Agent} = require('../../models')
// Search flights based on booking form
exports.flights = async (req, res) => {
    let body = req.body
    try {
        const flightSearch = sabreRequests.shop_BFM(body)
        // return res.send(flightSearch)
        let APIResponse = await axios.post(`${process.env.SABRE_URL}/v4/offers/shop`, flightSearch, {
            headers: {
                Authorization: `Bearer ${req.sabreAccessToken}`
            }
        })
        const checkIfSabreError = await customerResponseGeneratedFromSabre.checkErrorsComingFromSabre(APIResponse.data)
        if(checkIfSabreError) {
            return commonController.sendResponseWithError(res, checkIfSabreError)
        }
        const customGeneratedResponse =  await customerResponseGeneratedFromSabre.shop_BFM(APIResponse.data)
        return commonController.sendSuccess(res, 'Flight details fetched successfully', customGeneratedResponse)
        // return commonController.sendSuccess(res, 'Flight details fetched successfully', APIResponse.data)
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
        const checkIfSabreError = await customerResponseGeneratedFromSabre.checkErrorsComingFromSabre(APIResponse.data)
        if(checkIfSabreError) {
            return commonController.sendResponseWithError(res, checkIfSabreError)
        }
        const customGeneratedResponse =  await customerResponseGeneratedFromSabre.shop_BFM(APIResponse.data)
        return commonController.sendSuccess(res, 'Flight Validated details fetched successfully', customGeneratedResponse)
        // return commonController.sendSuccess(res, 'Flight Validated details fetched successfully', APIResponse.data)
    } catch (error) {
        return commonController.sendResponseWithError(res, error)
    }
}


/**
 * Book (Create PNR) flow here
 */
exports.booking = async (req, res) => {
    /**
     * Initialize db transactions
     */
    const dbTransaction = await sequelize.transaction()
    try {
        let body = req.body
        /**
         * Check the wallet of agent
         */
        if(body.agentId) {
            let agent = await Agent.findByPk(body.agentId)
            if(!agent) {
                return commonController.sendResponseWithError(res, ['Invalid account!'])
            }
            if(parseFloat(agent.wallet) < body.air_price.total_fare ) {
                return commonController.sendResponseWithError(res, ['You have insufficient balance to proceed! Please topup and try again.'])
            }
        }
        let bookPnr = sabreRequests.createPnrBook(body)
        // return res.send(bookPnr)
        let APIResponse = await axios.post(`${process.env.SABRE_URL}/v2.4.0/passenger/records?mode=create`, bookPnr, {
            headers: {
                Authorization: `Bearer ${req.sabreAccessToken}`
            }
        })
        // const checkIfSabreError = await customerResponseGeneratedFromSabre.checkErrorsComingFromSabre(APIResponse.data)
        // if(checkIfSabreError) {
        //     return commonController.sendResponseWithError(res, checkIfSabreError)
        // }
        const customGeneratedResponse =  await customerResponseGeneratedFromSabre.createPnrBook(APIResponse.data)
        // save the ticket information to database
        FlightBookings.create({
            itinerary_id: customGeneratedResponse.ItineraryRef.ID,
            // origin: body.flights[0].origin,
            // destination: customGeneratedResponse.FlightSegment.DestinationLocation.LocationCode,
            // arrival_date_time: body.flights[0].,
            // depart_date_time: body.flights[0].,
            // flight_no: customGeneratedResponse.FlightSegment.FlightNumber,
            // airline: customGeneratedResponse.FlightSegment.MarketingAirline.Code,
            agent_id: body.agentId || 0 
        }, { dbTransaction })

         /**
         * Confirm transactions and save data to db
         */
         await dbTransaction.commit()
        return commonController.sendSuccess(res, 'PNR/Booking Created successfully!', customGeneratedResponse)
        // return commonController.sendSuccess(res, 'PNR/Booking Created successfully!', APIResponse.data)
    } catch (error) {
        /**
         * Roll back transactions if any error occured.
         */
        await dbTransaction.rollback()
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
        // return res.send(EnhancedAirTicket)
        let APIResponse = await axios.post(`${process.env.SABRE_URL}/v1.3.0/air/ticket`, EnhancedAirTicket, {
            headers: {
                Authorization: `Bearer ${req.sabreAccessToken}`
            }
        })
        const customGeneratedResponse =  await customerResponseGeneratedFromSabre.bookTicket(APIResponse.data)
        return commonController.sendSuccess(res, 'Ticket booked successfully!', customGeneratedResponse)
    } catch (error) {
        return commonController.sendResponseWithError(res, error)
    }
}


// Get booking tickets.

exports.getBooking = async (req, res) => {
     /**
     * Initialize db transactions
     */
    const dbTransaction = await sequelize.transaction()
    try {
        let booking_id = req.params.booking_id
       
        let APIResponse = await axios.post(`${process.env.SABRE_URL}/v1/trip/orders/getBooking`, { confirmationId: booking_id }, {
            headers: {
                Authorization: `Bearer ${req.sabreAccessToken}`
            }
        })
        /**
         * Update status of flight for specific iteneryar id
         */
        let booking = await FlightBookings.findOne({
            where: {
                itinerary_id: booking_id
            }
        })
        booking.status = APIResponse.data.flights[0].flightStatusName
        booking.save()

        await dbTransaction.commit()
        return commonController.sendSuccess(res, 'Ticket details fetched successfully!', APIResponse.data)
    } catch (error) {
        await dbTransaction.rollback()
        return commonController.sendResponseWithError(res, error)
    }
}

