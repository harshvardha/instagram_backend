const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/dbConnect");
const authRoutes = require("./routes/Authentication.Routes");
const userRoutes = require("./routes/User.Routes");
const postRoutes = require("./routes/Post.Routes");
const commentRoutes = require("./routes/Comment.Routes");
const PORT = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors({
    origin: "*"
}));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);

app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || "Server error. We are fixing it.";
    res.status(status).json({
        success: false,
        status,
        message
    });
});

mongoose.connection.on("open", () => {
    console.log(`MONGO DB CONNECTED`);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});