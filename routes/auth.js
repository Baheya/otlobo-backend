const express = require("express");
const { body } = require("express-validator/check")

const authControllers = require("../controllers/auth");
const User = require('../models/user');

const router = express.Router();

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body('name')
        .trim()
        .not()
        .isEmpty()
],
 authControllers.postSignup)
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 5 })
],
 authControllers.postLogin)

module.exports = router;