const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    stocks: [{
        stockId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Stock', 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true,
            min: 0
        },
        _id: false // Disable automatic _id for subdocuments
    }]
}, {
    timestamps: true // Add createdAt and updatedAt fields
});

// Add index for faster queries
portfolioSchema.index({ userId: 1 });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;
