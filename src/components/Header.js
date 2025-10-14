﻿/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/dashboard">
              <img 
                src="/images/planet-fitness-logo.png" 
                alt="Fitness Planet" 
                className="logo-img"
              />
              <span className="logo-text">Fitness Planet</span>
            </Link>
          </div>

          <nav className={menuOpen ? 'nav open' : 'nav'}>
            <ul className="nav-list">
              <li className="nav-item">
                <Link 
                  to="/dashboard" 
                  className="av-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/workouts" 
                  className="av-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Workouts
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/voeding" 
                  className="av-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Voeding
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/recepten" 
                  className="av-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Recepten
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/maaltijdplan" 
                  className="av-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Maaltijdplan
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/voortgang" 
                  className="av-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Voortgang
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/profiel" 
                  className="av-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Profiel
                </Link>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            {user && (
              <div className="user-menu">
                <span className="user-name">Welkom, {user.name || user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="btn btn-secondary logout-btn"
                >
                  Uitloggen
                </button>
              </div>
            )}
            
            <button 
              className="menu-toggle"
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
