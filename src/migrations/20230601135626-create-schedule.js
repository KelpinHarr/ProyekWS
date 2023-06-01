'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId1: {
        type: Sequelize.INTEGER
      },
      UserId2: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      tanggal: {
        type: Sequelize.DATE
      },
      waktumulai: {
        type: Sequelize.TIME
      },
      waktuselesai: {
        type: Sequelize.TIME
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
    await queryInterface.dropTable('Schedules');
  }
};