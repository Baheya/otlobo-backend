const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator/check');

const Restaurant = require("../models/restaurant");
const User = require("../models/user");
const { TOKENSECRET } = process.env;

exports.postSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(422).json({
    //   msg: `Validation failed ${errors.array()}`
    // });
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const userType = req.query.userType;
  const email = req.body.email;
  const password = req.body.password;

  if (userType === "user") {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    User.findOne({
      where: {
        email: email
      }
    })
      .then(user => {
        if (user) {
          return res.status(401).json({
            msg: `Email: ${email}, is already taken.`
          });
        }
      })
      .catch(err => {
        console.log(err);
      });

    bcrypt
      .hash(password, 10)
      .then(hashPw => {
        return User.create({
          email: email,
          firstName: firstName,
          lastName: lastName,
          password: hashPw
        });
      })
      .then(result => {
        const token = jwt.sign(
          {
            email: email,
            userId: result.id
          },
          TOKENSECRET,
          { expiresIn: "1h" }
        );
        res.status(201).json({ token: token, userId: result.id, userType: "user", user: result });

        //res
        //  .status(201)
        //  .json({ msg: "user has been created", userId: result.id });
      })
      .catch(err => {
        console.log(err);
      });
  } else if (userType === "restaurant") {
    const name = req.body.name;
    const address = req.body.address;
    const selectedArea = req.body.selectedArea;
    Restaurant.findOne({
      where: {
        email: email
      }
    })
      .then(user => {
        if (user) {
          return res.status(401).json({
            msg: `Email: ${email}, is already taken.`
          });
        }
      })
      .catch(err => {
        console.log(err);
      });

    bcrypt
      .hash(password, 10)
      .then(hashPw => {
        return Restaurant.create({
          email: email,
          name: name,
          address: address,
          selectedArea: selectedArea,
          password: hashPw
        });
      })
      .then(result => {
        const token = jwt.sign(
          {
            email: email,
            userId: result.id
          },
          TOKENSECRET,
          { expiresIn: "1h" }
        );

        res.status(201).json({ token: token, userId: result.id, userType: "restaurant", restaurant: result });


        // res.status(201).json({
        //   msg: "restaurant has been created",
        //   restaurantId: result.id
        // });
      })
      .catch(err => {
        console.log(err);
      });
  }
};

exports.postLogin = (req, res, next) => {
  const userType = req.query.userType;
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  if (userType === "user") {
    User.findOne({
      where: {
        email: email
      }
    })
      .then(user => {
        if (!user) {
          return res.status(401).json({ msg: "Account not found." });
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
      })
      .then(isEqual => {
        if (!isEqual) {
          return res.status(401).json({ msg: "Password is incorrect." });
        }
        const token = jwt.sign(
          {
            email: loadedUser.email,
            userId: loadedUser.id
          },
          TOKENSECRET,
          { expiresIn: "1h" }
        );
        res.status(200).json({ token: token, userId: loadedUser.id, userType: "user", user: loadedUser});
      })
      .catch(err => {
        console.log(err);
      });
  } else if (userType === "restaurant") {
    Restaurant.findOne({
      where: {
        email: email
      }
    })
      .then(user => {
        if (!user) {
          return res.status(401).json({ msg: "Account not found." });
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
      })
      .then(isEqual => {
        if (!isEqual) {
          return res.status(401).json({ msg: "Password is incorrect." });
        }
        const token = jwt.sign(
          {
            email: loadedUser.email,
            userId: loadedUser.id
          },
          TOKENSECRET,
          { expiresIn: "1h" }
        );

        res.status(200).json({ token: token, userId: loadedUser.id, userType: "restaurant", restaurant: loadedUser });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }
};
