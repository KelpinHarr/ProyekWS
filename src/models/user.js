'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Group, {through: models.UserGroup, foreignKey: 'UserId'})
    }
  }
  User.init({
    display_name: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    birthdate: DataTypes.DATE,
    saldo: DataTypes.INTEGER,
    api_hit: DataTypes.INTEGER,
    profile_picture: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};