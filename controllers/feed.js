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
  const restaurantId = req.body.restaurantId;
  Restaurant.findAll({
    where: {
      id: 1
    },
    include: [
      {
        model: MenuItem,
        as: 'menu_items'
      }
    ]
  })
    // Restaurant.findByPk(1)
    //   include: [{ model: MenuItem, where: { restaurantId: 1 } }]
    // })
    .then(restaurant => {
      res.status(200).json({
        message: 'Restaurant fetched successfully.',
        restaurant: restaurant
      });
    })
    .catch(err => {
      console.log(err);
    });
};
