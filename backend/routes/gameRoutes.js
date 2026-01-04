const express = require('express');
const {
    createQuestion,
    submitOptions,
    submitSelection,
    getCurrentQuestion,
    getQuestionHistory,
    nextQuestion
} = require('../controllers/gameController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/question', auth, createQuestion);
router.post('/options', auth, submitOptions);
router.post('/selection', auth, submitSelection);
router.get('/:roomCode/current', auth, getCurrentQuestion);
router.get('/:roomCode/history', auth, getQuestionHistory);
router.post('/:roomCode/next', auth, nextQuestion);

module.exports = router;
