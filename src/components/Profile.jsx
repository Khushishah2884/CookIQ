import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ onModuleChange }) => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [message, setMessage] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loadingRecipe, setLoadingRecipe] = useState(null);
  const navigate = useNavigate();

  // Only call onModuleChange('profile') on mount
  useEffect(() => {
    if (onModuleChange) onModuleChange('profile');
    // Fetch details of the currently signed-in user
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser({ name: data.name, email: data.email });
        setForm({ name: data.name, email: data.email });
      })
      .catch(() => setMessage('Failed to fetch user details'));

    // Fetch saved recipes for the user
    fetch('http://localhost:5000/api/users/saved-recipes', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSavedRecipes(data))
      .catch(() => setSavedRecipes([]));
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setEditMode(true);
    setMessage('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({ name: user.name, email: user.email });
    setMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Failed to update');
        return;
      }
      setUser({ name: data.name, email: data.email });
      setEditMode(false);
      setMessage('Profile updated successfully!');
    } catch {
      setMessage('Server error');
    }
  };

  // Fetch full recipe details from backend (by _id or dish_name)
  const handleRecipeSelected = async (recipe) => {
    setLoadingRecipe(recipe._id || recipe.id || recipe.dish_name || recipe.name);
    let recipeDetails = null;
    try {
      // Prefer _id, fallback to dish_name
      if (recipe._id || recipe.id) {
        const res = await fetch(`http://localhost:8000/recipe/${recipe._id || recipe.id}`);
        recipeDetails = await res.json();
      } else if (recipe.dish_name) {
        // fallback: search by dish name
        const res = await fetch('http://localhost:8000/get_recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: recipe.dish_name })
        });
        recipeDetails = await res.json();
      }
      if (recipeDetails) {
        localStorage.setItem('selectedRecipe', JSON.stringify(recipeDetails));
        setLoadingRecipe(null);
        navigate('/results', { state: { recipe: recipeDetails } });
      }
    } catch {
      setLoadingRecipe(null);
      alert('Failed to fetch recipe details.');
    }
  };

  return (
    <div className="profile-page">
      {/* Hero Section */}
      <div className="profile-hero">
        <div className="container">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-info">
              <h1>{user.name}</h1>
              <p>{user.email}</p>
            </div>
            {!editMode && (
              <button className="btn-edit" onClick={handleEdit}>
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {editMode ? (
          <div className="edit-profile-form card">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{savedRecipes.length}</div>
                <div className="stat-label">Saved Recipes</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">4.8</div>
                <div className="stat-label">Avg Rating</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">12</div>
                <div className="stat-label">Cooked</div>
              </div>
            </div>

            {/* Saved Recipes Section */}
            <section className="saved-recipes-section">
              <h2>My Recipe Collection</h2>
              {savedRecipes.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📝</span>
                  <p>No saved recipes yet. Start exploring and save your favorites!</p>
                </div>
              ) : (
                <div className="recipes-grid">
                  {savedRecipes.map((item, idx) => {
                    const recipe = item.recipe || {};
                    return (
                      <div key={item._id || idx} className="recipe-card">
                        <div className="recipe-card-content">
                          <div className="recipe-type-badge">
                            {recipe.type || 'Recipe'}
                          </div>
                          <h3>{recipe.dish_name || recipe.name}</h3>
                          <div className="recipe-meta">
                            <span>
                              <i className="meta-icon">🌍</i>
                              {recipe.cuisine || 'N/A'}
                            </span>
                            <span>
                              <i className="meta-icon">👥</i>
                              {recipe.servings_scaled_to || recipe.servings || 'N/A'} servings
                            </span>
                            <span>
                              <i className="meta-icon">⏱️</i>
                              {recipe.time_to_prepare_minutes ? `${recipe.time_to_prepare_minutes} min` : 'N/A'}
                            </span>
                          </div>
                          <button
                            className="view-recipe-btn"
                            onClick={() => handleRecipeSelected(recipe)}
                            disabled={loadingRecipe === (recipe._id || recipe.id || recipe.dish_name)}
                          >
                            {loadingRecipe === (recipe._id || recipe.id || recipe.dish_name)
                              ? 'Loading...'
                              : 'View Recipe →'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
