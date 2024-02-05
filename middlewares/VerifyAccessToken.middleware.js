const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../errors/CustomError");
require("dotenv").config();

const verifyAccessToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader.startsWith("Bearer")) {
            return res.sendStatus(StatusCodes.UNAUTHORIZED);
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            (error, decoded) => {
                if (error) {
                    console.log(error);
                    return res.sendStatus(StatusCodes.UNAUTHORIZED);
                }
                req.userId = decoded.id;
                next();
            }
        )
    } catch (error) {
        console.log(error);
    }
}

module.exports = verifyAccessToken;