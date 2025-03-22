import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; // Import user icon
import '../styles/Navbar.css';
import { useAuth } from '../AuthContext'; // Import useAuth

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth(); // Destructure logout from useAuth
  const navigate = useNavigate(); // Initialize useNavigate

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate('/'); // Redirect to the login page after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/home" className="brand-logo">
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
        <Link to="/bonds" className={`nav-link ${location.pathname === '/bonds' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          Bonds
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
        <Link to="/learning" className={`nav-link ${location.pathname === '/learning' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          Learning
        </Link>
      </div>
      <div className="navbar-auth">
        <Link to="/profile" className="profile-link">
          <FaUserCircle className="user-icon" /> {/* User icon */}
        </Link>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;