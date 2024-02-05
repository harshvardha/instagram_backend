const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    username: {
        type: String,
        required: true,
        min: 3,
        max: 20,
        unique: true
    },
    profilePictureUrl: {
        type: String,
        default: ""
    },
    dob: {
        type: String,
        default: ""
    },
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    bio: {
        type: String
    },
    gender: {
        type: String
    },
    savedPosts: [
        {
            type: Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);