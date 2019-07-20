const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menu-item');

exports.postMenuItem = (req, res, next) => {
    const restaurantId = req.params.restaurantId;
    const name = req.body.name
    const description = req.body.description
    const price = req.body.price
    const picture = req.body.picture

    MenuItem.create({ name, description, price, picture, restaurantId})
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