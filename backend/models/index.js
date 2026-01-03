const User = require('./User');
const Room = require('./Room');
const RoomQuestion = require('./RoomQuestion');
const RoomAnswer = require('./RoomAnswer');

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

module.exports = {
    User,
    Room,
    RoomQuestion,
    RoomAnswer
};
