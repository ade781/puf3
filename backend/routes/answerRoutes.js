const express = require('express');
const { submitAnswer, getStatistics } = require('../controllers/answerController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, submitAnswer);
router.get('/statistics', auth, getStatistics);

module.exports = router;
