const { Room, User, RoomSongRound, RoomSongGuess } = require('../models');

const RANDOM_QUERIES = [
    'love',
    'romantic',
    'pop',
    'ballad',
    'acoustic',
    'rnb',
    'chill',
    'indie',
    'classic',
    'indonesia'
];

const normalizeText = (value) => value.toLowerCase().replace(/\s+/g, ' ').trim();

const fetchRandomTrack = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const query = RANDOM_QUERIES[Math.floor(Math.random() * RANDOM_QUERIES.length)];
        const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            continue;
        }
        const data = await response.json();
        const candidates = (data.data || []).filter((track) => track.preview);
        if (!candidates.length) {
            continue;
        }
        const track = candidates[Math.floor(Math.random() * candidates.length)];
        return {
            id: track.id,
            title: track.title,
            artist: track.artist?.name,
            preview: track.preview,
            cover: track.album?.cover_medium
        };
    }
    return null;
};

const getRoomOrFail = async (roomCode, userId) => {
    const room = await Room.findOne({ where: { code: roomCode } });
    if (!room) {
        return { error: { status: 404, message: 'Room not found' } };
    }

    if (room.user1Id !== userId && room.user2Id !== userId) {
        return { error: { status: 403, message: 'You are not in this room' } };
    }

    return { room };
};

const getCurrentRound = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const userId = req.userId;

        const { room, error } = await getRoomOrFail(roomCode, userId);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const include = [
            { model: Room, as: 'room', attributes: ['id', 'user1Id', 'user2Id'] },
            { model: User, as: 'askedBy', attributes: ['id', 'username', 'displayName'] },
            {
                model: RoomSongGuess,
                as: 'guesses',
                include: [{ model: User, as: 'user', attributes: ['id', 'username', 'displayName'] }]
            }
        ];

        let round = await RoomSongRound.findOne({
            where: { roomId: room.id, status: 'active' },
            order: [['createdAt', 'DESC']],
            include
        });

        if (!round) {
            round = await RoomSongRound.findOne({
                where: { roomId: room.id },
                order: [['createdAt', 'DESC']],
                include
            });
        }

        res.json({ round });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const startRandomRound = async (req, res) => {
    try {
        const { roomCode } = req.body;
        const userId = req.userId;

        const { room, error } = await getRoomOrFail(roomCode, userId);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const activeRound = await RoomSongRound.findOne({
            where: { roomId: room.id, status: 'active' }
        });

        if (activeRound) {
            return res.status(400).json({ message: 'Masih ada ronde aktif' });
        }

        const track = await fetchRandomTrack();
        if (!track) {
            return res.status(502).json({ message: 'Gagal mengambil lagu acak' });
        }

        const round = await RoomSongRound.create({
            roomId: room.id,
            askedByUserId: userId,
            deezerTrackId: String(track.id),
            title: track.title,
            artist: track.artist,
            previewUrl: track.preview,
            coverUrl: track.cover || null,
            status: 'active',
            surrenderedByUser1: false,
            surrenderedByUser2: false
        });

        const roundWithUser = await RoomSongRound.findByPk(round.id, {
            include: [{ model: User, as: 'askedBy', attributes: ['id', 'username', 'displayName'] }]
        });

        res.status(201).json({ round: roundWithUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const submitGuess = async (req, res) => {
    try {
        const { roundId, guessText } = req.body;
        const userId = req.userId;

        if (!guessText) {
            return res.status(400).json({ message: 'Tebakan wajib diisi' });
        }

        const round = await RoomSongRound.findByPk(roundId, {
            include: [{ model: Room, as: 'room' }]
        });

        if (!round) {
            return res.status(404).json({ message: 'Round not found' });
        }

        if (round.room.user1Id !== userId && round.room.user2Id !== userId) {
            return res.status(403).json({ message: 'You are not in this room' });
        }

        if (round.status !== 'active') {
            return res.status(400).json({ message: 'Ronde sudah selesai' });
        }

        const lastGuess = await RoomSongGuess.findOne({
            where: { roundId, userId },
            order: [['createdAt', 'DESC']]
        });

        if (lastGuess && !lastGuess.isCorrect) {
            const elapsed = Date.now() - new Date(lastGuess.createdAt).getTime();
            if (elapsed < 5000) {
                const retryAfter = Math.ceil((5000 - elapsed) / 1000);
                return res.status(429).json({ message: 'Tunggu sebentar sebelum mencoba lagi', retryAfter });
            }
        }

        const isCorrect = normalizeText(guessText) === normalizeText(round.title);

        const guess = await RoomSongGuess.create({
            roundId,
            userId,
            guessText: guessText.trim(),
            isCorrect
        });

        if (isCorrect) {
            await round.update({ status: 'completed' });
        }

        res.status(201).json({ guess, isCorrect });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const surrenderRound = async (req, res) => {
    try {
        const { roundId } = req.body;
        const userId = req.userId;

        const round = await RoomSongRound.findByPk(roundId, {
            include: [{ model: Room, as: 'room' }]
        });

        if (!round) {
            return res.status(404).json({ message: 'Round not found' });
        }

        if (round.room.user1Id !== userId && round.room.user2Id !== userId) {
            return res.status(403).json({ message: 'You are not in this room' });
        }

        if (round.status !== 'active') {
            return res.status(400).json({ message: 'Ronde sudah selesai' });
        }

        const updates = {};
        if (round.room.user1Id === userId) {
            updates.surrenderedByUser1 = true;
        }
        if (round.room.user2Id === userId) {
            updates.surrenderedByUser2 = true;
        }

        await round.update(updates);

        const shouldComplete = round.surrenderedByUser1 || updates.surrenderedByUser1;
        const shouldComplete2 = round.surrenderedByUser2 || updates.surrenderedByUser2;

        if (shouldComplete && shouldComplete2) {
            await round.update({ status: 'completed' });
        }

        res.json({ message: 'Surrender tercatat' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const userId = req.userId;

        const { room, error } = await getRoomOrFail(roomCode, userId);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const rounds = await RoomSongRound.findAll({
            where: { roomId: room.id },
            include: [
                { model: User, as: 'askedBy', attributes: ['id', 'username', 'displayName'] },
                {
                    model: RoomSongGuess,
                    as: 'guesses',
                    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'displayName'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ rounds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getCurrentRound,
    startRandomRound,
    submitGuess,
    surrenderRound,
    getHistory
};
