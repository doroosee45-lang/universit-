const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware d'authentification Socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Token manquant'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Utilisateur connecté : ${socket.user.id}`);

    // Rejoindre une room personnelle
    socket.join(`user_${socket.user.id}`);
    // Rejoindre la room de son rôle
    socket.join(`role_${socket.user.role}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Utilisateur déconnecté : ${socket.user.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io non initialisé');
  return io;
};

module.exports = { initSocket, getIO };