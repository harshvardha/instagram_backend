const express = require("express");
const { check } = require("express-validator");

const {
    postRegisterNewUser,
    postLoginUser
} = require("../controllers/Authentication.controller");

const authRouter = express.Router();

// route for registering new user
authRouter.post(
    "/register",
    [
        check("name").notEmpty(),
        check("email").normalizeEmail().isEmail(),
        check("password").isLength({ min: 6 }),
        check("username").isLength({ min: 3, max: 30 })
    ],
    postRegisterNewUser
);

// route for login
authRouter.post(
    "/login",
    [
        check("email").normalizeEmail().isEmail(),
        check("password").isLength({ min: 6 })
    ],
    postLoginUser
);

module.exports = authRouter;