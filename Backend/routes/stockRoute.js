const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const User = require('../models/userModel');

/**
 * @route   GET /api/stocks
 * @desc    Get all available stocks
 */
router.get('/', async (req, res) => {
    try {
        const stocks = await Stock.find({});
        res.status(200).json(stocks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
/**
 * @route   GET /api/stocks/portfolio/:email
 * @desc    Get user's stock portfolio
 */
router.get('/portfolio/:email', async (req, res) => {
    try {
        const { email } = req.params;
        console.log("Fetching portfolio for:", email);  // Debugging log

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const portfolio = await Portfolio.findOne({ userId: user._id }).populate('stocks.stockId');
        if (!portfolio || portfolio.stocks.length === 0) {
            return res.status(404).json({ message: "No stocks purchased yet." });
        }

        const formattedPortfolio = portfolio.stocks.map(s => ({
            symbol: s.stockId.symbol,
            name: s.stockId.name,
            quantity: s.quantity,
            currentPrice: s.stockId.price  // Assuming Stock model has 'price' field
        }));

        res.status(200).json(formattedPortfolio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @route   GET /api/stocks/user-stats/:email
 * @desc    Get user statistics (stocks purchased, sold, credits)
 */
router.get('/user-stats/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        
        // Get all transactions for the user
        const transactions = await Transaction.find({ userEmail: email });
        
        // Calculate statistics
        const buyTransactions = transactions.filter(t => t.type === 'BUY');
        const sellTransactions = transactions.filter(t => t.type === 'SELL');
        
        const totalPurchased = buyTransactions.reduce((total, t) => total + t.quantity, 0);
        const totalSold = sellTransactions.reduce((total, t) => total + t.quantity, 0);
        
        // Calculate total spent and earned
        const totalSpent = buyTransactions.reduce((total, t) => total + (t.price * t.quantity), 0);
        const totalEarned = sellTransactions.reduce((total, t) => total + (t.price * t.quantity), 0);
        
        // Calculate credits (assuming starting with 10000)
        const startingCredits = 10000;
        const currentCredits = startingCredits - totalSpent + totalEarned;
        
        // Get current portfolio value
        const portfolio = await Portfolio.findOne({ userId: user._id }).populate('stocks.stockId');
        let portfolioValue = 0;
        
        if (portfolio && portfolio.stocks.length > 0) {
            portfolioValue = portfolio.stocks.reduce((total, stock) => {
                return total + (stock.stockId.price * stock.quantity);
            }, 0);
        }
        
        res.status(200).json({
            totalPurchased,
            totalSold,
            currentHoldings: totalPurchased - totalSold,
            totalSpent,
            totalEarned,
            currentCredits,
            portfolioValue,
            netWorth: currentCredits + portfolioValue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @route   POST /api/stocks/buy
 * @desc    Buy stocks and update market + user portfolio
 */
router.post('/buy', async (req, res) => {
    try {
        const { email, symbol, quantity } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        
        const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
        if (!stock) return res.status(404).json({ message: "Stock not found" });
        
        if (stock.quantity < quantity) {
            return res.status(400).json({ message: "Not enough stock available" });
        }
        
        stock.quantity -= quantity;
        await stock.save();
        
        const transaction = new Transaction({
            userEmail: email,
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            quantity,
            type: "BUY"
        });
        await transaction.save();
        
        let portfolio = await Portfolio.findOne({ userId: user._id });
        if (!portfolio) {
            portfolio = new Portfolio({ userId: user._id, stocks: [] });
        }
        
        const stockIndex = portfolio.stocks.findIndex(s => s.stockId.equals(stock._id));
        if (stockIndex >= 0) {
            portfolio.stocks[stockIndex].quantity += quantity;
        } else {
            portfolio.stocks.push({ stockId: stock._id, quantity });
        }
        await portfolio.save();

        res.status(200).json({ message: "Stock purchased successfully", transaction, portfolio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @route   POST /api/stocks/sell
 * @desc    Sell stocks and update user portfolio + market
 */
router.post('/sell', async (req, res) => {
    try {
        const { email, symbol, quantity } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        
        const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
        if (!stock) return res.status(404).json({ message: "Stock not found" });
        
        let portfolio = await Portfolio.findOne({ userId: user._id });
        if (!portfolio) return res.status(400).json({ message: "No holdings found" });
        
        const stockIndex = portfolio.stocks.findIndex(s => s.stockId.equals(stock._id));
        if (stockIndex < 0 || portfolio.stocks[stockIndex].quantity < quantity) {
            return res.status(400).json({ message: "Not enough stocks to sell" });
        }
        
        portfolio.stocks[stockIndex].quantity -= quantity;
        if (portfolio.stocks[stockIndex].quantity === 0) {
            portfolio.stocks.splice(stockIndex, 1);
        }
        await portfolio.save();
        
        stock.quantity += quantity;
        await stock.save();
        
        const transaction = new Transaction({
            userEmail: email,
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            quantity,
            type: "SELL"
        });
        await transaction.save();

        res.status(200).json({ message: "Stock sold successfully", transaction, portfolio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
