import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Header = ({ onModuleChange, activeModule }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home', path: '/' },
    { id: 'recipe-generator', label: 'Recipe Generator', icon: 'restaurant_menu', path: '/recipe-generator' },
    { id: 'ingredient-predictor', label: 'Ingredient Predictor', icon: 'bar_chart', path: '/ingredient-predictor' }
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // Determine active nav item based on location or activeModule
  const getActiveNav = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/recipe-generator')) return 'recipe-generator';
    if (location.pathname.startsWith('/ingredient-predictor')) return 'ingredient-predictor';
    if (location.pathname.startsWith('/profile')) return 'profile'; // <-- Add this line
    return activeModule;
  };
  const currentActive = getActiveNav();

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-margin-mobile md:px-gutter py-4 w-full max-w-container-max mx-auto shadow-sm bg-surface transition-all">
      <button
        type="button"
        className="flex items-center gap-stack-sm bg-transparent border-none cursor-pointer p-0 focus:outline-none"
        onClick={() => { onModuleChange && onModuleChange('home'); navigate('/'); }}
      >
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          restaurant
        </span>
        <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">CookIQ</span>
      </button>

      <nav className="hidden md:flex items-center gap-stack-lg">
        {navItems.map(item => (
          <button
            key={item.id}
            type="button"
            className={
              currentActive === item.id
                ? 'text-primary border-0 border-b-2 border-primary pb-1 font-bold font-label-lg text-label-lg bg-transparent focus:outline-none'
                : 'text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg bg-transparent border-none hover:bg-surface-container-low rounded-lg px-2 py-1 focus:outline-none'
            }
            onClick={() => {
              onModuleChange && onModuleChange(item.id);
              navigate(item.path);
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-stack-md">
        {user ? (
          <>
            <button
              type="button"
              className="flex items-center bg-transparent border-none cursor-pointer p-0 ml-2 focus:outline-none"
              onClick={() => navigate('/profile')}
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-on-primary font-bold text-lg mr-2 uppercase">
                {user.name ? user.name.charAt(0) : 'U'}
              </span>
              <span className="font-label-lg text-label-lg text-on-surface hidden sm:inline">
                {user.name}
              </span>
            </button>
            <button
              type="button"
              className="bg-surface-container text-on-surface font-label-lg text-label-lg px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors ml-2 focus:outline-none"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/');
                window.location.reload();
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <Link
            className="bg-primary text-on-primary font-label-lg text-label-lg px-6 py-2 rounded-xl hover:opacity-90 transition-opacity ml-2"
            to="/signup"
          >
            Sign Up
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
