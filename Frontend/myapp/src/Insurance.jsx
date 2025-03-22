import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Insurance.css';

const Insurance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insurance, setInsurance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [userCredits, setUserCredits] = useState(0);

  const fetchInsurance = async (type = 'all') => {
    try {
      setLoading(true);
      const response = await axios.get(
        type === 'all'
          ? 'http://localhost:8000/api/insurance'
          : `http://localhost:8000/api/insurance/type/${type}`
      );
      setInsurance(response.data);

      const userStatsResponse = await axios.get(`http://localhost:8000/api/stocks/user-stats/${user.email}`);
      setUserCredits(userStatsResponse.data.currentCredits);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching insurance:', err);
      setError('Failed to load insurance data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurance(selectedType);
  }, [selectedType, user?.email]);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleBuyClick = (insuranceId) => {
    navigate(`/buy-insurance/${insuranceId}`);
  };

  return (
    <div className="insurance-container">
      <header className="insurance-header">
        <h1>Insurance Products</h1>
        <p>Secure your future with our tailored insurance plans.</p>
        <div className="user-credits">
          Available Credits: ${userCredits.toFixed(2)}
        </div>
      </header>

      {loading ? (
        <div className="loading-spinner">Loading insurance data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="insurance-filters">
            <h3>Filter Insurance</h3>
            <select
              className="filter-select"
              value={selectedType}
              onChange={handleTypeChange}
            >
              <option value="all">All Types</option>
              <option value="life">Life Insurance</option>
              <option value="health">Health Insurance</option>
              <option value="property">Property Insurance</option>
            </select>
          </div>

          <div className="insurance-list">
            {insurance.length === 0 ? (
              <div className="no-insurance-message">
                <p>No insurance products match your selected filters.</p>
              </div>
            ) : (
              insurance.map((product) => (
                <div key={product.id} className="insurance-card">
                  <div className="insurance-card-header">
                    <h3>{product.name}</h3>
                    <span className={`insurance-type ${product.type.toLowerCase()}`}>
                      {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                    </span>
                  </div>
                  <div className="insurance-card-details">
                    <div className="detail-item">
                      <span>Provider</span>
                      <strong>{product.provider}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Rating</span>
                      <strong>{product.rating}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Coverage</span>
                      <strong>${product.coverageAmount.toLocaleString()}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Monthly Premium</span>
                      <strong>${product.monthlyPremium.toLocaleString()}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Term</span>
                      <strong>{product.term === 'Lifetime' ? 'Lifetime' : `${product.term} year(s)`}</strong>
                    </div>
                  </div>
                  <div className="features-list">
                    <h4>Features & Benefits</h4>
                    <ul>
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className="buy-btn"
                    onClick={() => handleBuyClick(product.id)}
                    disabled={userCredits < product.monthlyPremium}
                  >
                    {userCredits < product.monthlyPremium ? 'Insufficient Credits' : 'Purchase Now'}
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Insurance;