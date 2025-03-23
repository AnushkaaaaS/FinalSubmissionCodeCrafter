import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import './App.css';

const AutoTrading = () => {
    const { user } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                console.log('Fetching status for:', user.email);
                const response = await axios.get(`http://localhost:8000/api/auto-trading/status/${user.email}`);
                console.log('Received status:', response.data);
                setIsActive(response.data.isActive);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching status:', err);
                setError('Failed to fetch automated trading status');
                setLoading(false);
            }
        };

        const fetchSignals = async () => {
            try {
                console.log('Fetching signals for:', user.email);
                const response = await axios.get(`http://localhost:8000/api/auto-trading/signals/${user.email}`);
                console.log('Received signals:', response.data);
                setSignals(response.data.signals || []);
            } catch (err) {
                console.error('Error fetching signals:', err);
                setError('Failed to fetch trading signals');
                setSignals([]);
            }
        };

        if (user?.email) {
            fetchStatus();
            fetchSignals();
            // Update signals every 5 minutes
            const interval = setInterval(fetchSignals, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user?.email]);

    const handleToggleAutoTrading = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const endpoint = isActive ? 'stop' : 'start';
            const response = await axios.post(`http://localhost:8000/api/auto-trading/${endpoint}/${user.email}`);
            
            setIsActive(!isActive);
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to toggle automated trading');
        } finally {
            setLoading(false);
        }
    };

    const getSignalColor = (signal) => {
        switch (signal.signal) {
            case 'BUY':
                return '#4caf50';
            case 'SELL':
                return '#f44336';
            default:
                return '#9e9e9e';
        }
    };

    const getSignalEmoji = (signal) => {
        switch (signal.signal) {
            case 'BUY':
                return '🟢';
            case 'SELL':
                return '🔴';
            default:
                return '⚪';
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="auto-trading-container">
            <h2>Automated Trading</h2>
            
            <div className="auto-trading-status">
                <div className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
                    {isActive ? '🟢 Active' : '🔴 Inactive'}
                </div>
                
                <button 
                    className={`toggle-button ${isActive ? 'stop' : 'start'}`}
                    onClick={handleToggleAutoTrading}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : isActive ? 'Stop Auto Trading' : 'Start Auto Trading'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="trading-info">
                <h3>Trading Strategy</h3>
                <p>
                    The automated trading system uses a mean reversion strategy:
                </p>
                <ul>
                    <li>Analyzes stock prices over a 20-day period</li>
                    <li>Identifies stocks that have deviated significantly from their mean</li>
                    <li>Buys undervalued stocks (below 2 standard deviations)</li>
                    <li>Sells overvalued stocks (above 2 standard deviations)</li>
                    <li>Only executes trades with high confidence (≥70%)</li>
                    <li>Limits position size to 10% of portfolio value</li>
                </ul>
            </div>

            <div className="signals-section">
                <h3>Current Signals</h3>
                <div className="signals-grid">
                    {signals.map(signal => (
                        <div key={signal.symbol} className="signal-card">
                            <div className="signal-header">
                                <span className="signal-emoji">{getSignalEmoji(signal)}</span>
                                <span className="signal-symbol">{signal.symbol}</span>
                            </div>
                            <div className="signal-details">
                                <div className="signal-price">
                                    Current: ${signal.currentPrice.toFixed(2)}
                                </div>
                                <div className="signal-mean">
                                    Mean: ${signal.mean.toFixed(2)}
                                </div>
                                <div className="signal-zscore">
                                    Z-Score: {signal.zScore.toFixed(2)}
                                </div>
                                <div className="signal-confidence">
                                    Confidence: {(signal.confidence * 100).toFixed(1)}%
                                </div>
                            </div>
                            <div 
                                className="signal-bar"
                                style={{
                                    backgroundColor: getSignalColor(signal),
                                    width: `${signal.confidence * 100}%`
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