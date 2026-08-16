import React, { useState, useEffect } from 'react';

const DishResult = ({ recipes, servings }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    if (!selectedRecipe) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedRecipe(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRecipe]);

  const renderRecipeModal = () => {
    if (!selectedRecipe) return null;
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-on-background/40 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) setSelectedRecipe(null); }}
      >
        <div className="bg-surface-container-lowest w-full max-w-3xl max-h-[90vh] rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden relative">
          <div className="p-6 border-b border-surface-variant flex justify-between items-start sticky top-0 bg-surface-container-lowest z-10">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">{selectedRecipe.name}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">public</span> {selectedRecipe.cuisine}
                </span>
                <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span> {selectedRecipe.cookTime}
                </span>
                <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">group</span> {servings} servings
                </span>
              </div>
            </div>
            <button
              type="button"
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low -mt-2 -mr-2"
              onClick={() => setSelectedRecipe(null)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-section-gap">
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-surface-variant pb-2">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  list_alt
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Ingredients</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                <div>
                  <h4 className="font-label-lg text-label-lg text-tertiary-container mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">check</span> Available
                  </h4>
                  <ul className="space-y-2 font-body-md text-body-md text-on-surface">
                    {selectedRecipe.matched.map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-tertiary-container" /> {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedRecipe.missing.length > 0 && (
                  <div>
                    <h4 className="font-label-lg text-label-lg text-secondary mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">shopping_cart</span> Need to Buy
                    </h4>
                    <ul className="space-y-2 font-body-md text-body-md text-on-surface">
                      {selectedRecipe.missing.map((ing, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary" /> {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-surface-variant pb-2">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_dining
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Instructions</h3>
              </div>
              <div className="space-y-4">
                {selectedRecipe.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-surface-container-low p-4 rounded-lg">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-lg text-label-lg shadow-sm">
                      {idx + 1}
                    </span>
                    <p className="font-body-md text-body-md text-on-surface pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="flex-grow w-full max-w-container-max mx-auto px-gutter py-stack-lg mb-section-gap">
      <header className="text-center mb-stack-lg">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            restaurant
          </span>
          <h1 className="font-headline-xl text-headline-xl text-primary">Found Recipes</h1>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">Based on your available ingredients</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-lg">
        {recipes.map((recipe, index) => (
          <article
            key={index}
            className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] overflow-hidden hover-lift transition-all duration-300 border border-surface-variant flex flex-col h-full"
          >
            <div className="relative h-32 w-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-4xl">skillet</span>
              <span className="absolute top-3 right-3 bg-surface-container-lowest/85 backdrop-blur-sm px-3 py-1 rounded-full font-label-sm text-label-sm text-primary font-bold shadow-sm">
                {recipe.cuisine}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">{recipe.name}</h2>
              <div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm mb-4">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span> {recipe.cookTime}
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">group</span> {servings} servings
                </div>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3 mb-4 flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-tertiary-container text-[18px]">check_circle</span>
                  <span className="font-label-sm text-label-sm text-tertiary-container">
                    {recipe.matched.length} ingredients available
                  </span>
                </div>
                {recipe.missing.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">add_circle</span>
                    <span className="font-label-sm text-label-sm text-secondary">{recipe.missing.length} to buy</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm active:scale-95 duration-150"
                onClick={() => setSelectedRecipe(recipe)}
              >
                View Full Recipe
              </button>
            </div>
          </article>
        ))}
      </div>
      {renderRecipeModal()}
    </section>
  );
};

export default DishResult;
