const mongoose = require("mongoose");
const Post = require("../models/Post.model");
const User = require("../models/User.model");
const Comment = require("../models/Comment.model");
const CustomError = require("../errors/CustomError");
const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");

const postCreatePost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Please provide correct url");
        }
        const { url, caption } = req.body;
        const userId = req.userId;
        const newPost = await Post.create({
            url,
            user: userId,
            caption
        });
        res.status(StatusCodes.CREATED).json({ newPost });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const putUpdatePost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Please provide correct url");
        }
        const { url, caption } = req.body;
        const postId = req.params.postId;
        const userId = req.userId;
        const post = await Post.findById(postId);
        if (post && post.user.toString() === userId.toString()) {
            await post.updateOne({
                $set: { url: url, caption: caption }
            }, { new: true });
            res.status(StatusCodes.OK).json(post);
        }
        else {
            throw new CustomError(StatusCodes.BAD_REQUEST, "Either the post does not exist or you are not authorized.");
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const deletePost = async (req, res, next) => {
    try {
        const userId = req.userId;
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        const user = await User.findById(userId);
        if (post && post.user.toString() === userId.toString()) {
            if (user.savedPosts.includes(postId)) {
                await user.updateOne({
                    $pull: { savedPosts: postId }
                });
            }
            post.comments.map(async commentId => await Comment.deleteOne(commentId));
            await post.deleteOne({ _id: postId });
            res.status(StatusCodes.OK).json({ message: "Post deleted." });
        }
        else {
            throw new CustomError(StatusCodes.BAD_REQUEST, "Either the post does not exist or you are not authorized");
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const putLikeOrDislikePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const userId = req.userId;
        const post = await Post.findById(postId);
        if (!post) {
            throw new CustomError(StatusCodes.NOT_FOUND, "Please provide correct post id.");
        }
        if (post.likes.includes(userId)) {
            await post.updateOne({
                $pull: { likes: userId }
            });
            res.sendStatus(StatusCodes.OK);
        }
        else {
            await post.updateOne({
                $push: { likes: userId }
            });
            res.sendStatus(StatusCodes.OK);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getPostById = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            throw new CustomError(StatusCodes.NOT_FOUND).json({ message: "Post does not exist." });
        }
        await post.populate("user");
        await (await post.populate("comments")).populate("comments.user");
        res.status(StatusCodes.OK).json(post);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getAllPosts = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const posts = await Post.find({ user: userId });
        if (!posts) {
            throw new CustomError(StatusCodes.OK, "User does not exist.");
        }
        res.status(StatusCodes.OK).json(posts);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getTimelinePosts = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        const userPosts = await Post.find({ user: userId }).populate("user");
        const friendsPost = await Promise.all(
            user.following.map((friendId) => {
                return Post.find({ user: friendId }).populate("user");
            })
        );
        res.status(StatusCodes.OK).json(userPosts.concat(...friendsPost));
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const putSavePost = async (req, res, next) => {
    try {
        const userId = req.userId;
        const postId = req.params.postId;
        const user = await User.findById(userId);
        if (user.savedPosts.includes(postId)) {
            await user.updateOne({
                $pull: { savedPosts: postId }
            });
            res.sendStatus(StatusCodes.OK);
        } else {
            await user.updateOne({
                $push: { savedPosts: postId }
            });
            res.sendStatus(StatusCodes.OK);
        }
    } catch (error) {
        console.log(error)
        next(error);
    }
}

const getIsPostBookmarked = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { postId } = req.query;
        const user = await User.findById(userId);
        if (!userId) {
            throw new CustomError(StatusCodes.NOT_FOUND, "user not found.");
        }
        if (user.savedPosts.includes(postId)) {
            res.sendStatus(StatusCodes.OK);
        } else {
            res.sendStatus(StatusCodes.NOT_FOUND);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {
    postCreatePost,
    putUpdatePost,
    deletePost,
    putLikeOrDislikePost,
    getPostById,
    getAllPosts,
    getTimelinePosts,
    putSavePost,
    getIsPostBookmarked
}