import React, { useState } from 'react';

const CATEGORY_BACKGROUNDS = {
  'Tarih': 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=900&q=80', // parşömen
  'Bilim': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80', // laboratuvar cam tüpler
  'Spor': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80', // koşan atletler
  'Teknoloji': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80', // devre kartı
  'Müzik': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80', // gitar
};

const CATEGORIES = [
  { name: 'Tarih', color: '#f39c12', icon: '📜' },
  { name: 'Bilim', color: '#27ae60', icon: '🔬' },
  { name: 'Spor', color: '#2980b9', icon: '🏆' },
  { name: 'Teknoloji', color: '#8e44ad', icon: '💻' },
  { name: 'Müzik', color: '#e74c3c', icon: '🎵' },
];
const CATEGORY_INFOS = {
  'Tarih': 'Tarih, geçmişte yaşanan olayları inceleyen bilim dalıdır. İnsanlık tarihinin önemli dönüm noktalarını ve uygarlıkların gelişimini kapsar.',
  'Bilim': 'Bilim, evreni ve doğayı anlamak için yapılan sistematik çalışmalardır. Deney, gözlem ve mantık yoluyla bilgi üretir.',
  'Spor': 'Spor, bedensel ve zihinsel gelişimi destekleyen, rekabet ve eğlence amaçlı yapılan fiziksel aktivitelerdir.',
  'Teknoloji': 'Teknoloji, insan hayatını kolaylaştıran araç, gereç ve yöntemlerin geliştirilmesidir. Günümüzde hızla gelişmektedir.',
  'Müzik': 'Müzik, sesin ritim, melodi ve armoniyle birleşerek oluşturduğu sanattır. Kültürlerin önemli bir parçasıdır.'
};

function Chat({ username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryScreen, setCategoryScreen] = useState('main'); // 'main', 'chat', 'quiz', 'qa'

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '' || !selectedCategory) return;
    setMessages([...messages, { user: username, text: input, category: selectedCategory.name }]);
    setInput('');
  };

  if (!selectedCategory) {
    return (
      <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 8px 32px rgba(44,62,80,0.08)' }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#222', marginBottom: 10, textAlign: 'center', letterSpacing: 1 }}>Hoş Geldin{username ? `, ${username}` : ''}!</h1>
        <p style={{ color: '#555', fontSize: 20, textAlign: 'center', marginBottom: 36 }}>Bir kategori seçerek sohbete katılabilirsin:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'center' }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.name}
              onClick={() => { setSelectedCategory(cat); setCategoryScreen('main'); }}
              style={{
                cursor: 'pointer',
                background: cat.color,
                color: '#fff',
                borderRadius: 18,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                width: 180,
                minHeight: 170,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
                transition: 'transform 0.15s',
                userSelect: 'none',
                padding: 18,
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: 48, marginBottom: 12 }}>{cat.icon}</span>
              {cat.name}
              <div style={{ fontWeight: 400, fontSize: 14, marginTop: 10, opacity: 0.9, textAlign: 'center' }}>{CATEGORY_INFOS[cat.name]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Kategori içi anasayfa (bilgi kartları ve 3 seçenek)
  if (categoryScreen === 'main') {
    return (
      <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 8px 32px rgba(44,62,80,0.08)' }}>
        <button onClick={() => setSelectedCategory(null)} style={{ marginBottom: 24, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>← Kategoriler</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <span style={{ fontSize: 38 }}>{selectedCategory.icon}</span>
          <span style={{ fontWeight: 800, fontSize: 32, color: selectedCategory.color }}>{selectedCategory.name}</span>
        </div>
        <div style={{ color: '#444', fontSize: 18, marginBottom: 32, background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}>
          {CATEGORY_INFOS[selectedCategory.name]}
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 18 }}>
          <button onClick={() => setCategoryScreen('quiz')} style={{ flex: 1, background: '#f39c12', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 14, padding: '28px 0', cursor: 'pointer', boxShadow: '0 2px 8px rgba(243,156,18,0.10)', transition: 'background 0.2s' }}>Mini Quiz</button>
          <button onClick={() => setCategoryScreen('chat')} style={{ flex: 1, background: selectedCategory.color, color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 14, padding: '28px 0', cursor: 'pointer', boxShadow: `0 2px 8px ${selectedCategory.color}22`, transition: 'background 0.2s' }}>Sohbet</button>
          <button onClick={() => setCategoryScreen('qa')} style={{ flex: 1, background: '#27ae60', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 14, padding: '28px 0', cursor: 'pointer', boxShadow: '0 2px 8px rgba(39,174,96,0.10)', transition: 'background 0.2s' }}>Soru-Cevap</button>
        </div>
      </div>
    );
  }

  // Sohbet ekranı (görseller ve mevcut sistem korunuyor)
  if (categoryScreen === 'chat') {
    const bgUrl = CATEGORY_BACKGROUNDS[selectedCategory.name];
    return (
      <div style={{
        maxWidth: 700,
        margin: '40px auto',
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 500,
        boxShadow: '0 8px 32px rgba(44,62,80,0.10)',
        background: `url(${bgUrl}) center/cover no-repeat`
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(30,30,40,0.60)',
          zIndex: 1
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
            <button onClick={() => setCategoryScreen('main')} style={{ marginRight: 16, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>← {selectedCategory.name} Anasayfa</button>
            <span style={{ fontWeight: 'bold', fontSize: 26, color: '#fff', letterSpacing: 1 }}>{selectedCategory.icon} {selectedCategory.name} Sohbeti</span>
          </div>
          <div style={{ marginBottom: 18, color: '#fff', fontSize: 16, minHeight: 40, opacity: 0.92 }}>
            {CATEGORY_INFOS[selectedCategory.name]}
          </div>
          <div style={{ minHeight: 200, marginBottom: 18, border: '1px solid #fff2', padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.10)', maxHeight: 250, overflowY: 'auto' }}>
            {messages.filter(msg => msg.category === selectedCategory.name).map((msg, i) => (
              <div key={i} style={{ marginBottom: 8, color: '#fff' }}>
                <b>{msg.user}:</b> {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', fontSize: 16, background: 'rgba(255,255,255,0.85)' }}
            />
            <button type="submit" style={{ padding: '12px 24px', borderRadius: 8, background: '#27ae60', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}>Gönder</button>
          </form>
        </div>
      </div>
    );
  }

  // Mini Quiz ve Soru-Cevap için placeholder (şimdilik)
  if (categoryScreen === 'quiz') {
    return (
      <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 8px 32px rgba(44,62,80,0.08)' }}>
        <button onClick={() => setCategoryScreen('main')} style={{ marginBottom: 24, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>← {selectedCategory.name} Anasayfa</button>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: selectedCategory.color, marginBottom: 18 }}>{selectedCategory.icon} Mini Quiz</h2>
        <div style={{ color: '#444', fontSize: 18, background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}>
          Bu alanda {selectedCategory.name} ile ilgili mini quiz olacak (yakında).
        </div>
      </div>
    );
  }
  if (categoryScreen === 'qa') {
    return (
      <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 8px 32px rgba(44,62,80,0.08)' }}>
        <button onClick={() => setCategoryScreen('main')} style={{ marginBottom: 24, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>← {selectedCategory.name} Anasayfa</button>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: selectedCategory.color, marginBottom: 18 }}>{selectedCategory.icon} Soru-Cevap</h2>
        <div style={{ color: '#444', fontSize: 18, background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}>
          Bu alanda {selectedCategory.name} ile ilgili soru-cevap bölümü olacak (yakında).
        </div>
      </div>
    );
  }
}

export default Chat; 