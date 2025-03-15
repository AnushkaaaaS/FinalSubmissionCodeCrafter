const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
