import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, FlatList, Text, ScrollView, Image, ImageBackground, Platform, KeyboardAvoidingView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Provider as PaperProvider, Card, TextInput, Button, Title, Paragraph, Modal, Portal, Chip, Avatar, IconButton, List } from 'react-native-paper';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = ['Tarih', 'Bilim', 'Spor', 'Teknoloji', 'Müzik'];
const CATEGORY_INFOS: { [key: string]: string } = {
  'Tarih': 'Tarih, geçmişte yaşanan olayları inceleyen bilim dalıdır. İnsanlık tarihinin önemli dönüm noktalarını ve uygarlıkların gelişimini kapsar.',
  'Bilim': 'Bilim, evreni ve doğayı anlamak için yapılan sistematik çalışmalardır. Deney, gözlem ve mantık yoluyla bilgi üretir.',
  'Spor': 'Spor, bedensel ve zihinsel gelişimi destekleyen, rekabet ve eğlence amaçlı yapılan fiziksel aktivitelerdir.',
  'Teknoloji': 'Teknoloji, insan hayatını kolaylaştıran araç, gereç ve yöntemlerin geliştirilmesidir. Günümüzde hızla gelişmektedir.',
  'Müzik': 'Müzik, sesin ritim, melodi ve armoniyle birleşerek oluşturduğu sanattır. Kültürlerin önemli bir parçasıdır.'
};

const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.165.109:5000';
  }
  return 'http://localhost:5000';
};
const getWsUrl = () => {
  if (Platform.OS === 'android') {
    return 'ws://192.168.165.109:5000';
  }
  return 'ws://localhost:5000';
};
const BACKEND_URL = getBaseUrl();
const WS_URL = getWsUrl();

const CATEGORY_ICONS: { [key: string]: string } = {
  'Tarih': 'clock-outline',
  'Bilim': 'atom-variant',
  'Spor': 'soccer',
  'Teknoloji': 'laptop',
  'Müzik': 'music-note',
};

