const { fetchHistoricalData } = require('../utils/historicalData');

// Get the ticker symbol from command line arguments
const symbol = process.argv[2];
const years = parseInt(process.argv[3]) || 2;

if (!symbol) {
    console.error('Please provide a stock symbol as a command line argument');
    console.error('Usage: node fetchHistoricalData.js <symbol> [years]');
    process.exit(1);
}

// Fetch historical data and save to CSV
fetchHistoricalData(symbol, years)
    .then(filePath => {
        console.log(`Successfully saved historical data to: ${filePath}`);
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    }); 