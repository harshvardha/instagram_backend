const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    caption: {
        type: String,
        default: ""
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);