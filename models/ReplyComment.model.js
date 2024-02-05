const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replyCommentSchema = new Schema({
    commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        required: true
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("ReplyComment", replyCommentSchema);