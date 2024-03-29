'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Airport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Airport.init({
    VENDOR_CODE: DataTypes.STRING,
    POI_NAME: DataTypes.STRING,
    CITY_NAME: DataTypes.STRING,
    COUNTRY_CODE: DataTypes.STRING,
    LATITUDE: DataTypes.STRING,
    LONGITUDE: DataTypes.STRING,
    STATE_CODE: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Airport',
  });
  return Airport;
};