const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menu-item');
const Group = require('../models/group');
const Order = require('../models/order');
const OrderItem = require('../models/order-item');

exports.getRestaurants = (req, res, next) => {
  if (req.query.sortBy === 'name') {
    Restaurant.findAll({
      order: [['name', 'ASC']],
      limit: 2
    })
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
  } else if (req.query.sortBy === 'newest') {
    Restaurant.findAll({
      order: [['createdAt', 'DESC']],
      limit: 2
    })
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
  } else {
    Restaurant.findAll({ limit: 2 })
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
  }
};

exports.getRestaurant = (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  Restaurant.findAll({
    where: {
      id: restaurantId
    },
    include: [
      {
        model: MenuItem,
        as: 'menu_items'
      },
      {
        model: Group
      }
    ]
  })
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

exports.addMenuItem = (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  const menuItemId = req.params.menuItemId;
  const userId = req.body.userId;
  let groupId;
  let orderId;

  Group.findOrCreate({ where: { restaurantId, userId } })
    .then(group => {
      groupId = group[0].id;
      Order.findOrCreate({ where: { groupId, userId } })
        .then(order => {
          orderId = order[0].id;
          OrderItem.findOrCreate({
            where: { menuItemId, orderId }
          })
            .spread((item, created) => {
              if (created === false) {
                item
                  .update({
                    quantity: item.quantity + 1
                  })
                  .then(item => {
                    res.status(200).json({
                      message: 'Everything fetched successfully.',
                      group: group[0],
                      order: order[0],
                      item: item
                    });
                  });
              }
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.log(err);
    });
};
