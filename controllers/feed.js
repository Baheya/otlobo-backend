const Restaurant = require('../models/restaurant');

exports.getRestaurants = (req, res, next) => {
  Restaurant.find()
    .then(restaurants => {
      console.log(restaurants);
      res.status(200).json({
        message: 'Restaurants fetched successfully.',
        posts: restaurants
      });
    })
    .catch(err => {
      console.log(err);
    });
};
