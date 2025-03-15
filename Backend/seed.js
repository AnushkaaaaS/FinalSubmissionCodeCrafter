const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stock = require('./models/Stock');

dotenv.config();

// Connect to investPortal database
mongoose.connect("mongodb+srv://nairayush45:nairayush45@cluster0.3daw0.mongodb.net/investPortal?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('✅ Connected to MongoDB: investPortal');

        // Dummy stock data with quantity
        const stocks = [
            { name: 'Apple', symbol: 'AAPL', price: 180, quantity: 1000 },
            { name: 'Microsoft', symbol: 'MSFT', price: 330, quantity: 800 },
            { name: 'Amazon', symbol: 'AMZN', price: 150, quantity: 900 },
            { name: 'Tesla', symbol: 'TSLA', price: 210, quantity: 1200 },
            { name: 'Google', symbol: 'GOOGL', price: 2800, quantity: 700 },
            { name: 'Meta', symbol: 'META', price: 350, quantity: 600 },
            { name: 'Nvidia', symbol: 'NVDA', price: 480, quantity: 500 },
            { name: 'Adobe', symbol: 'ADBE', price: 570, quantity: 550 },
            { name: 'Netflix', symbol: 'NFLX', price: 440, quantity: 400 },
            { name: 'Intel', symbol: 'INTC', price: 45, quantity: 1100 },
            { name: 'AMD', symbol: 'AMD', price: 120, quantity: 1300 },
            { name: 'Oracle', symbol: 'ORCL', price: 115, quantity: 1000 },
            { name: 'PayPal', symbol: 'PYPL', price: 85, quantity: 900 },
            { name: 'Uber', symbol: 'UBER', price: 52, quantity: 950 },
            { name: 'Spotify', symbol: 'SPOT', price: 290, quantity: 650 },
            { name: 'Salesforce', symbol: 'CRM', price: 250, quantity: 700 },
            { name: 'IBM', symbol: 'IBM', price: 140, quantity: 850 },
            { name: 'Cisco', symbol: 'CSCO', price: 50, quantity: 1000 },
            { name: 'Qualcomm', symbol: 'QCOM', price: 135, quantity: 720 },
            { name: 'Snapchat', symbol: 'SNAP', price: 10, quantity: 1500 },
            { name: 'Boeing', symbol: 'BA', price: 210, quantity: 400 },
            { name: 'Ford', symbol: 'F', price: 12, quantity: 2000 },
            { name: 'General Motors', symbol: 'GM', price: 38, quantity: 1500 },
            { name: 'Pepsi', symbol: 'PEP', price: 170, quantity: 900 },
            { name: 'Coca-Cola', symbol: 'KO', price: 60, quantity: 1200 },
            { name: 'McDonalds', symbol: 'MCD', price: 250, quantity: 500 },
            { name: 'Starbucks', symbol: 'SBUX', price: 98, quantity: 1100 },
            { name: 'Nike', symbol: 'NKE', price: 125, quantity: 1000 },
            { name: 'Adidas', symbol: 'ADDYY', price: 95, quantity: 950 },
            { name: 'Disney', symbol: 'DIS', price: 120, quantity: 800 },
            { name: 'Twitter', symbol: 'TWTR', price: 40, quantity: 1300 },
            { name: 'Walmart', symbol: 'WMT', price: 140, quantity: 1000 },
            { name: 'Target', symbol: 'TGT', price: 135, quantity: 1100 },
            { name: 'Costco', symbol: 'COST', price: 520, quantity: 600 },
            { name: 'Home Depot', symbol: 'HD', price: 310, quantity: 750 },
            { name: 'Visa', symbol: 'V', price: 245, quantity: 900 },
            { name: 'Mastercard', symbol: 'MA', price: 370, quantity: 850 },
            { name: 'JPMorgan Chase', symbol: 'JPM', price: 140, quantity: 950 },
            { name: 'Goldman Sachs', symbol: 'GS', price: 350, quantity: 700 },
            { name: 'American Express', symbol: 'AXP', price: 165, quantity: 900 },
            { name: 'Bank of America', symbol: 'BAC', price: 30, quantity: 2000 },
            { name: 'Netflix', symbol: 'NFLX', price: 450, quantity: 500 },
            { name: 'Airbnb', symbol: 'ABNB', price: 135, quantity: 1000 },
            { name: 'Zoom', symbol: 'ZM', price: 100, quantity: 950 },
            { name: 'DocuSign', symbol: 'DOCU', price: 55, quantity: 1100 },
            { name: 'Lyft', symbol: 'LYFT', price: 15, quantity: 1400 },
            { name: 'Shopify', symbol: 'SHOP', price: 65, quantity: 1300 },
            { name: 'Tesla', symbol: 'TSLA', price: 205, quantity: 1200 },
            { name: 'Roku', symbol: 'ROKU', price: 75, quantity: 900 }
        ];

        try {
            // Clear existing stock data
            await Stock.deleteMany({});
            console.log('🗑️ Old stock data cleared');

            // Insert new stocks
            await Stock.insertMany(stocks);
            console.log('✅ Stock data seeded successfully');

        } catch (err) {
            console.error('❌ Error inserting stock data:', err);
        } finally {
            mongoose.connection.close();
            console.log('🔌 Database connection closed');
        }
    })
    .catch(err => console.error('❌ Database connection failed:', err));
