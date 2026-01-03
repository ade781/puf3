const { Question, Answer, User } = require('../models');
const { Op } = require('sequelize');

const createQuestion = async (req, res) => {
    try {
        const { questionText, creatorAnswer } = req.body;
        const creatorId = req.userId;

        const question = await Question.create({
            creatorId,
            questionText,
            creatorAnswer,
            status: 'waiting'
        });

        const questionWithCreator = await Question.findByPk(question.id, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'username', 'displayName']
            }]
        });

        res.status(201).json({
            message: 'Question created successfully',
            question: questionWithCreator
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllQuestions = async (req, res) => {
    try {
        const userId = req.userId;

        const questions = await Question.findAll({
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'displayName']
                },
                {
                    model: Answer,
                    as: 'answers',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'displayName']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Add metadata for current user
        const questionsWithMeta = questions.map(q => {
            const questionObj = q.toJSON();
            const userAnswer = questionObj.answers.find(a => a.userId === userId);
            const otherAnswer = questionObj.answers.find(a => a.userId !== userId);

            return {
                ...questionObj,
                userHasAnswered: !!userAnswer,
                allAnswered: questionObj.answers.length >= 2,
                userAnswer: userAnswer || null,
                otherAnswer: otherAnswer || null
            };
        });

        res.json({ questions: questionsWithMeta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'displayName']
                },
                {
                    model: Answer,
                    as: 'answers',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'displayName']
                    }]
                }
            ]
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ question });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const question = await Question.findByPk(id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (question.creatorId !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this question' });
        }

        await Answer.destroy({ where: { questionId: id } });
        await question.destroy();

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    deleteQuestion
};
