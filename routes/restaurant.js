const express = require('express');

const restaurantControllers = require('../controllers/restaurant');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/restaurant/addMenuItem/:restaurantId', restaurantControllers.postMenuItem); 

module.exports = router;