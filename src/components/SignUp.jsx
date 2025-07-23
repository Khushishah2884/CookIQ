import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        localStorage.setItem('user', JSON.stringify(data.user)); // Store user info
        navigate('/'); // Redirect to home page
      } else {
        setError(data.message || 'Sign up failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <section className="container" style={{ maxWidth: 400, margin: '60px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Sign Up</h2>
        {submitted ? (
          <div style={{ textAlign: 'center', color: '#667eea', fontWeight: 600 }}>
            Thank you for signing up!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            {error && (
              <div style={{ color: 'red', marginBottom: 8, textAlign: 'center' }}>{error}</div>
            )}
            <button className="btn btn-primary w-full" type="submit">
              Sign Up
            </button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span>Already have an account? </span>
              <Link to="/signin" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default SignUp;
