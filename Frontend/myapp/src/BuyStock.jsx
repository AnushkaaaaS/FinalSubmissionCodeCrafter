import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import './BuyStock.css';

const BuyStock = () => {
  const { symbol } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stockInfo, setStockInfo] = useState(null);

  const fetchStockInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/stocks`);
      const stock = response.data.find(s => s.symbol === symbol);
      if (stock) {
        setStockInfo({
          currentPrice: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume,
          marketCap: stock.marketCap,
          quantity: stock.quantity
        });
      }
    } catch (err) {
      console.error('Error fetching stock info:', err);
      setError('Failed to fetch stock information');
    }
  };

  useEffect(() => {
    fetchStockInfo();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStockInfo, 30000);
    return () => clearInterval(interval);
  }, [symbol]);

  const handleBuy = async () => {
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!stockInfo || quantity > stockInfo.quantity) {
      setError('Not enough stock available');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/api/stocks/buy', { 
        email: user.email, 
        symbol, 
        quantity: parseInt(quantity) 
      });
      
      setSuccess('Stock purchased successfully!');
      setLoading(false);
      
      // Update stock info after purchase
      setStockInfo(prev => ({
        ...prev,
        quantity: prev.quantity - parseInt(quantity),
        currentPrice: response.data.currentPrice
      }));
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/portfolio');
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Error buying stock");
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const totalCost = stockInfo ? (quantity * stockInfo.currentPrice).toFixed(2) : 0;

  return (
    <div className="buy-stock-container">
      <button className="back-button" onClick={handleBack}>
        ← Back to Home
      </button>
      
      <h2 className="buy-stock-header">
        Buy <span className="buy-stock-symbol">{symbol}</span>
      </h2>
      
      {stockInfo && (
        <div className="buy-stock-info">
          <p>
            <span className={stockInfo.change >= 0 ? "price-up" : "price-down"}>
              {stockInfo.change >= 0 ? '↑' : '↓'}
              {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)} ({stockInfo.changePercent.toFixed(2)}%)
            </span>
          </p>
          <p><strong>Current Price:</strong> ${stockInfo.currentPrice.toFixed(2)}</p>
          <p><strong>Volume:</strong> {formatNumber(stockInfo.volume)}</p>
          <p><strong>Market Cap:</strong> ${formatNumber(stockInfo.marketCap)}</p>
          <p><strong>Available Quantity:</strong> {stockInfo.quantity.toLocaleString()}</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      
      <div className="buy-stock-form">
        <div className="form-group">
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            max={stockInfo?.quantity || 0}
          />
        </div>
        
        {quantity > 0 && (
          <div className="total-cost">
            <span>Total Cost:</span>
            <strong>${totalCost}</strong>
          </div>
        )}
        
        <button 
          className="buy-stock-btn" 
          onClick={handleBuy}
          disabled={loading || !stockInfo || quantity <= 0 || quantity > stockInfo.quantity}
        >
          {loading ? 'Processing...' : 'Buy Stock'}
        </button>
      </div>
    </div>
  );
};

export default BuyStock;
