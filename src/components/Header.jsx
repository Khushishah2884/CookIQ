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
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // Determine active nav item based on location or activeModule
  const getActiveNav = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/recipe-generator')) return 'recipe-generator';
    if (location.pathname.startsWith('/ingredient-predictor')) return 'ingredient-predictor';
    return activeModule;
  };
  const currentActive = getActiveNav();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo" onClick={() => { onModuleChange && onModuleChange('home'); navigate('/'); }}>
            <span className="logo-icon">👨‍🍳</span>
            <span className="logo-text">CookIQ</span>
          </div>
          
          <nav className="nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${currentActive === item.id ? 'active' : ''}`}
                onClick={() => {
                  onModuleChange && onModuleChange(item.id);
                  navigate(item.path);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
            {user ? (
              <button
                className="profile-btn"
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: 8
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 18,
                    marginRight: 8,
                    textTransform: 'uppercase'
                  }}
                >
                  {user.name ? user.name.charAt(0) : 'U'}
                </span>
                <span style={{ fontWeight: 600, color: '#333', fontSize: 16 }}>
                  {user.name}
                </span>
              </button>
            ) : (
              <Link className="btn btn-primary" to="/signup" style={{ marginLeft: 8 }}>
                Sign Up
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;