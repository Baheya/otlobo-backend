const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Restaurant = sequelize.define(
  "restaurant",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: Sequelize.STRING
  },
  {
    timestamps: true
  }
);

module.exports = Restaurant;
