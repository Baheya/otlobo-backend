const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menu-item');
const Group = require('../models/group');
const Order = require('../models/order');
const OrderItem = require('../models/order-item');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
              totalPrice
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
    restaurantId: req.body.restaurantId,
    userId: req.body.userId,
    currency: 'egp'
  };
  stripe.charges.create(body, stripeChargeCallback(res));
  Group.findOne({
    where: { userId: body.userId, restaurantId: body.restaurantId }
  }).then(group => {
    groupId = group.id;
    Order.findOne({ where: { userId: body.userId, groupId } })
      .then(order => {
        order.update({
          completed: true
        });
      })
      .then(result => {
        res.status(200).json({
          message: 'Order placed successfully!',
          result
        });
      })
      .catch(err => {
        console.log(err);
      });
  });
};
