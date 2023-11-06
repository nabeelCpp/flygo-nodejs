exports.shop_BFM = (body) => {
    const start_date = body?.depart_date && body.depart_date 
    const end_date = body?.return_date && body.return_date
    const OriginDestinationInformation = []
    /**
     * Start process to save data to send as round tip or oneway trip.
     */
        // create an object for departure details and push it to OriginDestinationInformation array. It confirms that we have pushed the oneway trip.
        OriginDestinationInformation.push({
            "RPH": `${OriginDestinationInformation.length + 1}`, 
            "DepartureDateTime": `${start_date}T00:00:00`,
            "OriginLocation": {
                "LocationCode": body.origin
            },
            "DestinationLocation": {
                "LocationCode": body.destination
            }
        })
        
        //Check if trip type is round!
        if( body.trip_type == 'round' ) {
            // if trip is round push the second object to array originDestinationInformation.
            OriginDestinationInformation.push({
                "RPH": `${OriginDestinationInformation.length + 1}`, 
                "DepartureDateTime": `${end_date}T00:00:00`,
                "OriginLocation": {
                    "LocationCode": body.destination
                },
                "DestinationLocation": {
                    "LocationCode": body.origin
                }
            })
        }
    /**
     * End trip type data here.
     */

    /**
     * Store passengers record information.
     */
        const PassengerTypeQuantity = body.passengers ? PopulatePassengerTypeQuantity(body.passengers) : []

    /**
     * Passengers information end here.
     */
    let flightData = {
        "OTA_AirLowFareSearchRQ": {
            "Version": process.env.SABRE_VERSION,
            "POS": POS(),
            "OriginDestinationInformation": OriginDestinationInformation,
            
            "TravelerInfoSummary": {
                "AirTravelerAvail": [
                    {
                        "PassengerTypeQuantity": PassengerTypeQuantity
                    }
                ]
            },
            "TPA_Extensions": TPA_Extensions()
        }
    }
    return flightData
}

