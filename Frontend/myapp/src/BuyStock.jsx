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

  useEffect(() => {
    // Fetch current stock price and information
    const fetchStockInfo = async () => {
      try {
        // This is a placeholder. You would replace with your actual API call
        // const response = await axios.get(`http://localhost:8000/api/stocks/info/${symbol}`);
        // setStockInfo(response.data);
        
        // Placeholder data for demonstration
        setStockInfo({
          currentPrice: 150.25,
          change: 2.5,
          changePercent: 1.7,
          volume: 1250000
        });
      } catch (err) {
        console.error('Error fetching stock info:', err);
      }
    };

    fetchStockInfo();
  }, [symbol]);

  const handleBuy = async () => {
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8000/api/stocks/buy', { 
        email: user.email, 
        symbol, 
        quantity: parseInt(quantity) 
      });
      
      setSuccess('Stock purchased successfully!');
      setLoading(false);
      
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
              {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)} ({stockInfo.changePercent}%)
            </span>
            <strong>Current Price:</strong> ${stockInfo.currentPrice.toFixed(2)}
            <span style={{marginLeft: 'auto'}}>Volume: {stockInfo.volume.toLocaleString()}</span>
          </p>
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
        <div className="buy-stock-input-group">
          <label className="buy-stock-input-label">Quantity</label>
          <input
            className="buy-stock-input"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter number of shares"
          />
        </div>
        
        {quantity > 0 && stockInfo && (
          <div className="total-cost">
            <span>Total Cost:</span> <strong>${totalCost}</strong>
          </div>
        )}
        
        <button
          className="buy-stock-btn"
          onClick={handleBuy}
          disabled={loading || !quantity || quantity <= 0}
        >
          {loading ? 'Processing...' : 'Confirm Purchase 🛒'}
        </button>
      </div>
    </div>
  );
};

export default BuyStock;
