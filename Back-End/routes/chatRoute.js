const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');

router.get('/:roomId', chatController.getMessages);

module.exports = router;
