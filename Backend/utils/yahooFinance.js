const yahooFinance = require('yahoo-finance2').default;

const getStockQuote = async (symbol) => {
    try {
        const quote = await yahooFinance.quote(symbol);
        if (!quote || !quote.regularMarketPrice) {
            throw new Error(`No quote data available for ${symbol}`);
        }
        return {
            symbol: quote.symbol,
            name: quote.longName || quote.shortName || symbol,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            marketCap: quote.marketCap || 0
        };
    } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error.message);
        throw new Error(`Failed to fetch quote for ${symbol}: ${error.message}`);
    }
};

const updateStockPrices = async (stocks) => {
    try {
        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
            throw new Error('No stocks provided for update');
        }

        const validStocks = stocks.filter(stock => stock && stock.symbol);
        if (validStocks.length === 0) {
            throw new Error('No valid stocks found for update');
        }

        const promises = validStocks.map(stock => getStockQuote(stock.symbol));
        const results = await Promise.allSettled(promises);
        
        // Filter out failed requests and return successful ones
        const updatedStocks = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);

        if (updatedStocks.length === 0) {
            throw new Error('Failed to fetch any stock quotes');
        }

        return updatedStocks;
    } catch (error) {
        console.error('Error updating stock prices:', error.message);
        throw error;
    }
};

module.exports = {
    getStockQuote,
    updateStockPrices
}; 