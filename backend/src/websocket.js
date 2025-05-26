const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const Message = require('./models/message.model');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  const clients = new Map(); // Kullanıcı bağlantılarını tutacak
  const onlineUsers = new Set(); // Online kullanıcıları tutacak

  wss.on('connection', (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, ws);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case 'user_join':
            // Kullanıcıyı online listesine ekle
            onlineUsers.add(data.username);
            // Tüm kullanıcılara güncel online listesini gönder
            broadcastOnlineUsers();
            break;

          case 'message':
            // Mesajı önce MongoDB'ye kaydet
            const msg = new Message({
              user: data.message.user,
              text: data.message.text,
              category: data.message.category,
              timestamp: data.message.timestamp || new Date()
            });
            await msg.save();
            // Mesajı tüm kullanıcılara ilet
            broadcastMessage(msg);
            break;

          case 'typing':
            // Yazıyor... durumunu diğer kullanıcılara ilet
            broadcastTypingStatus(data.username, data.isTyping);
            break;
        }
      } catch (error) {
        console.error('WebSocket mesaj işleme hatası:', error);
      }
    });

    ws.on('close', () => {
      // Kullanıcıyı listeden çıkar
      const username = Array.from(clients.entries())
        .find(([_, client]) => client === ws)?.[0];
      
      if (username) {
        onlineUsers.delete(username);
        broadcastOnlineUsers();
      }
      
      clients.delete(clientId);
    });
  });

  // Tüm bağlı kullanıcılara mesaj gönder
  function broadcastMessage(message) {
    const messageData = JSON.stringify({
      type: 'message',
      message: message
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageData);
      }
    });
  }

  // Yazıyor... durumunu yayınla
  function broadcastTypingStatus(username, isTyping) {
    const typingData = JSON.stringify({
      type: 'typing',
      username: username,
      isTyping: isTyping
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(typingData);
      }
    });
  }

  // Online kullanıcı listesini yayınla
  function broadcastOnlineUsers() {
    const usersData = JSON.stringify({
      type: 'online_users',
      users: Array.from(onlineUsers)
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(usersData);
      }
    });
  }
}

module.exports = setupWebSocket; 