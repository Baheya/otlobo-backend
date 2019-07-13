const Sequelize = require('sequelize');

const { DB_NAME, DB_USER, SECRET } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, SECRET, {
  dialect: 'postgres',
  host: 'localhost'
});

module.exports = sequelize;