// Kategoriye göre görsel eşlemesi
const CATEGORY_IMAGES: { [key: string]: any } = {
  'Tarih': require('./assets/history.png'),
  'Bilim': require('./assets/science.png'),
  'Spor': require('./assets/sport.png'),
  'Teknoloji': require('./assets/technology.png'),
  'Müzik': require('./assets/music.png'),
};

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{user: string, text: string, category: string, answer?: string, createdAt?: string}[]>([]);
  const [users, setUsers] = useState<{username: string, password: string}[]>([]);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [appScreen, setAppScreen] = useState<'home' | 'categoryDetail' | 'chat' | 'qa' | 'quiz'>('home');
  const [aboutVisible, setAboutVisible] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [availableTests, setAvailableTests] = useState<number[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [qaLoaded, setQaLoaded] = useState(false);

  const handleSend = () => {
    if (message.trim() !== '' && selectedCategory && ws.current) {
      const msg = {
        user: username,
        text: message,
        category: selectedCategory,
        timestamp: new Date().toISOString()
      };
      ws.current.send(JSON.stringify({ type: 'message', message: msg }));
      setMessage('');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setAppScreen('home');
      } else {
        alert(data.message || 'Giriş başarısız!');
      }
    } catch (err) {
      alert('Sunucuya bağlanılamadı');
    }
  };

  const handleRegister = async () => {
    if (username.trim() === '' || password.trim() === '') {
      alert('Kullanıcı adı ve şifre boş olamaz!');
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email: username + '@mail.com', password })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Kayıt başarılı! Giriş yapabilirsiniz.');
        setShowRegister(false);
        setUsername('');
        setPassword('');
      } else {
        alert(data.message || 'Kayıt sırasında hata oluştu');
      }
    } catch (err) {
      alert('Sunucuya bağlanılamadı');
    }
  };

  const handleQASend = async () => {
    if (message.trim() === '') return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: message, username, kategori: selectedCategory })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [
          ...prev,
          {
            user: username,
            text: data.question,
            category: selectedCategory || '',
            answer: data.answer,
            createdAt: data.createdAt
          }
        ]);
        setMessage('');
      } else {
        alert(data.message || 'Soru gönderilemedi');
      }
    } catch (err) {
      alert('Sunucuya bağlanılamadı');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (appScreen === 'qa' && selectedCategory && !qaLoaded) {
      fetch(`${BACKEND_URL}/api/questions?kategori=${selectedCategory}`)
        .then(res => res.json())
        .then((data: any[]) => {
          setMessages(
            data.map((q: any) => ({
              user: q.username || 'Kullanıcı',
              text: q.question,
              category: q.kategori || q.category || selectedCategory,
              answer: q.answer,
              createdAt: q.createdAt
            }))
          );
          setQaLoaded(true);
        });
    }
    if (appScreen !== 'qa') {
      setQaLoaded(false);
      setMessages([]);
    }
  }, [appScreen, selectedCategory]);

  // Kategoriye girildiğinde geçmiş mesajları çek ve WebSocket bağlantısı kur
  useEffect(() => {
    if (appScreen === 'chat' && selectedCategory) {
      // Geçmiş mesajları çek
      fetch(`${BACKEND_URL}/api/messages/${selectedCategory}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(() => setMessages([]));

      // WebSocket bağlantısı kur
      ws.current = new WebSocket(WS_URL);
      ws.current.onopen = () => {
        ws.current?.send(JSON.stringify({ type: 'user_join', username }));
      };
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'message' && data.message.category === selectedCategory) {
          setMessages(prev => [...prev, data.message]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
        if (data.type === 'typing') {
          setIsTyping(data.isTyping);
        }
      };
      ws.current.onclose = () => {};
      return () => {
        ws.current?.close();
      };
    }
  }, [appScreen, selectedCategory]);

  // Mesaj yazarken yazıyor... bildirimi gönder
  const handleTyping = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'typing', username, isTyping: true }));
      setTimeout(() => {
        ws.current?.send(JSON.stringify({ type: 'typing', username, isTyping: false }));
      }, 2000);
    }
  };

  // Test numaralarını çek
  useEffect(() => {
    if (selectedCategory) {
      fetch(`${BACKEND_URL}/api/quizzes/${selectedCategory}`)
        .then(res => res.json())
        .then(data => {
          const testNumbers = Array.from(new Set((data as any[]).map((q: any) => Number(q.testNo)))).sort((a: number, b: number) => a - b);
          setAvailableTests(testNumbers);
        })
        .catch(() => setAvailableTests([]));
    }
  }, [selectedCategory]);

  // Seçili test değiştiğinde soruları getir
  useEffect(() => {
    if (selectedCategory && selectedTest) {
      fetch(`${BACKEND_URL}/api/quizzes/${selectedCategory}/${selectedTest}`)
        .then(res => res.json())
        .then(data => setQuizzes(data))
        .catch(err => console.error('Quiz soruları getirilemedi:', err));
    } else {
      setQuizzes([]);
    }
  }, [selectedCategory, selectedTest]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
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
      const response = await fetch(`${BACKEND_URL}/api/quizzes/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          answers, 
          category: selectedCategory, 
          testNo: selectedTest 
        })
      });
      const results = await response.json();
      setQuizResults(results);
      setShowResults(true);
    } catch (err) {
      console.error('Cevaplar gönderilemedi:', err);
    }
  };

  // Kategori değiştiğinde test seçimini sıfırla
  useEffect(() => {
    setSelectedTest(null);
  }, [selectedCategory]);

  // Giriş/Kayıt ekranı
  if (!isLoggedIn) {
    return (
      <PaperProvider>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }}>
          <Card style={{ width: 340, padding: 24, borderRadius: 18, elevation: 6, backgroundColor: '#fff' }}>
            <Title style={{ textAlign: 'center', fontSize: 28, fontWeight: 'bold', marginBottom: 6, color: '#222' }}>{showRegister ? 'Üye Ol' : 'Hoş Geldiniz'}</Title>
            <Paragraph style={{ color: '#888', fontSize: 16, marginBottom: 22, textAlign: 'center' }}>{showRegister ? 'Yeni hesap oluşturun' : 'Hesabınıza giriş yapın'}</Paragraph>
        <TextInput
              label="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
              mode="outlined"
              style={{ marginBottom: 16, backgroundColor: '#fafbfc', borderRadius: 10 }}
              outlineColor="#ddd"
              activeOutlineColor="#2196f3"
            />
            <TextInput
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={{ marginBottom: 16, backgroundColor: '#fafbfc', borderRadius: 10 }}
              outlineColor="#ddd"
              activeOutlineColor="#2196f3"
        />
        <Button
              mode="contained"
              onPress={showRegister ? handleRegister : handleLogin}
              style={{ borderRadius: 10, marginBottom: 10, backgroundColor: '#2196f3', paddingVertical: 4 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
            >
              {showRegister ? 'Üye Ol' : 'Giriş Yap'}
            </Button>
            <Button
              mode="text"
              onPress={() => {
                setShowRegister(!showRegister);
                setUsername('');
                setPassword('');
              }}
              labelStyle={{ color: '#2196f3', fontWeight: 'bold', fontSize: 15 }}
            >
              {showRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Üye olun'}
            </Button>
          </Card>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  // Anasayfa ekranı (kategori seçimi)
  if (appScreen === 'home') {
    return (
      <PaperProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#e0c3fc' }}>
          {/* Hamburger Menü Butonu */}
          <View style={{ position: 'absolute', top: 36, left: 18, zIndex: 10 }}>
            <IconButton
              icon="menu"
              size={36}
              onPress={() => setShowCategoryModal(true)}
              style={{ backgroundColor: '#fff', borderRadius: 18, elevation: 4 }}
              iconColor="#4b2e83"
            />
          </View>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 32, minHeight: Dimensions.get('window').height }}>
            {/* Tanıtım Kutusu */}
            <View style={{
              width: '92%',
              backgroundColor: '#fff',
              borderRadius: 22,
              padding: 24,
              marginTop: 60,
              marginBottom: 28,
              shadowColor: '#8ec5fc',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#4b2e83', marginBottom: 10, textAlign: 'left' }}>Sohbet Uygulamasına Hoş Geldin!</Text>
              <Text style={{ fontSize: 18, color: '#333', marginBottom: 18, fontWeight: '600', textAlign: 'left' }}>Bu platformda seni neler bekliyor?</Text>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                  <Text style={{ fontSize: 22, marginRight: 8 }}>🚀</Text>
                  <Text style={{ fontSize: 16, color: '#222', flex: 1 }}><Text style={{ fontWeight: 'bold' }}>Yapay Zeka Destekli Mini Quiz:</Text> Çözdüğün testlerin analizini yapay zeka ile anında öğren, güçlü ve gelişime açık yönlerini keşfet!</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                  <Text style={{ fontSize: 22, marginRight: 8 }}>🤖</Text>
                  <Text style={{ fontSize: 16, color: '#222', flex: 1 }}><Text style={{ fontWeight: 'bold' }}>Akıllı Soru-Cevap:</Text> Sohbet sırasında sorduğun sorulara, yapay zeka tarafından hızlı ve doğru yanıtlar al!</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                  <Text style={{ fontSize: 22, marginRight: 8 }}>💬</Text>
                  <Text style={{ fontSize: 16, color: '#222', flex: 1 }}><Text style={{ fontWeight: 'bold' }}>Farklı Kategorilerde Sohbet:</Text> Tarih, Bilim, Spor, Teknoloji ve Müzik gibi ilgi alanlarında yeni insanlarla tanış, bilgi paylaş!</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                  <Text style={{ fontSize: 22, marginRight: 8 }}>🏆</Text>
                  <Text style={{ fontSize: 16, color: '#222', flex: 1 }}><Text style={{ fontWeight: 'bold' }}>Kendini Test Et:</Text> Her kategoride onlarca test ile bilgini sınayabilir, başarılarını arkadaşlarınla paylaşabilirsin!</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 }}>
                  <Text style={{ fontSize: 22, marginRight: 8 }}>🌐</Text>
                  <Text style={{ fontSize: 16, color: '#222', flex: 1 }}><Text style={{ fontWeight: 'bold' }}>Modern ve Kullanıcı Dostu Tasarım:</Text> Hem web hem mobilde kolay kullanım, hızlı erişim ve eğlenceli bir deneyim!</Text>
                </View>
              </View>
            </View>
            {/* Nasıl Çalışır Kutusu */}
            <View style={{
              width: '92%',
              backgroundColor: '#f3e8ff',
              borderRadius: 18,
              padding: 20,
              marginBottom: 22,
              shadowColor: '#8ec5fc',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.10,
              shadowRadius: 10,
              elevation: 5,
            }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#7c3aed', marginBottom: 8 }}>Nasıl Çalışır?</Text>
              <Text style={{ fontSize: 16, color: '#333', marginBottom: 6 }}>1. Kategori seç ve sohbet odasına katıl.</Text>
              <Text style={{ fontSize: 16, color: '#333', marginBottom: 6 }}>2. Sohbet et, soru sor veya mini quiz çöz.</Text>
              <Text style={{ fontSize: 16, color: '#333', marginBottom: 6 }}>3. Quiz sonuçlarını ve güçlü yönlerini anında öğren.</Text>
              <Text style={{ fontSize: 16, color: '#333' }}>4. Eğlen, öğren, yeni insanlarla tanış!</Text>
            </View>
            {/* Hakkımızda Kutusu */}
            <View style={{
              width: '92%',
              backgroundColor: '#fff',
              borderRadius: 18,
              padding: 20,
              marginBottom: 32,
              shadowColor: '#8ec5fc',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.10,
              shadowRadius: 10,
              elevation: 5,
            }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#4b2e83', marginBottom: 8 }}>Hakkımızda</Text>
              <Text style={{ fontSize: 16, color: '#333' }}>
                Sohbet Uygulaması, kullanıcıların farklı ilgi alanlarında sohbet edebileceği, yapay zeka destekli mini quizler çözebileceği ve akıllı soru-cevap sistemiyle bilgi paylaşabileceği modern bir platformdur. Amacımız, eğlenceli ve öğretici bir ortamda insanları bir araya getirmek ve teknolojinin gücünü herkes için erişilebilir kılmaktır.
              </Text>
            </View>
          </ScrollView>
          {/* Kategori Seçim Modalı */}
          <Portal>
            <Modal visible={showCategoryModal} onDismiss={() => setShowCategoryModal(false)} contentContainerStyle={{ backgroundColor: '#fff', margin: 24, borderRadius: 18, padding: 24, alignItems: 'center' }}>
              <Title style={{ fontSize: 24, color: '#4b2e83', marginBottom: 18 }}>Kategori Seç</Title>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  mode="contained"
                  onPress={() => {
                    setSelectedCategory(cat);
                    setAppScreen('categoryDetail');
                    setShowCategoryModal(false);
                  }}
                  style={{ width: 220, marginVertical: 8, borderRadius: 14, backgroundColor: '#2196f3', elevation: 2 }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}
                >
                  {cat}
                </Button>
              ))}
            </Modal>
          </Portal>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  // Kategori Detay ekranı
  if (appScreen === 'categoryDetail' && selectedCategory) {
    return (
      <PaperProvider>
        <ImageBackground
          source={CATEGORY_IMAGES[selectedCategory]}
          style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'flex-start' }}
          imageStyle={{ opacity: 0.35 }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ alignItems: 'flex-start', padding: 8, paddingTop: 32 }}>
              <IconButton icon="arrow-left" size={28} onPress={() => {
                setAppScreen('home');
                setSelectedTest(null);
              }} />
            </View>
            <View style={{ alignItems: 'center', padding: 24, paddingTop: 0 }}>
              <Avatar.Icon size={80} icon={CATEGORY_ICONS[selectedCategory]} style={{ backgroundColor: '#2196f3', marginBottom: 18, marginTop: 18 }} />
              <Title style={{ textAlign: 'center', fontSize: 30, fontWeight: 'bold', color: '#1976d2', marginBottom: 8 }}>{selectedCategory}</Title>
              <Paragraph style={{ textAlign: 'center', color: '#222', fontSize: 17, marginBottom: 0, marginHorizontal: 12 }}>{CATEGORY_INFOS[selectedCategory]}</Paragraph>
            </View>
            <View style={{ padding: 28, alignItems: 'center' }}>
              <Button
                mode="contained"
                onPress={() => setAppScreen('chat')}
                style={{ borderRadius: 14, backgroundColor: '#2196f3', marginBottom: 18, width: '100%', paddingVertical: 10, elevation: 2 }}
                labelStyle={{ fontWeight: 'bold', fontSize: 18 }}
              >
                Sohbet
              </Button>
              <Button
                mode="contained"
                onPress={() => setAppScreen('quiz')}
                style={{ borderRadius: 14, backgroundColor: '#f39c12', marginBottom: 18, width: '100%', paddingVertical: 10, elevation: 2 }}
                labelStyle={{ fontWeight: 'bold', fontSize: 18 }}
              >
                Mini Quiz
              </Button>
              <Button
                mode="outlined"
                onPress={() => setAppScreen('qa')}
                style={{ borderRadius: 14, borderColor: '#2196f3', marginBottom: 12, width: '100%', paddingVertical: 10 }}
                labelStyle={{ color: '#2196f3', fontWeight: 'bold', fontSize: 18 }}
              >
                Soru-Cevap
              </Button>
            </View>
      </SafeAreaView>
        </ImageBackground>
      </PaperProvider>
    );
  }

  // Sohbet ekranı
  if (appScreen === 'chat') {
  return (
      <PaperProvider>
        <ImageBackground source={require('./assets/chat-bg.png')} style={{ flex: 1 }} imageStyle={{ opacity: 0.4 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
            >
              <View style={{ flex: 1, margin: 18, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.35)', padding: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2196f3', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconButton icon={CATEGORY_ICONS[selectedCategory || 'Tarih']} iconColor="#fff" size={28} />
                    <Title style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 4 }}>{selectedCategory ? selectedCategory + ' Sohbeti' : 'Sohbet Odası'}</Title>
                  </View>
                  <IconButton icon="arrow-left" iconColor="#fff" size={24} onPress={() => setAppScreen('categoryDetail')} />
                </View>
                <FlatList
                  ref={flatListRef}
                  data={messages.filter(m => m.category === selectedCategory)}
                  keyExtractor={(_, i) => i.toString()}
                  contentContainerStyle={{ padding: 18, paddingBottom: 30 }}
                  renderItem={({ item }) => {
                    const isMe = item.user === username;
                    return (
                      <View style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', marginBottom: 14 }}>
                        <Avatar.Text
                          size={32}
                          label={item.user[0].toUpperCase()}
                          style={{ backgroundColor: isMe ? '#2196f3' : '#bdbdbd', marginHorizontal: 6, elevation: 2 }}
                          color="#fff"
                        />
                        <View style={{ maxWidth: '75%', minWidth: 80 }}>
                          <View style={{
                            backgroundColor: isMe ? '#2196f3' : 'rgba(255,255,255,0.85)',
                            borderRadius: 18,
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            marginBottom: 2,
                            shadowColor: isMe ? '#2196f3' : '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isMe ? 0.10 : 0.08,
                            shadowRadius: 6,
                            elevation: 3,
                            borderTopRightRadius: isMe ? 6 : 18,
                            borderTopLeftRadius: isMe ? 18 : 6,
                          }}>
                            <Text style={{ color: isMe ? '#fff' : '#1976d2', fontWeight: 'bold', fontSize: 13, opacity: 0.7, marginBottom: 2 }}>{item.user}</Text>
                            <Text style={{ color: isMe ? '#fff' : '#222', fontSize: 16 }}>{item.text}</Text>
                          </View>
                          <Text style={{ color: '#888', fontSize: 12, alignSelf: isMe ? 'flex-end' : 'flex-start', marginHorizontal: 6, marginTop: 2 }}>
                            {item.timestamp ? moment(item.timestamp).format('HH:mm') : ''}
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                  onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                  onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
                {isTyping && (
                  <Text style={{ color: '#2196f3', fontStyle: 'italic', marginLeft: 24, marginBottom: 4 }}>Birisi yazıyor...</Text>
                )}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', margin: 14, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                    <TextInput
                      placeholder="Mesajınızı yazın..."
                      value={message}
                      onChangeText={text => { setMessage(text); handleTyping(); }}
                      mode="flat"
                      style={{ flex: 1, backgroundColor: 'transparent', borderRadius: 18, marginRight: 8, fontSize: 16 }}
                      underlineColor="transparent"
                      selectionColor="#2196f3"
                      theme={{ colors: { text: '#222', placeholder: '#888' } }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="default"
                    />
                    <Button
                      mode="contained"
                      onPress={handleSend}
                      style={{ borderRadius: 18, backgroundColor: '#2196f3', paddingVertical: 4, minWidth: 80 }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
                    >
                      Gönder
                    </Button>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </ImageBackground>
      </PaperProvider>
    );
  }

  // Soru-Cevap ekranı
  if (appScreen === 'qa') {
    const categoryColors: { [key: string]: string } = {
      'Tarih': '#f39c12',
      'Bilim': '#27ae60',
      'Spor': '#2980b9',
      'Teknoloji': '#8e44ad',
      'Müzik': '#e74c3c'
    };
    const categoryIcons: { [key: string]: string } = {
      'Tarih': 'clock-outline',
      'Bilim': 'atom-variant',
      'Spor': 'soccer',
      'Teknoloji': 'laptop',
      'Müzik': 'music-note',
    };
    const color = categoryColors[selectedCategory || 'Bilim'] || '#2196f3';
    const icon = categoryIcons[selectedCategory || 'Bilim'] || 'comment-question';

    return (
      <PaperProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: color + '11', padding: 18, paddingTop: 36, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, marginBottom: 8, shadowColor: color, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
              <Avatar.Icon icon={icon} size={40} style={{ backgroundColor: color, marginRight: 10 }} />
              <Title style={{ fontSize: 24, fontWeight: 'bold', color: '#222', letterSpacing: 1 }}>{selectedCategory || 'Soru-Cevap'} Soru-Cevap</Title>
              <IconButton icon="arrow-left" iconColor="#222" size={24} style={{ marginLeft: 'auto' }} onPress={() => setAppScreen('categoryDetail')} />
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', padding: 18 }} keyboardShouldPersistTaps="handled">
              {messages
                .filter(m => m.category === selectedCategory)
                .map((item, i) => (
                  <View key={i} style={{ marginBottom: 18 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
                      <Avatar.Text size={32} label={item.user[0].toUpperCase()} style={{ backgroundColor: color, marginHorizontal: 6 }} color="#fff" />
                      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 12, maxWidth: '80%', elevation: 2, shadowColor: '#aaa', shadowOpacity: 0.1, shadowRadius: 4 }}>
                        <Text style={{ color: color, fontWeight: 'bold', marginBottom: 2 }}>{item.user}</Text>
                        <Text style={{ fontSize: 16, color: '#222' }}>{item.text}</Text>
                      </View>
                    </View>
                    {item.answer && (
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginLeft: 38 }}>
                        <Avatar.Text size={28} label="AI" style={{ backgroundColor: '#43a047', marginHorizontal: 6 }} color="#fff" />
                        <View style={{ backgroundColor: '#eafaf1', borderRadius: 16, padding: 12, maxWidth: '80%', borderLeftWidth: 6, borderLeftColor: color, elevation: 2, shadowColor: color, shadowOpacity: 0.1, shadowRadius: 4 }}>
                          <Text style={{ color: '#27ae60', fontWeight: 'bold', marginBottom: 2 }}>Yapay Zeka</Text>
                          <Text style={{ fontSize: 16, color: '#222' }}>{item.answer}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
            </ScrollView>
            <View style={{ padding: 18, backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, elevation: 8 }}>
              <TextInput
                placeholder="Sorunuzu yazın..."
                value={message}
                onChangeText={setMessage}
                mode="outlined"
                style={{ marginBottom: 10, backgroundColor: '#fff', fontSize: 18 }}
                outlineColor={color}
                activeOutlineColor={color}
                editable={!loading}
              />
              <Button
                mode="contained"
                onPress={handleQASend}
                disabled={!message.trim() || loading}
                style={{ borderRadius: 10, backgroundColor: color, marginBottom: 6 }}
                contentStyle={{ paddingVertical: 8 }}
                labelStyle={{ fontWeight: 'bold', fontSize: 18 }}
                icon="send"
              >
                Sor
              </Button>
              {loading && (
                <Text style={{ color: color, fontWeight: 'bold', marginTop: 8, fontSize: 16, textAlign: 'center' }}>Cevaplanıyor...</Text>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  // Quiz ekranı
  if (appScreen === 'quiz') {
    // Test seçilmediyse test butonlarını göster
    if (!selectedTest) {
      return (
        <PaperProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
            <Card style={{ flex: 1, margin: 18, borderRadius: 18, elevation: 6, backgroundColor: '#fff', padding: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2196f3', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14 }}>
                <Title style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Mini Quiz</Title>
                <IconButton icon="arrow-left" iconColor="#fff" size={24} onPress={() => {
                  setAppScreen('categoryDetail');
                  setSelectedTest(null);
                }} />
              </View>
              <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Title style={{ fontSize: 22, color: '#2196f3', marginBottom: 18, textAlign: 'center' }}>Lütfen çözmek istediğiniz testi seçin:</Title>
                {availableTests.length === 0 ? (
                  <Paragraph style={{ color: '#888', fontSize: 18 }}>Hiç test bulunamadı.</Paragraph>
                ) : (
                  availableTests.map((testNo) => (
                    <Button
                      key={testNo}
                      mode="contained"
                      onPress={() => {
                        setSelectedTest(testNo);
                        setShowResults(false);
                        setQuizResults(null);
                        setCurrentQuestion(0);
                        setSelectedAnswers({});
                      }}
                      style={{
                        width: 220,
                        marginVertical: 8,
                        borderRadius: 14,
                        backgroundColor: '#2196f3',
                        elevation: 2
                      }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}
                    >
                      Test-{testNo}
                    </Button>
                  ))
                )}
              </ScrollView>
            </Card>
          </SafeAreaView>
        </PaperProvider>
      );
    }

    if (showResults && quizResults) {
      return (
        <PaperProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
            <Card style={{ flex: 1, margin: 18, borderRadius: 18, elevation: 6, backgroundColor: '#fff', padding: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2196f3', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14 }}>
                <Title style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Quiz Sonuçları</Title>
                <IconButton icon="arrow-left" iconColor="#fff" size={24} onPress={() => {
                  setSelectedTest(null);
                  setCurrentQuestion(0);
                  setSelectedAnswers({});
                  setShowResults(false);
                  setQuizResults(null);
                }} />
              </View>
              <ScrollView style={{ padding: 18, paddingBottom: 100 }}>
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <Title style={{ fontSize: 24, color: '#2196f3', marginBottom: 12 }}>Puanınız: {quizResults.score}/{quizResults.totalQuestions}</Title>
                  <Paragraph style={{ color: '#666', fontSize: 16, textAlign: 'center', marginBottom: 24 }}>
                    {quizResults.score === quizResults.totalQuestions ? '🎉 Mükemmel! Tüm soruları doğru bildiniz!' :
                     quizResults.score >= quizResults.totalQuestions * 0.7 ? '👏 Çok iyi! Neredeyse tamamını bildiniz!' :
                     quizResults.score >= quizResults.totalQuestions * 0.5 ? '👍 İyi gidiyorsunuz! Daha fazla çalışın.' :
                     '💪 Biraz daha çalışmanız gerekiyor. Pes etmeyin!'}
                  </Paragraph>
                </View>
                {quizResults.results.map((result: any, index: number) => (
                  <Card key={index} style={{ marginBottom: 16, backgroundColor: result.isCorrect ? '#e8f5e9' : '#ffebee' }}>
                    <Card.Content>
                      <Paragraph style={{ fontWeight: 'bold', marginBottom: 8 }}>Soru {index + 1}: {result.question}</Paragraph>
                      <Paragraph style={{ color: result.isCorrect ? '#2e7d32' : '#c62828' }}>
                        {result.isCorrect ? '✓ Doğru cevap!' : `✗ Yanlış cevap. Doğru cevap: ${result.correctAnswer}`}
                      </Paragraph>
                    </Card.Content>
                  </Card>
                ))}
                {quizResults.aiAnalysis && (
                  <View style={{ marginTop: 24 }}>
                    <Title style={{ fontSize: 20, color: '#2196f3', marginBottom: 12 }}>AI Analizi</Title>
                    <Card style={{ marginBottom: 16, backgroundColor: '#e3f2fd' }}>
                      <Card.Content>
                        <Title style={{ fontSize: 16, color: '#1976d2' }}>Güçlü Yönler</Title>
                        {quizResults.aiAnalysis.strengths.map((strength: string, index: number) => (
                          <Paragraph key={index} style={{ marginLeft: 8 }}>• {strength}</Paragraph>
                        ))}
                      </Card.Content>
                    </Card>
                    <Card style={{ marginBottom: 16, backgroundColor: '#fff3e0' }}>
                      <Card.Content>
                        <Title style={{ fontSize: 16, color: '#f57c00' }}>Geliştirilmesi Gereken Alanlar</Title>
                        {quizResults.aiAnalysis.weaknesses.map((weakness: string, index: number) => (
                          <Paragraph key={index} style={{ marginLeft: 8 }}>• {weakness}</Paragraph>
                        ))}
                      </Card.Content>
                    </Card>
                    <Card style={{ marginBottom: 16, backgroundColor: '#e8f5e9' }}>
                      <Card.Content>
                        <Title style={{ fontSize: 16, color: '#2e7d32' }}>Öneriler</Title>
                        {quizResults.aiAnalysis.recommendations.map((rec: string, index: number) => (
                          <Paragraph key={index} style={{ marginLeft: 8 }}>• {rec}</Paragraph>
                        ))}
                      </Card.Content>
                    </Card>
                    <Card style={{ marginBottom: 16, backgroundColor: '#f3e5f5' }}>
                      <Card.Content>
                        <Title style={{ fontSize: 16, color: '#7b1fa2' }}>Çalışma Planı</Title>
                        {quizResults.aiAnalysis.studyPlan.map((plan: string, index: number) => (
                          <Paragraph key={index} style={{ marginLeft: 8 }}>• {plan}</Paragraph>
                        ))}
                      </Card.Content>
                    </Card>
                    <Card style={{ marginBottom: 16, backgroundColor: '#e8eaf6' }}>
                      <Card.Content>
                        <Title style={{ fontSize: 16, color: '#3f51b5' }}>Motivasyonel Mesaj</Title>
                        <Paragraph style={{ fontStyle: 'italic' }}>{quizResults.aiAnalysis.motivationalMessage}</Paragraph>
                      </Card.Content>
                    </Card>
                  </View>
                )}
                <Button
                  mode="contained"
                  onPress={() => {
                    setSelectedTest(null);
                    setCurrentQuestion(0);
                    setSelectedAnswers({});
                    setShowResults(false);
                    setQuizResults(null);
                  }}
                  style={{ marginVertical: 24, backgroundColor: '#2196f3' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                >
                  Tekrar Dene
                </Button>
              </ScrollView>
            </Card>
          </SafeAreaView>
        </PaperProvider>
      );
    }

    if (quizzes.length === 0) {
      return (
        <PaperProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
            <Card style={{ flex: 1, margin: 18, borderRadius: 18, elevation: 6, backgroundColor: '#fff', padding: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2196f3', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14 }}>
                <Title style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Mini Quiz</Title>
                <IconButton icon="arrow-left" iconColor="#fff" size={24} onPress={() => setAppScreen('categoryDetail')} />
              </View>
              <View style={{ padding: 18, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <ActivityIndicator size="large" color="#2196f3" />
                <Paragraph style={{ marginTop: 16, color: '#666' }}>Quiz soruları yükleniyor...</Paragraph>
      </View>
            </Card>
    </SafeAreaView>
        </PaperProvider>
      );
    }

    const currentQuiz = quizzes[currentQuestion];

    return (
      <PaperProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
          <Card style={{ flex: 1, margin: 18, borderRadius: 18, elevation: 6, backgroundColor: '#fff', padding: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2196f3', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14 }}>
              <Title style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Mini Quiz</Title>
              <IconButton icon="arrow-left" iconColor="#fff" size={24} onPress={() => {
                setSelectedTest(null);
                setCurrentQuestion(0);
                setSelectedAnswers({});
                setShowResults(false);
                setQuizResults(null);
              }} />
            </View>
            <ScrollView style={{ padding: 18 }}>
              <View style={{ marginBottom: 16 }}>
                <Paragraph style={{ color: '#666' }}>Soru {currentQuestion + 1}/{quizzes.length}</Paragraph>
              </View>
              <Title style={{ fontSize: 20, color: '#333', marginBottom: 20 }}>{currentQuiz.question}</Title>
              <View style={{ gap: 12 }}>
                {currentQuiz.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    mode="outlined"
                    onPress={() => handleAnswerSelect(currentQuiz._id, option)}
                    style={{
                      borderColor: selectedAnswers[currentQuiz._id] === option ? '#2196f3' : '#ddd',
                      backgroundColor: selectedAnswers[currentQuiz._id] === option ? '#e3f2fd' : '#fff',
                    }}
                    labelStyle={{
                      color: '#333',
                      fontSize: 16,
                      textAlign: 'left',
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderTopWidth: 1, borderTopColor: '#eee' }}>
              <Button
                mode="outlined"
                onPress={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                style={{ borderColor: '#2196f3' }}
                labelStyle={{ color: '#2196f3' }}
              >
                ← Önceki
              </Button>
              {currentQuestion === quizzes.length - 1 ? (
                <Button
                  mode="contained"
                  onPress={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length !== quizzes.length}
                  style={{ backgroundColor: Object.keys(selectedAnswers).length === quizzes.length ? '#2196f3' : '#ccc' }}
                  labelStyle={{ color: '#fff' }}
                >
                  Bitir
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={() => setCurrentQuestion(prev => Math.min(quizzes.length - 1, prev + 1))}
                  style={{ backgroundColor: '#2196f3' }}
                  labelStyle={{ color: '#fff' }}
                >
                  Sonraki →
                </Button>
              )}
            </View>
          </Card>
        </SafeAreaView>
      </PaperProvider>
    );
  }
}
