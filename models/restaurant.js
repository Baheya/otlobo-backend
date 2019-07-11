const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Restaurant = sequelize.define(
  'restaurant',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    name: Sequelize.STRING,
    address: Sequelize.STRING,
    password: Sequelize.STRING
  },
  {
    timestamps: true
  }
);

module.exports = Restaurant;
