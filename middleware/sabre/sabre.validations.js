const { body, validationResult } = require('express-validator');
const commonController = require('../../controllers/common/commonFuncs')
const SabreAuth = require('../../controllers/sabre/authToken.controller')

exports.authToken = [
    async (req, res, next) => {
        const errors = validationResult(req);
        let errorsArr = errors.array()
        
        /**
         * Fetch token from db
         */
        const sabreAuthResponse = await SabreAuth.getAccessToken(req, res)
        
        
        if(sabreAuthResponse.status !== 200) {
            errorsArr.push({
                type: "SABRE_API_ERROR",
                msg: `${sabreAuthResponse.data.error}: ${sabreAuthResponse.data.error_description}`,
            })
        }
        if (!errors.isEmpty() || errorsArr.length ) {
          return commonController.catchError(res, errorsArr, sabreAuthResponse.status)
        }
        req.sabreAccessToken = sabreAuthResponse.data.access_token
        next();
    }
]


// Validations for request coming to fetch the flights between dates and destinations.
exports.offersShop = [
    body('depart_date').isDate(),
    body('origin', 'Origin must be a 3-letter IATA code').isLength({min: 3, max: 3}),
    body('destination', 'Destination must be a 3-letter IATA code').isLength({min: 3, max: 3}),
    body('passengers.adults', 'At least one adult passenger is required').isInt({ min: 1 }),
    body('passengers.children').optional().isInt({ min: 0 }),
    body('passengers.infants').optional().isInt({ min: 0 }),
    body('trip_type').custom((value) => {
      if (value !== 'oneway' && value !== 'round') {
        throw new Error('Trip type must be either "One way" or "Round Trip"');
      }
      return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        let errorsArr = errors.array()
        // check if round trip is selected and return date is not selected.
        if(req.body.trip_type === 'round' && !req.body.return_date) {
            errorsArr.push({
                type: "field",
                msg: "Return date is required for round trips.",
                path: "return_date",
                location: "body"
            })
        }
        if (!errors.isEmpty() || errorsArr.length ) {
            return commonController.catchError(res, errorsArr, 400)
        }
        next();
    }
]


// Validations for revalidate flight.
exports.revalidate = [
    body('seats_requested', "At least 1 passenger seat is required!").isInt({ min: 1 }),
    body('passengers.adults', 'At least one adult passenger is required').isInt({ min: 1 }),
    body('trip_type', 'Trip type must be either "One way" or "Round Trip"').notEmpty().isIn(['oneway', 'round']),
    body('origin', 'Origin must be a 3-letter IATA code').notEmpty().isLength({ min: 3, max: 3 }),
    body('destination', 'Destination must be a 3-letter IATA code').notEmpty().isLength({ min: 3, max: 3 }),
    body('flights', 'Flights data is required!').isArray({ min: 1 }),
    body('flights.*', 'Atleast 1 flight data is required!').isArray({ min: 1 }),
    body('flights.*.*.departure_date_time', 'Departure Date Time is required!').notEmpty().isISO8601(),
    body('flights.*.*.arrival_date_time', 'Arrival Date time is required!').notEmpty().isISO8601(),
    body('flights.*.*.origin', 'Origin is required!').notEmpty().isLength({ min: 3, max: 3 }),
    body('flights.*.*.destination', 'Destination is required!').notEmpty().isLength({ min: 3, max: 3 }),
    body('flights.*.*.flight_number', 'Flight Number is required!').notEmpty().isInt().toInt(),
    body('flights.*.*.flight_airline.Operating', 'Operating airline code is required.').notEmpty().isAlpha(),
    body('flights.*.*.flight_airline.Marketing', 'Marketing airline code is required.').notEmpty().isAlpha(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return commonController.catchError(res, errors.array(), 400)
        }
        next();
    }
]


// Validations for booking of flight.
exports.booking = [
    body('flights', 'Flights data is required').isArray().custom(value => value.length > 0),
    body('air_price.total_fare').isNumeric().custom(value => value > 0),
    body('passengers.adults').isArray().custom(value => value.length > 0),
    body('customer_info.phone').isMobilePhone('any', { strictMode: false }),
    body('customer_info.email').isEmail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return commonController.catchError(res, errors.array(), 400)
        }
        next();
    }
]