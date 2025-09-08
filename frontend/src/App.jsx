import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from '../../src/components/Header';
import Hero from '../../src/components/Hero';
import RecipeGenerator from '../../src/components/RecipeGenerator';
import IngredientPredictor from '../../src/components/IngredientPredictor';
import RecipeResults from '../../src/components/RecipeResults';
import Chatbot from '../../src/components/Chatbot';
import Footer from '../../src/components/Footer';
import SignUp from '../../src/components/SignUp';
import SignIn from '../../src/components/SignIn';
import Profile from '../../src/components/Profile';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState('home');
  const [recipeData, setRecipeData] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync activeModule with route changes
  React.useEffect(() => {
    if (location.pathname === '/') setActiveModule('home');
    else if (location.pathname.startsWith('/recipe-generator')) setActiveModule('recipe-generator');
    else if (location.pathname.startsWith('/ingredient-predictor')) setActiveModule('ingredient-predictor');
    else if (location.pathname.startsWith('/profile')) setActiveModule('profile');
    else if (location.pathname.startsWith('/results')) setActiveModule('results');
  }, [location.pathname]);

  const handleModuleChange = (module) => {
    setActiveModule(module);
    if (module === 'home') navigate('/');
    else if (module === 'recipe-generator') navigate('/recipe-generator');
    else if (module === 'ingredient-predictor') navigate('/ingredient-predictor');
    else if (module === 'profile') navigate('/profile');
  };

  const handleRecipeGenerated = (data) => {
    setRecipeData(data);
    setActiveModule('results');
    navigate('/results');
  };

  return (
    <div className="App">
      <Header onModuleChange={handleModuleChange} activeModule={activeModule} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Hero onModuleChange={handleModuleChange} />} />
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
              recipeData ? <RecipeResults data={recipeData} /> : <Hero onModuleChange={handleModuleChange} />
            }
          />
          {/* Add more routes as needed */}
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