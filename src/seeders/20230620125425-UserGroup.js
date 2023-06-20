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

    await queryInterface.bulkInsert('UserGroups', [{
      GroupId : 1,
      UserId : 1,
      status : 'joined',
      createdAt : '2023-05-20 12:54:20',
      updatedAt : '2023-05-20 12:54:20'
    }, {
      GroupId : 1,
      UserId : 2,
      status : 'joined',
      createdAt : '2023-05-21 08:00:25',
      updatedAt : '2023-05-21 08:00:25'
    }, {
      GroupId : 1,
      UserId : 4,
      status : 'joined',
      createdAt : '2023-05-28 15:46:50',
      updatedAt : '2023-05-28 15:46:50'
    }, {
      GroupId : 2,
      UserId : 5,
      status : 'joined',
      createdAt : '2023-05-23 18:24:23',
      updatedAt : '2023-05-23 18:24:23'
    }, {
      GroupId : 2,
      UserId : 3,
      status : 'joined',
      createdAt : '2023-05-23 18:28:20',
      updatedAt : '2023-05-23 18:28:20'
    }, {
      GroupId : 2,
      UserId : 1,
      status : 'joined',
      createdAt : '2023-05-23 19:25:45',
      updatedAt : '2023-05-23 19:25:45'
    }, {
      GroupId : 3,
      UserId : 2,
      status : 'joined',
      createdAt : '2023-06-01 09:14:50',
      updatedAt : '2023-06-01 09:14:50'
    }, {
      GroupId : 4,
      UserId : 3,
      status : 'joined',
      createdAt : '2023-06-05 12:31:11',
      updatedAt : '2023-06-05 12:31:11'
    }, {
      GroupId : 5,
      UserId : 4,
      status : 'joined',
      createdAt : '2023-06-10 19:01:52',
      updatedAt : '2023-06-10 19:01:52'
    }])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    return queryInterface.bulkDelete('UserGroups', null, {});
  }
};
