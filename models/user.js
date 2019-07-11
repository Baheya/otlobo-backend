const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define(
  'user',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    password: Sequelize.STRING,
    admin: {
       type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false }
  },
  {
    timestamps: true
  }
);

module.exports = User;
