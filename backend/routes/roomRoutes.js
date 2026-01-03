const express = require('express');
const {
    createRoom,
    joinRoom,
    getRoomState,
    leaveRoom
} = require('../controllers/roomController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/create', auth, createRoom);
router.post('/join', auth, joinRoom);
router.get('/:code', auth, getRoomState);
router.post('/:code/leave', auth, leaveRoom);

module.exports = router;
