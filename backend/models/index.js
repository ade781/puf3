const User = require('./User');
const Room = require('./Room');
const RoomQuestion = require('./RoomQuestion');
const RoomAnswer = require('./RoomAnswer');
const RoomOption = require('./RoomOption');
const RoomSelection = require('./RoomSelection');
const RoomSongRound = require('./RoomSongRound');
const RoomSongGuess = require('./RoomSongGuess');

// Define associations
User.hasMany(Room, { foreignKey: 'user1Id', as: 'roomsAsUser1' });
User.hasMany(Room, { foreignKey: 'user2Id', as: 'roomsAsUser2' });
Room.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
Room.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });

Room.hasMany(RoomQuestion, { foreignKey: 'roomId', as: 'questions' });
RoomQuestion.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

User.hasMany(RoomQuestion, { foreignKey: 'askedByUserId', as: 'questionsAsked' });
RoomQuestion.belongsTo(User, { foreignKey: 'askedByUserId', as: 'askedBy' });

RoomQuestion.hasMany(RoomAnswer, { foreignKey: 'questionId', as: 'answers' });
RoomAnswer.belongsTo(RoomQuestion, { foreignKey: 'questionId', as: 'question' });

User.hasMany(RoomAnswer, { foreignKey: 'userId', as: 'answers' });
RoomAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

RoomQuestion.hasMany(RoomOption, { foreignKey: 'questionId', as: 'options' });
RoomOption.belongsTo(RoomQuestion, { foreignKey: 'questionId', as: 'question' });

User.hasMany(RoomOption, { foreignKey: 'userId', as: 'options' });
RoomOption.belongsTo(User, { foreignKey: 'userId', as: 'user' });

RoomQuestion.hasMany(RoomSelection, { foreignKey: 'questionId', as: 'selections' });
RoomSelection.belongsTo(RoomQuestion, { foreignKey: 'questionId', as: 'question' });

User.hasMany(RoomSelection, { foreignKey: 'userId', as: 'selections' });
RoomSelection.belongsTo(User, { foreignKey: 'userId', as: 'user' });

RoomOption.hasMany(RoomSelection, { foreignKey: 'selectedOptionId', as: 'selectedBy' });
RoomSelection.belongsTo(RoomOption, { foreignKey: 'selectedOptionId', as: 'selectedOption' });

Room.hasMany(RoomSongRound, { foreignKey: 'roomId', as: 'songRounds' });
RoomSongRound.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

User.hasMany(RoomSongRound, { foreignKey: 'askedByUserId', as: 'songRoundsAsked' });
RoomSongRound.belongsTo(User, { foreignKey: 'askedByUserId', as: 'askedBy' });

RoomSongRound.hasMany(RoomSongGuess, { foreignKey: 'roundId', as: 'guesses' });
RoomSongGuess.belongsTo(RoomSongRound, { foreignKey: 'roundId', as: 'round' });

User.hasMany(RoomSongGuess, { foreignKey: 'userId', as: 'songGuesses' });
RoomSongGuess.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    User,
    Room,
    RoomQuestion,
    RoomAnswer,
    RoomOption,
    RoomSelection,
    RoomSongRound,
    RoomSongGuess
};
