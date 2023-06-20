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

    await queryInterface.bulkInsert('GroupMeetings', [{
      GroupId : 1,
      MeetingId : 1,
      notes : 'Meeting ini membahas tentang tugas kelompok',
      createdAt : '2023-05-24 11:05:00',
      updatedAt : '2023-05-24 11:05:00'
    }, {
      GroupId : 2,
      MeetingId : 3,
      notes : "ada rapat lanjutan nantinya",
      createdAt : '2023-06-06 20:33:25',
      updatedAt : '2023-06-06 20:33:25'
    }, {
      GroupId : 2,
      MeetingId : 4,
      notes : "games nya belum disetujui, masih dalam proses",
      createdAt : '2023-06-14 20:45:55',
      updatedAt : '2023-06-14 20:45:55'
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
