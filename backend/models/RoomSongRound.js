const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const RoomSongRound = sequelize.define('RoomSongRound', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'room_id'
    },
    askedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'asked_by_user_id'
    },
    deezerTrackId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'deezer_track_id'
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'title'
    },
    artist: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'artist'
    },
    previewUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'preview_url'
    },
    coverUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'cover_url'
    },
    status: {
        type: DataTypes.ENUM('active', 'completed'),
        defaultValue: 'active',
        field: 'status'
    },
    surrenderedByUser1: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'surrendered_by_user1'
    },
    surrenderedByUser2: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'surrendered_by_user2'
    }
}, {
    timestamps: true,
    tableName: 'room_song_rounds'
});

module.exports = RoomSongRound;
