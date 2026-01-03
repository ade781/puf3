const { Room, User } = require('../models');

// Generate random room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const createRoom = async (req, res) => {
    try {
        const userId = req.userId;

        // Generate unique room code
        let code;
        let existingRoom;
        do {
            code = generateRoomCode();
            existingRoom = await Room.findOne({ where: { code } });
        } while (existingRoom);

        const room = await Room.create({
            code,
            user1Id: userId,
            status: 'waiting'
        });

        const roomWithUsers = await Room.findByPk(room.id, {
            include: [
                { model: User, as: 'user1', attributes: ['id', 'username', 'displayName'] },
                { model: User, as: 'user2', attributes: ['id', 'username', 'displayName'] }
            ]
        });

        res.status(201).json({
            message: 'Room created successfully',
            room: roomWithUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const joinRoom = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.userId;

        const room = await Room.findOne({
            where: { code },
            include: [
                { model: User, as: 'user1', attributes: ['id', 'username', 'displayName'] },
                { model: User, as: 'user2', attributes: ['id', 'username', 'displayName'] }
            ]
        });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.user2Id) {
            return res.status(400).json({ message: 'Room is full' });
        }

        if (room.user1Id === userId) {
            return res.status(400).json({ message: 'You are already in this room' });
        }

        await room.update({
            user2Id: userId,
            status: 'playing'
        });

        const updatedRoom = await Room.findByPk(room.id, {
            include: [
                { model: User, as: 'user1', attributes: ['id', 'username', 'displayName'] },
                { model: User, as: 'user2', attributes: ['id', 'username', 'displayName'] }
            ]
        });

        res.json({
            message: 'Joined room successfully',
            room: updatedRoom
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getRoomState = async (req, res) => {
    try {
        const { code } = req.params;

        const room = await Room.findOne({
            where: { code },
            include: [
                { model: User, as: 'user1', attributes: ['id', 'username', 'displayName'] },
                { model: User, as: 'user2', attributes: ['id', 'username', 'displayName'] }
            ]
        });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json({ room });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const leaveRoom = async (req, res) => {
    try {
        const { code } = req.params;
        const userId = req.userId;

        const room = await Room.findOne({ where: { code } });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // If user1 leaves, close the room
        if (room.user1Id === userId) {
            await room.update({ status: 'finished' });
            return res.json({ message: 'Room closed' });
        }

        // If user2 leaves, set back to waiting
        if (room.user2Id === userId) {
            await room.update({
                user2Id: null,
                status: 'waiting'
            });
            return res.json({ message: 'Left room successfully' });
        }

        res.status(403).json({ message: 'You are not in this room' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createRoom,
    joinRoom,
    getRoomState,
    leaveRoom
};
