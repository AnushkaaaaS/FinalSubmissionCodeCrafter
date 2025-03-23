const fs = require('fs');
const path = require('path');

/**
 * Parses CSV data
 * @param {string} csvContent - CSV file content
 * @returns {Array} - Parsed data
 */
const parseCSV = (csvContent) => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim();
        });
        return row;
    }).filter(row => Object.keys(row).length === headers.length);
};

/**
 * Calculates the moving average for a given period
 * @param {Array} prices - Array of prices
 * @param {number} period - Period for moving average
 * @returns {Array} - Moving averages
 */
const calculateMovingAverage = (prices, period) => {
    const result = [];
    for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) {
            result.push(null);
            continue;
        }
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
    }
    return result;
};

/**
 * Calculates the relative strength index (RSI)
 * @param {Array} prices - Array of prices
 * @param {number} period - Period for RSI
 * @returns {Array} - RSI values
 */
const calculateRSI = (prices, period = 14) => {
    const result = [];
    for (let i = 0; i < prices.length; i++) {
        if (i < period) {
            result.push(null);
            continue;
        }
        
        const changes = [];
        for (let j = 1; j <= period; j++) {
            changes.push(prices[i - j + 1] - prices[i - j]);
        }
        
        const gains = changes.map(change => change > 0 ? change : 0);
        const losses = changes.map(change => change < 0 ? -change : 0);
        
        const avgGain = gains.reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
        
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        result.push(rsi);
    }
    return result;
};

/**
 * Makes predictions using technical indicators
 * @param {Array} data - Historical data from CSV
 * @returns {Object} - Predictions and analysis
 */
const makePredictions = (data) => {
    // Extract closing prices
    const prices = data.map(row => parseFloat(row.Close));
    
    // Calculate technical indicators
    const ma20 = calculateMovingAverage(prices, 20);
    const ma50 = calculateMovingAverage(prices, 50);
    const rsi = calculateRSI(prices);
    
    // Get the last available values
    const lastPrice = prices[prices.length - 1];
    const lastMA20 = ma20[ma20.length - 1];
    const lastMA50 = ma50[ma50.length - 1];
    const lastRSI = rsi[rsi.length - 1];
    
    // Generate predictions based on technical analysis
    let prediction = lastPrice;
    let trend = 'Neutral';
    let confidence = 0;
    
    // Trend analysis
    if (lastMA20 > lastMA50) {
        trend = 'Bullish';
        confidence += 0.3;
    } else if (lastMA20 < lastMA50) {
        trend = 'Bearish';
        confidence -= 0.3;
    }
    
    // RSI analysis
    if (lastRSI > 70) {
        trend = 'Bearish';
        confidence -= 0.2;
    } else if (lastRSI < 30) {
        trend = 'Bullish';
        confidence += 0.2;
    }
    
    // Price momentum
    const priceChange = (lastPrice - prices[prices.length - 2]) / prices[prices.length - 2];
    if (priceChange > 0.02) { // 2% increase
        confidence += 0.1;
    } else if (priceChange < -0.02) { // 2% decrease
        confidence -= 0.1;
    }
    
    // Generate price prediction
    const volatility = Math.abs(priceChange);
    const predictionRange = lastPrice * volatility;
    
    if (confidence > 0) {
        prediction = lastPrice + predictionRange;
    } else if (confidence < 0) {
        prediction = lastPrice - predictionRange;
    }
    
    return {
        currentPrice: lastPrice,
        predictedPrice: prediction,
        trend,
        confidence: Math.abs(confidence),
        technicalIndicators: {
            ma20: lastMA20,
            ma50: lastMA50,
            rsi: lastRSI
        }
    };
};

/**
 * Main function to analyze data and make predictions
 * @param {string} csvPath - Path to the CSV file
 * @returns {Object} - Analysis results and predictions
 */
const analyzeAndPredict = async (csvPath) => {
    try {
        // Read and parse CSV file
        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        const records = parseCSV(fileContent);
        
        // Make predictions
        console.log('Analyzing data and making predictions...');
        const predictions = makePredictions(records);
        
        return predictions;
    } catch (error) {
        console.error('Error in analyzeAndPredict:', error);
        throw error;
    }
};

module.exports = {
    analyzeAndPredict
}; 