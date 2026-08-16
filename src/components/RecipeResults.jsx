import React, { useState } from 'react';

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
  const [userRating, setUserRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Save recipe handler
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

  // Rating and feedback handlers
  const handleRating = (star) => {
    setUserRating(star);
    setShowFeedback(true);
  };
  const submitFeedback = () => {
    // You can send feedback to backend here if needed
    alert('Thank you for your feedback!');
    setShowFeedback(false);
    setFeedback('');
    setUserRating(0);
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

  // Close modal on Escape key
  React.useEffect(() => {
    if (!modalRecipe) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalRecipe(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalRecipe]);

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
    const dishName = modalRecipe.dish_name || modalRecipe.name || modalRecipe.title;
    const cuisine = modalRecipe.cuisine || 'N/A';
    const servingsLabel = modalRecipe.servings || modalRecipe.servings_scaled_to || 'N/A';
    const timeLabel = modalRecipe.time_to_prepare_minutes
      ? `${modalRecipe.time_to_prepare_minutes} min`
      : modalRecipe.cookTime || 'N/A';
    const isSaved = savedIds.includes(modalRecipe._id || modalRecipe.id);

    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        style={{ backgroundColor: 'rgba(25, 28, 30, 0.4)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setModalRecipe(null); }}
      >
        <div className="bg-surface-container-lowest w-full max-w-4xl max-h-[90vh] rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row relative">
          <button
            type="button"
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-surface-container-lowest/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors shadow-sm"
            onClick={() => setModalRecipe(null)}
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Left Column: Meta */}
          <div className="w-full md:w-2/5 bg-surface-container relative flex flex-col">
            <div className="relative h-40 md:h-full w-full flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-5xl">skillet</span>
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-primary-container font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">timer</span> {timeLabel}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12 md:hidden">
                <h2 className="font-headline-lg text-headline-lg text-white mb-1">{dishName}</h2>
                <p className="font-label-lg text-label-lg text-white/80">{cuisine}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="w-full md:w-3/5 flex flex-col h-full bg-surface-container-lowest overflow-y-auto">
            <div className="p-6 md:p-8 flex-1">
              <div className="hidden md:block mb-8 pb-6 pr-12 border-b border-surface-container">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">{dishName}</h2>
                  <button
                    type="button"
                    className={isSaved ? 'text-secondary transition-colors flex-shrink-0' : 'text-surface-variant hover:text-secondary transition-colors flex-shrink-0'}
                    title={isSaved ? 'Saved' : 'Save Recipe'}
                    onClick={() => handleSaveRecipe(modalRecipe)}
                    disabled={isSaved}
                  >
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-on-surface-variant">
                  <span className="flex items-center gap-1.5 font-label-lg text-label-lg bg-surface-container-low px-3 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[18px]">location_on</span> {cuisine}
                  </span>
                  <span className="flex items-center gap-1.5 font-label-lg text-label-lg bg-surface-container-low px-3 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[18px]">restaurant</span> Servings: {servingsLabel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container">shopping_basket</span>
                    Ingredients
                  </h3>
                  <ul className="space-y-3">
                    {(modalRecipe.ingredients || []).map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors group">
                        <div className="relative mt-0.5">
                          <input
                            className="appearance-none w-5 h-5 border-2 border-outline rounded-full cursor-pointer transition-colors group-hover:border-primary-container"
                            type="checkbox"
                          />
                        </div>
                        <div className="flex-1 flex justify-between items-baseline">
                          <span className="font-body-md text-body-md text-on-surface">{ing.ingredient || ing.name}</span>
                          {(ing.quantity || ing.amount) && (
                            <span className="font-label-sm text-label-sm text-primary-container bg-primary-fixed-dim/20 px-2 py-0.5 rounded">
                              {ing.quantity || ing.amount} {ing.unit || ''}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container">menu_book</span>
                    Instructions
                  </h3>
                  <ol className="space-y-6 relative border-l-2 border-surface-container ml-3">
                    {steps.map((step, idx) => (
                      <li key={idx} className="pl-6 relative">
                        <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full flex items-center justify-center font-label-sm text-[10px] font-bold ring-4 ring-surface-container-lowest ${idx === 0 ? 'bg-primary-container text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                          {idx + 1}
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="p-6 bg-surface-container-low border-t border-surface-container flex justify-end gap-4 mt-auto">
              <button
                type="button"
                className="px-6 py-2.5 rounded-[16px] font-label-lg text-label-lg text-primary hover:bg-primary-fixed/50 transition-colors border-2 border-transparent"
                onClick={() => handleSaveRecipe(modalRecipe)}
                disabled={isSaved}
              >
                {isSaved ? 'Saved to Cooklist' : 'Save to Cooklist'}
              </button>
              <button
                type="button"
                className="px-8 py-2.5 rounded-[16px] font-label-lg text-label-lg bg-primary-container text-white hover:bg-primary transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5"
                onClick={() => setModalRecipe(null)}
              >
                Start Cooking
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  if (data.type === 'cuisine-dishes' || data.type === 'recipe-generation') {
    return (
      <section className="flex-grow w-full max-w-container-max mx-auto px-gutter py-stack-lg mb-section-gap">
        <header className="text-center mb-stack-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {data.type === 'cuisine-dishes' ? 'restaurant' : 'auto_awesome'}
            </span>
            <h1 className="font-headline-xl text-headline-xl text-primary">
              {data.type === 'cuisine-dishes' ? `${data.cuisine} Dishes` : 'Recipe Results'}
            </h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {data.type === 'cuisine-dishes'
              ? `Here are some popular dishes from ${data.cuisine} cuisine.`
              : `We found ${list.length} recipes for you!`}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-lg">
          {showList.map((dish, idx) => {
            const dishId = dish._id || dish.id;
            const isSaved = savedIds.includes(dishId);
            return (
              <article
                key={dishId || idx}
                className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] overflow-hidden hover-lift transition-all duration-300 border border-surface-variant flex flex-col h-full"
              >
                <div className="relative h-32 w-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-4xl">skillet</span>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      {dish.dish_name || dish.name || dish.title}
                    </h2>
                    <button
                      type="button"
                      className="bg-transparent border-none p-1"
                      title={isSaved ? 'Saved' : 'Save Recipe'}
                      onClick={() => handleSaveRecipe(dish)}
                      disabled={isSaved}
                    >
                      <span
                        className="material-symbols-outlined text-secondary"
                        style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm mb-4">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">public</span> {dish.cuisine || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {dish.time_to_prepare_minutes ? `${dish.time_to_prepare_minutes} min` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 mb-4 flex-grow">
                    <h4 className="font-label-sm text-label-sm font-bold text-on-surface mb-2">Key Ingredients</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(dish.ingredients || []).slice(0, 3).map((ing, i) => (
                        <span key={i} className="bg-surface-container-lowest border border-surface-variant rounded-full px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
                          {typeof ing === 'string' ? ing : ing.ingredient || ing.name}
                        </span>
                      ))}
                      {(dish.ingredients || []).length > 3 && (
                        <span className="font-label-sm text-label-sm text-primary px-1">
                          +{dish.ingredients.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm active:scale-95 duration-150"
                    onClick={() => setModalRecipe(dish)}
                  >
                    View Full Recipe
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {renderModal()}
      </section>
    );
  }

  if (data.type === 'ingredient-prediction') {
    return (
      <section className="flex-grow w-full max-w-container-max mx-auto px-gutter py-stack-lg mb-section-gap">
        <header className="text-center mb-stack-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              bar_chart
            </span>
            <h1 className="font-headline-xl text-headline-xl text-primary">Ingredient Predictions</h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Predicted ingredients for "{data.dishName}" — {data.targetServings} servings
          </p>
        </header>

        <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-low p-6 mb-stack-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col gap-1">
              <span className="font-headline-md text-headline-md text-tertiary-container">{data.accuracy}%</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Accuracy</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-headline-md text-headline-md text-primary">{data.scalingFactor}x</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Scale Factor</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-headline-md text-headline-md text-primary">{data.cookingTime} min</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Cook Time</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-headline-md text-headline-md text-secondary">{data.difficulty}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Difficulty</span>
            </div>
          </div>
        </div>

        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Predicted Ingredients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md mb-stack-lg">
          {data.ingredients.map((ingredient, index) => (
            <div key={index} className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-low p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">{ingredient.name}</span>
                {ingredient.category && (
                  <span className="font-label-sm text-label-sm text-primary bg-primary-container/10 px-2 py-0.5 rounded-full">
                    {ingredient.category}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Base ({data.baseServings})</div>
                  <div className="font-body-md text-body-md text-on-surface">{ingredient.baseAmount} {ingredient.unit}</div>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Scaled ({data.targetServings})</div>
                  <div className="font-body-md text-body-md text-primary font-semibold">{ingredient.scaledAmount} {ingredient.unit}</div>
                </div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Confidence: {Math.round(ingredient.confidence * 100)}%
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-2">
                  <div className="bg-tertiary-container h-2 rounded-full" style={{ width: `${ingredient.confidence * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-low p-6 mb-stack-lg">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lightbulb</span> Cooking Tips
          </h3>
          <ul className="space-y-2 list-disc list-inside font-body-md text-body-md text-on-surface-variant">
            {data.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-low p-6">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Rate This Prediction</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">
            Help us improve our AI by rating the accuracy of these predictions.
          </p>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className="bg-transparent border-none p-0"
                onClick={() => handleRating(star)}
              >
                <span
                  className="material-symbols-outlined text-3xl text-secondary"
                  style={{ fontVariationSettings: userRating >= star ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              </button>
            ))}
          </div>
          {showFeedback && (
            <div className="flex flex-col gap-stack-sm">
              <textarea
                className="w-full bg-surface p-3 rounded-lg border border-surface-variant text-on-surface font-body-md focus:outline-none focus:border-primary resize-none"
                placeholder="Any additional feedback about the predictions?"
                rows="3"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button
                type="button"
                className="self-start bg-primary text-on-primary font-label-lg text-label-lg px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                onClick={submitFeedback}
              >
                Submit Feedback
              </button>
            </div>
          )}
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
      <section className="flex-grow w-full max-w-container-max mx-auto px-gutter py-stack-lg mb-section-gap">
        <header className="text-center mb-stack-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              restaurant
            </span>
            <h1 className="font-headline-xl text-headline-xl text-primary">Recipe Details</h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {data.dish_name} — {data.cuisine} — {data.servings?.scaled_to || data.servings?.base || '?'} servings
          </p>
        </header>

        <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-low p-6 mb-stack-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Ingredients</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.ingredients.map((ing, idx) => (
              <div key={idx} className="bg-surface-container-low rounded-lg p-3 flex justify-between items-baseline">
                <span className="font-body-md text-body-md text-on-surface">{ing.ingredient}</span>
                <span className="font-label-sm text-label-sm text-primary-container bg-primary-fixed-dim/20 px-2 py-0.5 rounded">
                  {ing.quantity} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-low p-6">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Instructions</h2>
          <ol className="space-y-3">
            {steps.map((step, idx) => (
              <li key={idx} className="flex gap-4 items-start bg-surface-container-low p-4 rounded-lg">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-lg text-label-lg shadow-sm">
                  {idx + 1}
                </span>
                <span className="font-body-md text-body-md text-on-surface pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  if (data.type === 'dish-suggested') {
    const targetServings = data.targetServings || 4;
    return (
      <section className="flex-grow w-full max-w-container-max mx-auto px-gutter py-section-gap">
        <header className="text-center mb-section-gap flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-fixed mb-stack-md">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              restaurant_menu
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary mb-stack-sm">{data.cuisine} Dishes</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Showing ingredient quantities for {targetServings} servings.
          </p>
        </header>

        {data.dishes.length === 0 && (
          <div className="text-center font-body-md text-body-md text-on-surface-variant">
            No dishes found for this cuisine.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-lg">
          {data.dishes.slice(0, visibleCount).map((dish, idx) => {
            const dishId = dish._id || dish.id;
            const isSaved = savedIds.includes(dishId);
            const ingredientsList = dish.ingredients_scaled || dish.ingredients || [];
            return (
              <article
                key={dishId || idx}
                className="bg-surface-container-lowest rounded-xl shadow-tactile hover:shadow-level-2 transition-all duration-300 flex flex-col overflow-hidden border border-surface-container-low"
                style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)' }}
              >
                <div className="relative w-full pt-[56%] bg-surface-container-low">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-4xl">skillet</span>
                  </div>
                  <button
                    type="button"
                    aria-label="Save recipe"
                    className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-sm p-2 rounded-full text-outline hover:text-secondary transition-colors"
                    onClick={() => handleSaveRecipe(dish)}
                    disabled={isSaved}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>
                <div className="p-stack-md flex flex-col flex-grow">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mb-stack-sm truncate">
                    {dish.dish_name || dish.title}
                  </h2>
                  <div className="flex items-center gap-stack-md mb-stack-md font-label-sm text-label-sm text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>{dish.time_to_prepare_minutes ? `${dish.time_to_prepare_minutes} min` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">group</span>
                      <span>{dish.servings_scaled_to || targetServings} servings</span>
                    </div>
                  </div>
                  <div className="bg-background rounded-lg p-stack-sm mb-stack-md flex-grow border border-surface-container-low">
                    <h3 className="font-label-sm text-label-sm font-bold text-on-surface mb-2">Ingredients:</h3>
                    <ul className="space-y-2">
                      {ingredientsList.slice(0, 3).map((ingredient, i) => (
                        <li key={i} className="flex justify-between font-label-sm text-label-sm">
                          <span className="text-on-surface-variant">{ingredient.ingredient || ingredient.name}</span>
                          <span className="text-primary font-medium">
                            {ingredient.quantity || ingredient.amount} {ingredient.unit || ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {ingredientsList.length > 3 && (
                      <div className="mt-3 text-center">
                        <span
                          className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
                          onClick={() => setModalRecipe(dish)}
                        >
                          +{ingredientsList.length - 3} more
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                    onClick={() => setModalRecipe(dish)}
                  >
                    View More
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {visibleCount < data.dishes.length && (
          <div className="text-center mt-stack-lg">
            <button
              type="button"
              className="bg-surface-container text-on-surface font-label-lg text-label-lg px-8 py-3 rounded-xl hover:bg-surface-container-high transition-colors"
              onClick={() => setVisibleCount(visibleCount + 12)}
            >
              Load More
            </button>
          </div>
        )}
        {renderModal()}
      </section>
    );
  }

  return null;
};

export default RecipeResults;
