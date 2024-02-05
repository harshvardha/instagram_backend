const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Comment = require("../models/Comment.model");
const ReplyComment = require("../models/ReplyComment.model");
const CustomError = require("../errors/CustomError");
const Post = require("../models/Post.model");

const postAddComment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Please provide proper description.");
        }
        const userId = req.userId;
        const postId = req.params.postId;
        const { description } = req.body;
        if (!userId || !postId) {
            throw new CustomError(StatusCodes.BAD_REQUEST, "Please provide user id and post id both.");
        }
        const newComment = await Comment.create({
            user: userId,
            description
        });
        const post = await Post.findById(postId);
        if (!post) {
            throw new CustomError(StatusCodes.NOT_FOUND, "Post does not exist.");
        }
        await post.updateOne({
            $push: { comments: newComment._id }
        });
        await newComment.populate("user");
        res.status(StatusCodes.CREATED).json(newComment);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const putEditComment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Please provide proper description.");
        }
        const commentId = req.params.commentId;
        const userId = req.userId;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new CustomError(StatusCodes.NOT_FOUND, "Comment does not exist.");
        }
        const { description } = req.body;
        if (comment.user.toString() !== userId.toString()) {
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "You can only edit your comments.");
        }
        await comment.updateOne({
            $set: { description: description }
        }, { new: true });
        res.sendStatus(StatusCodes.OK);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const deleteComment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Please provide proper ids.");
        }
        const userId = req.userId;
        const { commentId, postId } = req.body;
        const post = await Post.findById(postId);
        if (!post) {
            throw new CustomError(StatusCodes.NOT_FOUND, "Post does not exist.")
        }
        const comment = await Comment.findById(commentId)
        // const replyComments = await ReplyComment.exists({ commentId: commentId });
        if (!comment) {
            throw new CustomError(StatusCodes.NOT_FOUND, "Comment does not exist.");
        }
        if (comment.user.toString() !== userId.toString() && post.user.toString() !== userId.toString()) {
            throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "You can only delete your comments or comments on your posts.");
        }
        await post.updateOne({
            $pull: { comments: new mongoose.Types.ObjectId(commentId) }
        });
        // if (replyComments) {
        //     await ReplyComment.deleteMany({ commentId: commentId });
        // }
        await Comment.findByIdAndDelete(commentId);
        res.sendStatus(StatusCodes.OK);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const putLikeComment = async (req, res, next) => {
    try {
        const userId = req.userId;
        const commentId = req.params.commentId;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new CustomError(StatusCodes.NOT_FOUND, "Comment does not exist.");
        }
        if (comment.likes.includes((userId))) {
            await comment.updateOne({
                $pull: { likes: userId }
            });
            res.sendStatus(StatusCodes.OK);
        }
        else {
            await comment.updateOne({
                $push: { likes: userId }
            });
            res.sendStatus(StatusCodes.OK);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {
    postAddComment,
    putEditComment,
    deleteComment,
    putLikeComment
}