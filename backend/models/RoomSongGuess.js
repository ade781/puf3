const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const RoomSongGuess = sequelize.define('RoomSongGuess', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    roundId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'round_id'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    guessText: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'guess_text'
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_correct'
    }
}, {
    timestamps: true,
    tableName: 'room_song_guesses'
});

module.exports = RoomSongGuess;
