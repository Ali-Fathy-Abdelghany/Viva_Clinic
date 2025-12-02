// chat.controller.js

const chatService = require('./chatService');

module.exports = {
  /**
   * Endpoint to retrieve the list of recent conversations for a user.
   * Handles GET /chat/user/:userId
   */
  async getConversations(req, res) {
    const { userId } = req.params; // Get userId from the route parameter
    
    try {
      // Call a new service function to get the formatted list of conversations
      const conversations = await chatService.getConversationList(userId);
      
      if (!conversations) {
          return res.status(404).json({ message: 'User not found or no conversations exist.' });
      }

      // The service layer is responsible for fetching and formatting doctorName/doctorImage
      res.json(conversations);
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ 
        message: 'Internal Server Error while fetching conversations.',
        error: error.message 
      });
    }
  },
    
  /**
   * Endpoint to retrieve all messages within a specific chat room.
   * Handles GET /chat/:roomId
   */
  async getMessages(req, res) {
    const { roomId } = req.params;
    
    try {
        const messages = await chatService.getRoomMessages(roomId);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ 
            message: 'Internal Server Error while fetching messages.',
            error: error.message 
        });
    }
  }
};
