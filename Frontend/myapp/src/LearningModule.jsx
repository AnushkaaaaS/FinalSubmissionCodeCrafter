import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LearningModule.css';

const LearningModule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeVideo, setActiveVideo] = useState(0);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' or 'documents'
  const [completedVideos, setCompletedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Video data with titles, descriptions, and YouTube embed URLs
  const videos = [
    {
      id: 1,
      title: "Stock Market for Beginners",
      description: "A comprehensive guide to understanding the stock market basics for beginners.",
      embedUrl: "https://www.youtube.com/embed/MXDtgPjJ2rA",
      thumbnail: "https://img.youtube.com/vi/MXDtgPjJ2rA/hqdefault.jpg"
    },
    {
      id: 2,
      title: "How to Invest in Stocks",
      description: "Learn the fundamentals of investing in stocks and building a portfolio.",
      embedUrl: "https://www.youtube.com/embed/8EDwgRmnJr8",
      thumbnail: "https://img.youtube.com/vi/8EDwgRmnJr8/hqdefault.jpg"
    },
    {
      id: 3,
      title: "Understanding Stock Analysis",
      description: "Discover methods for analyzing stocks and making informed investment decisions.",
      embedUrl: "https://www.youtube.com/embed/Ay4fmZdZqJE",
      thumbnail: "https://img.youtube.com/vi/Ay4fmZdZqJE/hqdefault.jpg"
    },
    {
      id: 4,
      title: "Investment Strategies for Beginners",
      description: "Learn effective investment strategies that can help beginners build wealth over time.",
      embedUrl: "https://www.youtube.com/embed/i5OZQQWj5-I",
      thumbnail: "https://img.youtube.com/vi/i5OZQQWj5-I/hqdefault.jpg"
    },
    {
      id: 5,
      title: "Understanding Market Trends",
      description: "Discover how to identify and analyze market trends to make better investment decisions.",
      embedUrl: "https://www.youtube.com/embed/p7HKvqRI_Bo",
      thumbnail: "https://img.youtube.com/vi/p7HKvqRI_Bo/hqdefault.jpg"
    },
    {
      id: 6,
      title: "Risk Management in Investing",
      description: "Learn essential risk management techniques to protect your investment portfolio.",
      embedUrl: "https://www.youtube.com/embed/nMLVn_n1hb8",
      thumbnail: "https://img.youtube.com/vi/nMLVn_n1hb8/hqdefault.jpg"
    },
    {
      id: 7,
      title: "Fundamental Analysis Explained",
      description: "A detailed explanation of fundamental analysis and how to apply it to stock evaluation.",
      embedUrl: "https://www.youtube.com/embed/U0nPlZmFy9c",
      thumbnail: "https://img.youtube.com/vi/U0nPlZmFy9c/hqdefault.jpg"
    },
    {
      id: 8,
      title: "Technical Analysis for Investors",
      description: "Learn how to use technical analysis tools and charts to improve your trading decisions.",
      embedUrl: "https://www.youtube.com/embed/hxDrKQf8vWE",
      thumbnail: "https://img.youtube.com/vi/hxDrKQf8vWE/hqdefault.jpg"
    }
  ];

  // Document data with titles, descriptions, and links
  const documents = [
    {
      id: 1,
      title: "Guide to Investing in Small Enterprises",
      description: "A comprehensive guide from the International Labour Organization on investing in small enterprises.",
      link: "https://www.ilo.org/sites/default/files/wcmsp5/groups/public/@ed_emp/@emp_ent/documents/publication/wcms_116165.pdf",
      icon: "📑"
    },
    {
      id: 2,
      title: "Financial Education Booklet",
      description: "Educational resource from SEBI (Securities and Exchange Board of India) covering financial literacy and investment basics.",
      link: "https://investor.sebi.gov.in/pdf/downloadable-documents/Financial%20Education%20Booklet%20-%20English.pdf",
      icon: "📘"
    }
  ];

  // Load completed videos from localStorage on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(`learning-progress-${user?.email}`);
    if (savedProgress) {
      try {
        setCompletedVideos(JSON.parse(savedProgress));
      } catch (err) {
        console.error('Error parsing saved progress:', err);
        setCompletedVideos([]);
      }
    }
  }, [user?.email]);

  // Save completed videos to localStorage when it changes
  useEffect(() => {
    if (user?.email && completedVideos.length > 0) {
      localStorage.setItem(`learning-progress-${user?.email}`, JSON.stringify(completedVideos));
    }
  }, [completedVideos, user?.email]);

  // Fetch personalized recommendations based on user's portfolio
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock recommendations based on learning progress
      const mockRecommendations = [
        {
          id: 1,
          title: "Diversification Strategies",
          description: "Learn how to diversify your portfolio to minimize risk and maximize returns.",
          type: "video",
          relevance: "high"
        },
        {
          id: 2,
          title: "Value Investing Principles",
          description: "Understand the core principles of value investing as practiced by Warren Buffett.",
          type: "article",
          relevance: "medium"
        },
        {
          id: 3,
          title: "ETFs vs. Individual Stocks",
          description: "Compare the benefits and drawbacks of investing in ETFs versus individual stocks.",
          type: "guide",
          relevance: "high"
        }
      ];
      
      setRecommendations(mockRecommendations);
      setShowRecommendations(true);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again later.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleVideoSelect = (index) => {
    setActiveVideo(index);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMarkAsCompleted = (videoId) => {
    if (!completedVideos.includes(videoId)) {
      setCompletedVideos([...completedVideos, videoId]);
    }
  };

  const handleRemoveCompleted = (videoId) => {
    setCompletedVideos(completedVideos.filter(id => id !== videoId));
  };

  const calculateProgress = () => {
    return Math.round((completedVideos.length / videos.length) * 100);
  };

  const handleRetryRecommendations = () => {
    setError(null);
    fetchRecommendations();
  };

  return (
    <div className="learning-container">
      <div className="learning-header">
        <button className="btn btn-outline-light" onClick={handleBack}>
          ← Back to Dashboard
        </button>
        <h2>Investment Learning Center</h2>
      </div>

      {/* Progress Bar */}
      <div className="learning-progress">
        <div className="progress-info">
          <span>Your Learning Progress</span>
          <span>{calculateProgress()}% Complete</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      <div className="learning-tabs">
        <button 
          className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => handleTabChange('videos')}
        >
          <i className="bi bi-play-circle"></i> Video Tutorials
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => handleTabChange('documents')}
        >
          <i className="bi bi-file-earmark-text"></i> Documentation
        </button>
      </div>

      {activeTab === 'videos' ? (
        <div className="learning-content">
          <div className="video-player-container">
            <div className="video-player">
              <iframe
                src={videos[activeVideo].embedUrl}
                title={videos[activeVideo].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-info">
              <h3>{videos[activeVideo].title}</h3>
              <p>{videos[activeVideo].description}</p>
              <div className="video-actions">
                {completedVideos.includes(videos[activeVideo].id) ? (
                  <button 
                    className="btn-completed"
                    onClick={() => handleRemoveCompleted(videos[activeVideo].id)}
                  >
                    <i className="bi bi-check-circle-fill"></i> Completed
                  </button>
                ) : (
                  <button 
                    className="btn-mark-complete"
                    onClick={() => handleMarkAsCompleted(videos[activeVideo].id)}
                  >
                    <i className="bi bi-check-circle"></i> Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="video-playlist">
            <h3>Learning Playlist</h3>
            <div className="playlist-items">
              {videos.map((video, index) => (
                <div 
                  key={video.id} 
                  className={`playlist-item ${index === activeVideo ? 'active' : ''} ${completedVideos.includes(video.id) ? 'completed' : ''}`}
                  onClick={() => handleVideoSelect(index)}
                >
                  <div className="playlist-thumbnail">
                    <img src={video.thumbnail} alt={video.title} />
                    {index === activeVideo && <div className="now-playing">Now Playing</div>}
                    {completedVideos.includes(video.id) && <div className="completed-badge"><i className="bi bi-check-circle-fill"></i></div>}
                  </div>
                  <div className="playlist-info">
                    <h4>{video.title}</h4>
                    <p>{video.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="documents-container">
          <h3>Investment Documentation</h3>
          <p className="documents-intro">
            Access comprehensive guides and educational materials to deepen your understanding of investment concepts and strategies.
          </p>
          
          <div className="documents-grid">
            {documents.map(doc => (
              <div key={doc.id} className="document-card">
                <div className="document-icon">{doc.icon}</div>
                <div className="document-info">
                  <h4>{doc.title}</h4>
                  <p>{doc.description}</p>
                  <a 
                    href={doc.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="document-link"
                  >
                    Download PDF <i className="bi bi-download"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="document-disclaimer">
            <p>
              <i className="bi bi-info-circle"></i> These documents are provided for educational purposes only. 
              Always consult with a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      )}

      {/* Personalized Recommendations Section */}
      <div className="recommendations-section">
        <div className="recommendations-header">
          <h3>Personalized Learning Recommendations</h3>
          {!showRecommendations && !loading && !error && (
            <button 
              className="btn-get-recommendations"
              onClick={fetchRecommendations}
            >
              <i className="bi bi-lightbulb"></i> Get Recommendations
            </button>
          )}
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading personalized recommendations...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <i className="bi bi-exclamation-triangle"></i>
            <p>{error}</p>
            <button 
              className="btn-retry"
              onClick={handleRetryRecommendations}
            >
              Try Again
            </button>
          </div>
        )}

        {showRecommendations && !loading && !error && (
          <div className="recommendations-grid">
            {recommendations.map(rec => (
              <div key={rec.id} className="recommendation-card">
                <div className={`recommendation-badge ${rec.relevance}`}>
                  {rec.relevance === 'high' ? 'Highly Relevant' : 'Recommended'}
                </div>
                <h4>{rec.title}</h4>
                <p>{rec.description}</p>
                <div className="recommendation-type">
                  <i className={`bi ${rec.type === 'video' ? 'bi-play-circle' : rec.type === 'article' ? 'bi-file-text' : 'bi-book'}`}></i>
                  <span>{rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="learning-resources">
        <h3>Additional Resources</h3>
        <div className="resources-grid">
          <div className="resource-card">
            <div className="resource-icon">📚</div>
            <h4>Investment Glossary</h4>
            <p>Learn key investment terms and concepts to enhance your understanding.</p>
          </div>
          <div className="resource-card">
            <div className="resource-icon">📊</div>
            <h4>Market Analysis Tools</h4>
            <p>Discover tools and techniques for analyzing market trends and stock performance.</p>
          </div>
          <div className="resource-card">
            <div className="resource-icon">💰</div>
            <h4>Risk Management</h4>
            <p>Understand how to manage investment risks and protect your portfolio.</p>
          </div>
          <div className="resource-card">
            <div className="resource-icon">🎓</div>
            <h4>Advanced Courses</h4>
            <p>Explore in-depth courses on specialized investment topics and strategies.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningModule; 