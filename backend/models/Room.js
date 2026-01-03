const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Room = sequelize.define('Room', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(8),
        allowNull: false,
        unique: true
    },
    user1Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user1_id'
    },
    user2Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user2_id'
    },
    status: {
        type: DataTypes.ENUM('waiting', 'playing', 'finished'),
        defaultValue: 'waiting'
    },
    currentQuestionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'current_question_id'
    }
}, {
    timestamps: true,
    tableName: 'rooms'
});

module.exports = Room;
