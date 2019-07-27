const Restaurant = require('../models/restaurant');
const User = require('../models/user');


exports.adminGetAllUsers = (req, res, next) => {
    User.findAll()
        .then(users => {
            if (!users || users.length === 0) {
                const error = new Error('Could not find orders.');
                error.statusCode = 404;
                throw error;
            }
            console.log(users);
            res.status(200).json({
                message: 'users fetched successfully.',
                users
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.adminGetAllRestaurants = (req, res, next) => {
    Restaurant.findAll()
        .then(restaurants => {
            if (!restaurants || restaurants.length === 0) {
                const error = new Error('Could not find orders.');
                error.statusCode = 404;
                throw error;
            }
            console.log(restaurants);
            res.status(200).json({
                message: 'restaurants fetched successfully.',
                restaurants
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}