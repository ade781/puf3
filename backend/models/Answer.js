const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Answer = sequelize.define('Answer', {
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
    answerText: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'answer_text'
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_correct'
    }
}, {
    timestamps: true,
    tableName: 'answers'
});

module.exports = Answer;
