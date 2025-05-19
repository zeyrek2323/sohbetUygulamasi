import React, { useState } from 'react';
import { SafeAreaView, View, FlatList, Text, ScrollView, Image, ImageBackground } from 'react-native';
import { Provider as PaperProvider, Card, TextInput, Button, Title, Paragraph, Modal, Portal, Chip, Avatar, IconButton, List } from 'react-native-paper';

const CATEGORIES = ['Tarih', 'Bilim', 'Spor', 'Teknoloji', 'Müzik'];
const CATEGORY_INFOS: { [key: string]: string } = {
  'Tarih': 'Tarih, geçmişte yaşanan olayları inceleyen bilim dalıdır. İnsanlık tarihinin önemli dönüm noktalarını ve uygarlıkların gelişimini kapsar.',
  'Bilim': 'Bilim, evreni ve doğayı anlamak için yapılan sistematik çalışmalardır. Deney, gözlem ve mantık yoluyla bilgi üretir.',
  'Spor': 'Spor, bedensel ve zihinsel gelişimi destekleyen, rekabet ve eğlence amaçlı yapılan fiziksel aktivitelerdir.',
  'Teknoloji': 'Teknoloji, insan hayatını kolaylaştıran araç, gereç ve yöntemlerin geliştirilmesidir. Günümüzde hızla gelişmektedir.',
  'Müzik': 'Müzik, sesin ritim, melodi ve armoniyle birleşerek oluşturduğu sanattır. Kültürlerin önemli bir parçasıdır.'
};

