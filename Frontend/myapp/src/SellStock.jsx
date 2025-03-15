import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import './App.css';

const SellStock = () => {
  const { symbol } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState('');

  const handleSell = () => {
    axios.post('http://localhost:8000/api/stocks/sell', { email: user.email, symbol, quantity })
      .then(() => {
        alert('Stock sold successfully!');
        navigate('/portfolio');
      })
      .catch(err => alert(err.response?.data?.message || "Error selling stock"));
  };

  return (
    <div className="container">
      <h2>Sell {symbol}</h2>
      <input 
        type="number" 
        placeholder="Quantity" 
        value={quantity} 
        onChange={e => setQuantity(e.target.value)} 
      />
      <button className="sell-btn" onClick={handleSell}>Confirm Sell</button>
    </div>
  );
};

export default SellStock;
