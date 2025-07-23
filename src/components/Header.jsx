import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ onModuleChange, activeModule }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'recipe-generator', label: 'Recipe Generator', icon: '🍳' },
    { id: 'ingredient-predictor', label: 'Ingredient Predictor', icon: '📊' }
  ];
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo" onClick={() => onModuleChange('home')}>
            <span className="logo-icon">👨‍🍳</span>
            <span className="logo-text">CookIQ</span>
          </div>
          
          <nav className="nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
                onClick={() => onModuleChange(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;