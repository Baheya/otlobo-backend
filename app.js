const path = require('path');

const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const multer = require('multer')
const express = require('express');
const sequelize = require('./util/database');

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurant');
const adminRoutes = require('./routes/admin');

const Restaurant = require('./models/restaurant');
const MenuItem = require('./models/menu-item');
const User = require('./models/user');
const Group = require('./models/group');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null,'images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null, true)
  } else{
    cb(null, false)
  }
}

app.use(bodyParser.json());
app.use(require('body-parser').text());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('file'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

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
app.use(userRoutes);
app.use(restaurantRoutes);
app.use('admin', adminRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

//relations btw restaurant and group
Restaurant.hasOne(Group);
Group.belongsTo(Restaurant, { constraints: true, onDelete: 'CASCADE' });
//relations btw order and group
Group.hasMany(Order);
Order.belongsTo(Group, { constraints: true, onDelete: 'CASCADE' });
//relation btw order and user
Order.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Order);
//relation btw order and menuitems
Order.belongsToMany(MenuItem, { as: 'menu_items', through: OrderItem });
MenuItem.belongsToMany(Order, { through: OrderItem });
//relation btw restaurant and menuitems
MenuItem.belongsTo(Restaurant, { constraints: true, onDelete: 'CASCADE' });
Restaurant.hasMany(MenuItem, { foreignKey: 'restaurantId', as: 'menu_items' });

sequelize
  .sync({ force: false })
  .then(result => {
    console.log(result);
    app.listen(8080);
  })
  .catch(err => {
    console.log(err);
  });
