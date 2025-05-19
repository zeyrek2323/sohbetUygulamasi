import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

const BACKEND_URL = 'http://localhost:5000';
const App = () => {
  const [user, setUser] = useState(null);

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      throw err;
    }
  };

  const handleRegister = async (credentials) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: credentials.username, password: credentials.password }),
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {user && (
          <nav style={{ background: 'linear-gradient(90deg, #8ec5fc 0%, #e0c3fc 100%)', boxShadow: '0 2px 8px rgba(44,62,80,0.08)', padding: 0 }}>
            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64, padding: '0 32px' }}>
              <Link to="/chat" style={{ textDecoration: 'none', fontSize: 28, fontWeight: 800, color: '#4b2e83', letterSpacing: 1 }}>
                Chat App
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <span style={{ color: '#333', fontSize: 18, fontWeight: 600, background: '#fff', padding: '7px 18px', borderRadius: 16, boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}>
                  👋 Hoş geldin, <b>{user.username}</b>
                </span>
                <button
                  onClick={handleLogout}
                  style={{ background: 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)', color: '#fff', border: 'none', borderRadius: 16, padding: '10px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,88,88,0.08)', transition: 'background 0.2s' }}
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </nav>
        )}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/chat" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={user ? <Navigate to="/chat" replace /> : <Register onRegister={handleRegister} />} />
            <Route path="/chat" element={user ? <Chat username={user.username} /> : <Navigate to="/login" replace />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
