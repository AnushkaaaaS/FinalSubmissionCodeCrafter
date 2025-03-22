const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
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
        purchasePrice: { 
            type: Number, 
            required: true,
            min: 0
        },
        purchaseDate: { 
            type: Date, 
            required: true,
            default: Date.now
        },
        _id: false // Disable automatic _id for subdocuments
    }],
    totalValue: { 
        type: Number, 
        default: 0 
    },
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true // Add createdAt and updatedAt fields
});

// Add unique index for userId
portfolioSchema.index({ userId: 1 }, { unique: true });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;
