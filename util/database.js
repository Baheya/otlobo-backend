const Sequelize = require('sequelize');

const { DB_NAME, USER, SECRET } = process.env;

const sequelize = new Sequelize(DB_NAME, USER, SECRET, {
  dialect: 'postgres',
  host: 'localhost'
});

module.exports = sequelize;
