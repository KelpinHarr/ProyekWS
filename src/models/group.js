'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Group.belongsToMany(models.User, {through: models.UserGroup})
      Group.hasMany(models.Meeting)
    }
  }
  Group.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    groupCode: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};