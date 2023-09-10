'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Agent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Agent.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Mark 'id' as the primary key
      autoIncrement: true, // Add auto-increment behavior
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isUnique: async function (value, next) {
          const user = await Agent.findOne({ where: { email: value } });
          if (user) {
            return next('Email already exists');
          }
          return next();
        },
      },
    },
    landline: DataTypes.STRING,
    mobile: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isUnique: async function (value, next) {
          const user = await Agent.findOne({ where: { mobile: value } });
          if (user) {
            return next('Mobile number already exists');
          }
          return next();
        },
      },
    },
    country: DataTypes.STRING,
    city: DataTypes.STRING,
    travelAgentId: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isUnique: async function (value, next) {
          const user = await Agent.findOne({ where: { travelAgentId: value } });
          if (user) {
            return next('Same travel agent id already exists');
          }
          return next();
        },
      },
    },
    logo: DataTypes.STRING,
    representativeName: DataTypes.STRING,
    companyName: DataTypes.STRING,
    akama: {
      type:DataTypes.STRING,
      unique: true,
      validate: {
        isUnique: async function (value, next) {
          const user = await Agent.findOne({ where: { akama: value } });
          if (user) {
            return next('Same Akama already exists');
          }
          return next();
        },
      },
    },
    password: DataTypes.STRING,
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Add default value here
    },
    creditLimit: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    serviceCharges: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    serviceChargesType: {
      type: DataTypes.ENUM('F', 'P'),
      allowNull: true,
      comment: 'Flat: F, Percent: P'
    }
  }, {
    sequelize,
    modelName: 'Agent',
  });
  return Agent;
};