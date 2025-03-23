import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-logo">
          InvestGuru
        </Link>
      </div>
      <button className="navbar-menu-btn" onClick={toggleMenu}>
        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>
      <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/stocks" className={`nav-link ${location.pathname === '/stocks' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          Stocks
        </Link>
        <Link to="/portfolio" className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          Portfolio
        </Link>
        <Link to="/recommendations" className={`nav-link ${location.pathname === '/recommendations' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          Recommendations
        </Link>
        <Link to="/insurance" className={`nav-link ${location.pathname === '/insurance' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          Insurance
        </Link>
        <Link to="/auto-trading" className={`nav-link ${location.pathname === '/auto-trading' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          Auto Trading
        </Link>
        <Link to="/learning" className={`nav-link ${location.pathname === '/learning' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          Learning
        </Link>
      </div>
      <div className="navbar-auth">
        <Link to="/profile" className="profile-link">
          <i className="fas fa-user"></i>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar; 