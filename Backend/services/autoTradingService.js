const meanReversionService = require('./meanReversionService');
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const User = require('../models/userModel');
const Transaction = require('../models/Transaction');
const { getStockQuote } = require('../utils/yahooFinance');

class AutoTradingService {
    constructor() {
        this.minConfidence = 0.7; // Minimum confidence required to execute a trade
        this.maxPositionSize = 0.1; // Maximum position size as percentage of portfolio
        this.tradingInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.activeUsers = new Set();
        this.tradingIntervals = new Map(); // Map to store intervals for each user
        this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
    }

    async executeTrade(userEmail, symbol, type, quantity, price) {
        try {
            console.log(`Executing ${type} trade for ${userEmail}: ${quantity} shares of ${symbol} at $${price}`);
            
            const user = await User.findOne({ email: userEmail });
            if (!user) {
                throw new Error('User not found');
            }

            const portfolio = await Portfolio.findOne({ userId: user._id });
            if (!portfolio) {
                throw new Error('Portfolio not found');
            }

            if (type === 'BUY') {
                const totalCost = quantity * price;
                if (user.credits < totalCost) {
                    throw new Error('Insufficient funds');
                }

                // Update user credits
                user.credits -= totalCost;
                await user.save();

                // Update or add stock to portfolio
                const stockIndex = portfolio.stocks.findIndex(s => s.stockId.symbol === symbol);
                if (stockIndex >= 0) {
                    portfolio.stocks[stockIndex].quantity += quantity;
                } else {
                    const stock = await Stock.findOne({ symbol });
                    if (!stock) {
                        throw new Error('Stock not found');
                    }
                    portfolio.stocks.push({
                        stockId: stock._id,
                        quantity,
                        purchasePrice: price,
                        purchaseDate: new Date()
                    });
                }
            } else if (type === 'SELL') {
                const stockIndex = portfolio.stocks.findIndex(s => s.stockId.symbol === symbol);
                if (stockIndex < 0) {
                    throw new Error('Stock not found in portfolio');
                }

                const stock = portfolio.stocks[stockIndex];
                if (stock.quantity < quantity) {
                    throw new Error('Insufficient shares');
                }

                // Update user credits
                const totalProfit = quantity * price;
                user.credits += totalProfit;
                await user.save();

                // Update portfolio
                if (stock.quantity === quantity) {
                    portfolio.stocks.splice(stockIndex, 1);
                } else {
                    stock.quantity -= quantity;
                }
            }

            await portfolio.save();

            // Record transaction
            await Transaction.create({
                userEmail,
                symbol,
                name: symbol, // You might want to fetch the actual company name
                price,
                quantity,
                type,
                automated: true
            });

            console.log(`Successfully executed ${type} trade for ${userEmail}`);
            return true;
        } catch (error) {
            console.error(`Error executing trade: ${error.message}`);
            return false;
        }
    }

    async checkAndExecuteTrades(userEmail) {
        try {
            console.log(`Checking trades for user: ${userEmail}`);
            const user = await User.findOne({ email: userEmail });
            if (!user) {
                console.log('User not found, stopping auto trading');
                this.stopAutoTrading(userEmail);
                return;
            }

            const portfolio = await Portfolio.findOne({ userId: user._id })
                .populate({
                    path: 'stocks.stockId',
                    model: 'Stock'
                });

            if (!portfolio) {
                console.log('Portfolio not found');
                return;
            }

            if (!portfolio.stocks || portfolio.stocks.length === 0) {
                console.log('No stocks in portfolio');
                return;
            }

            // Filter out stocks with invalid stockId
            const validStocks = portfolio.stocks.filter(stock => 
                stock && stock.stockId && stock.stockId.symbol && stock.quantity > 0
            );

            if (validStocks.length === 0) {
                console.log('No valid stocks found in portfolio');
                return;
            }

            console.log('Valid stocks found:', validStocks.map(s => s.stockId.symbol));

            // Get trading signals
            const signals = await meanReversionService.analyzePortfolio(
                validStocks.map(s => ({
                    symbol: s.stockId.symbol,
                    quantity: s.quantity
                }))
            );

            if (!signals || signals.length === 0) {
                console.log('No trading signals generated');
                return;
            }

            console.log('Generated signals:', signals);

            // Execute trades for signals with high confidence
            for (const signal of signals) {
                try {
                    if (!signal || !signal.symbol) {
                        console.log('Invalid signal:', signal);
                        continue;
                    }

                    if (signal.confidence >= this.minConfidence) {
                        console.log(`Processing high confidence signal for ${signal.symbol}:`, signal);

                        if (signal.signal === 'BUY') {
                            const maxQuantity = Math.floor(
                                (user.credits * this.maxPositionSize) / signal.currentPrice
                            );
                            if (maxQuantity > 0) {
                                console.log(`Attempting to buy ${maxQuantity} shares of ${signal.symbol}`);
                                await this.executeTrade(
                                    userEmail,
                                    signal.symbol,
                                    'BUY',
                                    maxQuantity,
                                    signal.currentPrice
                                );
                            } else {
                                console.log(`Insufficient funds to buy ${signal.symbol}`);
                            }
                        } else if (signal.signal === 'SELL') {
                            const stock = validStocks.find(s => s.stockId.symbol === signal.symbol);
                            if (stock && stock.quantity > 0) {
                                console.log(`Attempting to sell ${stock.quantity} shares of ${signal.symbol}`);
                                await this.executeTrade(
                                    userEmail,
                                    signal.symbol,
                                    'SELL',
                                    stock.quantity,
                                    signal.currentPrice
                                );
                            } else {
                                console.log(`No shares available to sell for ${signal.symbol}`);
                            }
                        }
                    } else {
                        console.log(`Signal confidence too low for ${signal.symbol}: ${signal.confidence}`);
                    }
                } catch (signalError) {
                    console.error(`Error processing signal for ${signal?.symbol}:`, signalError);
                }
            }
        } catch (error) {
            console.error(`Error checking trades: ${error.message}`);
        }
    }

