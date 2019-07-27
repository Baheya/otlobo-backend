const express = require('express');

const userControllers = require('../controllers/user');
const isAuthenticated = require('../middleware/is-auth');


const router = express.Router();



router.get('/restaurants', isAuthenticated, userControllers.getRestaurants);

router.get('/restaurant/:restaurantId', userControllers.getRestaurant);

// router.post('/restaurant/:restaurantId', userControllers.createActiveGroup);

router.get(
  '/restaurant/:restaurantId/checkout/success',
  userControllers.getOrders
);

router.get('/activeGroups/:groupId', userControllers.getGroupDetails);

router.get('/activeGroups', userControllers.getActiveGroups);

router.get('/userOrders/:userId', userControllers.getUserOrders);

router.post(
  '/restaurant/:restaurantId/checkout/charge',
  userControllers.handlePayment
);

router.get('/restaurant/:restaurantId/checkout', userControllers.getOrder);


module.exports = router;
