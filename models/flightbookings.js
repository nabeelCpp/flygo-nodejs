'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FlightBookings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  FlightBookings.init({
    itinerary_id: DataTypes.STRING,
    origin: DataTypes.STRING,
    destination: DataTypes.STRING,
    arrival_date_time: DataTypes.DATE,
    depart_date_time: DataTypes.DATE,
    flight_no: DataTypes.STRING,
    airline: DataTypes.STRING,
    agent_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'FlightBookings',
  });
  return FlightBookings;
};