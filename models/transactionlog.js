"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TransactionLog.init(
    {
      agentId: DataTypes.INTEGER,
      trx_id: DataTypes.STRING,
      topped_up_by: DataTypes.STRING,
      balance: DataTypes.DECIMAL,
      description: DataTypes.STRING,
      transaction_type: DataTypes.ENUM("debit", "credit"),
    },
    {
      sequelize,
      modelName: "TransactionLog",
    }
  );
  return TransactionLog;
};
