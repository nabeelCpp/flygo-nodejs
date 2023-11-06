
/**
 * Loading required modules
 */
/**
 * Module for working with env file.
 */
require("dotenv").config();

/**
 * Module for working with grouped routes in express js
 */
require('express-group-routes');




/**
 * Initialize Express
*/
const express = require("express");

const app = express();


/**
 * Fetching port number from env file
 */
const PORT = process.env.APP_PORT;

/**
 * Cors module is initizlized for allowing only trusted origins to hit our apis.
 */
const cors = require("cors");

/**
 * Allowed domains to reach our apis endpoint will be added here.
 */
var allowedDomains = ['http://localhost:3000', 'http://127.0.0.1:5000'];
app.use(express.static('public'));
/**
 * Functionality to send cors error to all those origins which are not added into trusted list.
 */
app.use(cors({
  origin: function (origin, callback) {
    // bypass the requests with no origin (like curl requests, mobile apps, etc )
    if (!origin) return callback(null, true);
 
    if (allowedDomains.indexOf(origin) === -1) {
      var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

/**
 * Use json as the response output
 */
app.use(express.json());
app.use(express.urlencoded({extended: true}));


/**
 * Make public folder as accessible to all users 
 */
app.use(express.static('public'));

/**
 * These are the routes defined for all dashbaords. Each dashboard has its own routes file.
 */
require('./routes/auth.routes')(app);
require('./routes/admin.routes')(app);
require('./routes/user.routes')(app);
require('./routes/agent.routes')(app);
require('./routes/sabre.routes')(app);


/**
 * Send 404 status code to api as a json response if endpoint is not found on our system via get method.
 */
app.get('*', function(req, res){
    res.send({
        message: "404 Not Found"
    }, 404);
});


/**
 * Send 404 status code to api as a json response if endpoint is not found on our system via post method.
 */
app.post('*', function(req, res){
    res.send({
        message: "404 Not Found"
    }, 404);
});



/**
 * Send 404 status code to api as a json response if endpoint is not found on our system via put method.
 */
app.put('*', function(req, res){
    res.send({
        message: "404 Not Found"
    }, 404);
});


/**
 * Run the application on given port and display message to console about running of server.
 */
app.listen(PORT, ()=>{
    console.log("server is running on port "+ PORT);
})