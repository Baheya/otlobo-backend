const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menu-item');

exports.getRestaurants = (req, res, next) => {
  Restaurant.findAll()
    .then(restaurants => {
      console.log(restaurants);
      res.status(200).json({
        message: 'Restaurants fetched successfully.',
        restaurants: restaurants
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getRestaurant = (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  console.log(restaurantId);
  Restaurant.findAll({
    where: {
      id: restaurantId
    },
    include: [
      {
        model: MenuItem,
        as: 'menu_items'
      }
    ]
  })
    .then(restaurant => {
      console.log(`Hello I am ${restaurant}`);
      res.status(200).json({
        message: 'Restaurant fetched successfully.',
        restaurant: restaurant
      });
    })
    .catch(err => {
      console.log(err);
    });
};
