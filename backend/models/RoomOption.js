const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const RoomOption = sequelize.define('RoomOption', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'question_id'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    optionText: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'option_text'
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_correct'
    }
}, {
    timestamps: true,
    tableName: 'room_options'
});

module.exports = RoomOption;