exports.revalidate = (body) => {
    const OriginDestinationInformation = []
    /**
     * Start process to save data to send as round tip or oneway trip.
     */
        // create an object for departure details and push it to OriginDestinationInformation array. It confirms that we have pushed the oneway trip.

        /**
         * Populate Flights
         */

        const flightFromHome = body.flights[0]
        const flightArr = flightFromHome.map(f => {
            return {
                /**
                 * Flight Number: scheduleDescs[x].carrier.operatingFlightNumber
                 */
                "Number": f.flight_number,
                /**
                 * Departure Date: groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].departureDate
                 * DepartureTime: scheduleDescs[x].departure.time
                 */
                "DepartureDateTime": f.departure_date_time,
                /**
                 * Arrival Date: groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].departureDate
                 * ArrivalTime: scheduleDescs[x].arrival.time
                 */
                "ArrivalDateTime": f.arrival_date_time,
                // "ClassOfService": "E", 
                "ClassOfService": body?.bookingCode ? body.bookingCode : 'E',
                "OriginLocation": {
                    /**
                     * scheduleDescs[x].departure.airport
                     */
                    "LocationCode": f.origin
                },
                "DestinationLocation": {
                    /**
                     * scheduleDescs[x].arrival.airport
                     */
                    "LocationCode": f.destination
                },
                "Airline": {
                    /**
                     * scheduleDescs[x].carrier.operating
                     */
                    "Operating": f.flight_airline.Operating,
                    /**
                     * scheduleDescs[x].carrier.marketing
                     */
                    "Marketing": f.flight_airline.Marketing
                }
            }
        })




        OriginDestinationInformation.push({
            "RPH": `${OriginDestinationInformation.length + 1}`,
            /**
             * Departure Date: groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].departureDate
             * DepartureTime: scheduleDescs[x].departure.time
             */
            "DepartureDateTime": `${flightFromHome[0].departure_date_time}`, // here [0] is for going to destination if the trip is round. Always first array element will be for going from the destination. Second will be for coming back to the home.
            /**
             * OriginLocation: groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].departureLocation
             */
            "OriginLocation": {
                "LocationCode": `${flightFromHome[0].origin}`
            },
            /**
             * DestinationLocation: groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].arrivalLocation
             */
            "DestinationLocation": {
                "LocationCode": `${flightFromHome[flightFromHome.length - 1].destination}`
            },
            "TPA_Extensions": {
                "SegmentType": {
                    "Code": "O"
                },
                "Flight": flightArr
            }
        })
        
        //Check if trip type is round!
        if( body.trip_type == 'round' ) {
            // if trip is round push the second object to array originDestinationInformation.
            OriginDestinationInformation.push({
                "RPH": `${OriginDestinationInformation.length + 1}`, 
                "DepartureDateTime": `${end_date}T00:00:00`,
                "OriginLocation": {
                    "LocationCode": body.destination
                },
                "DestinationLocation": {
                    "LocationCode": body.origin
                }
            })
            const flightToHome = body.flights[1]
            const flightArr = flightToHome.map(f => {
                return {
                    /**
                     * Flight Number: scheduleDescs[x].carrier.operatingFlightNumber
                     */
                    "Number": f.flight_number,
                    /**
                     * Departure Date: groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].departureDate
                     * DepartureTime: scheduleDescs[x].departure.time
                     */
                    "DepartureDateTime": f.departure_date_time,
                    /**
                     * Arrival Date: groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].departureDate
                     * ArrivalTime: scheduleDescs[x].arrival.time
                     */
                    "ArrivalDateTime": f.arrival_date_time,
                    "ClassOfService": "E",
                    "OriginLocation": {
                        /**
                         * scheduleDescs[x].departure.airport
                         */
                        "LocationCode": f.origin
                    },
                    "DestinationLocation": {
                        /**
                         * scheduleDescs[x].arrival.airport
                         */
                        "LocationCode": f.destination
                    },
                    "Airline": {
                        /**
                         * scheduleDescs[x].carrier.operating
                         */
                        "Operating": f.flight_airline.Operating,
                        /**
                         * scheduleDescs[x].carrier.marketing
                         */
                        "Marketing": f.flight_airline.Marketing
                    }
                }
            })


            OriginDestinationInformation.push({
                "RPH": `${OriginDestinationInformation.length + 1}`,
                /**
                 * Departure Date: groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].departureDate
                 * DepartureTime: scheduleDescs[x].departure.time
                 */
                "DepartureDateTime": `${flightToHome[0].departure_date_time}`, // here [0] is for going from destination if the trip is round. Always econd array element will be for going to the home.
                /**
                 * OriginLocation: groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].departureLocation
                 */
                "OriginLocation": {
                    "LocationCode": `${flightToHome[0].origin}`
                },
                /**
                 * DestinationLocation: groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].arrivalLocation
                 */
                "DestinationLocation": {
                    "LocationCode": `${flightToHome[flightToHome.length - 1].destination}`
                },
                "TPA_Extensions": {
                    "SegmentType": {
                        "Code": "O"
                    },
                    "Flight": flightArr
                }
            })
        }
    /**
     * End trip type data here.
     */
    let request = {
        OTA_AirLowFareSearchRQ: {
            Version: process.env.SABRE_VERSION,
            TravelPreferences: {
                TPA_Extensions: {
                    VerificationItinCallLogic: {
                        Value: "M"
                    }
                }
            },
            TravelerInfoSummary: {
                SeatsRequested: [
                    body.seats_requested // itineraryGroups[0].itineraries[0].pricingInformation[0].fare.passengerInfoList[0]passengerInfo.passengerNumber
                ],
                AirTravelerAvail: [
                    /**
                     * itineraryGroups[0].itineraries[0].pricingInformation[0].fare.passengerInfoList
                     * iterate through the passengerInfoList to populate passengerTypeQty.
                     */
                    {
                        "PassengerTypeQuantity": body.passengers ? PopulatePassengerTypeQuantity(body.passengers) : []
                    }
                ]
            },
            "POS": POS(),
            "OriginDestinationInformation": OriginDestinationInformation,
            "TPA_Extensions" : TPA_Extensions()
        }
    }
    return request
}


