const Sequelize = require('sequelize');

const sequelize = new Sequelize('otlobo', 'beya', '', {
  dialect: 'postgresql',
  host: 'localhost'
});

module.exports = sequelize;
