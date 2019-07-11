const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Restaurant = require('../models/restaurant');
const User = require('../models/user');
const { SECRET, TOKENSECRET } = process.env;


exports.postSignup = (req, res, next) => {
    const userType = req.query.userType
    const email = req.body.email
    const password = req.body.password

    if(userType === "user"){
        const firstName = req.body.firstName
        const lastName = req.body.lastName
        User.findOne({
            where: {
                email: email
            }
        }).then(user => {
            if (user) {
                const error = new Error("email is already exist")
                error.statusCode = 401
                throw error
            }
        })
        bcrypt.hash(password, 10)
        .then(hashPw => {
            return User.create({
                email: email,
                firstName: firstName,
                lastName: lastName,
                password: hashPw
            })
        }).then(result => {
            res.status(201).json({msg: 'user has been created', userId: result.id})
        })
        .catch(err => {
            console.log(err)
        })
        
    } else if(userType === "restaurant"){
        const name = req.body.name
        const address = req.body.address
        Restaurant.findOne({
            where: {
                email: email
            }
        })
        .then(user => {
            if (user) {
                const error = new Error("email is already exist")
                error.statusCode = 401
                throw error
            }
        })
        bcrypt.hash(password, 10)
            .then(hashPw => {
                return Restaurant.create({
                    email: email,
                    name: name,
                    address: address,
                    password: hashPw
                })
            }).then(result => {
                res.status(201).json({ msg: 'restaurant has been created', restaurantId: result.id })
            })
            .catch(err => {
                console.log(err)
            }) 
    };
}

exports.postLogin = (req, res, next) => {
    const userType = req.query.userType
    const email = req.body.email
    const password = req.body.password
    let loadedUser
    if (userType === "user"){
        User.findOne({
            where: {
                email: email
            }
        }).then(user => {
            if (!user) {
                const error = new Error("email is wrong")
                error.statusCode = 401
                throw error
            }
            loadedUser = user
            return bcrypt.compare(password, user.password)
        }).then(isEqual => {
            if (!isEqual) {
                const error = new Error("password is wrong")
                error.statusCode = 401
                throw error
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser.id
            },
                TOKENSECRET,
                { expiresIn: '1h' })

            res.status(200).json({ token: token, userId: loadedUser.id })
        }).catch(err => {
            console.log(err)
        })

    } else if (userType === "restaurant"){
        Restaurant.findOne({
            where: {
                email: email
            }
        }).then(user => {
            if (!user) {
                const error = new Error("email is wrong")
                error.statusCode = 401
                throw error
            }
            loadedUser = user
            return bcrypt.compare(password, user.password)
        }).then(isEqual => {
            if (!isEqual) {
                const error = new Error("password is wrong")
                error.statusCode = 401
                throw error
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser.id
            },
                TOKENSECRET,
                { expiresIn: '1h' })

            res.status(200).json({ token: token, userId: loadedUser.id })
        }).catch(err => {
            console.log(err)
        })

    }
};