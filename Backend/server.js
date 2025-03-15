const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoute');
const stockRoutes = require('./routes/stockRoute');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with better error handling
mongoose.connect("mongodb+srv://nairayush45:nairayush45@cluster0.3daw0.mongodb.net/investPortal?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log('✅ Connected to MongoDB: investPortal');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Request logging middleware (place this before routes)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);

// Error handling middleware (place this after routes)
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });
    
    // If it's a Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: "Validation Error",
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    // If it's a Mongoose cast error (invalid ID)
    if (err.name === 'CastError') {
        return res.status(400).json({
            message: "Invalid ID format",
            error: err.message
        });
    }

    // If it's a Yahoo Finance API error
    if (err.message && err.message.includes('Yahoo Finance')) {
        return res.status(503).json({
            message: "External API Error",
            error: err.message
        });
    }

    res.status(500).json({ 
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Handle uncaught exceptions & rejections
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", {
        message: err.message,
        stack: err.stack
    });
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", {
        reason: reason instanceof Error ? reason.stack : reason,
        promise
    });
    process.exit(1);
});
