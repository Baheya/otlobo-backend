const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const MenuItem = sequelize.define('menu-item', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  price: Sequelize.INTEGER,
  picture: Sequelize.STRING
});

module.exports = MenuItem;