// routes/chat.routes.js 
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController'); // Adjusted path assumption

// 1. Route to get the list of ALL recent conversations for a specific User ID.
// This is the endpoint that needed the fix (joining Doctor details).
// The corresponding controller function is `getConversations`.
// Example: GET /chat/user/9
router.get('/user/:userId', chatController.getConversations); 

// 2. Route to get the list of individual messages within a specific chat room ID.
// This is your original route for fetching messages in a single chat.
// Example: GET /chat/P1_D5
router.get('/:roomId', chatController.getMessages);

module.exports = router;
