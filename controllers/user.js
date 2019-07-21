const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menu-item');
const User = require('../models/user');
const Group = require('../models/group');
const Order = require('../models/order');
const OrderItem = require('../models/order-item');

const schedule = require('node-schedule');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
        where: {
          active: true,
          paid: true
        },
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

exports.addMenuItem = (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  const menuItemId = req.params.menuItemId;
  const userId = req.body.userId;
  let groupId;
  let orderId;

  Group.findOrCreate({ where: { restaurantId, userId, active: true } })
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

exports.getOrders = (req, res, next) => {
  const userId = req.query.userId;
  const restaurantId = req.query.restaurantId;
  let totalPrice = 0;
  Group.findOne({
    where: { userId, restaurantId, active: true, paid: true },
    include: [
      {
        model: Restaurant
      },
      {
        model: Order,
        where: {
          completed: true
        },
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
                  .then(order => {
                    group.update({
                      paid: true,
                      timeframe: req.body.timeframe
                    });
                  })
                  .then(result => {
                    let timeframeValue;
                    if (req.body.timeframe === '15 minutes') {
                      timeframeValue = 15;
                    } else if (req.body.timeframe === '30 minutes') {
                      timeframeValue = 30;
                    } else if (req.body.timeframe === '45 minutes') {
                      timeframeValue = 45;
                    } else if (req.body.timeframe === '1 hour') {
                      timeframeValue = 60;
                    }
                    let now = new Date();
                    let groupTimeframe = new Date(
                      now.getTime() + timeframeValue * 60000
                    );
                    let j = schedule.scheduleJob(groupTimeframe, function() {
                      group.update({
                        active: false
                      });
                      console.log('The world is going to end today.');
                    });
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
