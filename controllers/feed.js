const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menu-item');
const Group = require('../models/group');
const Order = require('../models/order');
const OrderItem = require('../models/order-item');
const User = require('../models/user');
//show all restaurants in the app
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
// get single restaurant info
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

exports.getOrder = (req, res, next) => {
  const userId = req.query.userId;
  const groupId = req.query.groupId;
  Order.find({
    where: { groupId, userId },
    include: [
      {
        model: MenuItem,
        as: 'menu_items'
      }
    ]
  })
    .then(order => {
        res.status(200).json({
          message: 'Everything fetched successfully.',
          order: order
        });
      })
    .catch(err => {
      console.log(err);
    });
};
// get all active groups and their orders(the users who made those orders) and restaurant
exports.getActiveGroups = (req,res,next) => {
  Group.findAll({
    where: {
      active: true
    },
    include: [
      {
        model: Restaurant,
        as: 'restaurant'
      },
      {
        model: Order,
        as: 'orders',
        include: [{
          model: User,
          as: 'user'}]
      }
    ]
  })
    .then(groups => {
      if (!groups) {
        const error = new Error('Could not find groups.');
        error.statusCode = 404;
        throw error;
      }
      console.log(groups)
      res.status(200).json({
        message: 'Groups fetched successfully.',
        groups: groups
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
