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

    await queryInterface.bulkInsert('Groups', [{
      name : 'Kelas A',
      description : 'Kelas A',
      groupCode : 'as7d32',
      createdAt : '2023-05-20 12:54:20',
      updatedAt : '2023-05-20 12:54:20'
    }, {
      name : 'Keren Abiezzz ',
      description : 'nak nak kerenss',
      groupCode : 'casr5d',
      createdAt : '2023-05-23 18:24:20',
      updatedAt : '2023-05-23 18:24:20'
    }, {
      name : 'Macam Tak Betuls ',
      description : 'TAHU FAMILY Grouppp!',
      groupCode : 'hgj542',
      createdAt : '2023-06-01 09:14:50',
      updatedAt : '2023-06-01 09:14:50'
    }, {
      name : 'NUTTELLA_TIRAMISSU ',
      description : 'NUTTELLA_TIRAMISSU ENAK BANGET LO',
      groupCode : 'tes5cz',
      createdAt : '2023-06-05 12:31:11',
      updatedAt : '2023-06-05 12:31:11'
    }, {
      name : 'NUTTELLA_TIRAMISSU ',
      description : 'NUTTELLA_TIRAMISSU ENAK BANGET LO',
      groupCode : 'tes5cz',
      createdAt : '2023-06-05 12:31:11',
      updatedAt : '2023-06-05 12:31:11'
    }]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
