const Sequelize = require("sequelize");
const { SECRET } = process.env;

const sequelize = new Sequelize('otlobo', 'otlobo', SECRET, {
  dialect: "postgressql",
  host: 'localhost'
});


const models = {
  User: sequelize.import("./user"),
  Restaurant: sequelize.import("./restaurant")
}


Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});


models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
