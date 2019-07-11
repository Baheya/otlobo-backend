const Restaurant = require('../models/restaurant');

exports.getRestaurants = (req, res, next) => {
  Restaurant.find()
    .then(restaurants => {
      console.log(restaurants);
    })
    .catch(err => {
      console.log(err);
    });
};
