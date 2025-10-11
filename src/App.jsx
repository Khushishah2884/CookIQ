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
import DishResult from './components/DishResult';
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

  const handleRecipeGenerated = (data) => {
    setRecipeData(data);
    setActiveModule('results');
    navigate('/dish-result');
  };

  return (
    <div className="App">
      <Header onModuleChange={handleModuleChange} activeModule={activeModule} />
      <main className="main-content">
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
          <Route
            path="/dish-result"
            element={
              recipeData
                ? <DishResult recipes={recipeData.recipes || []} servings={recipeData.servings} />
                : <Hero onModuleChange={handleModuleChange} />
            }
          />
        </Routes>
      </main>
      <Footer />
      <Chatbot
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
      />
    </div>
  );
}

export default App;