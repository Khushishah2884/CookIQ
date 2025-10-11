import React, { useState } from 'react';
import './RecipeResults.css';

// Utility to split instructions into steps and filter out empty/number-only steps
const formatInstructions = (instructions) => {
  if (!instructions || typeof instructions !== 'string') return [];
  // Split by step numbers (e.g., "1.", "2.", etc.)
  let steps = instructions.split(/\s*\d+\.\s*/).map(s => s.trim());
  // Remove empty steps and steps that are just numbers (e.g., "1", "2", "3")
  steps = steps.filter(s => s && !/^\d+$/.test(s));
  return steps;
};

const RecipeResults = ({ data }) => {
  // State for "view more" modal and pagination
  const [modalRecipe, setModalRecipe] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [savedIds, setSavedIds] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Save recipe handler
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

  // Infinite scroll: load more on scroll to bottom
  React.useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        visibleCount < (data.recipes?.length || data.dishes?.length || 0)
      ) {
        setVisibleCount((prev) => prev + 12);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, data]);

  // Helper to get list of recipes/dishes
  const getList = () => {
    if (data.type === 'recipe-generation') return data.recipes || [];
    if (data.type === 'cuisine-dishes') return data.dishes || [];
    return [];
  };

  const list = getList();
  const showList = list.slice(0, visibleCount);

  // Modal view for full recipe
  const renderModal = () => {
    if (!modalRecipe) return null;
    // Helper to split and clean instructions into steps
    const getInstructionSteps = (instructions) => {
      if (Array.isArray(instructions)) {
        return instructions.filter(
          (step) => typeof step === 'string' && step.trim() !== ''
        );
      }
      // Split by newlines or ". " and filter empty/whitespace
      return String(instructions || '')
        .split(/(?:\r?\n)+|\. +/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    };

    const steps = getInstructionSteps(modalRecipe.instructions);

    return (
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div
          className="modal-content card"
          style={{
            maxWidth: 540,
            width: '100%',
            background: 'linear-gradient(135deg, #fff 80%, #e3eaff 100%)',
            padding: 0,
            borderRadius: 16,
            position: 'relative',
            boxShadow: '0 8px 32px rgba(102,126,234,0.18), 0 1.5px 8px rgba(118,75,162,0.10)'
          }}
        >
          <button
            style={{
              position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#667eea'
            }}
            onClick={() => setModalRecipe(null)}
            aria-label="Close"
          >✕</button>
          <div
            style={{
              maxHeight: 520,
              overflowY: 'auto',
              padding: '32px 28px 24px 28px',
              borderRadius: 16,
              scrollbarWidth: 'thin'
            }}
          >
            <h2 style={{ marginBottom: 10, color: '#764ba2', fontWeight: 700, fontSize: 28 }}>
              {modalRecipe.dish_name || modalRecipe.name || modalRecipe.title}
            </h2>
            <div style={{ marginBottom: 12, color: '#667eea', fontWeight: 500 }}>
              <span style={{ marginRight: 18 }}>
                <strong>Cuisine:</strong> {modalRecipe.cuisine || 'N/A'}
              </span>
              <span>
                <strong>Servings:</strong> {modalRecipe.servings || modalRecipe.servings_scaled_to || 'N/A'}
              </span>
            </div>
            <div style={{ marginBottom: 10, color: '#333' }}>
              <span style={{ marginRight: 18 }}>
                <strong>Time:</strong> {modalRecipe.time_to_prepare_minutes ? `${modalRecipe.time_to_prepare_minutes} min` : modalRecipe.cookTime || 'N/A'}
              </span>
              <span>
                <strong>Difficulty:</strong> {modalRecipe.difficulty || modalRecipe.type || 'N/A'}
              </span>
            </div>
            {modalRecipe.image && (
              <img src={modalRecipe.image} alt="Recipe" style={{ width: '100%', borderRadius: 10, marginBottom: 18, boxShadow: '0 2px 12px #e3eaff' }} />
            )}
            <div style={{ marginBottom: 18 }}>
              <strong style={{ color: '#764ba2', fontSize: 18 }}>Ingredients:</strong>
              <ul style={{ margin: '10px 0 0 18px', color: '#222', fontSize: 16 }}>
                {(modalRecipe.ingredients || []).map((ing, idx) => (
                  <li key={idx} style={{ marginBottom: 3 }}>
                    <span style={{ fontWeight: 500 }}>{ing.ingredient || ing.name}</span>
                    {ing.quantity || ing.amount ? (
                      <span style={{ color: '#667eea', marginLeft: 8 }}>
                        {ing.quantity || ing.amount} {ing.unit || ''}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong style={{ color: '#764ba2', fontSize: 18 }}>Instructions:</strong>
              <div style={{ marginTop: 6, color: '#222', fontSize: 16, lineHeight: 1.7 }}>
                <ol style={{ paddingLeft: 20 }}>
                  {steps.map((step, idx) => (
                    <li key={idx} style={{
                      marginBottom: 10,
                      background: '#f6f8ff',
                      borderRadius: 6,
                      padding: '10px 14px',
                      boxShadow: '0 1px 4px #e3eaff',
                      color: '#333',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        minWidth: 28,
                        minHeight: 28,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        borderRadius: '50%',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                        marginRight: 12,
                        verticalAlign: 'middle',
                        lineHeight: '28px',
                        flexShrink: 0
                      }}>{idx + 1}</span>
                      <span style={{ flex: 1 }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{
                marginTop: 18,
                width: '100%',
                background: 'linear-gradient(90deg,#667eea 0%,#764ba2 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 18,
                border: 'none',
                borderRadius: 8,
                boxShadow: '0 2px 8px #e3eaff'
              }}
              onClick={() => setModalRecipe(null)}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  if (data.type === 'cuisine-dishes' || data.type === 'recipe-generation') {
    return (
      <section className="recipe-results">
        <div className="container">
          <div className="results-header">
            <h1 className="page-title">
              {data.type === 'cuisine-dishes'
                ? `🍽️ ${data.cuisine} Dishes`
                : '✨ Recipe Results'}
            </h1>
            <p className="page-subtitle">
              {data.type === 'cuisine-dishes'
                ? `Here are some popular dishes from ${data.cuisine} cuisine:`
                : `We found ${list.length} recipes for you!`}
            </p>
          </div>
          <div className="recipes-grid">
            {showList.length === 0 && (
              <div>No recipes found.</div>
            )}
            {showList.map((dish, idx) => (
              <div key={dish._id || dish.id || idx} className="recipe-card card">
                <div className="recipe-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="recipe-title">{dish.dish_name || dish.name || dish.title}</h3>
                    {/* Favorite icon button */}
                    <button
                      className="save-btn"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 24,
                        color: savedIds.includes(dish._id || dish.id) ? '#e74c3c' : '#ccc',
                        transition: 'color 0.2s'
                      }}
                      title={savedIds.includes(dish._id || dish.id) ? 'Saved' : 'Save Recipe'}
                      onClick={() => handleSaveRecipe(dish)}
                      disabled={savedIds.includes(dish._id || dish.id)}
                    >
                      {savedIds.includes(dish._id || dish.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div className="recipe-meta">
                    <span className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      {dish.time_to_prepare_minutes ? `${dish.time_to_prepare_minutes} min` : dish.cookTime || 'N/A'}
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">👥</span>
                      {dish.servings || dish.servings_scaled_to || 'N/A'} servings
                    </span>
                  </div>
                  <div className="ingredients-preview">
                    <h4>Ingredients:</h4>
                    <div className="ingredients-list">
                      {(dish.ingredients || []).slice(0, 3).map((ingredient, i) => (
                        <div key={i} className="ingredient-item">
                          <span className="ingredient-name">{ingredient.ingredient || ingredient.name}</span>
                          <span className="ingredient-amount">{ingredient.quantity || ingredient.amount} {ingredient.unit || ''}</span>
                        </div>
                      ))}
                      {dish.ingredients && dish.ingredients.length > 3 && (
                        <div className="more-ingredients">
                          +{dish.ingredients.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="recipe-instructions">
                    <h4>Instructions</h4>
                    <ol>
                      {formatInstructions(dish.instructions).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 12 }}
                    onClick={() => setModalRecipe(dish)}
                  >
                    View More
                  </button>
                </div>
              </div>
            ))}
          </div>
          {visibleCount < list.length && (
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setVisibleCount(visibleCount + 12)}
              >
                Load More
              </button>
            </div>
          )}
        </div>
        {renderModal()}
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

  if (data.type === 'dish-suggested') {
    const targetServings = data.targetServings || 4;
    return (
      <section className="cuisine-dishes-results">
        <div className="container">
          <div className="results-header">
            <h1 className="page-title">🍽️ {data.cuisine} Dishes</h1>
            <p className="page-subtitle">
              Showing ingredient quantities for <strong>{targetServings}</strong> servings.
            </p>
          </div>
          <div className="recipes-grid">
            {data.dishes.length === 0 && (
              <div>No dishes found for this cuisine.</div>
            )}
            {data.dishes.map((dish, idx) => (
              <div key={dish._id || idx} className="recipe-card card">
                <div className="recipe-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="recipe-title">{dish.dish_name || dish.title}</h3>
                    {/* Favorite icon button */}
                    <button
                      className="save-btn"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 24,
                        color: savedIds.includes(dish._id || dish.id) ? '#e74c3c' : '#ccc',
                        transition: 'color 0.2s'
                      }}
                      title={savedIds.includes(dish._id || dish.id) ? 'Saved' : 'Save Recipe'}
                      onClick={() => handleSaveRecipe(dish)}
                      disabled={savedIds.includes(dish._id || dish.id)}
                    >
                      {savedIds.includes(dish._id || dish.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div className="recipe-meta">
                    <span className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      {dish.time_to_prepare_minutes ? `${dish.time_to_prepare_minutes} min` : 'N/A'}
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">👥</span>
                      {dish.servings_scaled_to || targetServings} servings
                    </span>
                  </div>
                  <div className="ingredients-preview">
                    <h4>Ingredients:</h4>
                    <div className="ingredients-list">
                      {(dish.ingredients_scaled || dish.ingredients || []).slice(0, 3).map((ingredient, i) => (
                        <div key={i} className="ingredient-item">
                          <span className="ingredient-name">{ingredient.ingredient || ingredient.name}</span>
                          <span className="ingredient-amount">{ingredient.quantity || ingredient.amount} {ingredient.unit || ''}</span>
                        </div>
                      ))}
                      {((dish.ingredients_scaled || dish.ingredients || []).length > 3) && (
                        <div className="more-ingredients">
                          +{(dish.ingredients_scaled || dish.ingredients).length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 12 }}
                    onClick={() => setModalRecipe(dish)}
                  >
                    View More
                  </button>
                </div>
              </div>
            ))}
          </div>
          {visibleCount < data.dishes.length && (
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setVisibleCount(visibleCount + 12)}
              >
                Load More
              </button>
            </div>
          )}
        </div>
        {renderModal()}
      </section>
    );
  }

  return null;
};

export default RecipeResults;