const { analyzeAndPredict } = require('../utils/stockPrediction');
const path = require('path');

// Get the CSV file path from command line arguments
const csvPath = process.argv[2];

if (!csvPath) {
    console.error('Please provide the path to the CSV file as a command line argument');
    console.error('Usage: node predictStock.js <path_to_csv>');
    process.exit(1);
}

// Run the prediction
console.log('Starting stock price analysis and prediction...');
console.log(`Using data from: ${csvPath}`);

analyzeAndPredict(csvPath)
    .then(results => {
        console.log('\nAnalysis Results:');
        console.log('-----------------');
        
        console.log(`Current Price: $${results.currentPrice.toFixed(2)}`);
        console.log(`Predicted Price: $${results.predictedPrice.toFixed(2)}`);
        console.log(`Price Change: ${((results.predictedPrice - results.currentPrice) / results.currentPrice * 100).toFixed(2)}%`);
        console.log(`Trend: ${results.trend}`);
        console.log(`Confidence: ${(results.confidence * 100).toFixed(1)}%`);
        
        console.log('\nTechnical Indicators:');
        console.log('--------------------');
        console.log(`20-day Moving Average: $${results.technicalIndicators.ma20.toFixed(2)}`);
        console.log(`50-day Moving Average: $${results.technicalIndicators.ma50.toFixed(2)}`);
        console.log(`RSI (14): ${results.technicalIndicators.rsi.toFixed(1)}`);
        
        // RSI interpretation
        let rsiInterpretation = '';
        if (results.technicalIndicators.rsi > 70) {
            rsiInterpretation = 'Overbought';
        } else if (results.technicalIndicators.rsi < 30) {
            rsiInterpretation = 'Oversold';
        } else {
            rsiInterpretation = 'Neutral';
        }
        console.log(`RSI Interpretation: ${rsiInterpretation}`);
        
        // Additional analysis
        console.log('\nAnalysis Summary:');
        console.log('-----------------');
        if (results.trend === 'Bullish') {
            console.log('The stock shows bullish signals with:');
            if (results.technicalIndicators.ma20 > results.technicalIndicators.ma50) {
                console.log('- 20-day MA is above 50-day MA (Golden Cross)');
            }
            if (results.technicalIndicators.rsi < 30) {
                console.log('- RSI indicates oversold conditions');
            }
        } else if (results.trend === 'Bearish') {
            console.log('The stock shows bearish signals with:');
            if (results.technicalIndicators.ma20 < results.technicalIndicators.ma50) {
                console.log('- 20-day MA is below 50-day MA (Death Cross)');
            }
            if (results.technicalIndicators.rsi > 70) {
                console.log('- RSI indicates overbought conditions');
            }
        } else {
            console.log('The stock shows neutral signals with mixed technical indicators');
        }
        
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    }); 