// Request for sabre booking request (Create PNR)
exports.createPnrBook = (body) => {
    let book = {
        "CreatePassengerNameRecordRQ": {
            "haltOnAirPriceError": true,
            "targetCity": process.env.SABRE_PCC,
            "AirBook": AirBook(body),
            "AirPrice": AirPrice(body),
            "TravelItineraryAddInfo": TravelItineraryAddInfo(body),
            "SpecialReqDetails": SpecialReqDetails(body),
            "PostProcessing": {
                "RedisplayReservation": {
                    "waitInterval": 1000
                },
                // "ARUNK": { // multi city
                //     "priorPricing": true
                // },
                "EndTransaction": {
                    "Source": {
                        "ReceivedFrom": process.env?.AGENCY_NAME // agency name
                    }
                },
                "PostBookingHKValidation": {
                    "waitInterval": 200,
                    "numAttempts": 4
                },
                "WaitForAirlineRecLoc": {
                    "waitInterval": 200,
                    "numAttempts": 4
                }
            }
        }
    }
    return book
}




// common functions
const PopulatePassengerTypeQuantity = (passengers) => {
    let PassengerTypeQuantity = []
    // Save user types to the array.
    if(passengers.adults) {
        PassengerTypeQuantity.push({
            "Code": "ADT",
            "Quantity": passengers.adults
        })
    }

    if(passengers.children) {
        PassengerTypeQuantity.push({
            "Code": "CNN",
            "Quantity": passengers.children
        })
    }

    if(passengers.infants) {
        PassengerTypeQuantity.push({
            "Code": "INF",
            "Quantity": passengers.infants
        })
    }
    return PassengerTypeQuantity
}


const POS = () => {
    return {
        "Source": [
            {
                "PseudoCityCode": process.env.SABRE_PCC,
                "RequestorID": {
                    "Type": "1",
                    "ID": "1",
                    "CompanyName": {
                        "Code": "TN",
                        "content": "TN"
                    }
                }
            }
        ]
    }
}

const TPA_Extensions = () => {
    return  {
        "IntelliSellTransaction": {
            "RequestType": {
                "Name": "50ITINS"
            }
        }
    }
}

// For booking purpose, functions are defined here.
const AirBook = (body) => {
    return {
        "HaltOnStatus": [
            {
                "Code": "HL"
            },
            {
                "Code": "HN"
            },
            {
                "Code": "KK"
            },
            {
                "Code": "LL"
            },
            {
                "Code": "NN"
            },
            {
                "Code": "NO"
            },
            {
                "Code": "UC"
            },
            {
                "Code": "US"
            },
            {
                "Code": "UN"
            }
        ],
        "RedisplayReservation": {
            "NumAttempts": 5,
            "WaitInterval": 1000
        },
        "RetryRebook": {
            "Option": true
        },
        OriginDestinationInformation: {
            FlightSegment: FlightSegment(body)
        }
    }
}

const FlightSegment = (body) => {
    let flights = []
    body.flights.forEach((flight) => {
        let obj = {
            DepartureDateTime: flight?.departure_date_time,
            FlightNumber: flight?.marketing_airline?.flight_number,
            NumberInParty: `${body?.seatsRequested}`,
            ResBookDesigCode: body.bookingCode,
            Status: "NN",
            DestinationLocation: {
                LocationCode: flight?.destination
            },
            MarketingAirline: {
                Code: flight?.marketing_airline?.code,
                FlightNumber: flight?.marketing_airline?.flight_number
            },
            OriginLocation: {
                LocationCode: flight?.origin
            }
        }
        flights.push(obj)
    })
    return flights
}


// Booking airprice
const AirPrice = (body) => {
    return [
        {
            "PriceComparison": {
                "AmountSpecified": body?.air_price?.total_fare,
                "AcceptablePriceIncrease": {
                    "HaltOnNonAcceptablePrice": false,
                    "Amount": 10
                }
            },
            "PriceRequestInformation": {
                "Retain": true,
                "OptionalQualifiers": {
                    "PricingQualifiers": {
                        "PassengerType": customerInfoFunc(body, 'passenger_type')
                    }
                }
            }
        }
    ]
}

