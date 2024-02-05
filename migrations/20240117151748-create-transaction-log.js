"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TransactionLogs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      agentId: {
        type: Sequelize.INTEGER,
      },
      trx_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      topped_up_by: { // ie admin
        type: Sequelize.INTEGER,
      },
      balance: {
        type: Sequelize.DECIMAL,
      },
      description: {
        type: Sequelize.STRING,
      },
      transaction_type: {
        type: Sequelize.ENUM("debit", "credit"),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("TransactionLogs");
  },
};
