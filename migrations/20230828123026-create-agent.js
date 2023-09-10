'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Agents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      landline: {
        type: Sequelize.STRING
      },
      mobile: {
        type: Sequelize.STRING,
        unique: true
      },
      country: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      travelAgentId: {
        type: Sequelize.STRING
      },
      logo: {
        type: Sequelize.STRING
      },
      representativeName: {
        type: Sequelize.STRING
      },
      companyName: {
        type: Sequelize.STRING
      },
      akama: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Add default value here
      },
      creditLimit: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      serviceCharges: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      serviceChargesType: {
        type: Sequelize.ENUM(['F', 'P']),
        allowNull: true,
        comment: 'Flat: F, Percent: P'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Agents');
  }
};