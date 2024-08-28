// const mysql = require('mysql2/promise');
// const asyncHandler = require('express-async-handler');
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    // Your database configuration
    dialect: 'mysql', // e.g., 'mysql', 'postgres', 'sqlite'
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

// Synchronize the models with the database
const initializeDatabase = async ()=>{
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error.message);
  }
}






module.exports = { sequelize,  initializeDatabase} 


