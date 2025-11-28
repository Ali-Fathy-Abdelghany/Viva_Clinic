const Chat = require('./models/chatModel.js');
module.exports = {
  async saveMessage(data) {
    return await ChatMessage.create(data);
  },

  async getRoomMessages(roomId) {
    return await ChatMessage.findAll({
      where: { roomId },
      order: [['createdAt', 'ASC']]
    });
  }
};
