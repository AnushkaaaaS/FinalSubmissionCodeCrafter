import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Portfolio.css';

const Portfolio = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8000/api/stocks/portfolio/${user.email}`)
      .then(res => {
        setPortfolio(res.data);
        // Calculate total portfolio value
        const total = res.data.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
        setTotalValue(total);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load portfolio data');
        setLoading(false);
      });
  }, [user.email]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="portfolio-container">
      <button className="back-button" onClick={handleBack}>
        ← Back to Home
      </button>
      
      <h2 className="portfolio-header">Your Portfolio</h2>
      
      {loading ? (
        <div className="loading-spinner">Loading portfolio data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : portfolio.length === 0 ? (
        <div className="empty-portfolio">
          <p>You haven't purchased any stocks yet.</p>
          <Link to="/stocks">
            <button className="stock-buy-btn" style={{ margin: '20px auto', display: 'block' }}>
              Browse Stocks
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="portfolio-summary">
            <div className="summary-card">
              <div className="summary-label">Total Stocks</div>
              <div className="summary-value">{portfolio.length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Shares</div>
              <div className="summary-value">
                {portfolio.reduce((sum, stock) => sum + stock.quantity, 0)}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Portfolio Value</div>
              <div className="summary-value">${totalValue.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="portfolio-table-container">
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Current Price</th>
                  <th>Total Value</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map(stock => (
                  <tr key={stock.symbol}>
                    <td className="stock-symbol">{stock.symbol}</td>
                    <td className="stock-name">{stock.name}</td>
                    <td className="stock-quantity">{stock.quantity.toLocaleString()}</td>
                    <td className="stock-price">${stock.currentPrice.toFixed(2)}</td>
                    <td className="stock-value">${(stock.quantity * stock.currentPrice).toFixed(2)}</td>
                    <td>
                      <Link to={`/sell/${stock.symbol}`}>
                        <button className="sell-btn">Sell</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;
