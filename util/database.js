const Sequelize = require('sequelize');

const sequelize = new Sequelize('otlobo', 'beya', 'nantsigomenyabaghitibaba', {
  dialect: 'postgresql',
  host: 'localhost'
});

module.exports = sequelize;
