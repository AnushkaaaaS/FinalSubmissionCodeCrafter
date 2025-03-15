const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const userRoute = require('./routes/userRoute');
const stockRoute = require('./routes/stockRoute');

dotenv.config();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoute);
app.use('/api/stocks', stockRoute);

// Use environment variable for MongoDB URI
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nairayush45:nairayush45@cluster0.3daw0.mongodb.net/investPortal?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit process on DB failure
    });

// Handle uncaught exceptions & rejections
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
    process.exit(1);
});
