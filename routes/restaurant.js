const express = require('express');

const restaurantControllers = require('../controllers/restaurant');
const isAuthenticated = require('../middleware/is-auth');

const router = express.Router();

router.post('/menuItems/:restaurantId/add', isAuthenticated, restaurantControllers.postMenuItem); 


router.get('/menu', isAuthenticated, restaurantControllers.getMenu);
router.get('/allOrders/:restaurantId', isAuthenticated, restaurantControllers.getAllOrders); 

router.patch('/updateStatus', isAuthenticated, restaurantControllers.updateStatus); 

module.exports = router;