// Calculate the age of any passenger
const calculateAge = (dob) => {
    const dobDate = new Date(dob);
    const currentDate = new Date();
    
    const yearsDiff = currentDate.getFullYear() - dobDate.getFullYear();
  
    // Check if the current date has already passed the birthday this year
    if (currentDate.getMonth() < dobDate.getMonth() || 
        (currentDate.getMonth() === dobDate.getMonth() && currentDate.getDate() < dobDate.getDate())) {
      return (yearsDiff - 1).toString().padStart(2, '0');
    }
  
    return yearsDiff.toString().padStart(2, '0');
}


const TravelItineraryAddInfo = (body) => {
    return {
        "AgencyInfo": AgencyInfo(),
        "CustomerInfo": CustomerInfo(body)
    }
}

const CustomerInfo = (body) => {
    const contactNumber = []
    const emailData = []
    if(process.env?.AGENCY_CONTACT_NUMBER) {
        contactNumber.push({
            "NameNumber": `${contactNumber.length + 1}.1`,
            "Phone": `${process.env.AGENCY_CONTACT_NUMBER}`,
            "PhoneUseType": "B"
        })
    }

    if( body?.customer_info?.phone ) {
        contactNumber.push({
            "NameNumber": `${contactNumber.length + 1}.1`,
            "Phone": body.customer_info.phone,
            "PhoneUseType": "H"
        })
    }

    // Email of agency and user here.
    if( body?.customer_info?.email ) {
        emailData.push({
            "NameNumber": `${emailData.length + 1}.1`,
            "Address": body.customer_info.email,
            "Type": "TO"
        })
    }
    // Check if we have agency email provided.
    if(process.env?.AGENCY_EMAIL) {
        emailData.push({
            "Address": process.env.AGENCY_EMAIL,
            "Type": "BC"
        })
    }
    return {
        "ContactNumbers": {
            "ContactNumber": contactNumber
        },
        "Email": emailData,
        "PersonName": customerInfoFunc(body, 'person_names')
    }
}


const AgencyInfo = () => {
    return  {
        "Address": {
            "AddressLine": process.env.AGENCY_INFO_ADDRESS,
            "CityName": process.env.AGENCY_INFO_CITY,
            "CountryCode": process.env.AGENCY_INFO_COUNTRYCODE,
            "PostalCode": process.env.AGENCY_INFO_POSTAL_CODE,
            "StateCountyProv": {
                "StateCode": process.env.AGENCY_INFO_STATE
            },
            "StreetNmbr": process.env.AGENCY_INFO_STREET
        },
        "Ticketing": {
            "TicketType": "7TAW"
        }
    }
}

