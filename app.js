const path = require('path');

const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const express = require('express');
const sequelize = require('./util/database');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const Restaurant = require('./models/restaurant');
const MenuItem = require('./models/menu-item');
const User = require('./models/user');
const Group = require('./models/group');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

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

app.use(authRoutes);
app.use(feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
MenuItem.belongsTo(Restaurant);
Restaurant.hasMany(MenuItem, { foreignKey: 'restaurantId', as: 'menu_items' });
Restaurant.hasOne(Group);
Group.hasMany(Order);
Group.belongsTo(Restaurant);
Group.belongsTo(User);
Order.belongsTo(User);
// Order.hasMany(MenuItem, { through: OrderItem });
MenuItem.belongsToMany(Order, { through: OrderItem });
sequelize
  .sync({ force: false })
  .then(result => {
    console.log(result);
    app.listen(8080);
  })
  .catch(err => {
    console.log(err);
  });
