import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import SoruCevap from './SoruCevap';

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
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const ws = useRef(null);
  const typingTimeout = useRef(null);

  // Quiz ile ilgili state'ler (KOŞULSUZ)
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [availableTests, setAvailableTests] = useState([]);

  // Bilgi kartı state'i
  const [acikKart, setAcikKart] = useState(null);

  useEffect(() => {
    // WebSocket bağlantısını kur
    ws.current = new WebSocket('ws://localhost:5000');

    ws.current.onopen = () => {
      console.log('WebSocket bağlantısı kuruldu');
      // Kullanıcıyı online olarak işaretle
      ws.current.send(JSON.stringify({
        type: 'user_join',
        username: username
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          setMessages(prev => [...prev, data.message]);
          break;
        case 'typing':
          setIsTyping(data.isTyping);
          break;
        case 'online_users':
          setOnlineUsers(data.users);
          break;
        default:
          console.log('Bilinmeyen mesaj tipi:', data.type);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket bağlantısı kapandı');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [username]);

  // Kategori seçildiğinde geçmiş mesajları çek
  useEffect(() => {
    if (selectedCategory) {
      axios.get(`http://localhost:5000/api/messages/${selectedCategory.name}`)
        .then(res => {
          setMessages(res.data);
        })
        .catch(err => {
          setMessages([]);
        });
    }
  }, [selectedCategory]);

  // Test seçimi veya kategori değiştiğinde quiz state'lerini sıfırla
  useEffect(() => {
    setQuizzes([]);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizResults(null);
    setCurrentQuestion(0);
    setSelectedTest(null);
    setAvailableTests([]);
  }, [selectedCategory, categoryScreen]);

  // Seçili test değiştiğinde soruları getir
  useEffect(() => {
    if (categoryScreen === 'quiz' && selectedCategory && selectedTest) {
      fetch(`http://localhost:5000/api/quizzes/${selectedCategory.name}/${selectedTest}`)
        .then(res => res.json())
        .then(data => setQuizzes(data))
        .catch(err => console.error('Quiz soruları getirilemedi:', err));
    }
  }, [categoryScreen, selectedCategory, selectedTest]);

  // Kategori seçildiğinde mevcut testNo'ları çek
  useEffect(() => {
    if (categoryScreen === 'quiz' && selectedCategory) {
      fetch(`http://localhost:5000/api/quizzes/${selectedCategory.name}`)
        .then(res => res.json())
        .then(data => {
          // testNo'ları benzersiz ve sıralı şekilde çıkar
          const testNumbers = Array.from(new Set(data.map(q => q.testNo))).sort((a, b) => a - b);
          setAvailableTests(testNumbers);
        })
        .catch(err => setAvailableTests([]));
    }
  }, [categoryScreen, selectedCategory]);

  // Test seçimi sıfırlandığında test listesini tekrar çek
  useEffect(() => {
    if (categoryScreen === 'quiz' && selectedCategory && selectedTest === null) {
      fetch(`http://localhost:5000/api/quizzes/${selectedCategory.name}`)
        .then(res => res.json())
        .then(data => {
          const testNumbers = Array.from(new Set(data.map(q => q.testNo))).sort((a, b) => a - b);
          setAvailableTests(testNumbers);
        })
        .catch(err => setAvailableTests([]));
    }
  }, [categoryScreen, selectedCategory, selectedTest]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '' || !selectedCategory) return;

    const message = {
      user: username,
      text: input,
      category: selectedCategory.name,
      timestamp: new Date().toISOString()
    };

    // WebSocket üzerinden mesajı gönder
    ws.current.send(JSON.stringify({
      type: 'message',
      message: message
    }));

    setInput('');
  };

  const handleTyping = () => {
    // Yazıyor... durumunu gönder
    ws.current.send(JSON.stringify({
      type: 'typing',
      username: username,
      isTyping: true
    }));

    // Önceki timeout'u temizle
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // 2 saniye sonra yazıyor... durumunu kaldır
    typingTimeout.current = setTimeout(() => {
      ws.current.send(JSON.stringify({
        type: 'typing',
        username: username,
        isTyping: false
      }));
    }, 2000);
  };

  // Quiz fonksiyonları (KOŞULSUZ TANIMLANIR)
  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    const answers = Object.entries(selectedAnswers).map(([quizId, selectedOption]) => ({
      quizId,
      selectedOption
    }));

    try {
      // Önce cevapları kontrol et
      const checkResponse = await fetch('http://localhost:5000/api/quizzes/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const checkResults = await checkResponse.json();

      // Sonra AI analizi yap
      const analysisResponse = await fetch('http://localhost:5000/api/quizzes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers,
          category: selectedCategory.name,
          testNo: selectedTest
        })
      });
      const analysisResults = await analysisResponse.json();

      // Sonuçları birleştir
      setQuizResults({
        ...checkResults,
        aiAnalysis: analysisResults.aiAnalysis
      });
      setShowResults(true);
    } catch (err) {
      console.error('Cevaplar gönderilemedi:', err);
    }
  };

  if (!selectedCategory) {
    return (
      <div style={{
        maxWidth: 1400,
        margin: '40px auto',
        padding: '0 8px',
        display: 'flex',
        flexDirection: 'row',
        gap: 64,
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
        {/* Tanıtım Kutusu */}
        <div style={{
          background: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(44,62,80,0.10)',
          padding: '48px 40px 40px 40px',
          minWidth: 420,
          maxWidth: 600,
          flex: '1 1 480px',
          textAlign: 'left',
          color: '#222',
        }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 18, letterSpacing: 1, color: '#4b2e83', textAlign: 'left' }}>Sohbet Uygulamasına Hoş Geldin!</h1>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 18, color: '#333', textAlign: 'left' }}>
            Bu platformda seni neler bekliyor?
          </div>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            fontSize: 18,
            fontWeight: 500,
          }}>
            <li style={{ background: '#fff', borderRadius: 14, padding: '16px 22px', boxShadow: '0 2px 8px #e3e3e3', borderLeft: '6px solid #43cea2', textAlign: 'left' }}>
              🚀 <b>Yapay Zeka Destekli Mini Quiz:</b> Çözdüğün testlerin analizini yapay zeka ile anında öğren, güçlü ve gelişime açık yönlerini keşfet!
            </li>
            <li style={{ background: '#fff', borderRadius: 14, padding: '16px 22px', boxShadow: '0 2px 8px #e3e3e3', borderLeft: '6px solid #8e44ad', textAlign: 'left' }}>
              🤖 <b>Akıllı Soru-Cevap:</b> Sohbet sırasında sorduğun sorulara, yapay zeka tarafından hızlı ve doğru yanıtlar al!
            </li>
            <li style={{ background: '#fff', borderRadius: 14, padding: '16px 22px', boxShadow: '0 2px 8px #e3e3e3', borderLeft: '6px solid #f39c12', textAlign: 'left' }}>
              💬 <b>Farklı Kategorilerde Sohbet:</b> Tarih, Bilim, Spor, Teknoloji ve Müzik gibi ilgi alanlarında yeni insanlarla tanış, bilgi paylaş!
            </li>
            <li style={{ background: '#fff', borderRadius: 14, padding: '16px 22px', boxShadow: '0 2px 8px #e3e3e3', borderLeft: '6px solid #2980b9', textAlign: 'left' }}>
              🏆 <b>Kendini Test Et:</b> Her kategoride onlarca test ile bilgini sınayabilir, başarılarını arkadaşlarınla paylaşabilirsin!
            </li>
            <li style={{ background: '#fff', borderRadius: 14, padding: '16px 22px', boxShadow: '0 2px 8px #e3e3e3', borderLeft: '6px solid #e74c3c', textAlign: 'left' }}>
              🌐 <b>Modern ve Kullanıcı Dostu Tasarım:</b> Hem web hem mobilde kolay kullanım, hızlı erişim ve eğlenceli bir deneyim!
            </li>
          </ul>

          {/* Nasıl Çalışır Kutusu */}
          <div style={{
            marginTop: 40,
            background: 'linear-gradient(120deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 18,
            boxShadow: '0 4px 16px rgba(44,62,80,0.08)',
            padding: '28px 24px 24px 24px',
            color: '#222',
          }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 18, color: '#4b2e83', letterSpacing: 1 }}>Nasıl Çalışır?</h2>
            <ol style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              fontSize: 18,
              fontWeight: 500,
            }}>
              <li><span style={{fontSize: 22, marginRight: 10}}>📂</span><b>Kategori Seç:</b> İlgi alanına göre bir sohbet kategorisi seç.</li>
              <li><span style={{fontSize: 22, marginRight: 10}}>💬</span><b>Sohbete Katıl:</b> Diğer kullanıcılarla anında sohbet etmeye başla.</li>
              <li><span style={{fontSize: 22, marginRight: 10}}>📝</span><b>Mini Quiz Çöz:</b> Kategorideki Mini Quiz'leri çöz, yapay zeka analizini gör.</li>
              <li><span style={{fontSize: 22, marginRight: 10}}>🤖</span><b>Soru Sor:</b> Soru-Cevap bölümünde yapay zekaya istediğini sor.</li>
              <li><span style={{fontSize: 22, marginRight: 10}}>👤</span><b>Profilini Takip Et:</b> Başarılarını ve gelişimini profilinden izle.</li>
            </ol>
          </div>
        </div>
        {/* Kategori Kartları */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 36,
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: 0,
          marginBottom: 0,
          minWidth: 260,
          flex: '0 1 320px',
        }}>
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
                width: 260,
                minHeight: 190,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 700,
                transition: 'transform 0.15s',
                userSelect: 'none',
                padding: 24,
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: 54, marginBottom: 16 }}>{cat.icon}</span>
              {cat.name}
              <div style={{ fontWeight: 400, fontSize: 16, marginTop: 14, opacity: 0.9, textAlign: 'center' }}>{CATEGORY_INFOS[cat.name]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Kategori içi anasayfa (bilgi kartları ve 3 seçenek)
  if (categoryScreen === 'main') {
    // Bilgi kartı verisi (Tarih ve Bilim için)
    const tarihOlaylari = {
      dunya: [
        { title: "Yazının İcadı (MÖ 3200, Sümerler)", desc: "İnsanlık tarihindeki en büyük dönüm noktalarından biridir. Sümerler'in çivi yazısını bulmasıyla birlikte bilgi artık sözlü değil, kalıcı biçimde aktarılmaya başlandı. Devlet kayıtları, ticaret belgeleri, yasalar ve dini metinler yazılı hale geldi. Tarihin başlangıcı da bu olayla tanımlanır, çünkü yazılı belgelerle geçmişin kaydı tutulmaya başlanmıştır." },
        { title: "Roma İmparatorluğu'nun Yıkılışı (MS 476)", desc: "Batı Roma'nın çökmesiyle Avrupa'da merkezi otorite parçalandı ve 'Karanlık Çağ' olarak bilinen Orta Çağ başladı. Feodal sistem gelişti, şehirler küçüldü, bilim ve sanat durağanlaştı. Bu çöküş, Avrupa'nın siyasi ve kültürel yapısını yüzyıllarca etkiledi. Aynı zamanda kilisenin gücü arttı ve modern Avrupa'nın temelleri bu dönemde atıldı." },
        { title: "İstanbul'un Fethi (1453, Osmanlılar)", desc: "Fatih Sultan Mehmet'in İstanbul'u almasıyla Bizans İmparatorluğu sona erdi. Bu fetihle Orta Çağ kapandı, Yeni Çağ başladı. Aynı zamanda Osmanlı, Avrupa ile Asya arasında büyük bir güç haline geldi. Bu olay, Avrupalıların yeni ticaret yolları aramasına neden olarak Coğrafi Keşifler'in başlamasını da tetikledi." },
        { title: "Sanayi Devrimi (18. yüzyıl sonları, İngiltere)", desc: "Buhar gücünün üretime entegre edilmesiyle üretim hızı ve kapasitesi olağanüstü arttı. Tarım toplumu yerini sanayi toplumuna bıraktı. Kentleşme hızlandı, işçi sınıfı oluştu ve kapitalist sistem güç kazandı. Sanayi Devrimi, modern dünyanın temel ekonomik, sosyal ve teknolojik yapısını şekillendirdi." },
        { title: "II. Dünya Savaşı (1939–1945)", desc: "70 milyondan fazla insanın hayatını kaybettiği bu küresel savaş, sadece askeri değil, siyasi ve teknolojik anlamda da büyük değişimlere yol açtı. Nazizm'in yenilgisiyle demokrasi ve insan hakları kavramları güç kazandı. Savaş sonrası iki süper güç (ABD ve SSCB) ortaya çıktı, Soğuk Savaş dönemi başladı. Aynı zamanda BM kuruldu, modern uluslararası düzenin temeli atıldı." }
      ],
      turkiye: [
        { title: "Malazgirt Meydan Muharebesi (1071)", desc: "Selçuklu Sultanı Alp Arslan, Bizans İmparatoru Romen Diyojen'i büyük bir bozguna uğrattı. Bu zaferle Anadolu'nun kapıları Türklere açıldı. Savaş sonrasında Türk boyları Anadolu'ya akın etmeye başladı, Anadolu zamanla bir Türk yurdu haline geldi. Türkiye'nin tarihsel temeli bu zaferle atıldı." },
        { title: "Osmanlı Devleti'nin Kuruluşu (1299)", desc: "Osman Gazi'nin Söğüt'te küçük bir beylik olarak başlattığı Osmanlı Devleti, kısa sürede büyük bir imparatorluğa dönüştü. 600 yılı aşkın süre boyunca üç kıtada hüküm süren Osmanlı, İslam dünyasının lideri haline geldi. Türk-İslam sentezinin oluştuğu bu dönemde hukuk, mimari, edebiyat ve diplomasi gelişti." },
        { title: "İstanbul'un Fethi (1453)", desc: "Fatih Sultan Mehmet'in liderliğinde Osmanlı ordusu, Bizans İmparatorluğu'na son vererek İstanbul'u fethetti. Bu olay sadece çağ değiştirici bir zafer değil, aynı zamanda Osmanlı'nın bir dünya gücü olduğunu ilan etmesidir. İstanbul, imparatorluğun başkenti olmuş, bilim, sanat ve kültürün merkezi haline gelmiştir." },
        { title: "Kurtuluş Savaşı (1919–1923)", desc: "Mondros Ateşkes Antlaşması sonrası Anadolu işgal edilince Mustafa Kemal Paşa önderliğinde başlatılan milli direniş hareketi, işgalci güçlere karşı tam bağımsızlık hedefiyle yürütüldü. Sakarya, Dumlupınar gibi savaşlarla başarı kazanıldı. Sonuçta Türkiye Cumhuriyeti'nin temelleri atıldı ve Türk milleti bağımsızlığını yeniden kazandı." },
        { title: "Türkiye Cumhuriyeti'nin Kuruluşu (1923)", desc: "29 Ekim 1923'te Mustafa Kemal Atatürk'ün önderliğinde cumhuriyet ilan edildi. Saltanat kaldırıldı, halk egemenliği esas alındı. Laiklik, hukuk reformları, eğitim ve kadın haklarında yapılan köklü değişikliklerle Türkiye modern bir ulus-devlet haline geldi. Bu dönüşüm, Türk milletinin çağdaş dünyaya entegre olmasının temelini oluşturdu." }
      ]
    };
    const bilimOlaylari = {
      dunya: [
        { title: "Kopernik'in Güneş Merkezli Evren Modeli (1543)", desc: "Nicolaus Copernicus, De Revolutionibus Orbium Coelestium adlı eseriyle, o dönemin kutsal kabul edilen 'Dünya merkezlidir' anlayışını yıktı. Güneş'in merkeze alındığı bu model, bilimsel düşüncede devrim yarattı. Bu olay, Bilimsel Devrim'in başlangıcı kabul edilir ve modern astronominin temelini oluşturur." },
        { title: "Newton'un Hareket ve Evrensel Çekim Yasaları (1687)", desc: "Isaac Newton'un Principia Mathematica adlı eseri, fizik biliminin kurucu taşıdır. Hareket yasaları ve kütleçekimi teorisiyle doğa olayları artık matematiksel olarak açıklanabiliyordu. Bu çalışma, mühendislikten gökbilime kadar pek çok alanda yüzlerce yıl etkisini sürdürdü." },
        { title: "Darwin'in Evrim Teorisi (1859)", desc: "Charles Darwin, Türlerin Kökeni adlı kitabında doğal seçilim yoluyla evrim fikrini ortaya koydu. Bu teori, biyoloji bilimine yeni bir temel kazandırdı. Canlıların değişebilir, çevreye uyum sağlayabilir ve ortak atalara sahip olduğu anlayışı; genetik, paleontoloji ve ekoloji gibi birçok alanın gelişmesini sağladı." },
        { title: "Einstein'ın Görelilik Teorileri (1905–1915)", desc: "Albert Einstein'ın özel ve genel görelilik kuramları, zaman, uzay, kütle ve enerji kavramlarını tamamen dönüştürdü. Newton fiziğinin yetersiz kaldığı alanlara çözüm getirdi. Bu teoriler, modern fizik, kozmoloji ve GPS teknolojileri gibi günlük uygulamaların temelini oluşturdu." },
        { title: "DNA'nın Yapısının Keşfi (1953)", desc: "James Watson ve Francis Crick, DNA'nın çift sarmal yapısını ortaya koyarak moleküler biyoloji çağını başlattı. Bu keşif sayesinde genetik bilimi büyük bir hızla ilerledi. Kalıtsal hastalıkların anlaşılması, genetik mühendisliği, biyoteknoloji ve hatta adli tıp bu temel üzerine inşa edildi." }
      ],
      turkiye: [
        { title: "Uluğ Bey'in Rasathaneyi Kurması (1420, Semerkand)", desc: "Timur'un torunu ve aynı zamanda bir matematikçi/astronom olan Uluğ Bey, Semerkand'da devrin en ileri rasathanesini kurdu. Burada yaptığı gözlemlerle yıldızların konumlarını son derece hassas biçimde ölçtü. Hazırladığı 'Zîc-i Uluğ Bey' adlı yıldız kataloğu, yüzyıllar boyunca hem Doğu'da hem Batı'da kullanıldı." },
        { title: "Katip Çelebi'nin Bilimsel Eserleri (17. yüzyıl)", desc: "Osmanlı'nın önemli düşünürlerinden olan Katip Çelebi, tarih, coğrafya ve bibliyografya alanında bilimsel yöntemler kullanarak eserler verdi. Keşfü'z-Zünûn adlı kitabında 14 binden fazla eseri listelemesi, bilgiye sistemli bir yaklaşımı gösterir. Cihannüma ise Osmanlı'nın ilk bilimsel haritalarını içeren coğrafya kitabıdır." },
        { title: "Mühendishane-i Bahrî-i Hümayun'un Kuruluşu (1773)", desc: "III. Mustafa döneminde kurulan bu okul, Osmanlı'da Batı tarzı modern mühendislik eğitiminin başlangıcı oldu. Bugünkü İstanbul Teknik Üniversitesi'nin temeli sayılır. Bu kurum, bilimsel ve teknik bilgiye dayalı yeni bir eğitim anlayışının Osmanlı'ya girişini sağladı." },
        { title: "Cumhuriyet Döneminde Üniversite Reformu (1933)", desc: "Atatürk'ün öncülüğünde yapılan bu reformla Darülfünun kapatıldı ve modern anlamda İstanbul Üniversitesi kuruldu. Yurt dışından gelen bilim insanları sayesinde çağdaş bilimsel yöntemler benimsendi. Türkiye'de modern tıp, hukuk, sosyal bilimler ve temel bilimlerin temelleri bu reformla atıldı." },
        { title: "TÜBİTAK'ın Kurulması (1963)", desc: "Türkiye Bilimsel ve Teknolojik Araştırma Kurumu'nun (TÜBİTAK) kurulması, bilimsel araştırma ve AR-GE faaliyetlerinin kurumsal ve sistematik biçimde desteklenmesini sağladı. Yüksek teknolojili projeler, bilimsel yayınlar ve burs programlarıyla Türkiye'de bilimsel üretimin artmasına öncülük etti." }
      ]
    };
    const sporOlaylari = {
      dunya: [
        { title: "Modern Olimpiyat Oyunlarının Başlatılması (1896)", desc: "Antik Yunan'da yapılan oyunlar, 1500 yıl aradan sonra Fransız eğitimci Pierre de Coubertin'in öncülüğünde Atina'da yeniden başlatıldı. Sporun uluslararası bir barış ve kardeşlik sembolü haline gelmesini sağladı. Olimpiyatlar, zamanla dünyanın en prestijli spor organizasyonuna dönüştü ve farklı branşlarda milyonlarca sporcunun hedefi haline geldi." },
        { title: "FIFA'nın Kurulması ve Dünya Kupası'nın Başlaması (1904–1930)", desc: "FIFA, 1904'te futbolu uluslararası düzende yönetmek için kuruldu. 1930'da ilk FIFA Dünya Kupası Uruguay'da düzenlendi. Bu turnuva, futbolun küresel ölçekte yayılmasını sağladı ve günümüzde milyarlarca insanı ekran başına toplayan bir spor şöleni haline geldi." },
        { title: "Jesse Owens'ın Berlin Olimpiyatları'ndaki Zaferi (1936)", desc: "Nazi Almanyası'nın ev sahipliğindeki Berlin Olimpiyatları'nda siyahi Amerikalı atlet Jesse Owens, 4 altın madalya kazanarak Adolf Hitler'in 'üstün ırk' tezine meydan okudu. Bu olay, sporun sadece fiziksel değil, sosyal ve politik güç olduğunu tüm dünyaya gösterdi." },
        { title: "NBA ve Michael Jordan'ın Küresel Etkisi (1990'lar)", desc: "Michael Jordan, sadece basketbolun değil, sporun bir dünya markasına dönüşmesinin simgesi oldu. Onun önderliğinde NBA, ABD sınırlarını aşarak Avrupa, Asya ve Afrika'da milyonlarca taraftar kazandı. Sporun ticarileşmesi ve medya ile birleşmesi bu dönemde hızlandı." },
        { title: "Teknolojinin Spora Girişi – VAR ve Dijital Devrim (2010'lar)", desc: "Futbol başta olmak üzere birçok branşta video teknolojileri hakem kararlarını desteklemek için kullanılmaya başlandı. 2018 Dünya Kupası'nda VAR (Video Yardımcı Hakem) sisteminin resmen kullanılması, sporun dijitalleşmesinin simgesidir. Bu gelişme, adalet, hız ve şeffaflık tartışmalarını da beraberinde getirdi." }
      ],
      turkiye: [
        { title: "Yaşar Doğu'nun Olimpiyat Zaferi (1948, Londra)", desc: "Türk güreşinin efsane ismi Yaşar Doğu, 1948 Olimpiyatları'nda serbest stil güreşte altın madalya kazandı. Sadece bir şampiyonluk değil, Türk güreşinin dünya sahnesinde saygı görmesinin başlangıcı oldu. Onun başarısı, Türkiye'nin spora milli bir gurur ve kimlik olarak bakmasını sağladı." },
        { title: "Naim Süleymanoğlu'nun Olimpiyat Efsanesi (1988, Seul)", desc: "'Cep Herkülü' lakaplı Naim, 1988 Seul Olimpiyatları'nda sadece altın madalya kazanmakla kalmadı, aynı anda 3 dünya rekoru kırarak tarihe geçti. Türk bayrağını uluslararası arenada zirveye taşıdı. Onun başarıları, Türkiye'de olimpik branşlara olan ilgiyi artırdı." },
        { title: "Galatasaray'ın UEFA Kupası Şampiyonluğu (2000)", desc: "Galatasaray, Avrupa futbolunun önemli organizasyonlarından UEFA Kupası'nı kazanarak Türkiye'ye ilk büyük Avrupa kupasını getirdi. Arsenal karşısında kazanılan bu zafer, Türk kulüp futbolunun Avrupa'daki gücünü tescilledi. Aynı yıl Süper Kupa da kazanıldı." },
        { title: "Milli Futbol Takımı'nın Dünya Kupası 3.lüğü (2002, Güney Kore – Japonya)", desc: "Türkiye, 1954'ten sonra ilk kez Dünya Kupası'na katıldı ve 3. olarak tarihi bir başarıya imza attı. Rüştü Reçber, İlhan Mansız, Hakan Şükür gibi oyuncular dünya çapında tanındı. Bu başarı, futbolun Türkiye'de daha geniş kitlelere ulaşmasını sağladı." },
        { title: "2020 Tokyo Olimpiyatları'nda 13 Madalya ile Rekor", desc: "Türkiye, 2021'de (COVID-19 nedeniyle ertelenen) Tokyo Olimpiyatları'nda tarihindeki en yüksek madalya sayısına ulaştı. Kadın sporcuların başarısı dikkat çekiciydi. Busenaz Sürmeneli ve Buse Naz Çakıroğlu gibi isimler, yeni bir sporcu nesli için ilham kaynağı oldu." }
      ]
    };
    const teknolojiOlaylari = {
      dunya: [
        { title: "Matbaanın İcadı – Johannes Gutenberg (1450'ler)", desc: "Almanya'da Gutenberg'in geliştirdiği hareketli metal harflerle baskı sistemi, insanlık tarihinin en büyük devrimlerinden birini başlattı. Bilgiye erişim hızlandı, kitaplar yaygınlaştı ve bilimsel devrimlerin önü açıldı. Bu icat, Rönesans'tan modern eğitime kadar sayısız gelişmenin temelini attı." },
        { title: "Sanayi Devrimi ve Buhar Makinesi (18. yüzyıl sonu)", desc: "James Watt'ın buhar makinesini geliştirmesiyle üretim mekanize hale geldi. El emeği yerini makineli üretime bıraktı. Tekstil, ulaşım (trenler), maden ve enerji sektörleri köklü biçimde değişti. Teknoloji artık üretim ve ekonomik büyümenin kalbine yerleşti." },
        { title: "Elektriğin Yaygınlaşması ve Edison'un Ampulü (1879)", desc: "Thomas Edison'un ticari anlamda kullanılabilir ampulü geliştirmesiyle elektrik gündelik yaşama girdi. Şehirler aydınlandı, fabrikalar gece de çalışmaya başladı. Elektrik, modern yaşamın omurgası haline geldi ve teknolojik altyapının temel taşı oldu." },
        { title: "Bilgisayarın Doğuşu ve İnternetin Gelişimi (20. yüzyıl)", desc: "1940'larda ilk dijital bilgisayarlar geliştirildi, 1969'da ise ARPANET ile internetin temeli atıldı. 1990'larda Tim Berners-Lee'nin WWW'yi icat etmesiyle internet yaygınlaştı. Bilgisayarlar ve internet, iletişimi, eğitimi, ticareti ve üretimi tamamen dönüştürdü." },
        { title: "Akıllı Telefonların Yaygınlaşması – iPhone'un Tanıtımı (2007)", desc: "Apple'ın tanıttığı iPhone, mobil teknolojide çığır açtı. İnternet, kamera, iletişim, uygulamalar ve yapay zeka bir cihaza entegre oldu. Akıllı telefonlar sadece iletişim aracı değil, aynı zamanda yaşam tarzı ve iş yapma biçimini kökten değiştiren teknolojik bir devrim haline geldi." }
      ],
      turkiye: [
        { title: "İlk Yerli Radyo Vericisinin Üretilmesi (1927)", desc: "Türkiye, radyo yayıncılığına 1927'de başladı. İstanbul'da kurulan ilk radyo vericisiyle birlikte Türkiye, dünyadaki birçok ülkeyle aynı anda bu yeni kitle iletişim teknolojisini kullanmaya başladı. Bu gelişme, iletişim ve kamu bilgilendirmesinde yeni bir çağ başlattı." },
        { title: "Havelsan ve ASELSAN'ın Kuruluşu (1975–1980)", desc: "Türkiye'nin savunma ve yazılım teknolojilerinde dışa bağımlılığını azaltmak amacıyla kurulan bu iki kurum, yerli yazılım, radar, haberleşme ve elektronik sistemler geliştirdi. Bu adım, savunma sanayinin millileşmesinde önemli bir dönüm noktası oldu." },
        { title: "TÜBİTAK'ın BİLGEM ve ULAKBİM Birimlerinin Açılması (1990'lar)", desc: "TÜBİTAK bünyesinde açılan bu birimler, yerli yazılım geliştirme, ağ altyapısı oluşturma ve akademik veri sistemlerinin kurulmasını sağladı. Pardus işletim sistemi, TÜBİTAK destekli yerli yazılımların en bilinen örneklerinden biridir." },
        { title: "İlk Yerli Uydu – Türksat 1B'nin Fırlatılması (1994)", desc: "Türkiye'nin ilk haberleşme uydularından biri olan Türksat 1B, uzaya gönderilerek Türkiye'nin uzay teknolojilerine adım atmasını sağladı. Bu gelişme sayesinde televizyon yayıncılığı ve iletişim altyapısı çok daha modern hale geldi." },
        { title: "TOGG ve Yerli Elektrikli Otomobil Atılımı (2022–2023)", desc: "Türkiye'nin ilk yerli ve elektrikli otomobili olan TOGG'un üretime geçmesi, otomotiv, batarya teknolojisi ve yazılım sektörlerinde ciddi bir dönüşüm başlattı. Bu girişim, sadece otomobil değil, Türkiye'nin dijital dönüşüm ve mobilite vizyonunun sembolü haline geldi." }
      ]
    };
    const muzikOlaylari = {
      dunya: [
        { title: "Nota Sisteminin Standartlaşması (11. yüzyıl – Guido d'Arezzo)", desc: "İtalyan müzik teorisyeni Guido d'Arezzo, modern notalama sisteminin temellerini attı. Bu gelişme sayesinde müzik artık nesiller boyu kaydedilebilir ve paylaşılabilir hale geldi. Batı müziğinin sistematik biçimde gelişmesini sağlayan en önemli adımlardan biri oldu." },
        { title: "Barok Dönem ve Johann Sebastian Bach'ın Etkisi (1600–1750)", desc: "Barok dönem, armoni ve çok sesli müziğin zirveye ulaştığı bir çağ oldu. Johann Sebastian Bach gibi besteciler, müziğe yapısal derinlik kazandırdı. Klasik müziğin temelleri bu dönemde atıldı ve Batı müzik tarihinin yönü kalıcı biçimde değişti." },
        { title: "Gramofon ve Ses Kayıt Teknolojisinin Ortaya Çıkışı (1877)", desc: "Thomas Edison'un fonografı ve sonrasında Emile Berliner'in gramofonu sayesinde müzik ilk kez kaydedilebilir ve tekrar çalınabilir hale geldi. Bu, müziğin ticarileşmesini ve sanatçıların küresel ölçekte tanınmasını mümkün kıldı." },
        { title: "Rock'n Roll'un Yükselişi – Elvis Presley ve Beatles (1950–60'lar)", desc: "Amerika'da Elvis Presley ve ardından İngiltere'den Beatles gibi gruplar, gençlik kültürüyle birleşen Rock'n Roll müziğini dünya çapında bir harekete dönüştürdü. Bu dönem, müziğin sadece sanat değil, sosyal değişimlerin de aracı haline geldiği bir dönüm noktasıydı." },
        { title: "Dijital Dönüşüm ve Spotify/YouTube Çağı (2000'ler sonrası)", desc: "MP3, internet ve akıllı telefon teknolojileriyle birlikte müzik üretimi, dağıtımı ve tüketimi kökten değişti. YouTube ve Spotify gibi platformlar, bağımsız sanatçıların küresel sahneye çıkmasını sağladı ve müzik endüstrisini kökten yeniden şekillendirdi." }
      ],
      turkiye: [
        { title: "Dede Efendi ve Klasik Türk Müziğinin Sistemleşmesi (19. yüzyıl)", desc: "Hammamizade İsmail Dede Efendi, Klasik Türk Musikisi'nin en önemli bestecilerinden biri oldu. Makam müziğinin estetik yapısını geliştirdi, eserleriyle Osmanlı saray müziğini zirveye taşıdı. Onun çalışmaları, Türk müziğinin yazılı ve sistematik bir kültüre dönüşmesini sağladı." },
        { title: "Musiki Muallim Mektebi'nin Kurulması (1924)", desc: "Cumhuriyet'in ilanından sonra müzik eğitiminin kurumsallaşması amacıyla kurulan bu okul, batı müziği ve Türk müziği alanında birçok önemli sanatçının yetişmesini sağladı. Bu gelişme, müziğin devlet eliyle desteklenmesinin başlangıcı oldu." },
        { title: "TRT'nin Kurulması ve Radyo-Tv Yayınları (1964 sonrası)", desc: "TRT'nin kurulmasıyla birlikte müzik, Türkiye'nin her yerine ulaşabilen bir kültür öğesi haline geldi. Farklı yörelerden halk müziği derlemeleri yapıldı, sanat müziği icra edildi ve yeni müzik türleri toplumla tanıştı." },
        { title: "Anadolu Rock'ın Doğuşu – Barış Manço, Cem Karaca, Erkin Koray (1970'ler)", desc: "Batı müziği ile Anadolu ezgilerinin birleştiği bu tarz, Türkiye'de modern müziğin kimliğini oluşturdu. Hem siyasi hem kültürel anlamda gençliğe seslenen bu müzik akımı, uzun yıllar etkisini sürdürdü ve Türkiye'de özgün müzik üretiminin önünü açtı." },
        { title: "Tarkan ve Türk Pop Müziğinin Uluslararası Yükselişi (1990'lar)", desc: "Tarkan'ın 'Şımarık' gibi hitleriyle Avrupa'da da liste başı olması, Türk pop müziğinin sınırları aşabileceğini gösterdi. Aynı dönemde pop müzik Türkiye'de altın çağını yaşadı. Bu dönem, müziğin kitleselleşmesini ve globalleşmesini sağladı." }
      ]
    };

    // Her kategoriye özel haber ve bilgiler
    const CATEGORY_NEWS = {
      'Tarih': {
        news: [
          { title: "Osmanlı Arşivleri Dijitalleşiyor", desc: "Osmanlı dönemine ait milyonlarca belge dijital ortama aktarılıyor." },
          { title: "Göbeklitepe'de Yeni Kazılar", desc: "Dünyanın en eski tapınağında yeni bulgular ortaya çıktı." },
          { title: "Tarihi Eser Kaçakçılığına Büyük Operasyon", desc: "Yurtdışına kaçırılmak istenen 500'den fazla eser ele geçirildi." },
          { title: "UNESCO'ya Yeni Türk Kültür Mirası", desc: "Bir Osmanlı köyü UNESCO Dünya Mirası Listesi'ne girdi." },
          { title: "Tarihi Yarımada'da Restorasyon", desc: "İstanbul'daki birçok tarihi yapı restore edilerek ziyarete açıldı." },
        ],
        facts: [
          { fact: "Mısır piramitleri inşa edilirken henüz mamutlar yaşıyordu." },
          { fact: "Kleopatra, piramitlerin inşasından daha yakın bir dönemde yaşadı bize." },
          { fact: "Orta Çağ'da domates Avrupa'da zehirli sanılıyordu." },
          { fact: "Vikingler bıyıklarını ve saçlarını boyardı." },
          { fact: "Tarihteki en kısa savaş 38 dakika sürdü (İngiltere-Zanzibar, 1896)." },
        ]
      },
      'Bilim': {
        news: [
          { title: "James Webb Teleskobu Yeni Galaksi Keşfetti", desc: "NASA'nın uzay teleskobu, evrenin en uzak galaksilerinden birini görüntüledi." },
          { title: "Türkiye'de İlk Yerli Elektrikli Araç Bataryası", desc: "Yerli üretim batarya ile elektrikli araçlarda yeni dönem başlıyor." },
          { title: "Mars'ta Su İzleri", desc: "Bilim insanları Mars'ta yeni su izleri buldu." },
          { title: "Yapay Zeka ile Kanser Teşhisi", desc: "Yapay zeka destekli sistemler, kanser teşhisinde doğruluğu artırıyor." },
          { title: "Küresel Isınma Raporu Yayınlandı", desc: "Son 10 yıl, kayıtlardaki en sıcak dönem oldu." },
        ],
        facts: [
          { fact: "Bir insanın DNA'sı %60 oranında muz ile aynıdır." },
          { fact: "Bir yıldırım, 30.000°C'ye kadar ısınabilir." },
          { fact: "Dünyadaki en büyük canlı, dev bir mantar kolonisi (Oregon, ABD)." },
          { fact: "Karıncalar asla uyumaz." },
          { fact: "Bir kağıt parçası 42 kez katlanırsa Ay'a ulaşacak kadar kalın olurdu." },
        ]
      },
      'Spor': {
        news: [
          { title: "Olimpiyatlarda Türk Sporcular Tarih Yazdı", desc: "Milli sporcularımız Tokyo 2020'de rekor madalya kazandı." },
          { title: "VAR Sistemi Süper Lig'de", desc: "Video Yardımcı Hakem uygulaması ile tartışmalı pozisyonlar azalıyor." },
          { title: "Kadın Futbolunda Büyük Yükseliş", desc: "Türkiye Kadın Futbol Ligi'nde yeni rekorlar kırıldı." },
          { title: "NBA'de Playoff Heyecanı", desc: "NBA'de sezonun en çekişmeli playoffları yaşanıyor." },
          { title: "Bisiklet Turu Başladı", desc: "Türkiye Bisiklet Turu'nda sporcular kıyasıya yarışıyor." },
        ],
        facts: [
          { fact: "Dünyanın en hızlı golü 2.8 saniyede atıldı." },
          { fact: "Bir futbol topunun ömrü ortalama 3 yıldır." },
          { fact: "Basketbol ilk icat edildiğinde sepetlerin dibi kapalıydı." },
          { fact: "Bir maratonun uzunluğu 42.195 metredir." },
          { fact: "Dünyanın en eski spor dalı güreştir." },
        ]
      },
      'Teknoloji': {
        news: [
          { title: "Türkiye'nin İlk Yerli Elektrikli Otomobili Yollarda", desc: "TOGG, seri üretime geçerek satışa sunuldu." },
          { title: "5G Dönemi Başladı", desc: "Türkiye'de ilk 5G denemeleri başarıyla tamamlandı." },
          { title: "Yerli Yazılım İhracatı Rekor Kırdı", desc: "Türk yazılım firmaları dünya pazarında büyüyor." },
          { title: "Yapay Zeka ile Akıllı Evler", desc: "Ev otomasyonunda yapay zeka kullanımı artıyor." },
          { title: "Uzayda Türk Uydusu", desc: "Yeni nesil haberleşme uydusu başarıyla fırlatıldı." },
        ],
        facts: [
          { fact: "İlk bilgisayar bir oda büyüklüğündeydi." },
          { fact: "Dünyada her gün 300 milyar e-posta gönderiliyor." },
          { fact: "Bir akıllı telefonun ortalama 30 farklı metal içerir." },
          { fact: "İlk SMS 1992'de gönderildi." },
          { fact: "Dünyanın ilk web sitesi bugün hâlâ yayında." },
        ]
      },
      'Müzik': {
        news: [
          { title: "Türk Sanat Müziği Gecesi", desc: "İstanbul'da ünlü sanatçılar klasik eserleri seslendirdi." },
          { title: "Dijital Müzik Platformlarında Rekor", desc: "Türk sanatçıların şarkıları milyonlarca kez dinlendi." },
          { title: "Yeni Albüm Çıktı", desc: "Popüler bir grup yeni albümünü yayınladı." },
          { title: "Müzik Festivali Başladı", desc: "Gençler için büyük bir açık hava festivali düzenleniyor." },
          { title: "Müzik ve Yapay Zeka", desc: "Yapay zeka ile bestelenen ilk Türkçe şarkı yayınlandı." },
        ],
        facts: [
          { fact: "Dünyadaki en uzun şarkı 13 saat 23 dakika sürüyor." },
          { fact: "Bir gitar telinin ömrü ortalama 100 saat çalmadır." },
          { fact: "Mozart 5 yaşında beste yapmaya başladı." },
          { fact: "En çok çalınan enstrüman piyanodur." },
          { fact: "Bir insanın sesi 1 kilometreye kadar duyulabilir." },
        ]
      },
    };
    const guncelHaberler = CATEGORY_NEWS[selectedCategory.name]?.news || [];
    const eglenceliBilgiler = CATEGORY_NEWS[selectedCategory.name]?.facts || [];

    return (
      <div style={{
        maxWidth: 1400,
        margin: '40px auto',
        padding: '0 8px',
        display: 'flex',
        flexDirection: 'row',
        gap: 64,
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
        {/* Sol: Güncel Haberler */}
        <div style={{
          width: 260,
          minWidth: 200,
          maxHeight: 520,
          background: 'linear-gradient(120deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 18,
          boxShadow: '0 4px 16px rgba(44,62,80,0.08)',
          padding: '22px 18px',
          overflowY: 'auto',
          color: '#333',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          marginLeft: 0,
          marginRight: 0,
          marginTop: 0,
          marginBottom: 0,
          alignSelf: 'flex-start',
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#4b2e83', marginBottom: 10 }}>📰 Güncel Haberler</h3>
          {guncelHaberler.map((haber, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 4px #e3e3e3', marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{haber.title}</div>
              <div style={{ fontSize: 14, color: '#555' }}>{haber.desc}</div>
            </div>
          ))}
        </div>

        {/* Orta: Ana İçerik */}
        <div style={{ flex: 1, minWidth: 340 }}>
          <button onClick={() => setSelectedCategory(null)} style={{ marginBottom: 24, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>← Kategoriler</button>
          {/* Bilgi Kartları sadece Tarih için */}
          {selectedCategory && selectedCategory.name === 'Tarih' && (
            <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
              {/* Dünya ve Türkiye başlıkları yan yana (mobilde alt alta) */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <h2 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>🌍 Dünya Tarihini Değiştiren 5 Olay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {tarihOlaylari.dunya.map((olay, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAcikKart({ ...olay, tip: 'dunya' })}
                      style={{
                        background: '#fff',
                        border: `2px solid ${selectedCategory.color}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: selectedCategory.color,
                        boxShadow: '0 2px 8px #e3e3e3',
                        transition: 'all 0.18s',
                        textAlign: 'left',
                        outline: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f4f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 800, marginRight: 8, fontSize: 18 }}>•</span> {olay.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h2 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>🇹🇷 Türk Tarihini Değiştiren 5 Olay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {tarihOlaylari.turkiye.map((olay, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAcikKart({ ...olay, tip: 'turkiye' })}
                      style={{
                        background: '#fff',
                        border: `2px solid ${selectedCategory.color}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: selectedCategory.color,
                        boxShadow: '0 2px 8px #e3e3e3',
                        transition: 'all 0.18s',
                        textAlign: 'left',
                        outline: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f4f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 800, marginRight: 8, fontSize: 18 }}>•</span> {olay.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Bilgi Kartları sadece Bilim için */}
          {selectedCategory && selectedCategory.name === 'Bilim' && (
            <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h2 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>🔬 Dünya Bilimini Değiştiren 5 Olay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {bilimOlaylari.dunya.map((olay, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAcikKart({ ...olay, tip: 'dunya' })}
                      style={{
                        background: '#fff',
                        border: `2px solid ${selectedCategory.color}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: selectedCategory.color,
                        boxShadow: '0 2px 8px #e3e3e3',
                        transition: 'all 0.18s',
                        textAlign: 'left',
                        outline: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f4f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 800, marginRight: 8, fontSize: 18 }}>•</span> {olay.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h2 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>🇹🇷 Türk Bilimini Değiştiren 5 Olay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {bilimOlaylari.turkiye.map((olay, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAcikKart({ ...olay, tip: 'turkiye' })}
                      style={{
                        background: '#fff',
                        border: `2px solid ${selectedCategory.color}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: selectedCategory.color,
                        boxShadow: '0 2px 8px #e3e3e3',
                        transition: 'all 0.18s',
                        textAlign: 'left',
                        outline: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f4f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 800, marginRight: 8, fontSize: 18 }}>•</span> {olay.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Bilgi Kartları sadece Spor için */}
          {selectedCategory && selectedCategory.name === 'Spor' && (
            <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', alignItems: 'stretch' }}>
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h2 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>🌍 Dünya Sporunu Değiştiren 5 Olay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                  {sporOlaylari.dunya.map((olay, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAcikKart({ ...olay, tip: 'dunya' })}
                      style={{
                        background: '#fff',
                        border: `2px solid ${selectedCategory.color}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: selectedCategory.color,
                        boxShadow: '0 2px 8px #e3e3e3',
                        transition: 'all 0.18s',
                        textAlign: 'left',
                        outline: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        flex: 1,
                        minHeight: 60
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f4f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 800, marginRight: 8, fontSize: 18 }}>•</span> {olay.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h2 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>🇹🇷 Türk Sporunu Değiştiren 5 Olay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                  {sporOlaylari.turkiye.map((olay, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAcikKart({ ...olay, tip: 'turkiye' })}
                      style={{
                        background: '#fff',
                        border: `2px solid ${selectedCategory.color}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: selectedCategory.color,
                        boxShadow: '0 2px 8px #e3e3e3',
                        transition: 'all 0.18s',
                        textAlign: 'left',
                        outline: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        flex: 1,
                        minHeight: 60
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f4f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 800, marginRight: 8, fontSize: 18 }}>•</span> {olay.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Bilgi Kartları sadece Teknoloji için */}
          {selectedCategory && selectedCategory.name === 'Teknoloji' && (
            <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', alignItems: 'stretch' }}>
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h2 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>🌍 Dünya Teknolojisini Değiştiren 5 Olay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                  {teknolojiOlaylari.dunya.map((olay, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAcikKart({ ...olay, tip: 'dunya' })}
                      style={{
                        background: '#fff',
                        border: `2px solid ${selectedCategory.color}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: selectedCategory.color,
                        boxShadow: '0 2px 8px #e3e3e3',
                        transition: 'all 0.18s',
                        textAlign: 'left',
                        outline: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        flex: 1,
                        minHeight: 60
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f4f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 800, marginRight: 8, fontSize: 18 }}>•</span> {olay.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h2 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>🇹🇷 Türk Teknolojisini Değiştiren 5 Olay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                  {teknolojiOlaylari.turkiye.map((olay, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAcikKart({ ...olay, tip: 'turkiye' })}
                      style={{
                        background: '#fff',
                        border: `2px solid ${selectedCategory.color}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: selectedCategory.color,
                        boxShadow: '0 2px 8px #e3e3e3',
                        transition: 'all 0.18s',
                        textAlign: 'left',
                        outline: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        flex: 1,
                        minHeight: 60
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f4f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 800, marginRight: 8, fontSize: 18 }}>•</span> {olay.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Bilgi Kartları sadece Müzik için */}
          {selectedCategory && selectedCategory.name === 'Müzik' && (
            <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', alignItems: 'stretch' }}>
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h2 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>🌍 Dünya Müziğini Değiştiren 5 Olay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                  {muzikOlaylari.dunya.map((olay, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAcikKart({ ...olay, tip: 'dunya' })}
                      style={{
                        background: '#fff',
                        border: `2px solid ${selectedCategory.color}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: selectedCategory.color,
                        boxShadow: '0 2px 8px #e3e3e3',
                        transition: 'all 0.18s',
                        textAlign: 'left',
                        outline: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        flex: 1,
                        minHeight: 60
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f4f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 800, marginRight: 8, fontSize: 18 }}>•</span> {olay.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h2 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>🇹🇷 Türk Müziğini Değiştiren 5 Olay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                  {muzikOlaylari.turkiye.map((olay, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAcikKart({ ...olay, tip: 'turkiye' })}
                      style={{
                        background: '#fff',
                        border: `2px solid ${selectedCategory.color}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        color: selectedCategory.color,
                        boxShadow: '0 2px 8px #e3e3e3',
                        transition: 'all 0.18s',
                        textAlign: 'left',
                        outline: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        flex: 1,
                        minHeight: 60
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f4f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 800, marginRight: 8, fontSize: 18 }}>•</span> {olay.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Açık Kart */}
          {acikKart && (
            <div
              style={{
                background: '#fffbe7',
                border: `3px solid ${selectedCategory.color}`,
                borderRadius: 18,
                padding: 32,
                marginBottom: 28,
                boxShadow: '0 4px 24px #f9e79f55',
                position: 'relative',
                animation: 'fadeIn 0.5s',
                maxWidth: 600,
                margin: '0 auto 28px auto',
                zIndex: 10,
              }}
            >
              <button
                onClick={() => setAcikKart(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 22,
                  background: selectedCategory.color,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '6px 16px',
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: `0 2px 8px ${selectedCategory.color}33`,
                  letterSpacing: 1
                }}
              >
                Kapat ✕
              </button>
              <h3 style={{ color: selectedCategory.color, fontWeight: 800, fontSize: 24, marginBottom: 16 }}>{acikKart.title}</h3>
              <div style={{ color: '#222', fontSize: 18, lineHeight: 1.6 }}>{acikKart.desc}</div>
            </div>
          )}
          {/* 3 buton */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 18 }}>
            <button onClick={() => setCategoryScreen('quiz')} style={{ flex: 1, background: '#f39c12', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 14, padding: '28px 0', cursor: 'pointer', boxShadow: '0 2px 8px rgba(243,156,18,0.10)', transition: 'background 0.2s' }}>Mini Quiz</button>
            <button onClick={() => setCategoryScreen('chat')} style={{ flex: 1, background: selectedCategory.color, color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 14, padding: '28px 0', cursor: 'pointer', boxShadow: `0 2px 8px ${selectedCategory.color}22`, transition: 'background 0.2s' }}>Sohbet</button>
            <button onClick={() => setCategoryScreen('qa')} style={{ flex: 1, background: '#27ae60', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 14, padding: '28px 0', cursor: 'pointer', boxShadow: '0 2px 8px rgba(39,174,96,0.10)', transition: 'background 0.2s' }}>Soru-Cevap</button>
          </div>
        </div>

        {/* Sağ: Eğlenceli Bilgiler */}
        <div style={{
          width: 260,
          minWidth: 200,
          maxHeight: 520,
          background: 'linear-gradient(120deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 18,
          boxShadow: '0 4px 16px rgba(44,62,80,0.08)',
          padding: '22px 18px',
          overflowY: 'auto',
          color: '#333',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          marginLeft: 0,
          marginRight: 0,
          marginTop: 0,
          marginBottom: 0,
          alignSelf: 'flex-start',
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#e74c3c', marginBottom: 10 }}>🎉 Eğlenceli Bilgiler</h3>
          {eglenceliBilgiler.map((bilgi, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 4px #e3e3e3', marginBottom: 4, fontSize: 15 }}>
              {bilgi.fact}
            </div>
          ))}
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
          
          {/* Online kullanıcılar */}
          <div style={{ marginBottom: 12, color: '#fff', fontSize: 14 }}>
            Online: {onlineUsers.join(', ')}
          </div>

          <div style={{ marginBottom: 18, color: '#fff', fontSize: 16, minHeight: 40, opacity: 0.92 }}>
            {CATEGORY_INFOS[selectedCategory.name]}
          </div>

          {/* Yazıyor... göstergesi */}
          {isTyping && (
            <div style={{ color: '#fff', fontSize: 14, marginBottom: 8, fontStyle: 'italic' }}>
              Birisi yazıyor...
            </div>
          )}

          <div style={{ minHeight: 200, marginBottom: 18, border: '1px solid #fff2', padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.10)', maxHeight: 250, overflowY: 'auto' }}>
            {messages.filter(msg => msg.category === selectedCategory.name).map((msg, i) => {
              const isMe = msg.user === username;
              return (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  marginBottom: 10,
                }}>
                  <div style={{
                    maxWidth: 420,
                    minWidth: 80,
                    background: isMe ? '#27ae60' : 'rgba(255,255,255,0.10)',
                    color: isMe ? '#fff' : '#fff',
                    borderRadius: 18,
                    padding: '12px 18px',
                    marginLeft: isMe ? 0 : 8,
                    marginRight: isMe ? 8 : 0,
                    boxShadow: isMe ? '0 2px 8px #27ae6022' : '0 2px 8px rgba(44,62,80,0.06)',
                    textAlign: 'left',
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 15, opacity: 0.85, marginBottom: 2 }}>{msg.user}</div>
                    <div style={{ fontSize: 16 }}>{msg.text}</div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleTyping}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', fontSize: 16, background: 'rgba(255,255,255,0.85)' }}
            />
            <button type="submit" style={{ padding: '12px 24px', borderRadius: 8, background: '#27ae60', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}>Gönder</button>
          </form>
        </div>
      </div>
    );
  }

  // Mini Quiz ekranı
  if (categoryScreen === 'quiz') {
    // Test seçilmediyse test butonlarını göster
    if (!selectedTest) {
      return (
        <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 8px 32px rgba(44,62,80,0.08)' }}>
          <button onClick={() => setCategoryScreen('main')} style={{ marginBottom: 24, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>← {selectedCategory.name} Anasayfa</button>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: selectedCategory.color, marginBottom: 18 }}>{selectedCategory.icon} Mini Quiz</h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            justifyContent: 'center',
            width: '100%',
            maxWidth: 350,
            margin: '0 auto'
          }}>
            {availableTests.length === 0 ? (
              <div style={{ color: '#888', fontSize: 18 }}>Hiç test bulunamadı.</div>
            ) : (
              availableTests.map((testNo) => (
                <button
                  key={testNo}
                  onClick={() => {
                    setSelectedTest(testNo);
                    setAvailableTests([]);
                  }}
                  style={{
                    width: '100%',
                    padding: '18px 0',
                    borderRadius: 14,
                    background: '#2196f3',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 20,
                    border: 'none',
                    cursor: 'pointer',
                    margin: '0 0 10px 0',
                    boxShadow: '0 2px 8px #2196f322',
                    transition: 'background 0.2s',
                    letterSpacing: 1
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#1769aa'}
                  onMouseOut={e => e.currentTarget.style.background = '#2196f3'}
                >
                  Test-{testNo}
                </button>
              ))
            )}
          </div>
        </div>
      );
    }

    if (showResults && quizResults) {
      return (
        <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 8px 32px rgba(44,62,80,0.08)' }}>
          {quizResults.score === quizResults.totalQuestions && <Confetti numberOfPieces={250} recycle={false} />}
          <button onClick={() => setCategoryScreen('main')} style={{ marginBottom: 24, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>← {selectedCategory.name} Anasayfa</button>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: selectedCategory.color, marginBottom: 18 }}>{selectedCategory.icon} Quiz Sonuçları</h2>
          
          {/* Skor ve Motivasyonel Mesaj */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}>
            <h3 style={{ fontSize: 24, color: '#2196f3', marginBottom: 12 }}>Puanınız: {quizResults.score}/{quizResults.totalQuestions}</h3>
            <div style={{ color: '#666', fontSize: 16, marginBottom: 24 }}>
              {quizResults.score === quizResults.totalQuestions ? '🎉 Mükemmel! Tüm soruları doğru bildiniz!' :
               quizResults.score >= quizResults.totalQuestions * 0.7 ? '👏 Çok iyi! Neredeyse tamamını bildiniz!' :
               quizResults.score >= quizResults.totalQuestions * 0.5 ? '👍 İyi gidiyorsunuz! Daha fazla çalışın.' :
               '💪 Biraz daha çalışmanız gerekiyor. Pes etmeyin!'}
            </div>
            {quizResults.aiAnalysis?.motivationalMessage && (
              <div style={{ 
                background: '#e3f2fd', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 16,
                borderLeft: '4px solid #2196f3'
              }}>
                <p style={{ color: '#1565c0', fontSize: 16, fontStyle: 'italic' }}>
                  {quizResults.aiAnalysis.motivationalMessage}
                </p>
              </div>
            )}
          </div>

          {/* AI Analiz Sonuçları */}
          {quizResults.aiAnalysis && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}>
              <h3 style={{ fontSize: 20, color: '#333', marginBottom: 16 }}>AI Analizi ve Öneriler</h3>
              
              {/* Güçlü Yönler */}
              {quizResults.aiAnalysis.strengths?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: '#2e7d32', fontSize: 18, marginBottom: 8 }}>Güçlü Yönleriniz</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {quizResults.aiAnalysis.strengths.map((strength, index) => (
                      <li key={index} style={{ 
                        padding: '8px 12px', 
                        background: '#e8f5e9', 
                        marginBottom: 8, 
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <span style={{ color: '#2e7d32' }}>✓</span> {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Geliştirilmesi Gereken Alanlar */}
              {quizResults.aiAnalysis.weaknesses?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: '#c62828', fontSize: 18, marginBottom: 8 }}>Geliştirilmesi Gereken Alanlar</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {quizResults.aiAnalysis.weaknesses.map((weakness, index) => (
                      <li key={index} style={{ 
                        padding: '8px 12px', 
                        background: '#ffebee', 
                        marginBottom: 8, 
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <span style={{ color: '#c62828' }}>!</span> {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Öneriler */}
              {quizResults.aiAnalysis.recommendations?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: '#1565c0', fontSize: 18, marginBottom: 8 }}>Öneriler</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {quizResults.aiAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index} style={{ 
                        padding: '8px 12px', 
                        background: '#e3f2fd', 
                        marginBottom: 8, 
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <span style={{ color: '#1565c0' }}>→</span> {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Çalışma Planı */}
              {quizResults.aiAnalysis.studyPlan?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: '#6a1b9a', fontSize: 18, marginBottom: 8 }}>Kişiselleştirilmiş Çalışma Planı</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {quizResults.aiAnalysis.studyPlan.map((plan, index) => (
                      <li key={index} style={{ 
                        padding: '8px 12px', 
                        background: '#f3e5f5', 
                        marginBottom: 8, 
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <span style={{ color: '#6a1b9a' }}>📚</span> {plan}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Soru Sonuçları */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}>
            <h3 style={{ fontSize: 20, color: '#333', marginBottom: 16 }}>Soru Sonuçları</h3>
            {quizResults.results.map((result, index) => (
              <div key={index} style={{ 
                marginBottom: 20, 
                padding: 16, 
                background: result.isCorrect ? '#e8f5e9' : '#ffebee', 
                borderRadius: 8 
              }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Soru {index + 1}: {result.question}</p>
                <p style={{ color: result.isCorrect ? '#2e7d32' : '#c62828' }}>
                  {result.isCorrect ? '✓ Doğru cevap!' : `✗ Yanlış cevap. Doğru cevap: ${result.correctAnswer}`}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => {
              setShowResults(false);
              setSelectedAnswers({});
              setCurrentQuestion(0);
              setSelectedTest(null);
              setAvailableTests([]);
            }} style={{ 
              padding: '12px 24px', 
              borderRadius: 8, 
              background: '#2196f3', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 16, 
              border: 'none', 
              cursor: 'pointer',
              flex: 1
            }}>
              Test Seçimine Dön
            </button>
            <button onClick={() => {
              setShowResults(false);
              setSelectedAnswers({});
              setCurrentQuestion(0);
              setSelectedTest(null);
              setAvailableTests([]);
            }} style={{ 
              padding: '12px 24px', 
              borderRadius: 8, 
              background: '#43a047', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 16, 
              border: 'none', 
              cursor: 'pointer',
              flex: 1
            }}>
              Tekrar Dene
            </button>
          </div>
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 8px 32px rgba(44,62,80,0.08)' }}>
          <button onClick={() => setCategoryScreen('main')} style={{ marginBottom: 24, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>← {selectedCategory.name} Anasayfa</button>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: selectedCategory.color, marginBottom: 18 }}>{selectedCategory.icon} Mini Quiz</h2>
          <div style={{ color: '#444', fontSize: 18, background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}>
            Quiz soruları yükleniyor...
          </div>
        </div>
      );
    }

    const currentQuiz = quizzes[currentQuestion];

    return (
      <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 8px 32px rgba(44,62,80,0.08)' }}>
        <button onClick={() => setCategoryScreen('main')} style={{ marginBottom: 24, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>← {selectedCategory.name} Anasayfa</button>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: selectedCategory.color, marginBottom: 18 }}>{selectedCategory.icon} Mini Quiz</h2>
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}>
          <div style={{ marginBottom: 16, color: '#666' }}>
            Soru {currentQuestion + 1}/{quizzes.length}
          </div>
          <h3 style={{ fontSize: 20, color: '#333', marginBottom: 20 }}>{currentQuiz.question}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentQuiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuiz._id, option)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '2px solid',
                  borderColor: selectedAnswers[currentQuiz._id] === option ? '#2196f3' : '#ddd',
                  background: selectedAnswers[currentQuiz._id] === option ? '#e3f2fd' : '#fff',
                  color: '#333',
                  fontSize: 16,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              background: '#eee',
              color: '#666',
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              opacity: currentQuestion === 0 ? 0.5 : 1
            }}
          >
            ← Önceki
          </button>
          {currentQuestion === quizzes.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(selectedAnswers).length !== quizzes.length}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                background: Object.keys(selectedAnswers).length === quizzes.length ? '#2196f3' : '#ccc',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                border: 'none',
                cursor: Object.keys(selectedAnswers).length === quizzes.length ? 'pointer' : 'not-allowed'
              }}
            >
              Bitir
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(quizzes.length - 1, prev + 1))}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                background: '#2196f3',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Sonraki →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Mini Quiz ve Soru-Cevap için placeholder (şimdilik)
  if (categoryScreen === 'qa') {
    return (
      <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 8px 32px rgba(44,62,80,0.08)' }}>
        <button onClick={() => setCategoryScreen('main')} style={{ marginBottom: 24, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>← {selectedCategory.name} Anasayfa</button>
        <SoruCevap kategori={selectedCategory.name} />
      </div>
    );
  }
}

export default Chat; 