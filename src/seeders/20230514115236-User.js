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

    await queryInterface.bulkInsert('Users', [{
      display_name: 'Andre Sebastian',
      email: 'andrebastian69@gmail.com',
      username: 'andresebastian_real',
      password: 'namagwandre',
      birthdate: '2002-02-17',
      saldo: 0,
      api_hit: 0,
      profile_picture: '/assets/andresebastian_real.png',
      createdAt: '2023-05-20 05:53:30',
      updatedAt: '2023-05-20 05:53:30'
    }, {
      display_name: 'Jessica Susanto',
      email: 'jees@gmail.com',
      username: 'jees',
      password: 'jees123',
      birthdate: '2003-08-16',
      saldo: 10000,
      api_hit: 10,
      profile_picture: '/assets/jees.png',
      createdAt: '2023-05-23 10:05:30',
      updatedAt: '2023-05-23 10:05:30'
    }])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('User', null, {});
  }
};
