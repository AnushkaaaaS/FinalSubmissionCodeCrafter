const mongoose = require('mongoose');

const portfolioSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stocks: [
        {
            stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
            quantity: { type: Number, required: true }
        }
    ]
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;
