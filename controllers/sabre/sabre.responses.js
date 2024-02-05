const { Airport, Airline, sequelize } = require('../../models');

exports.shop_BFM = async (data) => {
    /**
     * sabre response
     * groupedItineraryResponse => contains all the data from sabre
     */
    let groupedItineraryResponse = data.groupedItineraryResponse
    /**
     * legDesc
     * all the possible legs are stored in legDesc
     */
    let legDesc = groupedItineraryResponse.legDescs
    /**
     * all possible schedulesDesc
     */
    let scheduleDescs = groupedItineraryResponse.scheduleDescs
    /**
     * itineraries[]:array 
     * get array of all the possible itenaries along with merged ascheduling of flights. 
     *
     * groupedItineraryResponse.itineraryGroups
     * its an array which consist of itenaries and groupDescription.legDescription
     * we need to loop over groupedItineraryResponse.itineraryGroups.groupDescription.legDescriptions to get all the data into itenary array with all possibilities, either it has multiple legs, multiple schedules.
     */

    let itenariesArr = []
    await Promise.all(groupedItineraryResponse.itineraryGroups.map(async (itnG) => {
        let legDescriptions = await Promise.all(itnG.groupDescription.legDescriptions.map(async (legD) => {
            /**
             *  convert air codes into city name and then send to the end-user
             */
            let origin = await Airport.findOne({
                where: {
                    VENDOR_CODE: legD.departureLocation
                }
            })
            let destination = await Airport.findOne({where: { VENDOR_CODE: legD.arrivalLocation }})
            legD.departureLocation = origin ? origin.CITY_NAME + '('+legD.departureLocation+')' : legD.departureLocation
            legD.arrivalLocation = destination ? destination.CITY_NAME + '('+legD.arrivalLocation+')': legD.arrivalLocation
            return legD
        }));

        await Promise.all(itnG.itineraries.map(async (itn) => {
            let baseFareAmount = itn.pricingInformation[0].fare.totalFare.totalPrice
            let legs = await Promise.all(itn.legs.map(async (leg, key) => {
                let filterLeg = legDesc.filter(lD => lD.id == leg.ref) 
                let filteredLeg = filterLeg[0]
                let flight_classes = await Promise.all(itn.pricingInformation[0].fare.passengerInfoList[0].passengerInfo.fareComponents[key].segments.map(fCSg=>fCSg.segment)) 
                // getting the classes segments and baseFareAmount from adult only as all the user types have same classes. ....passengerInfoList[0] is passenger type "adult"
                // let baseFareAmount = itn.pricingInformation[0].fare.passengerInfoList[0].passengerInfo.passengerTotalFare.totalFare
                let schedules = await Promise.all(filteredLeg.schedules.map(async (schedule) => {
                    let filterSchedule = scheduleDescs.filter(sD => sD.id === schedule.ref)
                    let filteredSchedule = filterSchedule[0]
                    let arrivalCityArr = await Airport.findOne({
                        where: {
                            VENDOR_CODE: filteredSchedule.arrival.city
                        }
                    })
                    filteredSchedule.arrival.city = arrivalCityArr.CITY_NAME

                    /**
                     * Check if date is changing on arrival at airport.
                     */
                    if(filteredSchedule.arrival.dateAdjustment) {
                        let dateObjforArrivalDate = new Date(legDescriptions[key].departureDate)
                        let newDate = dateObjforArrivalDate.setDate(dateObjforArrivalDate.getDate() + filteredSchedule.arrival.dateAdjustment)
                        filteredSchedule.arrival.date = new Date(newDate).toISOString().substring(0, 10)
                    }else{
                        filteredSchedule.arrival.date = legDescriptions[key].departureDate
                    }
                    
                    /**
                     * Changing airport code to city name
                     */
                    let departureCityArr = await Airport.findOne({
                        where: {
                            VENDOR_CODE: filteredSchedule.departure.city
                        }
                    })
                    filteredSchedule.departure.city = departureCityArr.CITY_NAME

                    /**
                     * Check if date is changing when having a connected filght and flight is departuring on next day
                     */

                    if(schedule.departureDateAdjustment) {
                        let dateObjforDepartureDate = new Date(legDescriptions[key].departureDate)
                        let newDate = dateObjforDepartureDate.setDate(dateObjforDepartureDate.getDate() + schedule.departureDateAdjustment)
                        filteredSchedule.departure.date = new Date(newDate).toISOString().substring(0, 10)
                        filteredSchedule.arrival.date = new Date(newDate).toISOString().substring(0, 10)
                    }else{
                        filteredSchedule.departure.date = legDescriptions[key].departureDate
                    }

                    /**
                     * Get airline name from database
                     */
                    let airline = await Airline.findOne({
                        where: {
                            uid: filteredSchedule.carrier.marketing
                        }
                    })
                    return {
                        arrival: filteredSchedule.arrival,
                        departure: filteredSchedule.departure,
                        elapsedTime: filteredSchedule.elapsedTime,
                        totalMilesFlown: filteredSchedule.totalMilesFlown,
                        airline: {name: airline.name, logo: airline.logo},
                        carrier: filteredSchedule.carrier
                    }
                })) 
                return {
                    origin: legDescriptions[key].departureLocation,
                    destination: legDescriptions[key].arrivalLocation,
                    duration: filteredLeg.elapsedTime,
                    flight_classes: flight_classes,
                    connecting_flights: filteredLeg.schedules.length - 1,
                    schedules: schedules
                }
            }))
            // return {legs, baseFareAmount}
            itenariesArr.push({legs, baseFareAmount})
        }))
    }));

    return itenariesArr;
};


/**
 * Create PNR response
 */
exports.createPnrBook = (async (data) => {
    let CreatePassengerNameRecordRS = data.CreatePassengerNameRecordRS
    let FlightSegment = CreatePassengerNameRecordRS.AirBook.OriginDestinationOption.FlightSegment
    let ItineraryRef = CreatePassengerNameRecordRS.ItineraryRef
    let {status, Success} = CreatePassengerNameRecordRS.ApplicationResults
    return {status, Success, ItineraryRef, FlightSegment}
})

/**
 * Booking a ticket 
 */
exports.bookTicket = (async (data) => {
    let AirTicketRS = data.AirTicketRS
    let {status, Success} = AirTicketRS.ApplicationResults
    let Summary = AirTicketRS.Summary
    return {status, Success, Summary}
})

/**
 * Check if there is any sabre error
 */

exports.checkErrorsComingFromSabre = (async (data) => {
    let messages = data.groupedItineraryResponse.messages
    let errors = []
    messages.forEach(message => {
        if(message.severity === "Info" && message.code === 'MSG'){
            errors.push(message.text)
        }
    });
    if(!errors.length && data.groupedItineraryResponse.statistics.itineraryCount == 0){
        errors.push("No flights Found!")
    }
    return errors.length?errors:false
})


