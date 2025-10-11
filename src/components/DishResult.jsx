import React, { useState } from 'react';
import './RecipeGenerator.css';

const DishResult = ({ recipes, servings }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const renderRecipeModal = () => {
    if (!selectedRecipe) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content card">
          <button className="modal-close-btn" onClick={() => setSelectedRecipe(null)}>✕</button>
          <div className="modal-body">
            {/* Recipe Header */}
            <div className="recipe-detail-header">
              <h2>{selectedRecipe.name}</h2>
              <div className="recipe-meta-tags">
                <span className="cuisine-tag">
                  <span className="tag-icon">🌍</span>
                  {selectedRecipe.cuisine}
                </span>
                <span className="time-tag">
                  <span className="tag-icon">⏱️</span>
                  {selectedRecipe.cookTime}
                </span>
                <span className="servings-tag">
                  <span className="tag-icon">👥</span>
                  {servings} servings
                </span>
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="ingredients-detail-section">
              <div className="section-title">
                <h3><span className="section-icon">📝</span>Ingredients</h3>
              </div>
              <div className="ingredients-columns">
                <div className="available-ingredients">
                  <h4>Available</h4>
                  <ul>
                    {selectedRecipe.matched.map((ing, idx) => (
                      <li key={idx}><span className="check-icon">✓</span>{ing}</li>
                    ))}
                  </ul>
                </div>
                {selectedRecipe.missing.length > 0 && (
                  <div className="missing-ingredients">
                    <h4>Need to Buy</h4>
                    <ul>
                      {selectedRecipe.missing.map((ing, idx) => (
                        <li key={idx}><span className="missing-icon">+</span>{ing}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions Section */}
            <div className="instructions-detail-section">
              <div className="section-title">
                <h3><span className="section-icon">👨‍🍳</span>Instructions</h3>
              </div>
              <ol className="instructions-list">
                {selectedRecipe.instructions.map((step, idx) => (
                  <li key={idx} className="instruction-step">
                    {/* Remove the blue circle step number */}
                    <div className="step-text">{step}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="dish-result">
      <div className="container">
        <div className="results-header">
          <h1 className="page-title">Found Recipes</h1>
          <p className="page-subtitle">Based on your available ingredients</p>
        </div>

        <div className="recipes-grid">
          {recipes.map((recipe, index) => (
            <div key={index} className="recipe-preview-card">
              <div className="preview-content">
                <div className="preview-header">
                  <h3>{recipe.name}</h3>
                  <span className="cuisine-badge">{recipe.cuisine}</span>
                </div>
                
                <div className="preview-meta">
                  <span className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    {recipe.cookTime}
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">👥</span>
                    {servings} servings
                  </span>
                </div>

                <div className="ingredients-summary">
                  <div className="matched-count">
                    <span className="count-icon">✓</span>
                    <span>{recipe.matched.length} ingredients available</span>
                  </div>
                  {recipe.missing.length > 0 && (
                    <div className="missing-count">
                      <span className="count-icon">+</span>
                      <span>{recipe.missing.length} to buy</span>
                    </div>
                  )}
                </div>

                <button
                  className="view-recipe-btn"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  View Full Recipe
                </button>
              </div>
            </div>
          ))}
        </div>
        {renderRecipeModal()}
      </div>
    </section>
  );
};

export default DishResult;
