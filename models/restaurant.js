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
    adress: Sequelize.STRING,
    password: Sequelize.STRING
  },
  {
    timestamps: true
  }
);

module.exports = Restaurant;
