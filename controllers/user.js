const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menu-item');
const User = require('../models/user');
const Group = require('../models/group');
const Order = require('../models/order');
const OrderItem = require('../models/order-item');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//show all restaurants in the app
exports.getRestaurants = (req, res, next) => {
  if (req.query.sortBy === 'name') {
    Restaurant.findAll({
      order: [['name', 'ASC']]
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
      order: [['createdAt', 'DESC']]
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
    .catch(err => {
      console.log(err);
    });
};

exports.getOrder = (req, res, next) => {
  const userId = req.query.userId;
  const restaurantId = req.query.restaurantId;
  let totalPrice = 0;
  Group.findOne({
    where: { userId, restaurantId },
    include: [
      {
        model: Restaurant
      }
    ]
  })
    .then(group => {
      let groupId = group.id;
      Order.findOne({
        where: { groupId, userId },
        include: [
          {
            model: MenuItem,
            as: 'menu_items'
          }
        ]
      })
        .then(order => {
          order.menu_items.map(item => {
            const { price, order_item } = item;
            totalPrice = totalPrice + price * order_item.quantity;
            order.update({
              total: totalPrice
            });
          });
          res.status(200).json({
            message: 'Cart fetched successfully.',
            order,
            group,
            totalPrice
          });
        })
        .catch(err => {
          console.log(err);
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
        as: 'restaurant',
        attributes: ['name']
      },
      {
        model: Order,
        as: 'orders',
        attributes: ['id'],
        include: [{
          model: User,
          attributes: [ 'id', 'firstName', 'image'],
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

//payments handling
const stripeChargeCallback = res => (stripeErr, stripeRes) => {
  if (stripeErr) {
    res.status(500).send({ error: stripeErr });
  } else {
    res.status(200).send({ success: stripeRes });
  }
};

exports.handlePayment = async (req, res, next) => {
  const body = {
    source: req.body.token.id,
    amount: req.body.amount,
    currency: 'egp'
  };
  stripe.charges
    .create(body)
    .then(stripeResult => {
      User.findOne({ where: { id: req.body.userId } }).then(user => {
        Group.findOne({
          where: {
            userId: req.body.userId,
            restaurantId: req.body.restaurantId
          }
        }).then(group => {
          groupId = group.id;
          Order.findOne({ where: { userId: req.body.userId, groupId } })
            .then(order => {
              if (user.email !== req.body.token.email) {
                order
                  .update({
                    completed: false
                  })
                  .then(result => {
                    res.status(422).json({
                      message: 'Email incorrect, please try again.',
                      result,
                      completed: false
                    });
                  })
                  .catch(err => {
                    console.log(err);
                  });
              } else {
                order
                  .update({
                    completed: true
                  })
                  .then(result => {
                    if (
                      order.completed === true &&
                      user.email === req.body.token.email
                    ) {
                      res.status(200).json({
                        message: 'Order placed successfully!',
                        result,
                        completed: true
                      });
                    } else {
                      res.status(500).json({
                        message: 'Payment details incorrect, please try again.',
                        result,
                        completed: false
                      });
                    }
                  });
              }
            })
            .catch(err => {
              console.log(err);
            });
        });
      });
    })
    .catch(err => {
      console.log(`hello i am stripe catch block ${err}`);
    });
};
exports.getGroupDetails = (req, res, next) => {
  const groupId = req.params.groupId;
  Group.findOne({
    where: {
      id: groupId
    }
    ,
    include: [
      {
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'name']
      },
      {
        model: Order,
        as: 'orders',
        attributes: ['id'],
        include: [{
          model: User,
          attributes: ['id', 'firstName', 'image'],
          as: 'user'
        }, {
          model: MenuItem,
          as: 'menu_items',
          attributes: ['id', 'name', 'price', 'description', 'picture']
        }]
      }
    ]
  })
    .then(group => {
      if (!group) {
        const error = new Error('Could not find group.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Group details fetched successfully.',
        group: group
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}