    async startAutoTrading(email) {
        try {
            if (this.activeUsers.has(email)) {
                return false;
            }

            // Start periodic trading check
            const interval = setInterval(() => this.checkAndExecuteTrades(email), this.checkInterval);
            this.tradingIntervals.set(email, interval);
            this.activeUsers.add(email);

            // Do initial check immediately
            await this.checkAndExecuteTrades(email);
            
            return true;
        } catch (error) {
            console.error('Error starting auto trading:', error);
            return false;
        }
    }

    stopAutoTrading(email) {
        try {
            if (!this.activeUsers.has(email)) {
                return false;
            }

            // Clear the trading interval
            const interval = this.tradingIntervals.get(email);
            if (interval) {
                clearInterval(interval);
                this.tradingIntervals.delete(email);
            }

            this.activeUsers.delete(email);
            return true;
        } catch (error) {
            console.error('Error stopping auto trading:', error);
            return false;
        }
    }

    isAutoTradingActive(email) {
        return this.activeUsers.has(email);
    }

    async cleanupInvalidStocks(userId) {
        try {
            const portfolio = await Portfolio.findOne({ userId })
                .populate('stocks.stockId');
            
            if (!portfolio) {
                console.log(`No portfolio found for user ${userId}`);
                return;
            }

            // Log initial portfolio state
            console.log(`Initial portfolio has ${portfolio.stocks.length} stocks`);

            // Filter out stocks with invalid stockId or missing required fields
            const validStocks = portfolio.stocks.filter(stock => {
                // Check if stock object exists
                if (!stock) {
                    console.log('Found null stock entry');
                    return false;
                }

                // Check if stockId exists and is valid
                if (!stock.stockId) {
                    console.log('Found stock with null stockId:', stock._id);
                    return false;
                }

                // Check if symbol exists
                if (!stock.stockId.symbol) {
                    console.log('Found stock with missing symbol:', stock._id);
                    return false;
                }

                // Check if quantity exists and is valid
                if (!stock.quantity || stock.quantity <= 0) {
                    console.log(`Found stock with invalid quantity for ${stock.stockId.symbol}`);
                    return false;
                }

                // Check if purchasePrice exists and is valid
                if (!stock.purchasePrice || stock.purchasePrice <= 0) {
                    console.log(`Found stock with invalid purchase price for ${stock.stockId.symbol}`);
                    // Set a default purchase price if missing (current price or 100 as fallback)
                    stock.purchasePrice = stock.stockId.price || 100;
                    console.log(`Set default purchase price ${stock.purchasePrice} for ${stock.stockId.symbol}`);
                }

                // Check if purchaseDate exists
                if (!stock.purchaseDate) {
                    console.log(`Found stock with missing purchase date for ${stock.stockId.symbol}`);
                    // Set purchase date to current date if missing
                    stock.purchaseDate = new Date();
                    console.log(`Set default purchase date for ${stock.stockId.symbol}`);
                }

                return true;
            });

            // Update portfolio with only valid stocks
            if (validStocks.length !== portfolio.stocks.length) {
                console.log(`Found ${portfolio.stocks.length - validStocks.length} invalid stocks`);
                console.log(`Cleaning up portfolio for user ${userId}`);
                
                // Update the portfolio with valid stocks
                portfolio.stocks = validStocks;
                
                try {
                    await portfolio.save();
                    console.log(`Successfully cleaned up portfolio. ${validStocks.length} valid stocks remaining`);
                } catch (saveError) {
                    console.error('Error saving cleaned portfolio:', saveError);
                    // If save fails, try to save stocks one by one
                    portfolio.stocks = [];
                    for (const stock of validStocks) {
                        try {
                            portfolio.stocks.push(stock);
                            await portfolio.save();
                        } catch (individualSaveError) {
                            console.error(`Error saving stock ${stock.stockId.symbol}:`, individualSaveError);
                        }
                    }
                }
            } else {
                console.log('No invalid stocks found in portfolio');
            }
        } catch (error) {
            console.error('Error in cleanupInvalidStocks:', error);
            throw error;
        }
    }
}

module.exports = new AutoTradingService(); 