const express = require('express');
const {
    getCurrentRound,
    startRandomRound,
    submitGuess,
    surrenderRound,
    getHistory
} = require('../controllers/musicController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:roomCode/current', auth, getCurrentRound);
router.get('/:roomCode/history', auth, getHistory);
router.post('/random', auth, startRandomRound);
router.post('/guess', auth, submitGuess);
router.post('/surrender', auth, surrenderRound);

module.exports = router;
