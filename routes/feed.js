const express = require('express');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/restaurants', feedController.getRestaurants);

router.get('/restaurant/:restaurantId', feedController.getRestaurant);

router.post(
  '/restaurant/:restaurantId/:menuItemId',
  feedController.addMenuItem
);

router.get('/restaurant/:restaurantId/:menuItemId', feedController.getOrder);

router.get('/restaurant/:restaurantId/checkout', feedController.getOrder);

router.post(
  '/restaurant/:restaurantId/checkout/charge',
  feedController.handlePayment
);

module.exports = router;
