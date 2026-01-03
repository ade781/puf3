const { Answer, Question, User } = require('../models');

const submitAnswer = async (req, res) => {
    try {
        const { questionId, answerText } = req.body;
        const userId = req.userId;

        // Check if question exists
        const question = await Question.findByPk(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check if user already answered
        const existingAnswer = await Answer.findOne({
            where: { questionId, userId }
        });

        if (existingAnswer) {
            return res.status(400).json({ message: 'You have already answered this question' });
        }

        // Determine if answer is correct
        let isCorrect = false;

        if (userId === question.creatorId) {
            // Creator is answering their own question (shouldn't happen, but handle it)
            isCorrect = answerText.toLowerCase().trim() === question.creatorAnswer.toLowerCase().trim();
        } else {
            // Other user answering creator's question
            isCorrect = answerText.toLowerCase().trim() === question.creatorAnswer.toLowerCase().trim();
        }

        // Create answer
        const answer = await Answer.create({
            questionId,
            userId,
            answerText,
            isCorrect
        });

        // Check if all users have answered (2 users)
        const allAnswers = await Answer.findAll({ where: { questionId } });
        if (allAnswers.length >= 2) {
            await question.update({ status: 'completed' });
        }

        const answerWithUser = await Answer.findByPk(answer.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'displayName']
            }]
        });

        res.status(201).json({
            message: 'Answer submitted successfully',
            answer: answerWithUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getStatistics = async (req, res) => {
    try {
        const userId = req.userId;

        // Get all completed questions
        const completedQuestions = await Question.findAll({
            where: { status: 'completed' },
            include: [{
                model: Answer,
                as: 'answers'
            }]
        });

        // Calculate statistics
        let totalQuestions = completedQuestions.length;
        let correctAnswers = 0;
        let questionsAsked = 0;
        let questionsAnswered = 0;

        completedQuestions.forEach(q => {
            if (q.creatorId === userId) {
                questionsAsked++;
            }

            const userAnswer = q.answers.find(a => a.userId === userId);
            if (userAnswer) {
                questionsAnswered++;
                if (userAnswer.isCorrect) {
                    correctAnswers++;
                }
            }
        });

        const compatibilityScore = totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : 0;

        res.json({
            statistics: {
                totalQuestions,
                correctAnswers,
                questionsAsked,
                questionsAnswered,
                compatibilityScore
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    submitAnswer,
    getStatistics
};
