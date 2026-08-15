import React, { useState } from 'react';
import './RecipeGenerator.css';

const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState('');
  const [servings, setServings] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');

  const backendURL = "http://127.0.0.1:8000"; // FastAPI base URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;
    setIsLoading(true);
    setError('');
    setRecipes([]);

    try {
      // Step 1: Fetch suggested recipes based on ingredients
      const suggestResponse = await fetch(`${backendURL}/ingredients/suggest_recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, top_n: 10 })
      });

      if (!suggestResponse.ok) throw new Error("Failed to fetch recipe suggestions");
      const suggestions = await suggestResponse.json();

      // Step 2: Fetch full details for each suggested recipe
      const fullRecipes = await Promise.all(
        suggestions.map(async (r) => {
          const fullResponse = await fetch(`${backendURL}/ingredients/recipe_full/${r.index}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ num_people: servings })
          });
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
    } catch (err) {
      console.error("Error:", err);
      setError("Error fetching recipes. Please make sure FastAPI is running.");
    } finally {
      setIsLoading(false);
    }
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

        {/* --- Form Section --- */}
        <form className="main-form card" onSubmit={handleSubmit}>
          <label className="form-label">
            🧂 Your Ingredients
          </label>
          <textarea
            className="form-input form-textarea"
            placeholder="Enter ingredients separated by commas (e.g. rice, onion, tomato)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />

          <label className="form-label">👥 Servings</label>
          <div className="servings-control">
            <button type="button" onClick={() => setServings(Math.max(1, servings - 1))}>−</button>
            <input
              type="number"
              value={servings}
              onChange={(e) => setServings(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
            />
            <button type="button" onClick={() => setServings(servings + 1)}>+</button>
          </div>

          <button type="submit" className="generate-btn" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Recipes"}
          </button>
        </form>

        {/* --- Error Handling --- */}
        {error && <div className="error-message">{error}</div>}

        {/* --- Recipes Display Section --- */}
        <div className="recipes-list">
          {recipes.map((recipe, index) => (
            <div key={index} className="recipe-card">
              <h2>{recipe.name}</h2>
              <p><b>Cuisine:</b> {recipe.cuisine}</p>
              <p><b>Type:</b> {recipe.type}</p>
              <p><b>Cook Time:</b> {recipe.cookTime}</p>

              <div className="ingredients-section">
                <h4>🟢 Matched Ingredients:</h4>
                <ul>
                  {recipe.matched.length > 0
                    ? recipe.matched.map((m, i) => <li key={i}>{m}</li>)
                    : <li>None</li>}
                </ul>

                <h4>🔴 Missing Ingredients:</h4>
                <ul className="missing-ingredients">
                  {recipe.missing.length > 0
                    ? recipe.missing.map((m, i) => <li key={i}>{m}</li>)
                    : <li>None</li>}
                </ul>
              </div>

              <div className="instructions-section">
                <h4>👨‍🍳 Instructions:</h4>
                <ol>
                  {recipe.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && recipes.length === 0 && (
          <p className="no-results">Enter ingredients and click Generate to see recipes.</p>
        )}
      </div>
    </section>
  );
};

export default RecipeGenerator;