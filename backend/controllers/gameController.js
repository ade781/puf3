const { RoomQuestion, RoomAnswer, Room, User } = require('../models');

const createQuestion = async (req, res) => {
    try {
        const { roomCode, questionText } = req.body;
        const userId = req.userId;

        const room = await Room.findOne({ where: { code: roomCode } });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.user1Id !== userId && room.user2Id !== userId) {
            return res.status(403).json({ message: 'You are not in this room' });
        }

        const question = await RoomQuestion.create({
            roomId: room.id,
            askedByUserId: userId,
            questionText,
            status: 'active'
        });

        // Update room's current question
        await room.update({ currentQuestionId: question.id });

        const questionWithUser = await RoomQuestion.findByPk(question.id, {
            include: [
                { model: User, as: 'askedBy', attributes: ['id', 'username', 'displayName'] }
            ]
        });

        res.status(201).json({
            message: 'Question created successfully',
            question: questionWithUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const submitAnswer = async (req, res) => {
    try {
        const { questionId, answerText } = req.body;
        const userId = req.userId;

        const question = await RoomQuestion.findByPk(questionId, {
            include: [{ model: Room, as: 'room' }]
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check if user already answered
        const existingAnswer = await RoomAnswer.findOne({
            where: { questionId, userId }
        });

        if (existingAnswer) {
            return res.status(400).json({ message: 'You have already answered this question' });
        }

        const answer = await RoomAnswer.create({
            questionId,
            userId,
            answerText,
            correctAnswerText: null
        });

        // Check if both answered, mark question as completed
        const allAnswers = await RoomAnswer.findAll({ where: { questionId } });
        if (allAnswers.length >= 2) {
            await question.update({ status: 'completed' });
        }

        res.status(201).json({
            message: 'Answer submitted successfully',
            answer
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCurrentQuestion = async (req, res) => {
    try {
        const { roomCode } = req.params;

        const room = await Room.findOne({
            where: { code: roomCode },
            include: [
                { model: User, as: 'user1', attributes: ['id', 'username', 'displayName'] },
                { model: User, as: 'user2', attributes: ['id', 'username', 'displayName'] }
            ]
        });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (!room.currentQuestionId) {
            return res.json({ question: null, room });
        }

        const question = await RoomQuestion.findByPk(room.currentQuestionId, {
            include: [
                { model: User, as: 'askedBy', attributes: ['id', 'username', 'displayName'] },
                {
                    model: RoomAnswer,
                    as: 'answers',
                    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'displayName'] }]
                }
            ]
        });

        res.json({ question, room });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getQuestionHistory = async (req, res) => {
    try {
        const { roomCode } = req.params;

        const room = await Room.findOne({ where: { code: roomCode } });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const questions = await RoomQuestion.findAll({
            where: { roomId: room.id },
            include: [
                { model: User, as: 'askedBy', attributes: ['id', 'username', 'displayName'] },
                {
                    model: RoomAnswer,
                    as: 'answers',
                    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'displayName'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ questions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const nextQuestion = async (req, res) => {
    try {
        const { roomCode } = req.params;

        const room = await Room.findOne({ where: { code: roomCode } });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await room.update({ currentQuestionId: null });

        res.json({ message: 'Ready for next question' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createQuestion,
    submitAnswer,
    getCurrentQuestion,
    getQuestionHistory,
    nextQuestion
};
