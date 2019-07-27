const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menu-item');
const Order = require('../models/order');
const Group = require('../models/group');
const User = require('../models/user')

exports.postMenuItem = (req, res, next) => {
    const restaurantId = req.params.restaurantId;
    const name = req.body.name
    const description = req.body.description
    const price = req.body.price
    const picture = req.file
    
    let picturePath = '';
    if(!picture){
        picturePath = 'images/defaultFood.png'
    } else {
        picturePath = picture.path
    }

    MenuItem.create({ name, description, price, picture: picturePath, restaurantId})
        .then(menuItem => {
            res.status(201).json({
                msg: "menuItem has been created",
                restaurantId: menuItem
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}


// get single restaurant info
exports.getMenu = (req, res, next) => {
    const restaurantId = req.userId;
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
exports.getAllOrders = (req, res, next) => {
    const restaurantId = req.params.restaurantId;
    Group.findAll({
        where: {
            restaurantId
        },
        include: [
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
        .then(groups => {
            if (!groups) {
                const error = new Error('Could not find orders for this restaurant.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message: 'orders fetched successfully.',
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
