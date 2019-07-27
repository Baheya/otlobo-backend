const express = require('express');

const restaurantControllers = require('../controllers/restaurant');
const isAuthenticated = require('../middleware/is-auth');

const router = express.Router();

router.post('/menuItems/:restaurantId/add', restaurantControllers.postMenuItem); 


router.get('/menu', isAuthenticated, restaurantControllers.getMenu);

router.get('/allOrders/:restaurantId', restaurantControllers.getAllOrders); 

router.patch('/updateStatus', restaurantControllers.updateStatus); 

module.exports = router;