'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Mark 'id' as the primary key
      autoIncrement: true, // Add auto-increment behavior
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isUnique: async function (value, next) {
          const user = await User.findOne({ where: { email: value } });
          if (user) {
            return next('Email already exist');
          }
          return next();
        },
      },
    },
    mobile: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isUnique: async function (value, next) {
          const user = await User.findOne({ where: { mobile: value } });
          if (user) {
            return next('Mobile number already exists');
          }
          return next();
        },
      },
    },
    image: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};