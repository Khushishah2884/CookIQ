import React, { useState } from 'react';
import './IngredientPredictor.css';

const IngredientPredictor = ({ onRecipeGenerated }) => {
  const [dishName, setDishName] = useState('');
  const [servings, setServings] = useState(4);
  const [baseServings, setBaseServings] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const popularDishes = [
    'Pasta Carbonara', 'Chicken Curry', 'Beef Stir Fry', 'Vegetable Soup',
    'Pizza Margherita', 'Fried Rice', 'Caesar Salad', 'Chocolate Cake',
    'Fish Tacos', 'Mushroom Risotto', 'Chicken Tikka Masala', 'Pad Thai'
  ];

  const handleDishNameChange = (e) => {
    const value = e.target.value;
    setDishName(value);
    
    if (value.length > 2) {
      const filtered = popularDishes.filter(dish => 
        dish.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion) => {
    setDishName(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    setIsLoading(true);
    
    // Simulate ML prediction API call
    setTimeout(() => {
      const mockPrediction = {
        type: 'ingredient-prediction',
        dishName: dishName,
        baseServings: baseServings,
        targetServings: servings,
        scalingFactor: servings / baseServings,
        ingredients: [
          {
            name: 'Pasta',
            baseAmount: 300,
            scaledAmount: Math.round((300 * servings) / baseServings),
            unit: 'g',
            category: 'Carbohydrates',
            confidence: 0.95
          },
          {
            name: 'Bacon',
            baseAmount: 150,
            scaledAmount: Math.round((150 * servings) / baseServings),
            unit: 'g',
            category: 'Protein',
            confidence: 0.92
          },
          {
            name: 'Eggs',
            baseAmount: 3,
            scaledAmount: Math.round((3 * servings) / baseServings),
            unit: 'pieces',
            category: 'Protein',
            confidence: 0.88
          },
          {
            name: 'Parmesan Cheese',
            baseAmount: 80,
            scaledAmount: Math.round((80 * servings) / baseServings),
            unit: 'g',
            category: 'Dairy',
            confidence: 0.90
          },
          {
            name: 'Heavy Cream',
            baseAmount: 200,
            scaledAmount: Math.round((200 * servings) / baseServings),
            unit: 'ml',
            category: 'Dairy',
            confidence: 0.85
          },
          {
            name: 'Garlic',
            baseAmount: 2,
            scaledAmount: Math.max(1, Math.round((2 * servings) / baseServings)),
            unit: 'cloves',
            category: 'Aromatics',
            confidence: 0.78
          },
          {
            name: 'Black Pepper',
            baseAmount: 1,
            scaledAmount: Math.round((1 * servings) / baseServings * 10) / 10,
            unit: 'tsp',
            category: 'Spices',
            confidence: 0.82
          },
          {
            name: 'Salt',
            baseAmount: 0.5,
            scaledAmount: Math.round((0.5 * servings) / baseServings * 10) / 10,
            unit: 'tsp',
            category: 'Spices',
            confidence: 0.75
          }
        ],
        accuracy: 89.5,
        cookingTime: Math.round((25 * servings) / baseServings),
        difficulty: 'Medium',
        tips: [
          'Adjust salt and pepper to taste',
          'Cook pasta al dente for best texture',
          'Add cream slowly to prevent curdling'
        ]
      };

      setIsLoading(false);
      onRecipeGenerated(mockPrediction);
    }, 2500);
  };

  return (
    <section className="ingredient-predictor">
      <div className="container">
        <div className="predictor-header">
          <h1 className="page-title">📊 Ingredient Predictor</h1>
          <p className="page-subtitle">
            Enter a dish name and serving size, and our AI will predict the exact ingredient quantities you need!
          </p>
        </div>

        <div className="predictor-content">
          <div className="predictor-form-section">
            <form onSubmit={handleSubmit} className="predictor-form card">
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
                    required
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
                    onChange={(e) => setServings(parseInt(e.target.value))}
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
                    onChange={(e) => setBaseServings(parseInt(e.target.value))}
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

              <button 
                type="submit" 
                className="btn btn-primary btn-large w-full"
                disabled={isLoading || !dishName.trim()}
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
                {popularDishes.slice(0, 6).map((dish, index) => (
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