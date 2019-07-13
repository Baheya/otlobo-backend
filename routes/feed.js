const express = require('express');

const feedController = require('../controllers/feed');

const router = express.Router();

router.get('/restaurants', feedController.getRestaurants);

router.get('/restaurant/1', feedController.getRestaurant);

module.exports = router;
