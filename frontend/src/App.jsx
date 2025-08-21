import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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

  const handleModuleChange = (module) => {
    setActiveModule(module);
  };

  const handleRecipeGenerated = (data) => {
    setRecipeData(data);
    setActiveModule('results');
  };

  return (
    <div className="App">
      <Header onModuleChange={handleModuleChange} activeModule={activeModule} />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              activeModule === 'home' ? (
                <Hero onModuleChange={handleModuleChange} />
              ) : activeModule === 'recipe-generator' ? (
                <RecipeGenerator onRecipeGenerated={handleRecipeGenerated} />
              ) : activeModule === 'ingredient-predictor' ? (
                <IngredientPredictor onRecipeGenerated={handleRecipeGenerated} />
              ) : activeModule === 'results' && recipeData ? (
                <RecipeResults data={recipeData} />
              ) : (
                <Hero onModuleChange={handleModuleChange} />
              )
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/profile" element={<Profile />} />
          {/* Add more routes as needed */}
        </Routes>
      </main>
      <Footer />
      {/* Chatbot */}
      <Chatbot
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
      />
    </div>
  );
}

export default App;