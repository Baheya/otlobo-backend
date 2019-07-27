const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menu-item');
const Group = require('../models/group');

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