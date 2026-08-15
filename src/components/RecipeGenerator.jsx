import React, { useState } from 'react';
import './RecipeGenerator.css';

const RecipeGenerator = ({ onRecipeGenerated }) => {
  const [ingredients, setIngredients] = useState('');
  const [servings, setServings] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const backendURL = "http://127.0.0.1:8000"; // FastAPI base URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;
    setIsLoading(true);
    setError('');
    setRecipes([]);

    try {
      // Step 1: Fetch suggested recipes based on ingredients
      const suggestResponse = await fetch(
        backendURL + '/ingredients/suggest_recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredients, top_n: 10 })
        }
      );

      if (!suggestResponse.ok) throw new Error("Failed to fetch recipe suggestions");
      const suggestions = await suggestResponse.json();

      // Step 2: Fetch full details for each suggested recipe
      const fullRecipes = await Promise.all(
        suggestions.map(async (r) => {
          const fullResponse = await fetch(
            backendURL + '/ingredients/recipe_full/' + r.index, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ num_people: servings })
            }
          );
          const fullData = await fullResponse.json();
          return {
            id: r.index,
            name: fullData.dish_name,
            cuisine: fullData.cuisine,
            type: fullData.type,
            cookTime: fullData.time_to_prepare_minutes + ' mins',
            ingredients: fullData.ingredients,
            instructions: fullData.instructions.split('\n'),
            matched: r.matched,
            missing: r.missing
          };
        })
      );

      setRecipes(fullRecipes);

      // ---- ADD THIS: Call onRecipeGenerated to trigger navigation ----
      if (onRecipeGenerated) {
        onRecipeGenerated({
          type: 'recipe-generation',
          recipes: fullRecipes,
          servings,
          ingredients
        });
      }
      // --------------------------------------------------------------

    } catch (err) {
      console.error("Error:", err);
      setError("Error fetching recipes. Please make sure FastAPI is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal card view for full recipe details
  const renderRecipeModal = () => {
    if (!selectedRecipe) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content card">
          <button
            className="modal-close-btn"
            onClick={() => setSelectedRecipe(null)}
          >
            ✕
          </button>
          <div className="modal-body">
            <div className="recipe-header">
              <h2>{selectedRecipe.name}</h2>
              <div className="recipe-meta-tags">
                <span className="cuisine-tag">{selectedRecipe.cuisine}</span>
                <span className="time-tag">{selectedRecipe.cookTime}</span>
                <span className="servings-tag">{servings} servings</span>
              </div>
            </div>
            <div className="ingredients-section">
              <h3>
                <span className="section-icon">📝</span>
                Ingredients
              </h3>
              <div className="ingredients-grid">
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <div key={idx} className="ingredient-item">
                    <span className="ingredient-icon">🔸</span>
                    <span className="ingredient-name">{ing.ingredient}</span>
                    <span className="ingredient-amount">
                      {ing.quantity} {ing.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="instructions-section">
              <h3>
                <span className="section-icon">👩‍🍳</span>
                Instructions
              </h3>
              <ol className="instructions-list">
                {selectedRecipe.instructions.map((step, idx) => (
                  <li key={idx} className="instruction-step">
                    <div className="step-number">{idx + 1}</div>
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
    <section className="recipe-generator">
      <div className="container">
        <div className="generator-header">
          <h1 className="page-title">Recipe Generator</h1>
          <p className="page-subtitle">
            Transform your ingredients into delicious recipes with AI
          </p>
        </div>

        <div className="generator-layout">
          {/* Left Column - Form */}
          <div className="form-section">
            <div className="form-card card">
              <div className="form-header">
                <span className="form-icon">🧪</span>
                <h2>Recipe Generator</h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="form-label">
                    <span className="label-icon">🥗</span>
                    Your Ingredients
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter ingredients separated by commas&#10;e.g. chicken, rice, tomatoes, onions"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    required
                  />
                </div>

                {/* <div className="servings-group">
                  <label className="form-label">
                    <span className="label-icon">👥</span>
                    Number of Servings
                  </label>
                  <div className="servings-control">
                    <button
                      type="button"
                      className="servings-btn"
                      onClick={() => setServings(Math.max(1, servings - 1))}
                    >−</button>
                    <input
                      type="number"
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                      min="1"
                      max="20"
                      className="servings-input"
                    />
                    <button
                      type="button"
                      className="servings-btn"
                      onClick={() => setServings(Math.min(20, servings + 1))}
                    >+</button>
                  </div>
                </div> */}

                <button
                  type="submit"
                  className="generate-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Generating Recipes...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✨</span>
                      Generate Recipes
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Tips Card */}
            <div className="tips-card card">
              <h3>
                <span className="tips-icon">💡</span>
                Pro Tips
              </h3>
              <ul className="tips-list">
                <li>List all ingredients you have available</li>
                <li>Separate ingredients with commas</li>
                <li>Be specific (e.g., "chicken breast" vs "chicken")</li>
                <li>Include basic pantry items if available</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="results-section">
            {error && <div className="error-message card">{error}</div>}

            {recipes.length > 0 ? (
              <div className="recipes-grid">
                {recipes.map((recipe, index) => (
                  <div key={index} className="recipe-card card">
                    <div className="recipe-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="recipe-title">{recipe.name}</h3>
                        <span className="recipe-cuisine">{recipe.cuisine}</span>
                      </div>
                      <div className="recipe-meta" style={{ marginBottom: 12 }}>
                        <span className="meta-item">
                          <span className="meta-icon">⏱️</span>
                          {recipe.cookTime}
                        </span>
                        <span className="meta-item">
                          <span className="meta-icon">👥</span>
                          {servings} servings
                        </span>
                      </div>
                      {/* Hide instructions and ingredients preview */}
                      <button
                        className="view-more-btn"
                        onClick={() => setSelectedRecipe(recipe)}
                        style={{ marginTop: 8 }}
                      >
                        View More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isLoading && (
              <div className="empty-state">
                <span className="empty-icon">🍳</span>
                <p>Enter your ingredients and generate delicious recipes!</p>
              </div>
            )}

            {/* Render the modal */}
            {renderRecipeModal()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipeGenerator;