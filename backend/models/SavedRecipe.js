const mongoose = require('mongoose');

const savedRecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipe: { type: Object, required: true }, // Store the recipe object or reference as needed
  savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);
