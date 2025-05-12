import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onLogin({ username, password });
      navigate('/chat');
    } catch (err) {
      setError(err.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 350, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#222', textAlign: 'center' }}>Hoş Geldiniz</h2>
        <p style={{ color: '#888', fontSize: 16, marginBottom: 28, textAlign: 'center' }}>Hesabınıza giriş yapın</p>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="username" style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#333' }}>Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 16, outline: 'none', background: '#fafbfc' }}
              required
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="password" style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#333' }}>Şifre</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 16, outline: 'none', background: '#fafbfc' }}
              required
            />
          </div>
          {error && (
            <div style={{ background: '#ffeaea', color: '#d32f2f', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 15, textAlign: 'center' }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', padding: '13px 0', borderRadius: 10, background: '#2196f3', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', marginBottom: 18, cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(33,150,243,0.08)', transition: 'background 0.2s' }}
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div style={{ marginTop: 6 }}>
          <span style={{ color: '#888', fontSize: 15 }}>Hesabınız yok mu? </span>
          <Link to="/register" style={{ color: '#2196f3', fontWeight: 600, textDecoration: 'none' }}>Üye olun</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 