const express = require('express');

const userControllers = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/restaurants', userControllers.getRestaurants);

router.get('/restaurant/:restaurantId', userControllers.getRestaurant);

// router.post('/restaurant/:restaurantId', userControllers.createActiveGroup);

router.post(
  '/restaurant/:restaurantId/:menuItemId',
  userControllers.addMenuItem
);

router.get('/restaurant/:restaurantId/:menuItemId', userControllers.getOrder);

router.get(
  '/restaurant/:restaurantId/checkout/success',
  userControllers.getOrders
);

router.get('/activeGroups', userControllers.getActiveGroups);

router.post(
  '/restaurant/:restaurantId/checkout/charge',
  userControllers.handlePayment
);

router.get('/restaurant/:restaurantId/checkout', userControllers.getOrder);

router.get('/activeGroups/:groupId', userControllers.getGroupDetails);

module.exports = router;
