const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
require("dotenv").config();

const User = require("../models/User.model");
const CustomError = require("../errors/CustomError");

const postRegisterNewUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Please provide correct details.");
        }
        const { name, email, password, username } = req.body;
        const userExist = await User.findOne({ email: email });
        if (userExist) {
            throw new CustomError(StatusCodes.CONFLICT, "User already exist.");
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            username
        });
        res.status(StatusCodes.CREATED).json(newUser);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const postLoginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Please provide correct details.");
        }
        const { email, password } = req.body;
        const userExist = await User.findOne({ email: email });
        if (!userExist) {
            throw new CustomError(StatusCodes.NOT_FOUND, "User does not exist.");
        }
        const correctPassword = await bcrypt.compare(password, userExist.password);
        if (!correctPassword) {
            throw new CustomError(StatusCodes.NOT_FOUND, "Please provide correct email or password.");
        }
        const accessToken = jwt.sign(
            {
                id: userExist._id
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "24h" }
        );
        res.status(StatusCodes.OK).json({ accessToken, username: userExist.username, id: userExist._id, profilePicUrl: userExist.profilePictureUrl });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {
    postRegisterNewUser,
    postLoginUser
}