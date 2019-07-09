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
    name: Sequelize.STRING,
    address: Sequelize.STRING,
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    password: Sequelize.STRING
  },
  {
    timestamps: true
  }
);

module.exports = Restaurant;
