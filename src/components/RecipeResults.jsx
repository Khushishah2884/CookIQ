import React, { useState } from 'react';
import './RecipeResults.css';

const RecipeResults = ({ data }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleRating = (rating) => {
    setUserRating(rating);
    setShowFeedback(true);
  };

  const submitFeedback = () => {
    // Here you would send feedback to your backend
    console.log('Feedback submitted:', { rating: userRating, feedback });
    setShowFeedback(false);
    setUserRating(0);
    setFeedback('');
  };

  if (data.type === 'recipe-generation') {
    return (
      <section className="recipe-results">
        <div className="container">
          <div className="results-header">
            <h1 className="page-title">🍳 Recipe Suggestions</h1>
            <p className="page-subtitle">
              Found {data.totalFound} recipes using your ingredients: "{data.query}"
            </p>
          </div>

          <div className="recipes-grid">
            {data.recipes.map(recipe => (
              <div key={recipe.id} className="recipe-card card">
                <div className="recipe-image">
                  <img src={recipe.image} alt={recipe.name} />
                  <div className="recipe-rating">
                    <span className="rating-star">⭐</span>
                    <span className="rating-value">{recipe.rating}</span>
                  </div>
                </div>
                
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.name}</h3>
                  
                  <div className="recipe-meta">
                    <span className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      {recipe.cookTime}
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">👨‍🍳</span>
                      {recipe.difficulty}
                    </span>
                  </div>

                  <div className="ingredients-preview">
                    <h4>Ingredients:</h4>
                    <div className="ingredients-list">
                      {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                        <div key={index} className={`ingredient-item ${ingredient.available ? 'available' : 'missing'}`}>
                          <span className="ingredient-name">{ingredient.name}</span>
                          <span className="ingredient-amount">{ingredient.amount}</span>
                        </div>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <div className="more-ingredients">
                          +{recipe.ingredients.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary w-full"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    View Full Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recipe Modal */}
          {selectedRecipe && (
            <div className="recipe-modal-overlay" onClick={() => setSelectedRecipe(null)}>
              <div className="recipe-modal" onClick={e => e.stopPropagation()}>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedRecipe(null)}
                >
                  ✕
                </button>
                
                <div className="modal-content">
                  <div className="modal-header">
                    <img src={selectedRecipe.image} alt={selectedRecipe.name} />
                    <div className="modal-title-section">
                      <h2>{selectedRecipe.name}</h2>
                      <div className="recipe-meta">
                        <span className="meta-item">⏱️ {selectedRecipe.cookTime}</span>
                        <span className="meta-item">👨‍🍳 {selectedRecipe.difficulty}</span>
                        <span className="meta-item">⭐ {selectedRecipe.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-body">
                    <div className="ingredients-section">
                      <h3>Ingredients</h3>
                      <div className="ingredients-list">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <div key={index} className={`ingredient-item ${ingredient.available ? 'available' : 'missing'}`}>
                            <span className="ingredient-name">{ingredient.name}</span>
                            <span className="ingredient-amount">{ingredient.amount}</span>
                            <span className="availability-indicator">
                              {ingredient.available ? '✅' : '❌'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="instructions-section">
                      <h3>Instructions</h3>
                      <ol className="instructions-list">
                        {selectedRecipe.instructions.map((step, index) => (
                          <li key={index} className="instruction-step">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="nutrition-section">
                      <h3>Nutrition (per serving)</h3>
                      <div className="nutrition-grid">
                        <div className="nutrition-item">
                          <span className="nutrition-value">{selectedRecipe.nutrition.calories}</span>
                          <span className="nutrition-label">Calories</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-value">{selectedRecipe.nutrition.protein}g</span>
                          <span className="nutrition-label">Protein</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-value">{selectedRecipe.nutrition.carbs}g</span>
                          <span className="nutrition-label">Carbs</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-value">{selectedRecipe.nutrition.fat}g</span>
                          <span className="nutrition-label">Fat</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (data.type === 'ingredient-prediction') {
    return (
      <section className="prediction-results">
        <div className="container">
          <div className="results-header">
            <h1 className="page-title">📊 Ingredient Predictions</h1>
            <p className="page-subtitle">
              Predicted ingredients for "{data.dishName}" - {data.targetServings} servings
            </p>
          </div>

          <div className="prediction-summary card modern-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-value highlight">{data.accuracy}%</span>
                <span className="stat-label">Accuracy</span>
              </div>
              <div className="stat-item">
                <span className="stat-value highlight">{data.scalingFactor}x</span>
                <span className="stat-label">Scale Factor</span>
              </div>
              <div className="stat-item">
                <span className="stat-value highlight">{data.cookingTime} min</span>
                <span className="stat-label">Cook Time</span>
              </div>
              <div className="stat-item">
                <span className="stat-value highlight">{data.difficulty}</span>
                <span className="stat-label">Difficulty</span>
              </div>
            </div>
          </div>

          <h2 className="predicted-ingredients-title">Predicted Ingredients</h2>
          <div className="modern-ingredients-grid">
            {data.ingredients.map((ingredient, index) => (
              <div key={index} className="modern-ingredient-card card">
                <div className="modern-ingredient-header">
                  <span className="modern-ingredient-name">{ingredient.name}</span>
                  {ingredient.category && (
                    <span className="modern-ingredient-category">{ingredient.category}</span>
                  )}
                </div>
                <div className="modern-amounts-row">
                  <div className="modern-amount-col">
                    <div className="modern-amount-label">Base ({data.baseServings} servings)</div>
                    <div className="modern-amount-value">{ingredient.baseAmount} {ingredient.unit}</div>
                  </div>
                  <div className="modern-amount-col">
                    <div className="modern-amount-label">Scaled ({data.targetServings} servings)</div>
                    <div className="modern-amount-value highlight">{ingredient.scaledAmount} {ingredient.unit}</div>
                  </div>
                </div>
                <div className="modern-confidence-row">
                  <span className="modern-confidence-label">Confidence: {Math.round(ingredient.confidence * 100)}%</span>
                  <div className="modern-confidence-bar">
                    <div className="modern-confidence-fill" style={{ width: `${ingredient.confidence * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tips-section card">
            <h3>💡 Cooking Tips</h3>
            <ul className="tips-list">
              {data.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="feedback-section card">
            <h3>📝 Rate This Prediction</h3>
            <p>Help us improve our AI by rating the accuracy of these predictions</p>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`star-button ${userRating >= star ? 'active' : ''}`}
                  onClick={() => handleRating(star)}
                >
                  ⭐
                </button>
              ))}
            </div>
            {showFeedback && (
              <div className="feedback-form">
                <textarea
                  className="form-input form-textarea"
                  placeholder="Any additional feedback about the predictions?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <button 
                  className="btn btn-primary"
                  onClick={submitFeedback}
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (data.id && data.ingredients && data.instructions) {
    // Split instructions into steps if possible
    let steps = [];
    if (Array.isArray(data.instructions)) {
      steps = data.instructions;
    } else if (typeof data.instructions === 'string') {
      // Try to split by line or number
      steps = data.instructions
        .split(/\n|\r|(?=\d+\.|\d+\))/)
        .map(s => s.trim())
        .filter(Boolean);
    }
    return (
      <section className="recipe-details">
        <div className="container">
          <div className="results-header">
            <h1 className="page-title">🍽️ Recipe Details</h1>
            <p className="page-subtitle">
              {data.dish_name} &ndash; {data.cuisine} &ndash; {data.servings?.scaled_to || data.servings?.base || '?'} servings
            </p>
          </div>
          <div className="ingredients-section card">
            <h2>Ingredients</h2>
            <div className="ingredients-grid">
              {data.ingredients.map((ing, idx) => (
                <div key={idx} className="ingredient-card">
                  <div className="ingredient-name-top">{ing.ingredient}</div>
                  <div className="ingredient-qty">
                    {ing.quantity} {ing.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="instructions-section card">
            <h2>Instructions</h2>
            <ol className="instructions-list styled-steps">
              {steps.map((step, idx) => (
                <li key={idx} className="instruction-step">
                  <span className="step-icon">🍴</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    );
  }

  return null;
};

export default RecipeResults;