// Customer info is handled here.
const customerInfoFunc = (body, type) => {
    let passengersArr = []
    let personNames = []
    let advancePassenger = []
    let services = [{
        "SSR_Code": "OSI",
        "Text": `CTCM ${body.customer_info.phone}/EN`, // customer email
        "VendorPrefs": {
            "Airline": {
                "Code": body.flights[0].marketing_airline.code
            }
        }
    },
    {
        "SSR_Code": "OSI",
        "Text": `CTCE ${body.customer_info.email}/EN`, //customer phone
        "VendorPrefs": {
            "Airline": {
                "Code": body.flights[0].marketing_airline.code
            }
        }
    },
    {
        "SegmentNumber": "A",
        "SSR_Code": "CTCM",
        "PersonName": {
            "NameNumber": "1.1"
        },
        "Text": body.customer_info.phone
    },
    {
        "SegmentNumber": "A",
        "SSR_Code": "CTCE",
        "PersonName": {
            "NameNumber": "1.1"
        },
        "Text": body.customer_info.email
    }]
    let passengers = body.passengers
    if(passengers?.adults && passengers.adults.length > 0) {
        passengersArr.push({
            "Code": "ADT",
            "Quantity": `${passengers.adults.length}`
        })

        passengers.adults.forEach(p => {
            let NameNumber = `${personNames.length + 1}.1`
            personNames.push({
                "NameNumber": NameNumber,
                "GivenName": p.given_name,
                "Surname": p?.sur_name && p.sur_name,
                "PassengerType": "ADT"
            })

            // advance passenger details
            advancePassenger.push({
                "SegmentNumber": "A",
                "Document": p.Document,
                "PersonName": {
                    "DateOfBirth": p.dob,
                    "Gender": p.gender,
                    "NameNumber": NameNumber,
                    "GivenName": p.given_name,
                    "Surname": p?.sur_name && p.sur_name
                }
            })
        })

    }

    if(passengers?.children && passengers.children.length > 0) {
        passengers.children.forEach(c => {
            let age = calculateAge(c.dob)
            let NameNumber = `${personNames.length + 1}.1`
            passengersArr.push({
                "Code": `C${age}`,
                "Quantity": '1'
            })

            // person names
            personNames.push({
                "NameNumber": NameNumber,
                "GivenName": c.given_name,
                "Surname": c?.sur_name && c.sur_name,
                "PassengerType": `C${age}`
            })
            // advance passenger details
            advancePassenger.push({
                "SegmentNumber": "A",
                "Document": p.Document,
                "PersonName": {
                    "DateOfBirth": p.dob,
                    "Gender": p.gender,
                    "NameNumber": NameNumber,
                    "GivenName": p.given_name,
                    "Surname": p?.sur_name && p.sur_name
                }
            })

            // service
            let dob = new Date(p.dob)
            const options = { month: 'short' };
            const monthAbbreviation = dob.toLocaleString('en-US', options);
            services.push({
                "SSR_Code": "CHLD",
                "PersonName": {
                    "NameNumber": NameNumber
                },
                "Text": `${dob.toString().padStart(2, '0')}${monthAbbreviation}${dob.getYear()}`
            })
        })
    }

    if(passengers?.infants && passengers.infants.length > 0) {
        passengersArr.push({
            "Code": "INF",
            "Quantity": `${passengers.infants.length}`
        })
        let adultsPerson = personNames.filter(aP => aP.PassengerType == 'ADT')

        passengers.infants.forEach(i => {
            personNames.push({
                "NameNumber": `${personNames.length + 1}.1`,
                "GivenName": i.given_name,
                "Surname": i?.sur_name && i.sur_name,
                "Infant": true,
                "PassengerType": "INF"
            })
            // advance passenger details
            let NameNumber = adultsPerson[0].NameNumber
            advancePassenger.push({
                "SegmentNumber": "A",
                "Document": p.Document,
                "PersonName": {
                    "DateOfBirth": p.dob,
                    "Gender": `${p.gender}I`,
                    "NameNumber": NameNumber,
                    "GivenName": p.given_name,
                    "Surname": p?.sur_name && p.sur_name
                }
            })

            // service
            let dob = new Date(p.dob)
            const options = { month: 'short' };
            const monthAbbreviation = dob.toLocaleString('en-US', options);
            services.push({
                "SSR_Code": "INFT",
                "PersonName": {
                    "NameNumber": NameNumber
                },
                "Text": `${p.given_name}${p?.sur_name?'/'+p.sur_name:''}/${dob.toString().padStart(2, '0')}${monthAbbreviation}${dob.getYear()}`
            })
            // Exclude user adult for infant.
            // As 1 adult can take 1 infant, if we had more infants than adult then we will pass the nameNumber duplicated to children and it will give us error reponse from sabre API.
            if(adultsPerson.length > 1) {
                adultsPerson.shift()
            }



            
        })
    }
    if( type == 'person_names') {
        return personNames
    }
    if( type == 'passenger_type' ) {
        return passengersArr
    }
    if(type == 'advance_passenger') {
        return advancePassenger
    }
    if(type == 'secure_flight') {
        let SecureFlight = advancePassenger.map(s =>{
            const {Document, ...sf} = s
            return sf
        })
        return SecureFlight
    }
    if( type == 'service' ) {
        return services
    }
}


// Special request
const SpecialReqDetails = (body) => {
    return {
        "SpecialService": {
            "SpecialServiceInfo": {
                "AdvancePassenger": customerInfoFunc(body, 'advance_passenger'),
                "SecureFlight": customerInfoFunc(body, 'secure_flight'),
                "Service": customerInfoFunc(body, 'service')
            }
        }
    }
}
  