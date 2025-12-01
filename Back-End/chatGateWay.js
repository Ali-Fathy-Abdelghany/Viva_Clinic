const chatService = require('./chatService');

module.exports = function (io) {
  io.on('connection', (socket) => {
    socket.on('joinRoom', ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on('sendMessage', async ({ roomId, senderId, receiverId, message }) => {
      const saved = await chatService.saveMessage({
        roomId,
        senderId,
        receiverId,
        message
      });

      io.to(roomId).emit('receiveMessage', saved);
    });

    socket.on('typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('typing', userId);
    });

    socket.on('stopTyping', ({ roomId, userId }) => {
      socket.to(roomId).emit('stopTyping', userId);
    });
  });
};
