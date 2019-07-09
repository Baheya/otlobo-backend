const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { SECRET } = process.env;
const authhelpers = require("../helperFuns/authhelpers")


exports.signup = (req, res) => {
    const userType = req.query.userType
    if(userType === "user"){
        authhelpers.signUp(User)
    }else if(userType === "restaurant"){
        authhelpers.signUp(Restaurant)
    } 
};

exports.login = (req, res) => {
    const userType = req.query.userType
    if (userType === "user"){
        authhelpers.login(User)
    } else if (userType === "restaurant"){
        authhelpers.login(Restaurant)
    }
};