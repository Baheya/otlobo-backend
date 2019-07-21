const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const User = sequelize.define(
  "user",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
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
    birthDate: Sequelize.DATEONLY,
    address: Sequelize.STRING,
    image: Sequelize.STRING,
    admin: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = User;
