import React from 'react';
import './Hero.css';

const Hero = ({ onModuleChange }) => {
  const features = [
    {
      icon: '🍳',
      title: 'Recipe Generator',
      description: 'Generate delicious recipes from your available ingredients',
      action: () => onModuleChange('recipe-generator')
    },
    {
      icon: '📊',
      title: 'Ingredient Predictor',
      description: 'Predict exact ingredient quantities for any number of servings',
      action: () => onModuleChange('ingredient-predictor')
    },
    {
      icon: '💬',
      title: 'AI Chatbot',
      description: 'Get cooking tips and recipe suggestions from our AI assistant',
      action: () => {} // Chatbot will be handled separately
    }
  ];

  const stats = [
    { number: '10K+', label: 'Recipes' },
    { number: '50K+', label: 'Happy Users' },
    { number: '95%', label: 'Accuracy' },
    { number: '24/7', label: 'AI Support' }
  ];

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-pattern"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title fade-in-up">
              Smart Cooking with
              <span className="gradient-text"> CookIQ</span>
            </h1>
            <p className="hero-subtitle fade-in-up">
              Transform your ingredients into amazing recipes with AI-powered predictions 
              and personalized cooking assistance. Cook smarter, not harder.
            </p>
            <div className="hero-actions fade-in-up">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => onModuleChange('recipe-generator')}
              >
                Start Cooking 🚀
              </button>
              <button 
                className="btn btn-secondary btn-large"
                onClick={() => onModuleChange('ingredient-predictor')}
              >
                Predict Ingredients
              </button>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="hero-card">
              <div className="recipe-preview">
                <div className="recipe-header">
                  <span className="recipe-icon">🍝</span>
                  <div>
                    <h3>Pasta Carbonara</h3>
                    <p>For 4 people</p>
                  </div>
                </div>
                <div className="ingredients-list">
                  <div className="ingredient">
                    <span>🥓 Bacon</span>
                    <span>200g</span>
                  </div>
                  <div className="ingredient">
                    <span>🥚 Eggs</span>
                    <span>4 pieces</span>
                  </div>
                  <div className="ingredient">
                    <span>🧀 Parmesan</span>
                    <span>100g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item fade-in-up">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="features-section">
          <h2 className="section-title text-center mb-4">
            Everything You Need for Smart Cooking
          </h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card card fade-in-up"
                onClick={feature.action}
                style={{ cursor: feature.action ? 'pointer' : 'default' }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;