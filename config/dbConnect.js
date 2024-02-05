const mongoose = require("mongoose");
require("dotenv").config();

const clientOptions = {
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
    }
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. Successfully connected to MongoDB!");
    } catch (error) {
        console.log(error);
        await mongoose.disconnect();
    }
}

module.exports = connectDB;