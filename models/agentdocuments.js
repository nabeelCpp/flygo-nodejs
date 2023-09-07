'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AgentDocuments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AgentDocuments.init({
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    agentId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AgentDocuments',
  });
  return AgentDocuments;
};