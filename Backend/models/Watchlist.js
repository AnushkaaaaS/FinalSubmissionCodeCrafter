const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    stocks: [{
        symbol: { 
            type: String, 
            required: true 
        },
        name: String,
        price: Number,
        change: Number,
        changePercent: Number,
        volume: Number,
        marketCap: Number,
        lastUpdated: Date
    }]
}, {
    timestamps: true
});

// Add unique index for userId
watchlistSchema.index({ userId: 1 }, { unique: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
module.exports = Watchlist; 