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
   await queryInterface.bulkInsert('Schedules', [{
    UserId1 : 1,
    UserId2 : 2,
    status : 'pending',
    tanggal : '2023-05-24',
    waktumulai : '10:00:00',
    waktuselesai : '11:00:00',
    createdAt : '2023-05-21 10:00:00',
    updatedAt : '2023-05-21 10:00:00'
   }, {
    UserId1 : 1,
    UserId2 : 3,
    status : 'pending',
    tanggal : '2023-05-24',
    waktumulai : '19:00:00',
    waktuselesai : '20:30:00',
    createdAt : '2023-05-22 15:45:34',
    updatedAt : '2023-05-22 15:45:34'
   }, {
    UserId1 : 2,
    UserId2 : 3,
    status : 'cancelled',
    tanggal : '2023-05-25',
    waktumulai : '10:00:00',
    waktuselesai : '11:00:00',
    createdAt : '2023-05-24 14:08:45',
    updatedAt : '2023-05-24 14:08:45'
   }, {
    UserId1 : 2,
    UserId2 : 4,
    status : 'approved',
    tanggal : '2023-06-10',
    waktumulai : '14:00:00',
    waktuselesai : '16:30:00',
    createdAt : '2023-06-05 12:34:14',
    updatedAt : '2023-06-05 12:34:14'
   }, {
    UserId1 : 3,
    UserId2 : 5,
    status : 'pending',
    tanggal : '2023-05-15',
    waktumulai : '10:00:00',
    waktuselesai : '13:00:00',
    createdAt : '2023-06-10 08:15:42',
    updatedAt : '2023-06-10 08:15:42'
   }]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Schedules', null, {});
  }
};
