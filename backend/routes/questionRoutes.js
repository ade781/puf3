const express = require('express');
const {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    deleteQuestion
} = require('../controllers/questionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createQuestion);
router.get('/', auth, getAllQuestions);
router.get('/:id', auth, getQuestionById);
router.delete('/:id', auth, deleteQuestion);

module.exports = router;
