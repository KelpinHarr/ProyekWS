'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Meeting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Meeting.belongsTo(models.Group)
      Meeting.belongsTo(models.User)
    }
  }
  Meeting.init({
    GroupId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
    status: DataTypes.STRING,
    tanggal: DataTypes.DATE,
    waktumulai: DataTypes.TIME,
    waktuselesai: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'Meeting',
  });
  return Meeting;
};