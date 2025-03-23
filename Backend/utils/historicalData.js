const yahooFinance = require('yahoo-finance2').default;
const fs = require('fs');
const path = require('path');

/**
 * Fetches historical data for a given ticker and saves it to a CSV file
 * @param {string} symbol - The stock symbol (e.g., 'AAPL' for Apple)
 * @param {number} years - Number of years of historical data to fetch
 * @returns {Promise<string>} - Path to the created CSV file
 */
const fetchHistoricalData = async (symbol, years = 2) => {
    try {
        // Calculate the date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - years);

        console.log(`Fetching historical data for ${symbol} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // Fetch historical data
        const historicalData = await yahooFinance.historical(symbol, {
            period1: startDate,
            period2: endDate,
            interval: '1d'
        });

        if (!historicalData || historicalData.length === 0) {
            throw new Error(`No historical data available for ${symbol}`);
        }

        // Create CSV content
        const csvHeader = 'Date,Open,High,Low,Close,Volume,AdjClose\n';
        const csvRows = historicalData.map(day => {
            return `${day.date.toISOString().split('T')[0]},${day.open},${day.high},${day.low},${day.close},${day.volume},${day.adjClose}`;
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        // Save to CSV file
        const fileName = `${symbol}_${years}years_${new Date().toISOString().split('T')[0]}.csv`;
        const filePath = path.join(dataDir, fileName);
        fs.writeFileSync(filePath, csvContent);

        console.log(`Historical data saved to ${filePath}`);
        return filePath;
    } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error.message);
        throw error;
    }
};

module.exports = {
    fetchHistoricalData
}; 