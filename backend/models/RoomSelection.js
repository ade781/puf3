const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const RoomSelection = sequelize.define('RoomSelection', {
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
    selectedOptionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'selected_option_id'
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_correct'
    }
}, {
    timestamps: true,
    tableName: 'room_selections'
});

module.exports = RoomSelection;
