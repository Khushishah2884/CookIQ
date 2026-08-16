import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    fetch('http://localhost:5050/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser({ name: data.name, email: data.email });
        setForm({ name: data.name, email: data.email });
      })
      .catch(() => setMessage('Failed to fetch user details'));

    // Fetch saved recipes for the user
    fetch('http://localhost:5050/api/users/saved-recipes', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSavedRecipes(Array.isArray(data) ? data : []))
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
      const res = await fetch('http://localhost:5050/api/users/update', {
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
    <main className="max-w-container-max mx-auto px-gutter py-stack-lg mb-section-gap">
      {/* Profile Banner Header */}
      <header className="bg-surface-container-lowest rounded-xl shadow-level-1 mb-stack-lg overflow-hidden relative transition-transform duration-300 hover:shadow-level-2">
        <div className="h-48 w-full bg-primary-container" />
        <div className="px-8 pb-8 pt-4 relative flex flex-col md:flex-row items-end md:items-center justify-between -mt-16 gap-stack-md">
          <div className="flex items-end gap-6 w-full md:w-auto">
            <div className="w-32 h-32 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-xl text-headline-xl border-4 border-surface-container-lowest relative z-10 shadow-sm shrink-0 uppercase">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="mb-2">
              <h1 className="font-headline-lg text-headline-lg text-on-surface m-0 p-0">{user.name || 'Your Profile'}</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">{user.email}</p>
            </div>
          </div>
          {!editMode && (
            <div className="flex gap-4 w-full md:w-auto justify-start md:justify-end">
              <button
                type="button"
                className="bg-surface-container text-on-surface font-label-lg text-label-lg px-6 py-3 rounded-lg hover:bg-surface-container-high transition-colors"
                onClick={handleEdit}
              >
                Edit Profile
              </button>
              <button
                type="button"
                className="bg-primary text-on-primary font-label-lg text-label-lg px-6 py-3 rounded-lg hover:opacity-90 transition-colors shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">share</span>
                Share Profile
              </button>
            </div>
          )}
        </div>
      </header>

      {editMode ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-8 max-w-xl mx-auto">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-md">Edit Profile</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-stack-md">
            <div className="flex flex-col gap-2">
              <label className="font-label-lg text-label-lg text-on-surface">Name</label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-3 bg-surface rounded-lg border border-surface-dim focus:border-primary focus:ring-2 focus:ring-primary-container/20 font-body-md text-body-md transition-all"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-lg text-label-lg text-on-surface">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 bg-surface rounded-lg border border-surface-dim focus:border-primary focus:ring-2 focus:ring-primary-container/20 font-body-md text-body-md transition-all"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            {message && (
              <div className={`font-body-md text-body-md ${message.includes('success') ? 'text-tertiary-container' : 'text-error'}`}>
                {message}
              </div>
            )}
            <div className="flex gap-stack-md mt-2">
              <button
                type="submit"
                className="bg-primary text-on-primary font-label-lg text-label-lg px-6 py-3 rounded-lg hover:opacity-90 transition-colors shadow-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                className="bg-surface-container text-on-surface font-label-lg text-label-lg px-6 py-3 rounded-lg hover:bg-surface-container-high transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-stack-lg">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 flex items-center gap-4 transition-transform duration-300 hover:shadow-level-2 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-tertiary-container/20 text-tertiary-container flex items-center justify-center">
                <span className="material-symbols-outlined">bookmark</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Saved Recipes</p>
                <p className="font-headline-md text-headline-md text-on-surface mt-1">{savedRecipes.length}</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 flex items-center gap-4 transition-transform duration-300 hover:shadow-level-2 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-secondary-container/20 text-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined">star</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Avg Rating</p>
                <p className="font-headline-md text-headline-md text-on-surface mt-1">4.8</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 flex items-center gap-4 transition-transform duration-300 hover:shadow-level-2 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined">restaurant_menu</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Cooked</p>
                <p className="font-headline-md text-headline-md text-on-surface mt-1">12</p>
              </div>
            </div>
          </section>

          {/* Recipe Collection Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">My Recipe Collection</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {savedRecipes.map((item, idx) => {
                const recipe = item.recipe || {};
                const recipeKey = recipe._id || recipe.id || recipe.dish_name;
                return (
                  <article
                    key={item._id || idx}
                    className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-level-1 flex flex-col transition-all duration-300 hover:shadow-level-2 hover:-translate-y-1"
                  >
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <span className="inline-flex w-fit items-center rounded-full bg-primary-container/10 text-primary px-3 py-1 font-label-sm text-label-sm font-semibold">
                        {recipe.type || 'Recipe'}
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                        {recipe.dish_name || recipe.name}
                      </h3>
                      <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-surface-variant text-on-surface-variant">
                        <div className="flex items-center gap-1 font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-sm">public</span>
                          {recipe.cuisine || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-sm">group</span>
                          {recipe.servings_scaled_to || recipe.servings || 'N/A'} servings
                        </div>
                        <div className="flex items-center gap-1 font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {recipe.time_to_prepare_minutes ? `${recipe.time_to_prepare_minutes} min` : 'N/A'}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-3 text-primary hover:text-primary-container font-label-lg text-label-lg flex items-center gap-1 transition-colors disabled:opacity-60"
                        onClick={() => handleRecipeSelected(recipe)}
                        disabled={loadingRecipe === recipeKey}
                      >
                        {loadingRecipe === recipeKey ? (
                          'Loading...'
                        ) : (
                          <>
                            View Recipe <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}

              {/* Empty State Card */}
              {savedRecipes.length === 0 && (
                <article className="bg-surface-container border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-6 min-h-[300px] col-span-1 md:col-span-2 lg:col-span-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center text-outline shadow-sm mb-4">
                    <span className="material-symbols-outlined text-3xl">note_add</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface text-center mb-2">Save More Recipes</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant text-center">
                    No saved recipes yet. Start exploring and save your favorites!
                  </p>
                </article>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default Profile;
