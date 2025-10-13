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
  const [savedIds, setSavedIds] = useState([]);
  const [predictedRecipe, setPredictedRecipe] = useState(null);
  const [isRecipeSaved, setIsRecipeSaved] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const cuisineOptions = [
    'Andhra Pradesh', 'Bengali', 'Bihari','East', 'Gujarati', 'Hyderabadi', 
    'Karnataka', 'Kashmiri', 'Kerala', 'Madhya Pradesh', 'Maharashtrian','Marwari','Rajasthani','Sindhi',
    'Tamil Nadu','Uttar Pradesh','Punjabi','Indian',
  ];

  // GET /search?query=
  async function searchRecipes(query) {
    const res = await fetch('http://localhost:8000/search?query=' + encodeURIComponent(query) + '&limit=8');
    const result = await res.json();
    // result.results is now [{dish_name: ...}], not full recipe objects
    return result;
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
        // result.results is [{dish_name: ...}]
        const suggestions = (result.results || []).map(r => r.dish_name || '');
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
    setSuggestions([]); // clear suggestions when cuisine changes
  };

  const selectSuggestion = (suggestion) => {
    setDishName(suggestion);
    setSuggestions([]);
    // Do NOT fetch or show recipe here. Let user enter servings and submit.
  };

  const fetchDishesByCuisine = async (cuisine, people) => {
    const res = await fetch(
      'http://localhost:8000/dishes?cuisine=' +
        encodeURIComponent(cuisine) +
        '&people=' +
        encodeURIComponent(people)
    );
    return res.json();
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
        setIsLoading(false);
        setPredictedRecipe(data); // Save for heart icon
        setIsRecipeSaved(false);  // Reset saved state
        onRecipeGenerated(data);
      } else {
        // Fetch dishes for the selected cuisine and target servings
        const result = await fetchDishesByCuisine(cuisine, servings);
        setIsLoading(false);
        onRecipeGenerated({
          type: 'dish-suggested', // <-- changed from 'cuisine-dishes'
          cuisine,
          targetServings: servings,
          dishes: result.dishes || []
        });
      }
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

  const handleSaveRecipe = async (recipe) => {
    if (!user || !token) {
      alert('Please sign in to save recipes.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/users/save-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipe })
      });
      if (res.ok) {
        setSavedIds(prev => [...prev, recipe._id || recipe.id]);
      }
    } catch {
      alert('Failed to save recipe.');
    }
  };

  // Save predicted recipe handler
  const handleSavePredictedRecipe = async () => {
    if (!user || !token || !predictedRecipe) {
      alert('Please sign in to save recipes.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/users/save-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipe: predictedRecipe })
      });
      if (res.ok) {
        setIsRecipeSaved(true);
      }
    } catch {
      alert('Failed to save recipe.');
    }
  };

  // Render results (for both options)
  const renderResults = (data) => {
    if (!data) return null;
    const recipes = data.dishes || data.recipes || [];
    return (
      <div className="results-list">
        {recipes.map((recipe, idx) => (
          <div className="recipe-card card" key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="recipe-name">{recipe.dish_name || recipe.name}</h3>
              {/* Favorite icon button */}
              <button
                className="save-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 24,
                  color: savedIds.includes(recipe._id || recipe.id) ? '#e74c3c' : '#ccc',
                  transition: 'color 0.2s'
                }}
                title={savedIds.includes(recipe._id || recipe.id) ? 'Saved' : 'Save Recipe'}
                onClick={() => handleSaveRecipe(recipe)}
                disabled={savedIds.includes(recipe._id || recipe.id)}
              >
                {savedIds.includes(recipe._id || recipe.id) ? '❤️' : '🤍'}
              </button>
            </div>
            {/* ...other recipe info... */}
            <div className="recipe-instructions">
              <h4>Instructions:</h4>
              <ol>
                {(recipe.instructions || '').split(/\s*\d+\.\s*/).map((step, i) =>
                  step && !/^\d+$/.test(step) ? <li key={i}>{step.trim()}</li> : null
                )}
              </ol>
            </div>
            {/* ...existing code... */}
          </div>
        ))}
      </div>
    );
  };

  // Render predicted recipe result with heart icon (for dish name search)
  const renderPredictedRecipe = () => {
    if (!predictedRecipe) return null;
    return (
      <div className="predicted-recipe-card card" style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{predictedRecipe.dish_name}</h2>
          <button
            className="save-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: isRecipeSaved ? 'default' : 'pointer',
              fontSize: 28,
              color: isRecipeSaved ? '#e74c3c' : '#ccc',
              transition: 'color 0.2s'
            }}
            title={isRecipeSaved ? 'Saved' : 'Save Recipe'}
            onClick={isRecipeSaved ? undefined : handleSavePredictedRecipe}
            disabled={isRecipeSaved}
          >
            {isRecipeSaved ? '❤️' : '🤍'}
          </button>
        </div>
        <div style={{ marginTop: 8, color: '#667eea' }}>
          <strong>Cuisine:</strong> {predictedRecipe.cuisine || 'N/A'} &nbsp; | &nbsp;
          <strong>Servings:</strong> {servings}
        </div>
        <div style={{ marginTop: 16 }}>
          <strong>Ingredients:</strong>
          <ul>
            {(predictedRecipe.ingredients || []).map((ing, idx) => (
              <li key={idx}>
                {ing.ingredient} - {ing.quantity} {ing.unit}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 16 }}>
          <strong>Instructions:</strong>
          <div>{predictedRecipe.instructions}</div>
        </div>
      </div>
    );
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
                      placeholder="Enter dish name (e.g., Paneer tikka , dhokla...)"
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
                  <select
                    className="form-input"
                    value={cuisine}
                    onChange={handleCuisineChange}
                    required={searchMode === 'cuisine'}
                  >
                    <option value="">Select cuisine</option>
                    {cuisineOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
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
                  <div className="stat-value">10+</div>
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

        {/* Show predicted recipe result with heart icon for dish name search */}
        {searchMode === 'dish' && renderPredictedRecipe()}
      </div>
    </section>
  );
};

export default IngredientPredictor;