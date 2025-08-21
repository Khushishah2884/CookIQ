import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ onModuleChange, activeModule }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/' },
    { id: 'recipe-generator', label: 'Recipe Generator', icon: '🍳', path: '/recipe-generator' },
    { id: 'ingredient-predictor', label: 'Ingredient Predictor', icon: '📊', path: '/ingredient-predictor' }
  ];
  const navigate = useNavigate();
  const isSignedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo" onClick={() => { onModuleChange('home'); navigate('/'); }}>
            <span className="logo-icon">👨‍🍳</span>
            <span className="logo-text">CookIQ</span>
          </div>
          
          <nav className="nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
                onClick={() => { onModuleChange(item.id); navigate(item.path); }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="header-actions">
            {isSignedIn ? (
              <>
                <button className="btn btn-primary" onClick={() => navigate('/profile')}>Profile</button>
                <button
                  className="Btn"
                  style={{ marginLeft: 16 }}
                  onClick={handleLogout}
                  title="Log Out"
                >
                  <span className="sign">
                    <svg viewBox="0 0 24 24">
                      <path d="M16 17v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"/>
                      <polyline points="8 12 21 12"/>
                      <polyline points="18 15 21 12 18 9"/>
                    </svg>
                  </span>
                  <span className="text">Log Out</span>
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;