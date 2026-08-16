import React, { useState } from 'react';

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

        // Attach a source flag so App can decide where to route
        const payload = { ...(data || {}), _source: 'ingredient-predictor' };
        onRecipeGenerated(payload);
      } else {
        // Fetch dishes for the selected cuisine and target servings
        const result = await fetchDishesByCuisine(cuisine, servings);
        setIsLoading(false);

        const payload = {
          type: 'dish-suggested',
          cuisine,
          targetServings: servings,
          dishes: result.dishes || [],
          _source: 'ingredient-predictor'
        };

        // pass suggested dishes data to parent App (App will handle navigation to /results)
        onRecipeGenerated(payload);
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
  const incrementServings = () => setServings(s => Math.max(1, (parseInt(s, 10) || 1) + 1));
  const decrementServings = () => setServings(s => Math.max(1, (parseInt(s, 10) || 1) - 1));
  const incrementBaseServings = () => setBaseServings(s => Math.max(1, (parseInt(s, 10) || 1) + 1));
  const decrementBaseServings = () => setBaseServings(s => Math.max(1, (parseInt(s, 10) || 1) - 1));

  const handleSaveRecipe = async (recipe) => {
    if (!user || !token) {
      alert('Please sign in to save recipes.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5050/api/users/save-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // <-- FIXED
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
      const res = await fetch('http://localhost:5050/api/users/save-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // <-- FIXED
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

  const scalingFactor = baseServings > 0 ? (servings / baseServings).toFixed(2) : '1.00';

  // Render results (for both options)
  const renderResults = (data) => {
    if (!data) return null;
    const recipes = data.dishes || data.recipes || [];
    return (
      <div className="flex flex-col gap-stack-md mt-stack-lg">
        {recipes.map((recipe, idx) => (
          <div
            key={idx}
            className="bg-surface-container-lowest rounded-xl shadow-level-1 hover-lift overflow-hidden p-6 flex flex-col gap-3 border border-surface-container-low"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {recipe.dish_name || recipe.name}
              </h3>
              <button
                type="button"
                className="bg-transparent border-none cursor-pointer p-1"
                title={savedIds.includes(recipe._id || recipe.id) ? 'Saved' : 'Save Recipe'}
                onClick={() => handleSaveRecipe(recipe)}
                disabled={savedIds.includes(recipe._id || recipe.id)}
              >
                <span
                  className="material-symbols-outlined text-2xl text-secondary"
                  style={{
                    fontVariationSettings: savedIds.includes(recipe._id || recipe.id) ? "'FILL' 1" : "'FILL' 0"
                  }}
                >
                  favorite
                </span>
              </button>
            </div>
            <div>
              <h4 className="font-label-lg text-label-lg text-on-surface-variant mb-2">Instructions</h4>
              <ol className="list-decimal list-inside space-y-1 font-body-md text-body-md text-on-surface">
                {(recipe.instructions || '').split(/\s*\d+\.\s*/).map((step, i) =>
                  step && !/^\d+$/.test(step) ? <li key={i}>{step.trim()}</li> : null
                )}
              </ol>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render predicted recipe result with heart icon (for dish name search)
  const renderPredictedRecipe = () => {
    if (!predictedRecipe) return null;
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-level-1 hover-lift overflow-hidden p-6 md:p-8 flex flex-col gap-4 border border-surface-container-low mt-stack-lg">
        <div className="flex justify-between items-center">
          <h2 className="font-headline-md text-headline-md text-on-surface m-0">{predictedRecipe.dish_name}</h2>
          <button
            type="button"
            className="bg-transparent border-none p-1"
            style={{ cursor: isRecipeSaved ? 'default' : 'pointer' }}
            title={isRecipeSaved ? 'Saved' : 'Save Recipe'}
            onClick={isRecipeSaved ? undefined : handleSavePredictedRecipe}
            disabled={isRecipeSaved}
          >
            <span
              className="material-symbols-outlined text-3xl text-secondary"
              style={{ fontVariationSettings: isRecipeSaved ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-label-lg text-label-lg text-primary">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-container/10 px-3 py-1">
            <span className="material-symbols-outlined text-sm">public</span>
            {predictedRecipe.cuisine || 'N/A'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-container/10 px-3 py-1">
            <span className="material-symbols-outlined text-sm">group</span>
            {servings} servings
          </span>
        </div>
        <div>
          <h4 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-2">
            Ingredients
          </h4>
          <ul className="space-y-1 font-body-md text-body-md text-on-surface list-disc list-inside">
            {(predictedRecipe.ingredients || []).map((ing, idx) => (
              <li key={idx}>
                {ing.ingredient} - {ing.quantity} {ing.unit}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-2">
            Instructions
          </h4>
          <div className="font-body-md text-body-md text-on-surface whitespace-pre-line">
            {predictedRecipe.instructions}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-stack-lg grid grid-cols-1 md:grid-cols-12 gap-gutter">
      {/* Left Column: Primary Inputs (8 cols) */}
      <div className="col-span-1 md:col-span-8 flex flex-col gap-stack-lg">
        <div className="flex flex-col gap-stack-sm">
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Ingredient Predictor</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Enter a dish name or cuisine and serving size, and our AI will predict the exact ingredient quantities
            you need.
          </p>
          <div className="inline-flex bg-surface-container-low p-1 rounded-xl mt-4 self-start">
            <label
              className={`px-6 py-2 rounded-lg font-label-lg text-label-lg cursor-pointer transition-colors ${
                searchMode === 'dish'
                  ? 'bg-white shadow-sm text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <input
                type="radio"
                name="searchMode"
                value="dish"
                checked={searchMode === 'dish'}
                onChange={() => setSearchMode('dish')}
                className="sr-only"
              />
              By Dish Name
            </label>
            <label
              className={`px-6 py-2 rounded-lg font-label-lg text-label-lg cursor-pointer transition-colors ${
                searchMode === 'cuisine'
                  ? 'bg-white shadow-sm text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <input
                type="radio"
                name="searchMode"
                value="cuisine"
                checked={searchMode === 'cuisine'}
                onChange={() => setSearchMode('cuisine')}
                className="sr-only"
              />
              By Cuisine
            </label>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-level-1 p-6 border border-surface-container-low flex flex-col gap-stack-md"
        >
          {searchMode === 'dish' ? (
            <div className="flex flex-col gap-2 relative">
              <label className="font-label-lg text-label-lg text-on-surface">What are you cooking?</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                  restaurant_menu
                </span>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-surface rounded-xl border border-surface-dim focus:border-primary focus:ring-2 focus:ring-primary-container/20 font-body-lg text-body-lg transition-all"
                  placeholder="e.g. Paneer Tikka, Dhokla..."
                  value={dishName}
                  onChange={handleDishNameChange}
                  required={searchMode === 'dish'}
                />
              </div>
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-level-2 border border-surface-container-low z-10">
                  <ul className="py-2">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-3 hover:bg-surface-container-low cursor-pointer flex items-center gap-3"
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        <span className="material-symbols-outlined text-outline">search</span>
                        <span className="font-body-md text-body-md">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="font-label-lg text-label-lg text-on-surface">Cuisine</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                  public
                </span>
                <select
                  className="w-full pl-12 pr-4 py-4 bg-surface rounded-xl border border-surface-dim focus:border-primary focus:ring-2 focus:ring-primary-container/20 font-body-lg text-body-lg transition-all"
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
            </div>
          )}

          {/* Servings & Scaling Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md mt-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Base Recipe Servings</label>
              <div className="flex items-center bg-surface rounded-lg border border-surface-dim p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                <button type="button" className="p-1 text-on-surface-variant hover:text-primary transition-colors" onClick={decrementBaseServings}>
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input
                  type="number"
                  className="w-full text-center bg-transparent border-none focus:ring-0 font-headline-md text-headline-md text-on-surface p-0"
                  min="1"
                  max="20"
                  value={baseServings}
                  onChange={handleBaseServingsChange}
                />
                <button type="button" className="p-1 text-on-surface-variant hover:text-primary transition-colors" onClick={incrementBaseServings}>
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Target Servings</label>
              <div className="flex items-center bg-surface rounded-lg border border-surface-dim p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                <button type="button" className="p-1 text-on-surface-variant hover:text-primary transition-colors" onClick={decrementServings}>
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input
                  type="number"
                  className="w-full text-center bg-transparent border-none focus:ring-0 font-headline-md text-headline-md text-on-surface p-0"
                  min="1"
                  max="50"
                  value={servings}
                  onChange={handleServingsChange}
                />
                <button type="button" className="p-1 text-on-surface-variant hover:text-primary transition-colors" onClick={incrementServings}>
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            <div className="bg-primary-container/10 rounded-lg p-4 flex flex-col justify-center items-center border border-primary-container/20">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Scaling Factor</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-lg text-headline-lg text-primary">{scalingFactor}</span>
                <span className="font-headline-sm text-headline-sm text-primary">x</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-error text-center font-body-md text-body-md">{error}</div>
          )}

          <button
            type="submit"
            className="w-full mt-6 bg-primary text-on-primary font-label-lg text-label-lg py-4 rounded-xl hover:opacity-90 transition-colors shadow-md flex justify-center items-center gap-2 disabled:opacity-60"
            disabled={isLoading || (searchMode === 'dish' ? !dishName.trim() : !cuisine.trim())}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Predicting Ingredients...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">auto_awesome</span>
                Predict Ingredients
              </>
            )}
          </button>
        </form>

        {/* Popular Dishes Tags */}
        <div className="flex flex-col gap-stack-sm mt-4">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Popular Predictions
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 6).map((dish, index) => (
              <button
                key={index}
                type="button"
                className="px-4 py-2 bg-surface-container border border-surface-dim rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high cursor-pointer transition-colors"
                onClick={() => setDishName(dish)}
              >
                {dish}
              </button>
            ))}
          </div>
        </div>

        {/* Show predicted recipe result with heart icon for dish name search */}
        {searchMode === 'dish' && renderPredictedRecipe()}
      </div>

      {/* Right Column: Stats & Smart Features (4 cols) */}
      <div className="col-span-1 md:col-span-4 flex flex-col gap-stack-lg">
        <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-low p-6 flex flex-col gap-stack-md hover-lift">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">database</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Predictor Engine</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Accuracy Rate</span>
              <span className="font-headline-md text-headline-md text-tertiary-container">95%</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Recipes Analyzed</span>
              <span className="font-headline-md text-headline-md text-primary">3K+</span>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Cuisines Supported</span>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface">10+ Cuisines</span>
                <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-low p-6 flex flex-col gap-stack-md">
          <h3 className="font-headline-sm text-headline-sm text-on-surface border-b border-surface-dim pb-3">
            Smart Features Enabled
          </h3>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-sm">track_changes</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface">Precise Scaling</span>
                <span className="font-body-md text-label-sm text-on-surface-variant mt-1">
                  Intelligent scaling that considers ingredient behavior.
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-tertiary-container/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-tertiary-container text-sm">trending_up</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface">Confidence Scores</span>
                <span className="font-body-md text-label-sm text-on-surface-variant mt-1">
                  See how confident our AI is about each prediction.
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary text-sm">sync</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface">Continuous Learning</span>
                <span className="font-body-md text-label-sm text-on-surface-variant mt-1">
                  Model improves with user feedback and ratings.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default IngredientPredictor;
