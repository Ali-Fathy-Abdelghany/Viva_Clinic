const chatService = require('./chatService');

module.exports = {
  async getMessages(req, res) {
    const { roomId } = req.params;
    const messages = await chatService.getRoomMessages(roomId);
    res.json(messages);
  }
};
