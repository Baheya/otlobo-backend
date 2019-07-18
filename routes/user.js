const express = require('express');

const userControllers = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/restaurants', userControllers.getRestaurants);

router.get('/restaurant/:restaurantId', userControllers.getRestaurant);

router.post(
  '/restaurant/:restaurantId/:menuItemId',
  userControllers.addMenuItem
);

router.get('/restaurant/:restaurantId/:menuItemId', userControllers.getOrder);

module.exports = router;
