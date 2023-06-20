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

    await queryInterface.bulkInsert('Meetings', [{
      GroupId : 1,
      UserId : 1,
      status : 'valid',
      tanggal : '2023-05-24',
      waktumulai : '10:00:00',
      waktuselesai : '11:00:00',
      createdAt : '2023-05-21 10:00:00',
      updatedAt : '2023-05-21 10:00:00'
    }, {
      GroupId : 2,
      UserId : 1,
      status : 'invalid',
      tanggal : '2023-06-02',
      waktumulai : '15:00:00',
      waktuselesai : '17:00:00',
      createdAt : '2023-05-29 09:30:10',
      updatedAt : '2023-05-29 09:30:10'
    }, {
      GroupId : 2,
      UserId : 3,
      status : 'valid',
      tanggal : '2023-06-06',
      waktumulai : '19:00:00',
      waktuselesai : '20:30:00',
      createdAt : '2023-06-02 13:23:43',
      updatedAt : '2023-06-02 13:23:43'
    }, {
      GroupId : 2,
      UserId : 3,
      status : 'valid',
      tanggal : '2023-06-14',
      waktumulai : '19:00:00',
      waktuselesai : '20:30:00',
      createdAt : '2023-06-09 17:48:13',
      updatedAt : '2023-06-09 17:48:13'
    }]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Meetings', null, {});
  }
};
