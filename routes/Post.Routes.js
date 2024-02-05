const express = require("express");
const { check } = require("express-validator");

const {
    postCreatePost,
    putUpdatePost,
    deletePost,
    putLikeOrDislikePost,
    getPostById,
    getAllPosts,
    getTimelinePosts,
    putSavePost,
    getIsPostBookmarked,
    getBookmarkedPosts
} = require("../controllers/Post.controller");
const verifyAccessToken = require("../middlewares/VerifyAccessToken.middleware");

const postRouter = express.Router();

// route to create post
postRouter.post(
    "/createPost",
    [
        check("url").isURL()
    ],
    verifyAccessToken,
    postCreatePost
);

// route to update post
postRouter.put(
    "/updatePost/:postId",
    [
        check("url").isURL(),
    ],
    verifyAccessToken,
    putUpdatePost
);

// route to delete post
postRouter.delete("/deletePost/:postId", verifyAccessToken, deletePost);

// route to like or dislike post
postRouter.put("/likeOrDislikePost/:postId", verifyAccessToken, putLikeOrDislikePost);

// route to get post by id
postRouter.get("/postById/:postId", getPostById);

// route to get All posts by user
postRouter.get("/allPosts/:userId", getAllPosts);

// route to get all timeline posts
postRouter.get("/timeline", verifyAccessToken, getTimelinePosts);

// route to bookmark or save a post
postRouter.put("/bookmark/:postId", verifyAccessToken, putSavePost);

// route to query if a post id bookmarked or not
postRouter.get("/isBookmarked", verifyAccessToken, getIsPostBookmarked);

// route to get bookmarked posts
postRouter.get("/bookmarkedPosts", verifyAccessToken, getBookmarkedPosts);

module.exports = postRouter;