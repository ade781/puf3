const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'creator_id'
    },
    questionText: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'question_text'
    },
    creatorAnswer: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'creator_answer'
    },
    status: {
        type: DataTypes.ENUM('waiting', 'completed'),
        defaultValue: 'waiting'
    }
}, {
    timestamps: true,
    tableName: 'questions'
});

module.exports = Question;
