const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menu-item');
const User = require('../models/user');
const Group = require('../models/group');
const Order = require('../models/order');
const OrderItem = require('../models/order-item');

const schedule = require('node-schedule');

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
          model: Group,
          where: { active: true },
          required: false
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

// exports.createActiveGroup = (req, res, next) => {
//   const restaurantId = req.body.restaurantId;
//   Group.create({ where: { restaurantId, active: true, paid: false } }).then(
//     group => {
//       res.status(200).json({
//         message: 'Active group created successfully.',
//         group: group
//       });
//     }
//   );
// };

exports.getOrder = (req, res, next) => {
  const userId = req.query.userId;
  const restaurantId = req.query.restaurantId;
  let totalPrice = 0;
  Group.findOne({
    where: { userId, restaurantId, active: true },
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
exports.getActiveGroups = (req, res, next) => {
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
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'image'],
            as: 'user'
          }
        ]
      }
    ]
  })
    .then(groups => {
      if (!groups) {
        const error = new Error('Could not find groups.');
        error.statusCode = 404;
        throw error;
      }
      console.log(groups);
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
};

//payments handling
const stripeChargeCallback = res => (stripeErr, stripeRes) => {
  if (stripeErr) {
    res.status(500).send({ error: stripeErr });
  } else {
    res.status(200).send({ success: stripeRes });
  }
};

exports.getOrders = (req, res, next) => {
  const restaurantId = req.query.restaurantId;

  Group.findOne({
    where: { restaurantId, active: true },
    include: [
      {
        model: Restaurant
      },
      {
        model: Order,
        include: [
          {
            model: MenuItem,
            as: 'menu_items'
          }
        ]
      }
    ]
  })
    .then(group => {
      res.status(200).json({
        message: 'Cart fetched successfully.',
        group
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.handlePayment = async (req, res, next) => {
  // calculating order total so it's not calculated from the frontend, if one item vs if array of items
  let orderTotal;
  const calculateTotal = a => {
    if (req.body.orderItems.length === 1) {
      orderTotal = a[0].price * a[0].quantity;
    } else {
      orderTotal = req.body.orderItems.reduce(
        (a, b) => a.price * a.quantity + b.price * b.quantity
      );
    }
  };
  calculateTotal(req.body.orderItems);

  // replacing the amount sent from frontend in the body with the amount calculated from backend
  const body = {
    source: req.body.token.id,
    amount: orderTotal,
    currency: 'usd'
  };
  const restaurantId = req.body.restaurantId;
  const userId = req.body.userId;
  // creating payment charge and if successful group, order, and order items
  stripe.charges
    .create(body)
    .then(stripeResult => {
      User.findOne({ where: { id: userId } }).then(user => {
        Group.findOrCreate({
          where: {
            restaurantId,
            active: true
          }
        }).then(group => {
          groupId = group[0].id;
          Order.create({ userId, groupId })
            .then(order => {
              orderId = order.id;
              req.body.orderItems.map(item => {
                const { id, quantity } = item;
                OrderItem.create({ orderId, menuItemId: id, quantity }).then(
                  orderItem => {
                    if (user.email !== req.body.token.email) {
                      res.status(422).json({
                        message: 'Email incorrect, please try again.',
                        //result,
                        completed: false
                      });
                    } else {
                      order
                        .update({
                          total: orderTotal
                        })
                        .then(order => {
                          if (group[1] === true) {
                            const timeframe = req.body.timeframe ? req.body.timeframe : '15 minutes';
                            group[0].update({
                              timeframe
                            });
                          }
                        })
                        .then(result => {
                          let timeframeValue;
                          if(req.body.timeframe) {
                            if (req.body.timeframe === '02 minutes') {
                              timeframeValue = 2;
                            } else if (req.body.timeframe === '15 minutes') {
                              timeframeValue = 15;
                            } else if (req.body.timeframe === '30 minutes') {
                              timeframeValue = 30;
                            } else if (req.body.timeframe === '45 minutes') {
                              timeframeValue = 45;
                            } else if (req.body.timeframe === '60 minutes') {
                              timeframeValue = 60;
                            }
                          } else {
                            timeframeValue = 15;
                          }
                          
                          let now = new Date();
                          let groupTimeframe = new Date(
                            now.getTime() + timeframeValue * 60000
                          );
                          let j = schedule.scheduleJob(
                            groupTimeframe,
                            function() {
                              group[0].update({
                                active: false
                              });
                              console.log('The world is going to end today.');
                              j.cancel();
                            }
                          );
                          if (user.email === req.body.token.email) {
                            res.status(200).json({
                              message: 'Order placed successfully!',
                              result,
                              completed: true
                            });
                          } else {
                            res.status(500).json({
                              message:
                                'Payment details incorrect, please try again.',
                              result,
                              completed: false
                            });
                          }
                        });
                    }
                  }
                );
              });
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
    },
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
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'image'],
            as: 'user'
          },
          {
            model: MenuItem,
            as: 'menu_items',
            attributes: ['id', 'name', 'price', 'description', 'picture']
          }
        ]
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
};
