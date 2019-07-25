const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Group = sequelize.define('group', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  timeframe: {
    type: Sequelize.ENUM('15 minutes', '30 minutes', '45 minutes', '60 minutes'),
    defaultValue: '30 minutes'
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Group;
