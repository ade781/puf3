const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const RoomQuestion = sequelize.define('RoomQuestion', {
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
    questionText: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'question_text'
    },
    status: {
        type: DataTypes.ENUM('active', 'completed'),
        defaultValue: 'active'
    }
}, {
    timestamps: true,
    tableName: 'room_questions'
});

module.exports = RoomQuestion;
