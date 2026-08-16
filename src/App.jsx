import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import RecipeGenerator from './components/RecipeGenerator';
import IngredientPredictor from './components/IngredientPredictor';
import RecipeResults from './components/RecipeResults';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState('home');
  const [recipeData, setRecipeData] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') setActiveModule('home');
    else if (location.pathname.startsWith('/recipe-generator')) setActiveModule('recipe-generator');
    else if (location.pathname.startsWith('/ingredient-predictor')) setActiveModule('ingredient-predictor');
    else if (location.pathname.startsWith('/profile')) setActiveModule('profile');
    else if (location.pathname.startsWith('/results')) setActiveModule('results');
  }, [location.pathname]);

  const handleModuleChange = (module) => {
    setActiveModule(module);
    if (module === 'recipe-generator') navigate('/recipe-generator');
    else if (module === 'ingredient-predictor') navigate('/ingredient-predictor');
    else if (module === 'home') navigate('/');
    else if (module === 'profile') navigate('/profile');
  };

  /**
   * Centralized handler called by children when a recipe/prediction is produced.
   * We inspect the optional `_source` flag in the payload:
   * - If `_source === 'ingredient-predictor'` => navigate to /results
   * - Otherwise (e.g., RecipeGenerator) => preserve previous behavior and navigate to /dish-result
   */
  const handleRecipeGenerated = (data) => {
    setRecipeData(data);
    setActiveModule('results');

    // Decide destination based on who sent the payload
    if (data && data._source === 'ingredient-predictor') {
      navigate('/results');
    } else {
      // Keep the original routing for RecipeGenerator (unchanged behavior)
      navigate('/dish-result');
    }
  };

  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  return (
    <div className="App">
      <Header onModuleChange={handleModuleChange} activeModule={activeModule} />
      <main className={isAuthPage ? '' : 'main-content'}>
        <Routes>
          <Route
            path="/"
            element={<Hero onModuleChange={handleModuleChange} />}
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/profile" element={<Profile onModuleChange={handleModuleChange} />} />
          <Route
            path="/recipe-generator"
            element={
              <RecipeGenerator
                onRecipeGenerated={handleRecipeGenerated}
              />
            }
          />
          <Route
            path="/ingredient-predictor"
            element={
              <IngredientPredictor
                onRecipeGenerated={handleRecipeGenerated}
              />
            }
          />
          <Route
            path="/results"
            element={
              recipeData
                ? <RecipeResults data={recipeData} />
                : (() => {
                    const selectedRecipe = localStorage.getItem('selectedRecipe');
                    if (selectedRecipe) {
                      const recipe = JSON.parse(selectedRecipe);
                      return <RecipeResults data={recipe} />;
                    }
                    return <Hero onModuleChange={handleModuleChange} />;
                  })()
            }
          />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && (
        <Chatbot
          isOpen={isChatbotOpen}
          onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        />
      )}
    </div>
  );
}

export default App;
