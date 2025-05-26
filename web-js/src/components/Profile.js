import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ fullName: '', avatar: '', bio: '', interests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // JWT token'ı localStorage'dan al
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.user);
        setForm({
          fullName: res.data.user.fullName || '',
          avatar: res.data.user.avatar || '',
          bio: res.data.user.bio || '',
          interests: res.data.user.interests || []
        });
        setError('');
      } catch (err) {
        setError('Profil bilgileri alınamadı.');
      }
      setLoading(false);
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInterestsChange = e => {
    setForm({ ...form, interests: e.target.value.split(',').map(s => s.trim()) });
  };

  const handleSave = async e => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const res = await axios.put(`${API_URL}/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.user);
      setEditMode(false);
      setSuccess('Profil başarıyla güncellendi.');
    } catch (err) {
      setError('Profil güncellenemedi.');
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!profile) return null;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #eee', padding: 32 }}>
      <h2>Profilim</h2>
      <img
        src={profile.avatar || '/default-avatar.png'}
        alt="Avatar"
        style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }}
      />
      <div><b>Kullanıcı adı:</b> {profile.username}</div>
      <div><b>Ad Soyad:</b> {editMode ? (
        <input name="fullName" value={form.fullName} onChange={handleChange} />
      ) : (
        profile.fullName || '-'
      )}</div>
      <div><b>Bio:</b> {editMode ? (
        <textarea name="bio" value={form.bio} onChange={handleChange} rows={2} />
      ) : (
        profile.bio || '-'
      )}</div>
      <div><b>İlgi Alanları:</b> {editMode ? (
        <input name="interests" value={form.interests.join(', ')} onChange={handleInterestsChange} placeholder="Virgülle ayırın" />
      ) : (
        profile.interests && profile.interests.length > 0 ? profile.interests.join(', ') : '-'
      )}</div>
      <div><b>Puan:</b> {profile.score || 0}</div>
      <div><b>Başarılar:</b> {profile.achievements && profile.achievements.length > 0 ? profile.achievements.join(', ') : '-'}</div>
      {editMode && (
        <div style={{ margin: '12px 0' }}>
          <input name="avatar" value={form.avatar} onChange={handleChange} placeholder="Avatar URL" style={{ width: '100%' }} />
          <small>Avatar için bir resim linki girebilirsiniz.</small>
        </div>
      )}
      <div style={{ marginTop: 18 }}>
        {editMode ? (
          <>
            <button onClick={handleSave} style={{ marginRight: 8 }}>Kaydet</button>
            <button onClick={() => setEditMode(false)}>İptal</button>
          </>
        ) : (
          <button onClick={() => setEditMode(true)}>Profili Düzenle</button>
        )}
      </div>
      {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </div>
  );
};

export default Profile; 