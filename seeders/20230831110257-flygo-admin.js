'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Admins', [
      {
        email: 'admin@flygo.com',
        name: 'Flygo Admin',
        password: '$2b$12$B.iAn2lsa8K2LntjDqe6POOM7pC2xrjtGu5WIt8NAqzz1BsFvI1yC', // Remember to hash the password
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Add more admin data if needed
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Admins', null, {});
  }
};
