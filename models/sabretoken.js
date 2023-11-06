'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SabreToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SabreToken.init({
    accessToken: DataTypes.TEXT,
    expiry: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'SabreToken',
  });
  return SabreToken;
};