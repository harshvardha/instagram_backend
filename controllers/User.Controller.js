const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");
const ReplyComment = require("../models/ReplyComment.model");
const CustomError = require("../errors/CustomError");
const { StatusCodes } = require("http-status-codes");

const putEditProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Please provide correct details.");
        }
        const userId = req.userId;
        const { name, username, profilePictureUrl, gender, bio } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError(StatusCodes.NOT_FOUND, "User does not exist.");
        }
        const updatedUser = await user.updateOne({
            name,
            username,
            profilePictureUrl: profilePictureUrl ? profilePictureUrl : "",
            gender: gender ? gender : "",
            bio: bio ? bio : ""
        }, { new: true });
        res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const putUpdateAccountCredentials = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Please provide correct credentials.");
        }
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError(StatusCodes.NOT_FOUND, "User does not exist");
        }
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        await user.updateOne({
            $set: { password: hashedPassword, email: email }
        }, { new: true });
        res.status(StatusCodes.OK).json({ message: "Account Credentials Updated." });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getUsers = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) {
            throw new CustomError(StatusCodes.UNPROCESSABLE_ENTITY, "Don't provide empty search query.");
        }
        const foundUsers = await User.find({ username: query });
        if (!foundUsers) {
            throw new CustomError(StatusCodes.NOT_FOUND, "Users not found");
        }
        res.status(StatusCodes.OK).json(foundUsers);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getUserByUsername = async (req, res, next) => {
    try {
        const username = req.params.username;
        if (!username) {
            throw new CustomError(StatusCodes.UNPROCESSABLE_ENTITY, "Please provide correct username");
        }
        const user = await User.findOne({ username: username });
        if (!user) {
            throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
        }
        await user.populate("followers");
        let posts = await Post.find({ user: user._id });
        res.status(StatusCodes.OK).json({ user, posts });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getAccountOwnerInfo = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new CustomError(StatusCodes.UNAUTHORIZED, "Please provide correct user id");
        }
        const user = await User.findById(new mongoose.Types.ObjectId(userId));
        if (!user) {
            throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
        }
        const { email, password, _id, ...others } = user._doc
        res.status(StatusCodes.OK).json({ userInfo: others });
    } catch (error) {
        console.log(error);
        next(error)
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new CustomError(StatusCodes.UNPROCESSABLE_ENTITY, "Please provide correct user id");
        }
        await User.findByIdAndDelete(userId);
        await Post.deleteMany({ user: userId });
        await Comment.deleteMany({ user: userId });
        await ReplyComment.deleteMany({ user: userId });
        res.status(StatusCodes.OK).json({ message: "User Account Deleted." });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const putFollowUser = async (req, res, next) => {
    try {
        const userId = req.userId;
        const followedUserId = req.params.userId;
        if (userId !== followedUserId) {
            const user = await User.findById(userId);
            const followedUser = await User.findById(followedUserId);
            if (!user.following.includes(followedUserId)) {
                await user.updateOne({ $push: { following: followedUserId } });
                await followedUser.updateOne({ $push: { followers: userId } });
                res.status(StatusCodes.OK).json({ message: `You followed ${followedUser.username}` });
            }
            else {
                throw new CustomError(StatusCodes.BAD_REQUEST, "You already follow this user.");
            }
        }
        else {
            throw new CustomError(StatusCodes.BAD_REQUEST, "You cannot follow yourself.");
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const putUnFollowUser = async (req, res, next) => {
    try {
        const userId = req.userId;
        const unFollowedUserId = req.params.userId;
        if (userId !== unFollowedUserId) {
            const user = await User.findById(userId);
            const unFollowedUser = await User.findById(unFollowedUserId);
            if (user.following.includes(unFollowedUserId)) {
                await user.updateOne({ $pull: { following: unFollowedUserId } });
                await unFollowedUser.updateOne({ $pull: { followers: userId } });
                res.status(StatusCodes.OK).json({ message: `You unfollowed ${unFollowedUser.username}` });
            }
            else {
                throw new CustomError(StatusCodes.BAD_REQUEST, "This user does not exist in your following list.");
            }
        }
        else {
            throw new CustomError(StatusCodes.BAD_REQUEST, "You cannot unfollow yourself.");
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {
    putEditProfile,
    putUpdateAccountCredentials,
    getUsers,
    getUserByUsername,
    getAccountOwnerInfo,
    deleteUser,
    putFollowUser,
    putUnFollowUser
};