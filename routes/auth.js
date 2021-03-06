const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth");
router.post("/signup", authControllers.signUp)
router.post("/login", authControllers.logIn)
module.exports = router;