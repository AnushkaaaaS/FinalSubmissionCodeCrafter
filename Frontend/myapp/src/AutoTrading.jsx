import React, { useState, useEffect } from 'react';
import axios from './utils/axios';
import { useAuth } from './AuthContext';
import './AutoTrading.css';

const AutoTrading = () => {
    const { user } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [signals, setSignals] = useState([]);

    useEffect(() => {
        if (user?.email) {
            fetchTradingStatus();
            fetchSignals();
            // Set up polling for signals every 30 seconds
            const interval = setInterval(fetchSignals, 30000);
            return () => clearInterval(interval);
        }
    }, [user?.email]);

    const fetchTradingStatus = async () => {
        try {
            const response = await axios.get(`/api/auto-trading/status/${user.email}`);
            setIsActive(response.data.isActive);
        } catch (err) {
            setError('Failed to fetch trading status');
        }
    };

    const fetchSignals = async () => {
        try {
            const response = await axios.get(`/api/auto-trading/signals/${user.email}`);
            setSignals(response.data.signals || []);
        } catch (err) {
            setError('Failed to fetch trading signals');
            setSignals([]);
        }
    };

    const toggleAutoTrading = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const endpoint = isActive ? '/api/auto-trading/stop' : '/api/auto-trading/start';
            await axios.post(`${endpoint}/${user.email}`);
            setIsActive(!isActive);
            setSuccess(`Auto trading ${!isActive ? 'started' : 'stopped'} successfully`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to toggle auto trading');
        } finally {
            setLoading(false);
        }
    };

    const getSignalEmoji = (signal) => {
        if (signal.action === 'BUY') return '📈';
        if (signal.action === 'SELL') return '📉';
        return '➡️';
    };

    const getSignalColor = (signal) => {
        if (signal.action === 'BUY') return '#4CAF50';
        if (signal.action === 'SELL') return '#F44336';
        return '#FFC107';
    };

    if (!user?.email) {
        return <div className="error-message">Please log in to access automated trading.</div>;
    }

    return (
        <div className="auto-trading-container">
            <div className="auto-trading-header">
                <h2>Automated Trading</h2>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="auto-trading-status">
                <div className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
                    {isActive ? '🟢 Active' : '🔴 Inactive'}
                </div>
                <button
                    className={`toggle-button ${isActive ? 'stop' : 'start'}`}
                    onClick={toggleAutoTrading}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : isActive ? 'Stop Trading' : 'Start Trading'}
                </button>
            </div>

            <div className="trading-info">
                <h3>How It Works</h3>
                <p>Our automated trading system uses advanced algorithms to analyze market data and execute trades based on predefined strategies.</p>
                <ul>
                    <li>Real-time market data analysis</li>
                    <li>Risk management protocols</li>
                    <li>Automated trade execution</li>
                    <li>Portfolio optimization</li>
                    <li>24/7 market monitoring</li>
                    <li>Performance tracking</li>
                </ul>
            </div>

            <div className="signals-section">
                <h3>Current Trading Signals</h3>
                <div className="signals-grid">
                    {signals.map((signal, index) => (
                        <div key={index} className="signal-card">
                            <div className="signal-header">
                                <span className="signal-emoji">{getSignalEmoji(signal)}</span>
                                <span className="signal-symbol">{signal.symbol}</span>
                            </div>
                            <div className="signal-details">
                                <div className="signal-price">
                                    <strong>Price:</strong> ${signal.currentPrice.toFixed(2)}
                                </div>
                                <div className="signal-mean">
                                    <strong>Mean:</strong> ${signal.mean.toFixed(2)}
                                </div>
                                <div className="signal-zscore">
                                    <strong>Z-Score:</strong> {signal.zScore.toFixed(2)}
                                </div>
                                <div className="signal-confidence">
                                    <strong>Confidence:</strong> {(signal.confidence * 100).toFixed(1)}%
                                </div>
                            </div>
                            <div
                                className="signal-bar"
                                style={{
                                    width: `${signal.confidence * 100}%`,
                                    backgroundColor: getSignalColor(signal)
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AutoTrading; 