import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Stocks.css';

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/stocks')
      .then(res => {
        setStocks(res.data);
        setFilteredStocks(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load stocks data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStocks(stocks);
    } else {
      const filtered = stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStocks(filtered);
    }
  }, [searchTerm, stocks]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="stocks-container">
      <button className="back-button" onClick={handleBack}>
        ← Back to Home
      </button>
      
      <h2 className="stocks-header">Available Stocks</h2>
      
      <div className="stocks-controls">
        <div className="stocks-search">
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading stocks data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredStocks.length === 0 ? (
        <div className="empty-stocks">No stocks found matching your search criteria</div>
      ) : (
        <div className="stock-table-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity Available</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map(stock => (
                <tr key={stock._id}>
                  <td className="stock-symbol">{stock.symbol}</td>
                  <td className="stock-name">{stock.name}</td>
                  <td className="stock-price">${stock.price.toFixed(2)}</td>
                  <td className="stock-quantity">{stock.quantity.toLocaleString()}</td>
                  <td>
                    <Link to={`/buy/${stock.symbol}`}>
                      <button className="stock-buy-btn">Buy 🛒</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Stocks;
