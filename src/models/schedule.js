'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Schedule.belongsTo(models.User, {foreignKey: 'UserId1'})
      Schedule.belongsTo(models.User, {foreignKey: 'UserId2'})
    }
  }
  Schedule.init({
    UserId1: DataTypes.INTEGER,
    UserId2: DataTypes.INTEGER,
    status: DataTypes.STRING,
    tanggal: DataTypes.DATE,
    waktumulai: DataTypes.TIME,
    waktuselesai: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'Schedule',
  });
  return Schedule;
};