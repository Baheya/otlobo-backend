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
    type: Sequelize.ENUM('02 minutes', '15 minutes', '30 minutes', '45 minutes', '60 minutes'),
    defaultValue: '15 minutes'
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: Sequelize.ENUM('opened', 'parpering', 'closed'),
    defaultValue: 'opened'
  }
});

module.exports = Group;
