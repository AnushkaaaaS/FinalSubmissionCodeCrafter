import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './App.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/stocks/user-stats/${user.email}`);
        setUserStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to load user statistics');
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchUserStats();
    }
  }, [user?.email]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <header className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <div className="user-info">
          <span>Hello, {user?.name || user?.email || 'User'}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      {/* User Statistics Section */}
      <div className="user-stats-container">
        <h2>Your Investment Summary</h2>
        
        {loading ? (
          <div className="loading-spinner">Loading statistics...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : userStats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">${userStats.currentCredits.toFixed(2)}</div>
              <div className="stat-label">Available Credits</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-value">{userStats.totalPurchased}</div>
              <div className="stat-label">Stocks Purchased</div>
            </div>
            
            {/* <div className="stat-card">
              <div className="stat-icon">📉</div>
              <div className="stat-value">{userStats.totalSold}</div>
              <div className="stat-label">Stocks Sold</div>
            </div> */}
            
            <div className="stat-card" onClick={() => navigate('/portfolio')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">📊</div>
              <div className="stat-value">{userStats.currentHoldings}</div>
              <div className="stat-label">Current Holdings</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💼</div>
              <div className="stat-value">${userStats.portfolioValue.toFixed(2)}</div>
              <div className="stat-label">Portfolio Value</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💎</div>
              <div className="stat-value">${userStats.netWorth.toFixed(2)}</div>
              <div className="stat-label">Net Worth</div>
            </div>
          </div>
        ) : (
          <p>No statistics available</p>
        )}
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Stock Market</h3>
          <p>View all available stocks</p>
          <Link to="/stocks">
            <button className="dashboard-btn">View Stocks</button>
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Your Portfolio</h3>
          <p>Check your purchased stocks</p>
          <Link to="/portfolio">
            <button className="dashboard-btn">View Portfolio</button>
          </Link>
        </div>
        
        <div className="dashboard-card">
          <h3>Stock Recommendation</h3>
          <p>See your most profitable stocks</p>
          <button className="dashboard-btn">Check Now!</button>
        </div>
      </div>
    </div>
  );
};

export default Home; 