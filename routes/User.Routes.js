const express = require("express");
const { check } = require("express-validator");

const verifyAccessToken = require("../middlewares/VerifyAccessToken.middleware");
const {
    putEditProfile,
    putUpdateAccountCredentials,
    deleteUser,
    getUserByUsername,
    getUsers,
    getAccountOwnerInfo,
    putFollowUser,
    putUnFollowUser
} = require("../controllers/User.Controller");

const userRouter = express.Router();

// route for edit profile details
userRouter.put(
    "/editProfile",
    [
        check("name").notEmpty(),
        check("username").isLength({ min: 3, max: 30 })
    ],
    verifyAccessToken,
    putEditProfile
);

// route for updating account credentials
userRouter.put(
    "/updateAccountCredentials",
    [
        check("email").normalizeEmail().isEmail(),
        check("password").isLength({ min: 6 })
    ],
    verifyAccessToken,
    putUpdateAccountCredentials
);

// route for deleting user account
userRouter.delete("/deleteAccount", verifyAccessToken, deleteUser);

// route for getting user by id
userRouter.get("/userByUsername/:username", getUserByUsername);

// route for getting users by name
userRouter.get("/search", getUsers);

// route for getting account owner info
userRouter.get("/accountOwnerInfo", verifyAccessToken, getAccountOwnerInfo);

// route for follow a user
userRouter.put("/follow/:userId", verifyAccessToken, putFollowUser);

// route for unfollow a user
userRouter.put("/unfollow/:userId", verifyAccessToken, putUnFollowUser);

module.exports = userRouter;