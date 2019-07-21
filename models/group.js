const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Group = sequelize.define('group', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  active: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

module.exports = Group;
