import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import RecipeGenerator from './components/RecipeGenerator';
import IngredientPredictor from './components/IngredientPredictor';
import RecipeResults from './components/RecipeResults';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
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
<<<<<<< HEAD
          <Route path="/profile" element={<Profile onModuleChange={handleModuleChange} />} />
=======
>>>>>>> 12431d1efb78da7502933c779046a660651d0d9b
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