const path = require('path');

const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const express = require('express');
const sequelize = require('./util/database');

const feedRoutes = require('./routes/feed');
const Restaurant = require('./models/restaurant');
const MenuItem = require('./models/menu-item');

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(feedRoutes);

MenuItem.belongsTo(Restaurant);
Restaurant.hasMany(MenuItem, { foreignKey: 'restaurantId', as: 'menu_items' });

sequelize
  .sync()
  .then(result => {
    console.log(result);
    app.listen(3001);
  })
  .catch(err => {
    console.log(err);
  });
