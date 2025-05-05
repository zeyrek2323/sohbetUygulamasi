import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native';

const CATEGORIES = ['Tarih', 'Bilim', 'Spor', 'Teknoloji', 'Müzik'];
const CATEGORY_INFOS: { [key: string]: string } = {
  'Tarih': 'Tarih, geçmişte yaşanan olayları inceleyen bilim dalıdır. İnsanlık tarihinin önemli dönüm noktalarını ve uygarlıkların gelişimini kapsar.',
  'Bilim': 'Bilim, evreni ve doğayı anlamak için yapılan sistematik çalışmalardır. Deney, gözlem ve mantık yoluyla bilgi üretir.',
  'Spor': 'Spor, bedensel ve zihinsel gelişimi destekleyen, rekabet ve eğlence amaçlı yapılan fiziksel aktivitelerdir.',
  'Teknoloji': 'Teknoloji, insan hayatını kolaylaştıran araç, gereç ve yöntemlerin geliştirilmesidir. Günümüzde hızla gelişmektedir.',
  'Müzik': 'Müzik, sesin ritim, melodi ve armoniyle birleşerek oluşturduğu sanattır. Kültürlerin önemli bir parçasıdır.'
};

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{user: string, text: string, category: string}[]>([]);
  const [users, setUsers] = useState<{username: string, password: string}[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [appScreen, setAppScreen] = useState<'home' | 'chat'>('home');

  const handleSend = () => {
    if (message.trim() !== '' && selectedCategory) {
      setMessages([...messages, { user: username, text: message, category: selectedCategory }]);
      setMessage('');
    }
  };

  const handleLogin = () => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setIsLoggedIn(true);
      setAppScreen('home');
    } else {
      alert('Kullanıcı adı veya şifre hatalı!');
    }
  };

  const handleRegister = () => {
    if (username.trim() === '' || password.trim() === '') {
      alert('Kullanıcı adı ve şifre boş olamaz!');
      return;
    }
    
    const userExists = users.some(u => u.username === username);
    if (userExists) {
      alert('Bu kullanıcı adı zaten kullanılıyor!');
      return;
    }

    setUsers([...users, { username, password }]);
    alert('Kayıt başarılı! Giriş yapabilirsiniz.');
    setShowRegister(false);
    setUsername('');
    setPassword('');
  };

  // Giriş/Kayıt ekranı
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.authContainer}>
            <Text style={styles.title}>{showRegister ? 'Üye Ol' : 'Hoş Geldiniz'}</Text>
            <Text style={styles.subtitle}>
              {showRegister ? 'Yeni hesap oluşturun' : 'Hesabınıza giriş yapın'}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kullanıcı Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi girin"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity 
              style={styles.mainButton}
              onPress={showRegister ? handleRegister : handleLogin}
            >
              <Text style={styles.mainButtonText}>
                {showRegister ? "Üye Ol" : "Giriş Yap"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => {
                setShowRegister(!showRegister);
                setUsername('');
                setPassword('');
              }}
            >
              <Text style={styles.switchText}>
                {showRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Üye olun'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Anasayfa ekranı
  if (appScreen === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.homeHeader}>
          <TouchableOpacity onPress={() => setShowCategoryModal(true)} style={styles.categoryButton}>
            <Text style={styles.categoryButtonText}>☰ Kategoriler</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Anasayfa</Text>
        </View>
        <View style={styles.homeContent}>
          <Text style={styles.welcomeText}>Hoş geldin, {username}!</Text>
          <Text style={styles.subtitle}>Bir kategori seçerek sohbete başlayabilirsin.</Text>
          {selectedCategory && (
            <>
              <Text style={styles.selectedCategoryText}>Seçili Kategori: {selectedCategory}</Text>
              <Text style={styles.categoryInfoText}>{CATEGORY_INFOS[selectedCategory]}</Text>
            </>
          )}
          <TouchableOpacity
            style={[styles.mainButton, {marginTop: 30}]}
            disabled={!selectedCategory}
            onPress={() => setAppScreen('chat')}
          >
            <Text style={styles.mainButtonText}>Sohbete Gir</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={showCategoryModal}
          animationType="slide"
          transparent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Kategori Seç</Text>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={styles.categoryItem}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.categoryItemText}>{cat}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Sohbet ekranı
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{selectedCategory ? selectedCategory + ' Sohbeti' : 'Sohbet Odası'}</Text>
        <Text style={styles.welcomeText}>Hoş geldin, {username}!</Text>
      </View>
      
      <FlatList
        data={messages.filter(m => m.category === selectedCategory)}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item }) => (
          <View style={[
            styles.message,
            item.user === username ? styles.myMessage : styles.otherMessage
          ]}>
            <Text style={styles.user}>{item.user}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Mesajınızı yazın..."
          value={message}
          onChangeText={setMessage}
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
        >
          <Text style={styles.sendButtonText}>Gönder</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButtonBottom} onPress={() => {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        setMessage('');
        setMessages([]);
        setSelectedCategory(null);
        setAppScreen('home');
      }}>
        <Text style={styles.logoutTextBottom}>Çıkış Yap</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backToHomeButton} onPress={() => setAppScreen('home')}>
        <Text style={styles.backToHomeText}>← Anasayfaya Dön</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mainButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchText: {
    color: '#3498db',
    textAlign: 'center',
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  messagesContainer: {
    padding: 20,
  },
  message: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3498db',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  user: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: '#fff',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 25,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#2c3e50',
  },
  sendButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 25,
    width: 80,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButtonBottom: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 30,
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  logoutTextBottom: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryButton: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3498db',
    borderRadius: 20,
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  homeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  selectedCategoryText: {
    fontSize: 18,
    color: '#3498db',
    marginTop: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  categoryItemText: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backToHomeButton: {
    margin: 20,
    alignItems: 'center',
  },
  backToHomeText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryInfoText: {
    fontSize: 15,
    color: '#2c3e50',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
});