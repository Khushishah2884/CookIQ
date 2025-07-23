import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // Fetch saved recipes from localStorage or backend (example uses localStorage)
    const recipes = localStorage.getItem('savedRecipes');
    if (recipes) {
      setSavedRecipes(JSON.parse(recipes));
    }
  }, []);

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Not signed in.</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <section className="container" style={{ maxWidth: 400, margin: '60px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Profile</h2>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: 32,
              marginBottom: 12,
              textTransform: 'uppercase'
            }}
          >
            {user.name ? user.name.charAt(0) : 'U'}
          </span>
        </div>
        <div style={{ marginBottom: 12 }}><strong>Name:</strong> {user.name}</div>
        <div style={{ marginBottom: 12 }}><strong>Email:</strong> {user.email}</div>
        {/* Saved Recipes Section */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 12, textAlign: 'center' }}>Saved Recipes</h3>
          {savedRecipes.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888' }}>No saved recipes.</div>
          ) : (
            <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
              {savedRecipes.map((recipe, idx) => (
                <li key={idx} style={{ marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                  <strong>{recipe.title || `Recipe #${idx + 1}`}</strong>
                  {/* Add more recipe details if available */}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="btn btn-secondary w-full"
          style={{ marginTop: 24 }}
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </section>
  );
};

export default Profile;
