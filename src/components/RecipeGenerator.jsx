import React, { useState } from 'react';

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
    <main className="flex-grow flex flex-col items-center justify-center p-gutter md:p-section-gap w-full max-w-container-max mx-auto">
      <div className="w-full max-w-3xl bg-surface-container-lowest rounded-xl shadow-level-1 p-8 md:p-12 flex flex-col gap-stack-lg transition-transform hover:-translate-y-1 duration-300">
        <div className="text-center">
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-stack-sm">What's in your pantry?</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Enter the ingredients you have on hand, and we'll conjure up a culinary masterpiece.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-lg">
          {/* Input Area */}
          <div className="flex flex-col gap-stack-sm">
            <label className="font-label-lg text-label-lg text-on-background" htmlFor="ingredients">
              Your Ingredients
            </label>
            <div className="relative rounded-lg transition-all duration-200 focus-within:ring-4 focus-within:ring-primary-fixed">
              <textarea
                id="ingredients"
                className="w-full bg-surface p-4 rounded-lg border-2 border-surface-variant text-on-surface font-body-md focus:outline-none focus:border-primary resize-none placeholder:text-outline"
                placeholder="e.g., chicken breast, broccoli, soy sauce, garlic..."
                rows="4"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                required
              />
            </div>
            <p className="font-label-sm text-label-sm text-outline">Separate ingredients with commas for better precision.</p>
          </div>

          {/* Controls (Servings & Generate) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-stack-md mt-stack-sm">
            <div className="flex items-center gap-stack-md bg-surface p-2 rounded-lg border border-surface-variant">
              <span className="font-label-lg text-label-lg text-on-surface-variant pl-2">Servings</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Decrease servings"
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="font-headline-sm text-headline-sm text-on-surface w-6 text-center">{servings}</span>
                <button
                  type="button"
                  aria-label="Increase servings"
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
                  onClick={() => setServings(servings + 1)}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-primary text-on-primary font-label-lg text-label-lg px-8 py-4 rounded-xl flex items-center justify-center gap-stack-sm hover:opacity-90 transition-all shadow-sm hover:shadow-md active:scale-95 group disabled:opacity-60"
              disabled={isLoading}
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
                magic_button
              </span>
              {isLoading ? 'Generating...' : 'Generate Recipes'}
            </button>
          </div>
        </form>

        {error && (
          <div className="text-error text-center font-body-md text-body-md">{error}</div>
        )}
      </div>

      {/* Recipes Display Section */}
      {recipes.length > 0 && (
        <div className="w-full max-w-3xl flex flex-col gap-stack-md mt-stack-lg">
          {recipes.map((recipe, index) => (
            <div
              key={index}
              className="bg-surface-container-lowest rounded-xl shadow-level-1 hover-lift overflow-hidden p-6 md:p-8 flex flex-col gap-4 border border-surface-container-low"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-headline-md text-headline-md text-on-surface">{recipe.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-container/10 text-primary px-3 py-1 font-label-sm text-label-sm">
                  {recipe.cuisine}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
                <div className="flex items-center gap-1 font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-sm">schedule</span> {recipe.cookTime}
                </div>
                <div className="flex items-center gap-1 font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-sm">group</span> {servings}
                </div>
                <div className="flex items-center gap-1 font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-sm">restaurant</span> {recipe.type}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
                <div>
                  <h4 className="flex items-center gap-1 font-label-lg text-label-lg text-tertiary-container mb-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Matched Ingredients
                  </h4>
                  <ul className="space-y-1 font-body-md text-body-md text-on-surface list-disc list-inside">
                    {recipe.matched.length > 0
                      ? recipe.matched.map((m, i) => <li key={i}>{m}</li>)
                      : <li className="text-on-surface-variant">None</li>}
                  </ul>
                </div>

                <div>
                  <h4 className="flex items-center gap-1 font-label-lg text-label-lg text-secondary mb-2">
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span> Missing Ingredients
                  </h4>
                  <ul className="space-y-1 font-body-md text-body-md text-on-surface list-disc list-inside">
                    {recipe.missing.length > 0
                      ? recipe.missing.map((m, i) => <li key={i}>{m}</li>)
                      : <li className="text-on-surface-variant">None</li>}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-1 font-label-lg text-label-lg text-on-surface mb-2">
                  <span className="material-symbols-outlined text-sm">menu_book</span> Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-1 font-body-md text-body-md text-on-surface">
                  {recipe.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State / Placeholder Area */}
      {!isLoading && recipes.length === 0 && (
        <div className="mt-section-gap text-center max-w-xl mx-auto flex flex-col items-center gap-stack-md opacity-60">
          <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-stack-sm">
            <span className="material-symbols-outlined text-4xl text-outline">skillet</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface-variant">Awaiting your ingredients</h2>
          <p className="font-body-md text-body-md text-outline">
            Enter ingredients above and click Generate to discover curated recipes tailored to what you have.
          </p>
        </div>
      )}
    </main>
  );
};

export default RecipeGenerator;
