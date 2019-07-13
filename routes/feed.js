const express = require('express');

const feedController = require('../controllers/feed');

const router = express.Router();

router.get('/restaurants', feedController.getRestaurants);

router.get('/restaurant/:restaurantId', feedController.getRestaurant);

module.exports = router;
