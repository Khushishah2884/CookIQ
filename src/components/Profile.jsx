import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onModuleChange }) => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [message, setMessage] = useState('');
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

  return (
    <section className="container" style={{ maxWidth: 400, margin: '60px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Profile</h2>
        {editMode ? (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
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
            {message && (
              <div style={{ color: message.includes('success') ? 'green' : 'red', textAlign: 'center', marginBottom: 12 }}>
                {message}
              </div>
            )}
            <button className="btn btn-primary w-full" type="submit">Save</button>
            <button className="btn btn-secondary w-full" type="button" style={{ marginTop: 8 }} onClick={handleCancel}>Cancel</button>
          </form>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <strong>Name:</strong> <span>{user.name}</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Email:</strong> <span>{user.email}</span>
            </div>
            {message && (
              <div style={{ color: 'red', textAlign: 'center', marginBottom: 12 }}>
                {message}
              </div>
            )}
            <button className="btn btn-primary w-full" onClick={handleEdit}>Edit</button>
          </>
        )}
      </div>
    </section>
  );
};

export default Profile;
