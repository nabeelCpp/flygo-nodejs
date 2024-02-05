'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;


/**
 * Model definitions are done, here
 */
db.User = require("./user.js")(sequelize, Sequelize);
db.Agent = require("./agent.js")(sequelize, Sequelize);
db.Admin = require("./admin.js")(sequelize, Sequelize);
db.AgentDocuments = require("./agentdocuments.js")(sequelize, Sequelize);
db.SabreToken = require('./sabretoken.js')(sequelize, Sequelize)
db.Airport = require('./airport.js')(sequelize, Sequelize)
db.Airline = require('./airline.js')(sequelize, Sequelize)
db.FlightBookings = require('./flightbookings.js')(sequelize, Sequelize) 
db.Transactions = require('./transactionlog.js')(sequelize, Sequelize) 

/******************************************************************************************* 
                  Relationships between different models defined here below
********************************************************************************************/
/**
 * Relationship between agents and agentDocuments is been defined here.
 */
db.Agent.hasMany(db.AgentDocuments)
db.AgentDocuments.belongsTo(db.Agent)

// relationship between agents and flight bookings
// db.Agent.hasMany(db.FlightBookings)
// db.FlightBookings.belongsTo(db.Agent)


db.Agent.hasMany(db.FlightBookings, {
  foreignKey: 'agent_id', // Assuming 'agentId' is the foreign key in FlightBookings
});

// In your FlightBookings model
db.FlightBookings.belongsTo(db.Agent, {
  foreignKey: 'id', // Specify the correct foreign key column name
});
module.exports = db;
