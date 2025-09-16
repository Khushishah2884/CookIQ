import React, { useState } from 'react';
import './IngredientPredictor.css';

const IngredientPredictor = ({ onRecipeGenerated }) => {
  const [searchMode, setSearchMode] = useState('dish'); // 'dish' or 'cuisine'
  const [dishName, setDishName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [servings, setServings] = useState(4);
  const [baseServings, setBaseServings] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  // GET /search?query=
  async function searchRecipes(query) {
    const res = await fetch('http://localhost:8000/search?query=' + encodeURIComponent(query) + '&limit=8');
    return res.json();
  }

  // POST /get_recipe
  async function getRecipeByName(dishName, people) {
    const res = await fetch('http://localhost:8000/get_recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: dishName, people })
    });
    return res.json();
  }

  const handleDishNameChange = async (e) => {
    const value = e.target.value;
    setDishName(value);
    if (value.length > 2) {
      try {
        const result = await searchRecipes(value);
        const suggestions = (result.results || []).map(r => r.dish_name || r.title || '');
        setSuggestions(suggestions.slice(0, 8));
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleCuisineChange = (e) => {
    setCuisine(e.target.value);
  };

  const selectSuggestion = (suggestion) => {
    setDishName(suggestion);
    setSuggestions([]);
    // Do NOT fetch or show recipe here. Let user enter servings and submit.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (searchMode === 'dish' && !dishName.trim()) return;
    if (searchMode === 'cuisine' && !cuisine.trim()) return;
    setIsLoading(true);
    try {
      let data;
      if (searchMode === 'dish') {
        data = await getRecipeByName(dishName, servings);
      } else {
        // For cuisine, you may want to implement a similar endpoint or logic
        setError('Cuisine-based prediction not implemented.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onRecipeGenerated(data);
    } catch (err) {
      setError('Server error');
      setIsLoading(false);
    }
  };

  const handleServingsChange = (e) => {
    const val = e.target.value;
    setServings(val === '' ? '' : Math.max(1, parseInt(val) || 1));
  };
  const handleBaseServingsChange = (e) => {
    const val = e.target.value;
    setBaseServings(val === '' ? '' : Math.max(1, parseInt(val) || 1));
  };

  return (
    <section className="ingredient-predictor">
      <div className="container">
        <div className="predictor-header">
          <h1 className="page-title">📊 Ingredient Predictor</h1>
          <p className="page-subtitle">
            Enter a dish name or cuisine and serving size, and our AI will predict the exact ingredient quantities you need!
          </p>
        </div>

        <div className="predictor-content">
          <div className="predictor-form-section">
            <form onSubmit={handleSubmit} className="predictor-form card">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Search Mode:</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  <label>
                    <input
                      type="radio"
                      name="searchMode"
                      value="dish"
                      checked={searchMode === 'dish'}
                      onChange={() => setSearchMode('dish')}
                    />{' '}
                    By Dish Name
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="searchMode"
                      value="cuisine"
                      checked={searchMode === 'cuisine'}
                      onChange={() => setSearchMode('cuisine')}
                    />{' '}
                    By Cuisine
                  </label>
                </div>
              </div>

              {searchMode === 'dish' ? (
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🍽️</span>
                    Dish Name
                  </label>
                  <div className="autocomplete-container">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter dish name (e.g., Pasta Carbonara, Chicken Curry...)"
                      value={dishName}
                      onChange={handleDishNameChange}
                      required={searchMode === 'dish'}
                    />
                    {suggestions.length > 0 && (
                      <div className="suggestions-dropdown">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="suggestion-item"
                            onClick={() => selectSuggestion(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🌍</span>
                    Cuisine
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter cuisine (e.g., Gujarati, Punjabi, Italian...)"
                    value={cuisine}
                    onChange={handleCuisineChange}
                    required={searchMode === 'cuisine'}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">👥</span>
                    Target Servings
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="50"
                    value={servings}
                    onChange={handleServingsChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📏</span>
                    Base Recipe Servings
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="20"
                    value={baseServings}
                    onChange={handleBaseServingsChange}
                  />
                </div>
              </div>

              <div className="scaling-info">
                <div className="scaling-factor">
                  <span className="scaling-label">Scaling Factor:</span>
                  <span className="scaling-value">
                    {baseServings > 0 ? (servings / baseServings).toFixed(2) : '1.00'}x
                  </span>
                </div>
              </div>

              {error && (
                <div style={{ color: 'red', textAlign: 'center', marginBottom: 12 }}>{error}</div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-large w-full"
                disabled={isLoading || (searchMode === 'dish' ? !dishName.trim() : !cuisine.trim())}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Predicting Ingredients...
                  </>
                ) : (
                  <>
                    Predict Ingredients 🔮
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="predictor-info-section">
            <div className="ml-info card">
              <h3>🤖 AI-Powered Predictions</h3>
              <div className="ml-stats">
                <div className="ml-stat">
                  <div className="stat-value">95%</div>
                  <div className="stat-label">Accuracy</div>
                </div>
                <div className="ml-stat">
                  <div className="stat-value">10K+</div>
                  <div className="stat-label">Recipes Trained</div>
                </div>
                <div className="ml-stat">
                  <div className="stat-value">50+</div>
                  <div className="stat-label">Cuisines</div>
                </div>
              </div>
              <p>Our machine learning model has been trained on thousands of recipes to provide accurate ingredient predictions.</p>
            </div>

            <div className="features-info card">
              <h3>✨ Smart Features</h3>
              <ul className="features-list">
                <li>
                  <span className="feature-icon">🎯</span>
                  <div>
                    <strong>Precise Scaling</strong>
                    <p>Intelligent scaling that considers ingredient behavior</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">📈</span>
                  <div>
                    <strong>Confidence Scores</strong>
                    <p>See how confident our AI is about each prediction</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">🔄</span>
                  <div>
                    <strong>Continuous Learning</strong>
                    <p>Model improves with user feedback and ratings</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="popular-dishes card">
              <h3>🔥 Popular Dishes</h3>
              <div className="dishes-grid">
                {suggestions.slice(0, 6).map((dish, index) => (
                  <button
                    key={index}
                    className="dish-tag"
                    onClick={() => setDishName(dish)}
                  >
                    {dish}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IngredientPredictor;