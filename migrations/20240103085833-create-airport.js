'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Airports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      VENDOR_CODE: {
        type: Sequelize.STRING
      },
      POI_NAME: {
        type: Sequelize.STRING
      },
      CITY_NAME: {
        type: Sequelize.STRING
      },
      COUNTRY_CODE: {
        type: Sequelize.STRING
      },
      LATITUDE: {
        type: Sequelize.STRING
      },
      LONGITUDE: {
        type: Sequelize.STRING
      },
      STATE_CODE: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Airports');
  }
};