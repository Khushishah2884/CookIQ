import React, { useState } from 'react';
import './RecipeGenerator.css';

const RecipeGenerator = ({ onRecipeGenerated }) => {
  const [ingredients, setIngredients] = useState('');
  const [servings, setServings] = useState(4);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [cuisine, setCuisine] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'French', 
    'Japanese', 'Thai', 'Mediterranean', 'American', 'Korean'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Keto', 'Low-Carb', 'High-Protein', 'Paleo'
  ];

  const handleDietaryChange = (option) => {
    setDietaryRestrictions(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockRecipes = [
        {
          id: 1,
          name: 'Creamy Pasta Primavera',
          image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
          cookTime: '25 mins',
          difficulty: 'Easy',
          rating: 4.8,
          ingredients: [
            { name: 'Pasta', amount: '400g', available: true },
            { name: 'Heavy Cream', amount: '200ml', available: true },
            { name: 'Mixed Vegetables', amount: '300g', available: true },
            { name: 'Parmesan Cheese', amount: '100g', available: false },
            { name: 'Garlic', amount: '3 cloves', available: true }
          ],
          instructions: [
            'Cook pasta according to package directions',
            'Sauté vegetables in olive oil',
            'Add cream and simmer',
            'Toss with pasta and cheese',
            'Season and serve hot'
          ],
          nutrition: {
            calories: 520,
            protein: 18,
            carbs: 65,
            fat: 22
          }
        },
        {
          id: 2,
          name: 'Mediterranean Quinoa Bowl',
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
          cookTime: '20 mins',
          difficulty: 'Easy',
          rating: 4.6,
          ingredients: [
            { name: 'Quinoa', amount: '200g', available: true },
            { name: 'Cherry Tomatoes', amount: '200g', available: true },
            { name: 'Cucumber', amount: '1 large', available: true },
            { name: 'Feta Cheese', amount: '150g', available: false },
            { name: 'Olive Oil', amount: '3 tbsp', available: true }
          ],
          instructions: [
            'Cook quinoa until fluffy',
            'Chop vegetables',
            'Mix with olive oil and herbs',
            'Add feta cheese',
            'Serve chilled or warm'
          ],
          nutrition: {
            calories: 380,
            protein: 15,
            carbs: 45,
            fat: 16
          }
        }
      ];

      const recipeData = {
        type: 'recipe-generation',
        query: ingredients,
        servings: servings,
        recipes: mockRecipes,
        totalFound: mockRecipes.length
      };

      setIsLoading(false);
      onRecipeGenerated(recipeData);
    }, 2000);
  };

  return (
    <section className="recipe-generator">
      <div className="container">
        <div className="generator-header">
          <h1 className="page-title">🍳 Recipe Generator</h1>
          <p className="page-subtitle">
            Tell us what ingredients you have, and we'll create amazing recipes for you!
          </p>
        </div>

        <div className="generator-content">
          <div className="generator-form-section">
            <form onSubmit={handleSubmit} className="generator-form card">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🥕</span>
                  Available Ingredients
                </label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Enter your ingredients separated by commas (e.g., chicken, rice, tomatoes, onions, garlic...)"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">👥</span>
                    Number of Servings
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="20"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🌍</span>
                    Preferred Cuisine
                  </label>
                  <select
                    className="form-input"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                  >
                    <option value="">Any Cuisine</option>
                    {cuisineOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🥗</span>
                  Dietary Restrictions
                </label>
                <div className="dietary-options">
                  {dietaryOptions.map(option => (
                    <label key={option} className="dietary-option">
                      <input
                        type="checkbox"
                        checked={dietaryRestrictions.includes(option)}
                        onChange={() => handleDietaryChange(option)}
                      />
                      <span className="dietary-label">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-large w-full"
                disabled={isLoading || !ingredients.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Generating Recipes...
                  </>
                ) : (
                  <>
                    Generate Recipes ✨
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="generator-info-section">
            <div className="info-cards">
              <div className="info-card card">
                <div className="info-icon">🎯</div>
                <h3>Smart Matching</h3>
                <p>Our AI analyzes your ingredients and suggests the best recipe combinations</p>
              </div>

              <div className="info-card card">
                <div className="info-icon">⚡</div>
                <h3>Instant Results</h3>
                <p>Get personalized recipes in seconds with detailed instructions and nutrition info</p>
              </div>

              <div className="info-card card">
                <div className="info-icon">🌟</div>
                <h3>Quality Recipes</h3>
                <p>All recipes are tested and rated by our community of home cooks</p>
              </div>
            </div>

            <div className="tips-section card">
              <h3>💡 Pro Tips</h3>
              <ul className="tips-list">
                <li>Be specific with ingredients (e.g., "boneless chicken breast" vs "chicken")</li>
                <li>Include spices and seasonings you have available</li>
                <li>Mention cooking equipment if relevant (oven, grill, slow cooker)</li>
                <li>Don't forget about pantry staples like oil, salt, and pepper</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipeGenerator;

// Make sure you have a form or button that triggers recipe generation
// and calls props.onRecipeGenerated with the result