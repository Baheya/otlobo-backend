const express = require('express');

const restaurantControllers = require('../controllers/restaurant');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/menuItems/:restaurantId/add', restaurantControllers.postMenuItem); 

router.get('/allOrders/:restaurandId', restaurantControllers.getAllOrders); 

module.exports = router;