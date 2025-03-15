import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './StockRecommendations.css';

const StockRecommendations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/recommendations/all');
        setRecommendations(response.data.recommendations);
        
        // Extract sectors from the response
        if (response.data.recommendations.sectors && 
            response.data.recommendations.sectors.availableSectors) {
          setSectors(response.data.recommendations.sectors.availableSectors);
        }
        
        // Also fetch portfolio recommendations if user is logged in
        if (user && user.email) {
          try {
            const portfolioResponse = await axios.get(`http://localhost:8000/api/recommendations/portfolio/${user.email}`);
            
            // Update recommendations with portfolio data
            setRecommendations(prev => ({
              ...prev,
              portfolio: {
                ...prev.portfolio,
                detailedRecommendations: portfolioResponse.data.recommendations,
                portfolioSectors: portfolioResponse.data.portfolioSectors,
                portfolioIndustries: portfolioResponse.data.portfolioIndustries
              }
            }));
          } catch (portfolioErr) {
            console.log('Portfolio recommendations info:', {
              status: portfolioErr.response?.status,
              message: portfolioErr.response?.data?.message,
              suggestion: portfolioErr.response?.data?.suggestion
            });
            // Don't set an error for the whole page if just portfolio recommendations fail
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  const fetchSpecificRecommendation = async (type, param = null) => {
    try {
      setLoading(true);
      let url = `http://localhost:8000/api/recommendations/${type}`;
      
      if (param) {
        url += `/${param}`;
      }
      
      console.log(`Fetching recommendations from: ${url}`);
      const response = await axios.get(url);
      console.log(`Response received for ${type}:`, response.data);
      
      // Create a temporary object with the current recommendations
      const updatedRecommendations = { ...recommendations };
      
      // Update only the specific recommendation type
      updatedRecommendations[type] = {
        ...updatedRecommendations[type],
        detailedRecommendations: response.data.recommendations
      };
      
      // For portfolio recommendations, also store sectors and industries
      if (type === 'portfolio' && response.data.portfolioSectors) {
        updatedRecommendations[type].portfolioSectors = response.data.portfolioSectors;
        updatedRecommendations[type].portfolioIndustries = response.data.portfolioIndustries;
      }
      
      setRecommendations(updatedRecommendations);
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching ${type} recommendations:`, {
        status: err.response?.status,
        message: err.response?.data?.message,
        suggestion: err.response?.data?.suggestion
      });
      
      // Special handling for portfolio recommendations
      if (type === 'portfolio' && err.response?.status === 404) {
        // Create a temporary object with the current recommendations
        const updatedRecommendations = { ...recommendations };
        
        // Set an empty array for portfolio recommendations with a message
        updatedRecommendations[type] = {
          ...updatedRecommendations[type],
          detailedRecommendations: [],
          noPortfolioMessage: err.response.data.message,
          suggestion: err.response.data.suggestion
        };
        
        setRecommendations(updatedRecommendations);
        setLoading(false);
        // Don't set an error for the whole page
        return;
      }
      
      setError(`Failed to load ${type} recommendations. ${err.response?.data?.message || 'Please try again later.'}`);
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch detailed recommendations based on the selected tab
    switch (tab) {
      case 'trending':
        fetchSpecificRecommendation('trending');
        break;
      case 'undervalued':
        fetchSpecificRecommendation('undervalued');
        break;
      case 'highVolume':
        fetchSpecificRecommendation('high-volume');
        break;
      case 'portfolio':
        if (user && user.email) {
          fetchSpecificRecommendation('portfolio', user.email);
        } else {
          setError('You must be logged in to view portfolio recommendations');
        }
        break;
      default:
        // For sector tabs or 'all', no need to fetch additional data
        break;
    }
  };

  const handleSectorSelect = (sector) => {
    setActiveTab(`sector-${sector}`);
    fetchSpecificRecommendation('sector', sector);
  };

  const handleBack = () => navigate('/home');
  
  const handleStockClick = (symbol) => navigate(`/stock/${symbol}`);

  const formatPrice = (price) => {
    return price ? `$${parseFloat(price).toFixed(2)}` : 'N/A';
  };

  const formatChange = (change, changePercent) => {
    if (change === undefined || change === null) return 'N/A';
    
    const formattedChange = parseFloat(change).toFixed(2);
    const formattedPercent = parseFloat(changePercent).toFixed(2);
    
    return (
      <span className={change >= 0 ? 'positive-change' : 'negative-change'}>
        {change >= 0 ? '+' : ''}{formattedChange} ({formattedPercent}%)
      </span>
    );
  };

  const formatVolume = (volume) => {
    if (!volume) return 'N/A';
    
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    
    return volume.toString();
  };

  const renderTrendingStocks = () => {
    const trendingStocks = recommendations.trending?.detailedRecommendations || 
                          recommendations.trending?.stocks || [];
    
    if (trendingStocks.length === 0) {
      return <p>No trending stocks available</p>;
    }
    
    return (
      <div className="recommendation-section">
        <h3>Trending Stocks</h3>
        <p className="section-description">Stocks with the highest recent price increase</p>
        
        <div className="stock-cards">
          {trendingStocks.map((stock) => (
            <div 
              key={stock.symbol} 
              className="stock-card" 
              onClick={() => handleStockClick(stock.symbol)}
            >
              <div className="stock-header">
                <h4>{stock.symbol}</h4>
                <span>{stock.name}</span>
              </div>
              <div className="stock-price">{formatPrice(stock.price)}</div>
              <div className="stock-change">
                {formatChange(stock.change, stock.changePercent)}
              </div>
              {stock.reason && (
                <div className="stock-reason">{stock.reason}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUndervaluedStocks = () => {
    const undervaluedStocks = recommendations.undervalued?.detailedRecommendations || [];
    
    if (undervaluedStocks.length === 0) {
      return <p>No undervalued stocks available</p>;
    }
    
    return (
      <div className="recommendation-section">
        <h3>Undervalued Stocks</h3>
        <p className="section-description">Stocks that may be trading below their intrinsic value</p>
        
        <div className="stock-cards">
          {undervaluedStocks.map((stock) => (
            <div 
              key={stock.symbol} 
              className="stock-card" 
              onClick={() => handleStockClick(stock.symbol)}
            >
              <div className="stock-header">
                <h4>{stock.symbol}</h4>
                <span>{stock.name}</span>
              </div>
              <div className="stock-price">{formatPrice(stock.price)}</div>
              <div className="stock-change">
                {formatChange(stock.change, stock.changePercent)}
              </div>
              <div className="stock-metrics">
                <div>P/E: {stock.peRatio ? stock.peRatio.toFixed(2) : 'N/A'}</div>
                <div>Price/Book: {stock.priceToBook ? stock.priceToBook.toFixed(2) : 'N/A'}</div>
                <div>Below 52W High: {stock.percentBelow52WeekHigh ? `${stock.percentBelow52WeekHigh.toFixed(2)}%` : 'N/A'}</div>
              </div>
              {stock.reason && (
                <div className="stock-reason">{stock.reason}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHighVolumeStocks = () => {
    const highVolumeStocks = recommendations.highVolume?.detailedRecommendations || 
                            recommendations.highVolume?.stocks || [];
    
    if (highVolumeStocks.length === 0) {
      return <p>No high volume stocks available</p>;
    }
    
    return (
      <div className="recommendation-section">
        <h3>High Trading Volume Stocks</h3>
        <p className="section-description">Stocks with increasing trading volume, indicating strong market interest</p>
        
        <div className="stock-cards">
          {highVolumeStocks.map((stock) => (
            <div 
              key={stock.symbol} 
              className="stock-card" 
              onClick={() => handleStockClick(stock.symbol)}
            >
              <div className="stock-header">
                <h4>{stock.symbol}</h4>
                <span>{stock.name}</span>
              </div>
              <div className="stock-price">{formatPrice(stock.price)}</div>
              {stock.change !== undefined && (
                <div className="stock-change">
                  {formatChange(stock.change, stock.changePercent)}
                </div>
              )}
              <div className="stock-volume">
                <div>Volume: {formatVolume(stock.volume)}</div>
                {stock.avgVolume && (
                  <div>Avg Volume: {formatVolume(stock.avgVolume)}</div>
                )}
                {stock.volumeRatio && (
                  <div>Volume Ratio: {stock.volumeRatio.toFixed(2)}x</div>
                )}
              </div>
              {stock.reason && (
                <div className="stock-reason">{stock.reason}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPortfolioBasedStocks = () => {
    const portfolioStocks = recommendations.portfolio?.detailedRecommendations || [];
    const noPortfolioMessage = recommendations.portfolio?.noPortfolioMessage;
    const suggestion = recommendations.portfolio?.suggestion;
    
    if (!user || !user.email) {
      return (
        <div className="recommendation-section">
          <h3>Portfolio-Based Recommendations</h3>
          <p className="login-prompt">Please log in to view personalized recommendations based on your portfolio.</p>
        </div>
      );
    }
    
    if (portfolioStocks.length === 0) {
      return (
        <div className="recommendation-section">
          <h3>Portfolio-Based Recommendations</h3>
          <div className="empty-portfolio-message">
            <p>{noPortfolioMessage || 'No recommendations available based on your portfolio.'}</p>
            {suggestion && <p className="suggestion">{suggestion}</p>}
            <div className="portfolio-action">
              <p>To get personalized recommendations:</p>
              <ol>
                <li>Go to the <Link to="/stocks">Stocks page</Link></li>
                <li>Find stocks you're interested in</li>
                <li>Click "Buy" to add them to your portfolio</li>
              </ol>
              <button 
                className="action-button"
                onClick={() => navigate('/stocks')}
              >
                Browse Stocks
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="recommendation-section">
        <h3>Portfolio-Based Recommendations</h3>
        <p className="section-description">Stocks similar to those in your portfolio</p>
        
        {recommendations.portfolio.portfolioSectors && (
          <div className="portfolio-info">
            <div>
              <strong>Your Portfolio Sectors:</strong> {recommendations.portfolio.portfolioSectors.join(', ')}
            </div>
            <div>
              <strong>Your Portfolio Industries:</strong> {recommendations.portfolio.portfolioIndustries.join(', ')}
            </div>
          </div>
        )}
        
        <div className="stock-cards">
          {portfolioStocks.map((stock) => (
            <div 
              key={stock.symbol} 
              className="stock-card" 
              onClick={() => handleStockClick(stock.symbol)}
            >
              <div className="stock-header">
                <h4>{stock.symbol}</h4>
                <span>{stock.name}</span>
              </div>
              <div className="stock-price">{formatPrice(stock.price)}</div>
              <div className="stock-change">
                {formatChange(stock.change, stock.changePercent)}
              </div>
              <div className="stock-sector">
                <div>Sector: {stock.sector || 'N/A'}</div>
                <div>Industry: {stock.industry || 'N/A'}</div>
              </div>
              {stock.reason && (
                <div className="stock-reason">{stock.reason}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectorStocks = (sector) => {
    const sectorKey = `sector-${sector}`;
    const sectorStocks = recommendations[sectorKey]?.detailedRecommendations || [];
    
    if (sectorStocks.length === 0) {
      return (
        <div className="recommendation-section">
          <h3>{sector} Sector Stocks</h3>
          <p>No stocks available for this sector</p>
        </div>
      );
    }
    
    return (
      <div className="recommendation-section">
        <h3>{sector} Sector Stocks</h3>
        <p className="section-description">Top performing stocks in the {sector} sector</p>
        
        <div className="stock-cards">
          {sectorStocks.map((stock) => (
            <div 
              key={stock.symbol} 
              className="stock-card" 
              onClick={() => handleStockClick(stock.symbol)}
            >
              <div className="stock-header">
                <h4>{stock.symbol}</h4>
                <span>{stock.name}</span>
              </div>
              <div className="stock-price">{formatPrice(stock.price)}</div>
              <div className="stock-change">
                {formatChange(stock.change, stock.changePercent)}
              </div>
              <div className="stock-sector">
                <div>Industry: {stock.industry || 'N/A'}</div>
              </div>
              {stock.reason && (
                <div className="stock-reason">{stock.reason}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAllRecommendations = () => {
    return (
      <>
        {renderTrendingStocks()}
        {renderHighVolumeStocks()}
        
        <div className="recommendation-section">
          <h3>Sector-Based Recommendations</h3>
          <p className="section-description">Explore stocks by sector</p>
          
          <div className="sector-buttons">
            {sectors.map((sector) => (
              <button 
                key={sector}
                className="sector-button"
                onClick={() => handleSectorSelect(sector)}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>
        
        <div className="recommendation-section">
          <h3>More Recommendation Strategies</h3>
          <div className="strategy-cards">
            <div className="strategy-card" onClick={() => handleTabChange('undervalued')}>
              <h4>Undervalued Stocks</h4>
              <p>Stocks that may be trading below their intrinsic value</p>
            </div>
            
            <div className="strategy-card" onClick={() => handleTabChange('portfolio')}>
              <h4>Portfolio-Based</h4>
              <p>Recommendations based on your current portfolio</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="recommendations-container">
      <header className="recommendations-header">
        <button className="back-button" onClick={handleBack}>
          ← Back to Dashboard
        </button>
        <h1>Stock Recommendations</h1>
      </header>
      
      <div className="recommendations-tabs">
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          All Recommendations
        </button>
        <button 
          className={`tab-button ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => handleTabChange('trending')}
        >
          Trending
        </button>
        <button 
          className={`tab-button ${activeTab === 'undervalued' ? 'active' : ''}`}
          onClick={() => handleTabChange('undervalued')}
        >
          Undervalued
        </button>
        <button 
          className={`tab-button ${activeTab === 'highVolume' ? 'active' : ''}`}
          onClick={() => handleTabChange('highVolume')}
        >
          High Volume
        </button>
        <button 
          className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => handleTabChange('portfolio')}
        >
          Portfolio-Based
        </button>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading recommendations...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="recommendations-content">
          {activeTab === 'all' && renderAllRecommendations()}
          {activeTab === 'trending' && renderTrendingStocks()}
          {activeTab === 'undervalued' && renderUndervaluedStocks()}
          {activeTab === 'highVolume' && renderHighVolumeStocks()}
          {activeTab === 'portfolio' && renderPortfolioBasedStocks()}
          {activeTab.startsWith('sector-') && renderSectorStocks(activeTab.replace('sector-', ''))}
        </div>
      )}
    </div>
  );
};

export default StockRecommendations; 