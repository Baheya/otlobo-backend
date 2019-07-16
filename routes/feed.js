const express = require('express');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/restaurants', feedController.getRestaurants);

router.get('/restaurant/:restaurantId', feedController.getRestaurant);

router.post('/restaurant/:restaurantId', feedController.addOrder);

module.exports = router;
