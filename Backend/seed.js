const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stock = require('./models/Stock');
const { getStockQuote } = require('./utils/yahooFinance');

dotenv.config();

// Connect to investPortal database
mongoose.connect("mongodb+srv://nairayush45:nairayush45@cluster0.3daw0.mongodb.net/investPortal?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('✅ Connected to MongoDB: investPortal');

        // Initial stock data with only symbols and quantities
        const initialStocks = [
            { symbol: 'AAPL', quantity: 1000 },
            { symbol: 'MSFT', quantity: 800 },
            { symbol: 'AMZN', quantity: 900 },
            { symbol: 'TSLA', quantity: 1200 },
            { symbol: 'GOOGL', quantity: 700 },
            { symbol: 'META', quantity: 600 },
            { symbol: 'NVDA', quantity: 500 },
            { symbol: 'ADBE', quantity: 550 },
            { symbol: 'NFLX', quantity: 400 },
            { symbol: 'INTC', quantity: 1100 },
            { symbol: 'AMD', quantity: 1300 },
            { symbol: 'ORCL', quantity: 1000 },
            { symbol: 'PYPL', quantity: 900 },
            { symbol: 'UBER', quantity: 950 },
            { symbol: 'SPOT', quantity: 650 },
            { symbol: 'CRM', quantity: 700 },
            { symbol: 'IBM', quantity: 850 },
            { symbol: 'CSCO', quantity: 1000 },
            { symbol: 'QCOM', quantity: 720 },
            { symbol: 'SNAP', quantity: 1500 }
        ];

        try {
            // Clear existing stock data
            await Stock.deleteMany({});
            console.log('🗑️ Old stock data cleared');

            // Fetch real-time data for each stock and create new entries
            const stockPromises = initialStocks.map(async (stock) => {
                try {
                    const quote = await getStockQuote(stock.symbol);
                    return new Stock({
                        symbol: quote.symbol,
                        name: quote.name,
                        price: quote.price,
                        quantity: stock.quantity,
                        change: quote.change,
                        changePercent: quote.changePercent,
                        volume: quote.volume,
                        marketCap: quote.marketCap,
                        lastUpdated: new Date()
                    });
                } catch (error) {
                    console.error(`Error fetching data for ${stock.symbol}:`, error);
                    return null;
                }
            });

            const stocks = await Promise.all(stockPromises);
            const validStocks = stocks.filter(stock => stock !== null);
            
            await Stock.insertMany(validStocks);
            console.log('✅ Stock data seeded successfully');

        } catch (err) {
            console.error('❌ Error inserting stock data:', err);
        } finally {
            mongoose.connection.close();
            console.log('🔌 Database connection closed');
        }
    })
    .catch(err => console.error('❌ Database connection failed:', err));
