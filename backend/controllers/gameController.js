const { RoomQuestion, RoomOption, RoomSelection, Room, User } = require('../models');

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

const submitOptions = async (req, res) => {
    try {
        const { questionId, options } = req.body;
        const userId = req.userId;

        const question = await RoomQuestion.findByPk(questionId, {
            include: [{ model: Room, as: 'room' }]
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: 'At least two options are required' });
        }

        const existingOptions = await RoomOption.findOne({
            where: { questionId, userId }
        });

        if (existingOptions) {
            return res.status(400).json({ message: 'Options already submitted' });
        }

        const normalizedOptions = options
            .map((option) => ({
                optionText: String(option.optionText || '').trim(),
                isCorrect: Boolean(option.isCorrect)
            }))
            .filter((option) => option.optionText.length > 0);

        if (normalizedOptions.length < 2) {
            return res.status(400).json({ message: 'At least two valid options are required' });
        }

        const correctCount = normalizedOptions.filter((option) => option.isCorrect).length;
        if (correctCount !== 1) {
            return res.status(400).json({ message: 'Exactly one option must be marked correct' });
        }

        const createdOptions = await RoomOption.bulkCreate(
            normalizedOptions.map((option) => ({
                questionId,
                userId,
                optionText: option.optionText,
                isCorrect: option.isCorrect
            }))
        );

        res.status(201).json({
            message: 'Options submitted successfully',
            options: createdOptions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const submitSelection = async (req, res) => {
    try {
        const { questionId, selectedOptionId } = req.body;
        const userId = req.userId;

        if (!selectedOptionId) {
            return res.status(400).json({ message: 'Selected option is required' });
        }

        const question = await RoomQuestion.findByPk(questionId, {
            include: [{ model: Room, as: 'room' }]
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (question.room.user1Id !== userId && question.room.user2Id !== userId) {
            return res.status(403).json({ message: 'You are not in this room' });
        }

        const existingSelection = await RoomSelection.findOne({
            where: { questionId, userId }
        });

        if (existingSelection) {
            return res.status(400).json({ message: 'You already selected an option' });
        }

        const selectedOption = await RoomOption.findOne({
            where: { id: selectedOptionId, questionId }
        });

        if (!selectedOption) {
            return res.status(404).json({ message: 'Selected option not found' });
        }

        if (selectedOption.userId === userId) {
            return res.status(400).json({ message: 'You cannot pick your own options' });
        }

        const selection = await RoomSelection.create({
            questionId,
            userId,
            selectedOptionId: selectedOption.id,
            isCorrect: selectedOption.isCorrect
        });

        const allSelections = await RoomSelection.findAll({ where: { questionId } });
        if (allSelections.length >= 2) {
            await question.update({ status: 'completed' });
        }

        res.status(201).json({
            message: 'Selection submitted successfully',
            selection
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
                    model: RoomOption,
                    as: 'options',
                    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'displayName'] }]
                },
                {
                    model: RoomSelection,
                    as: 'selections',
                    include: [
                        { model: User, as: 'user', attributes: ['id', 'username', 'displayName'] },
                        { model: RoomOption, as: 'selectedOption' }
                    ]
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
                    model: RoomOption,
                    as: 'options',
                    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'displayName'] }]
                },
                {
                    model: RoomSelection,
                    as: 'selections',
                    include: [
                        { model: User, as: 'user', attributes: ['id', 'username', 'displayName'] },
                        { model: RoomOption, as: 'selectedOption' }
                    ]
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
    submitOptions,
    submitSelection,
    getCurrentQuestion,
    getQuestionHistory,
    nextQuestion
};
