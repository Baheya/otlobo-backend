const express = require('express');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth')

const router = express.Router();

router.get('/restaurants', feedController.getRestaurants);

module.exports = router;
