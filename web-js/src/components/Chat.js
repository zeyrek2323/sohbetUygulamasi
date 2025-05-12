import React, { useState } from 'react';

const CATEGORIES = ['Tarih', 'Bilim', 'Spor', 'Teknoloji', 'Müzik'];
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
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    setMessages([...messages, { user: username, text: input, category: selectedCategory }]);
    setInput('');
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ marginRight: 16, padding: 6, borderRadius: 4 }}
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span style={{ fontWeight: 'bold', fontSize: 18 }}>{selectedCategory} Sohbeti</span>
      </div>
      <div style={{ marginBottom: 10, color: '#555', fontSize: 14, minHeight: 40 }}>
        {CATEGORY_INFOS[selectedCategory]}
      </div>
      <div style={{ minHeight: 200, marginBottom: 10, border: '1px solid #eee', padding: 10, borderRadius: 4, background: '#fafafa', maxHeight: 250, overflowY: 'auto' }}>
        {messages.filter(msg => msg.category === selectedCategory).map((msg, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <b>{msg.user}:</b> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Mesajınızı yazın..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>Gönder</button>
      </form>
    </div>
  );
}

export default Chat; 