const BACKEND_URL = 'http://10.2.20.107:5000';

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
  const [messages, setMessages] = useState<{user: string, text: string, category: string}[]>([]);
  const [users, setUsers] = useState<{username: string, password: string}[]>([]);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [appScreen, setAppScreen] = useState<'home' | 'categoryDetail' | 'chat'>('home');
  const [aboutVisible, setAboutVisible] = useState(false);

  const handleSend = () => {
    if (message.trim() !== '' && selectedCategory) {
      setMessages([...messages, { user: username, text: message, category: selectedCategory }]);
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
          <Card style={{ margin: 24, borderRadius: 18, elevation: 6, backgroundColor: '#fff', padding: 0, overflow: 'hidden', flex: 1 }}>
            <View style={{ alignItems: 'flex-end', padding: 8 }}>
              <IconButton icon="close" size={28} onPress={() => {
                setIsLoggedIn(false);
                setUsername('');
                setPassword('');
                setMessage('');
                setMessages([]);
                setSelectedCategory(null);
                setAppScreen('home');
              }} />
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={{ alignItems: 'center', padding: 28, paddingBottom: 18 }}>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', position: 'absolute', left: 0, top: 0 }}>
                  <IconButton icon="menu" size={32} onPress={() => setShowCategoryDrawer(true)} />
                </View>
                <Avatar.Icon size={72} icon="chat" style={{ backgroundColor: '#2196f3', marginBottom: 18 }} />
                <Title style={{ textAlign: 'center', fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 10 }}>Bilgi, Eğlence ve Sohbet Tek Yerde!</Title>
                <Paragraph style={{ textAlign: 'center', color: '#1976d2', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Kategorini seç, hemen sohbete katıl.</Paragraph>
                <Paragraph style={{ textAlign: 'center', color: '#888', fontSize: 16, marginBottom: 18 }}>Eğlen, öğren, paylaş! Farklı alanlarda insanlarla buluş, yeni bilgiler keşfet.</Paragraph>
              </View>
              {/* Alt Bölme */}
              <View style={{ backgroundColor: '#f5f6fa', paddingVertical: 22, paddingHorizontal: 24, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
                <Title style={{ fontSize: 20, color: '#1976d2', fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>Neden Bu Uygulama?</Title>
                <List.Item
                  title="Gerçek Zamanlı Sohbet"
                  description="Anında mesajlaş, aktif topluluklarla iletişimde kal."
                  left={props => <List.Icon {...props} icon="message-flash" color="#2196f3" />}
                />
                <List.Item
                  title="Farklı Kategoriler"
                  description="İlgi alanına göre sohbet odası seç, yeni bilgiler edin."
                  left={props => <List.Icon {...props} icon="shape" color="#1976d2" />}
                />
                <List.Item
                  title="Güvenli ve Anonim"
                  description="Kişisel bilgilerin korunur, güvenli bir ortamda sohbet et."
                  left={props => <List.Icon {...props} icon="shield-check" color="#43a047" />}
                />
                <List.Item
                  title="Kullanıcı Dostu Tasarım"
                  description="Modern ve sade arayüz ile kolay kullanım."
                  left={props => <List.Icon {...props} icon="cellphone" color="#ff9800" />}
                />
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                  <Button mode="text" onPress={() => setAboutVisible(true)} labelStyle={{ color: '#888', textDecorationLine: 'underline' }}>Hakkımızda</Button>
                </View>
              </View>
            </ScrollView>
          </Card>
          <Portal>
            <Modal visible={showCategoryDrawer} onDismiss={() => setShowCategoryDrawer(false)} contentContainerStyle={{ backgroundColor: '#fff', margin: 32, borderRadius: 18, padding: 24 }}>
              <Title style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 16 }}>Kategori Seç</Title>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 }}>
                {CATEGORIES.map(cat => (
                  <Card
                    key={cat}
                    style={{
                      width: 120,
                      margin: 8,
                      borderRadius: 16,
                      elevation: selectedCategory === cat ? 8 : 2,
                      backgroundColor: selectedCategory === cat ? '#2196f3' : '#f5f6fa',
                      alignItems: 'center',
                      paddingVertical: 18,
                    }}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDrawer(false);
                      setAppScreen('categoryDetail');
                    }}
                  >
                    <Avatar.Icon
                      size={36}
                      icon={CATEGORY_ICONS[cat]}
                      color={selectedCategory === cat ? '#fff' : '#2196f3'}
                      style={{ backgroundColor: selectedCategory === cat ? '#1976d2' : '#e3f2fd', marginBottom: 8 }}
                    />
                    <Paragraph style={{ color: selectedCategory === cat ? '#fff' : '#2196f3', fontWeight: 'bold', fontSize: 16 }}>{cat}</Paragraph>
                  </Card>
                ))}
              </View>
              <Button mode="contained" onPress={() => setShowCategoryDrawer(false)} style={{ borderRadius: 10, backgroundColor: '#e74c3c' }} labelStyle={{ color: '#fff', fontWeight: 'bold' }}>Kapat</Button>
            </Modal>
            <Modal visible={aboutVisible} onDismiss={() => setAboutVisible(false)} contentContainerStyle={{ backgroundColor: '#fff', margin: 32, borderRadius: 18, padding: 24 }}>
              <Title style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 10 }}>Hakkımızda</Title>
              <Paragraph style={{ textAlign: 'center', color: '#1976d2', fontSize: 16, marginBottom: 10 }}>
                Sohbet Uygulaması, bilgi paylaşımı ve eğlenceli sohbetler için tasarlanmış modern bir platformdur. Amacımız, farklı ilgi alanlarına sahip insanları güvenli ve keyifli bir ortamda buluşturmak.
              </Paragraph>
              <Paragraph style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>Geliştirici:</Text> Doğukan Enes Zeyrek
              </Paragraph>
              <Paragraph style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 18 }}>
                <Text style={{ fontWeight: 'bold' }}>İletişim:</Text> zeyrekdogukan@gmail.com
              </Paragraph>
              <Button mode="contained" onPress={() => setAboutVisible(false)} style={{ borderRadius: 10, backgroundColor: '#2196f3"', marginTop: 8 }} labelStyle={{ color: '#fff', fontWeight: 'bold' }}>Kapat</Button>
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
            <View style={{ alignItems: 'flex-end', padding: 8, paddingTop: 32 }}>
              <IconButton icon="close" size={28} onPress={() => setAppScreen('home')} />
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
                mode="outlined"
                disabled
                style={{ borderRadius: 14, borderColor: '#bdbdbd', marginBottom: 12, width: '100%', paddingVertical: 10 }}
                labelStyle={{ color: '#bdbdbd', fontWeight: 'bold', fontSize: 18 }}
              >
                Mini Quiz (Çok Yakında)
              </Button>
              <Button
                mode="outlined"
                disabled
                style={{ borderRadius: 14, borderColor: '#bdbdbd', width: '100%', paddingVertical: 10 }}
                labelStyle={{ color: '#bdbdbd', fontWeight: 'bold', fontSize: 18 }}
              >
                Soru-Cevap (Çok Yakında)
              </Button>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </PaperProvider>
    );
  }

  // Sohbet ekranı
  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
        <Card style={{ flex: 1, margin: 18, borderRadius: 18, elevation: 6, backgroundColor: '#fff', padding: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2196f3', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton icon={CATEGORY_ICONS[selectedCategory || 'Tarih']} color="#fff" size={28} />
              <Title style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 4 }}>{selectedCategory ? selectedCategory + ' Sohbeti' : 'Sohbet Odası'}</Title>
            </View>
            <IconButton icon="logout" color="#fff" size={24} onPress={() => {
              setIsLoggedIn(false);
              setUsername('');
              setPassword('');
              setMessage('');
              setMessages([]);
              setSelectedCategory(null);
              setAppScreen('home');
            }} />
          </View>
          <FlatList
            data={messages.filter(m => m.category === selectedCategory)}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: 18, paddingBottom: 30 }}
            renderItem={({ item }) => (
              <View style={{ flexDirection: item.user === username ? 'row-reverse' : 'row', alignItems: 'flex-end', marginBottom: 10 }}>
                <Avatar.Text
                  size={32}
                  label={item.user[0].toUpperCase()}
                  style={{ backgroundColor: item.user === username ? '#2196f3' : '#bdbdbd', marginHorizontal: 6 }}
                  color="#fff"
                />
                <Card style={{
                  backgroundColor: item.user === username ? '#2196f3' : '#f5f6fa',
                  borderRadius: 14,
                  maxWidth: '75%',
                  minWidth: 80,
                  marginHorizontal: 2,
                  elevation: 2,
                }}>
                  <Card.Content>
                    <Paragraph style={{ color: item.user === username ? '#fff' : '#2196f3', fontWeight: 'bold', marginBottom: 2 }}>{item.user}</Paragraph>
                    <Paragraph style={{ color: item.user === username ? '#fff' : '#222', fontSize: 16 }}>{item.text}</Paragraph>
                  </Card.Content>
                </Card>
              </View>
            )}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', margin: 14 }}>
            <TextInput
              placeholder="Mesajınızı yazın..."
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              style={{ flex: 1, backgroundColor: '#fafbfc', borderRadius: 25, marginRight: 8 }}
              outlineColor="#ddd"
              activeOutlineColor="#2196f3"
            />
            <Button
              mode="contained"
              onPress={handleSend}
              style={{ borderRadius: 25, backgroundColor: '#2196f3', paddingVertical: 4 }}
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
            >
              Gönder
            </Button>
          </View>
          <Button
            mode="outlined"
            onPress={() => setAppScreen('home')}
            style={{ borderRadius: 10, marginHorizontal: 18, marginBottom: 12, borderColor: '#2196f3' }}
            labelStyle={{ color: '#2196f3', fontWeight: 'bold', fontSize: 15 }}
          >
            ← Kategorilere Dön
          </Button>
        </Card>
      </SafeAreaView>
    </PaperProvider>
  );
}