const { Sequelize } = require('sequelize');
require('dotenv').config();

// Force load mysql2 driver for Vercel
require('mysql2');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✨ Database connected successfully!');
        await sequelize.sync({ alter: true });
        console.log('✨ All models synced!');
    } catch (error) {
        console.error('❌ Unable to connect to database:', error);
    }
};

module.exports = { sequelize, connectDB };
