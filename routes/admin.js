const express = require('express');

const adminControllers = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/allUsers', adminControllers.adminGetAllUsers);

router.get('/allRestaurants', adminControllers.adminGetAllRestaurants);

module.exports = router;