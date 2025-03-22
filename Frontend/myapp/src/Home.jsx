import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './App.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import stocks from "./stocks.png";
import bonds from "./bonds.png";
import insurance from "./insurance.png";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingCredits, setIsEditingCredits] = useState(false);
  const [newCredits, setNewCredits] = useState('');

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpdateCredits = async () => {
    try {
      const credits = parseFloat(newCredits);
      if (isNaN(credits) || credits <= 0) {
        setError('Please enter a valid positive number');
        return;
      }

      const amountInPaise = Math.round(credits * 100);
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setError("Failed to load Razorpay SDK. Please try again.");
        return;
      }

      const options = {
        key: 'rzp_test_2BZTggwTEwm8GC',
        amount: amountInPaise,
        currency: 'INR',
        name: 'InvestDelta',
        description: 'Add Credits',
        handler: async function (response) {
          try {
            await axios.post('http://localhost:8000/api/users/update-credits', {
              email: user.email,
              credits,
            });

            const response = await axios.get(`http://localhost:8000/api/stocks/user-stats/${user.email}`);
            setUserStats(response.data);
            setIsEditingCredits(false);
            setNewCredits('');
            setError('');
          } catch (err) {
            setError('Failed to update credits. Please contact support.');
          }
        },
        prefill: {
          name: user.name || "User",
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update credits');
    }
  };

  return (
    <>
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-container">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Invest Smart, Grow Wealth</h1>
          <p>Maximize your returns with data-driven insights and secure investments.</p>
          <button className="cta-button">Get Started</button>
        </div>
      </div>

      {/* User Statistics Section */}
      <div className="user-stats-container">
        <h2>Track Your Financial Growth</h2>
        {loading ? (
          <div className="loading-spinner">Loading statistics...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : userStats ? (
          <div className="stats-grid">
            <div
              className="stat-card"
              onClick={() => setIsEditingCredits(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon">💰</div>
              {isEditingCredits ? (
                <div className="stat-edit">
                  <input
                    type="number"
                    value={newCredits}
                    onChange={(e) => setNewCredits(e.target.value)}
                    placeholder="Enter amount in INR"
                    min="1"
                    step="0.01"
                    autoFocus
                  />
                  <div className="stat-edit-buttons">
                    <button onClick={handleUpdateCredits}>Add Credits</button>
                    <button
                      onClick={() => {
                        setIsEditingCredits(false);
                        setNewCredits('');
                        setError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  {error && <div className="error-message">{error}</div>}
                </div>
              ) : (
                <>
                  <div className="stat-value">₹{userStats.currentCredits.toFixed(2)}</div>
                  <div className="stat-label">Available Credits (Click to Add)</div>
                </>
              )}
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-value">{userStats.totalPurchased}</div>
              <div className="stat-label">Stocks Purchased</div>
            </div>

            <div className="stat-card" onClick={() => navigate('/portfolio')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">📊</div>
              <div className="stat-value">{userStats.currentHoldings}</div>
              <div className="stat-label">Current Holdings</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💼</div>
              <div className="stat-value">₹{userStats.portfolioValue.toFixed(2)}</div>
              <div className="stat-label">Portfolio Value</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💎</div>
              <div className="stat-value">₹{userStats.netWorth.toFixed(2)}</div>
              <div className="stat-label">Net Worth</div>
            </div>
          </div>
        ) : (
          <p>No statistics available</p>
        )}
      </div>

      {/* Let's Start Investing Section */}
      <div className="dashboard-content-start">
  <h2>Begin Your Investment Journey</h2>
  <div className="start-investing-grid">
    {/* Stocks Card */}
    <div className="dashboard-card-start stocks-card">
      <img src={stocks} alt="Stocks" className="card-icon" />
      <h3>Stocks</h3>
      <p>Dive into the stock market and grow your wealth with data-driven insights.</p>
      <Link to="/stocks">
        <button className="dashboard-btn">Explore Stocks</button>
      </Link>
    </div>

    {/* Bonds Card */}
    <div className="dashboard-card-start bonds-card">
      <img src={bonds} alt="Bonds" className="card-icon" />
      <h3>Bonds</h3>
      <p>Secure your investments with low-risk government and corporate bonds.</p>
      <Link to="/bonds">
        <button className="dashboard-btn">Explore Bonds</button>
      </Link>
    </div>

    {/* Insurance Card */}
    <div className="dashboard-card-start insurance-card">
      <img src={insurance} alt="Insurance" className="card-icon" />
      <h3>Insurance</h3>
      <p>Protect your future with tailored insurance policies.</p>
      <Link to="/insurance">
        <button className="dashboard-btn">Explore Insurance</button>
      </Link>
    </div>
  </div>
</div>

      {/* Other Dashboard Cards */}
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Your Portfolio</h3>
          <p>Check your purchased stocks and track your investments.</p>
          <Link to="/portfolio">
            <button className="dashboard-btn">View Portfolio</button>
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Profit Estimation</h3>
          <p>View projected returns and analytics for your investments.</p>
          <Link to="/profit-estimation">
            <button className="dashboard-btn">View Projections</button>
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Stock Recommendations</h3>
          <p>Discover the most profitable stocks tailored for you.</p>
          <Link to="/recommendations">
            <button className="dashboard-btn">Check Now!</button>
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Learning Module</h3>
          <p>Learn about investing and trading with our comprehensive guides.</p>
          <Link to="/learning">
            <button className="dashboard-btn">Start Learning</button>
          </Link>
        </div>

   
      </div>
    </div>

<footer className="footer">
<div className="footer-content">
  {/* Quick Links Section */}
  <div className="footer-section">
    <h4>Quick Links</h4>
    <ul>
      <li><a href="/about">About Us</a></li>
      <li><a href="/services">Services</a></li>
      <li><a href="/contact">Contact</a></li>
      <li><a href="/privacy-policy">Privacy Policy</a></li>
    </ul>
  </div>

  {/* Social Media Section */}
  <div className="footer-section">
    <h4>Follow Us</h4>
    <div className="social-icons">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-facebook"></i>
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-twitter"></i>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-instagram"></i>
      </a>
      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-linkedin"></i>
      </a>
    </div>
  </div>

  {/* Newsletter Section */}
  <div className="footer-section">
    <h4>Newsletter</h4>
    <p>Subscribe to our newsletter for the latest updates.</p>
    <form className="newsletter-form">
      <input type="email" placeholder="Enter your email" required />
      <button type="submit">Subscribe</button>
    </form>
  </div>
</div>

{/* Copyright Section */}
<div className="footer-bottom">
  <p>&copy; {new Date().getFullYear()} InvestGuru. All rights reserved.</p>
</div>
</footer>
</>
  );
};

export default Home;