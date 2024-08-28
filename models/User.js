const { DataTypes } = require('sequelize');
const { sequelize} = require('../config/db');
const asyncHandler = require('express-async-handler');
const helpers = require('../utils/helpers');



const User = sequelize.define('users', {
      id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
   validate: {
    isEmail: true
   } 
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passcode: {
     type: DataTypes.STRING,
     allowNull: false
  },
 date_signed: {
  type: DataTypes.DATE, 
  allowNull: false,
  defaultValue: sequelize.literal('NOW()')
 },
 last_login: {
  type: DataTypes.DATE,
  allowNull: true
 },

 image_data: {
  type: DataTypes.BLOB('long'),
  allowNull: true,
 },

 role: {
  type: DataTypes.STRING,
  defaultValue: "Regular",
  allowNull: false,
 },
 banned: {
   type: DataTypes.BOOLEAN,
   allowNull: false,
   defaultValue: false
 },
 rating: {
  type: DataTypes.DECIMAL(3, 2)
 },
 refreshtoken: {
   type: DataTypes.STRING,
   allowNull: true,
 },
 cart: {
  type: DataTypes.JSON,
  allowNull: true,
  get() {
    const rawValue = this.getDataValue('cart');
    return rawValue ? JSON.parse(rawValue): []
  },
  set(value){
    this.setDataValue('cart', JSON.stringify(value));
  }
 },
 otp: {
  type: DataTypes.STRING,
  allowNull: false
 },
 otp_verified:{
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false
 }
 }, {
  timestamps: false,
   hooks: {
     beforeCreate: asyncHandler(async(user)=>{
       user.passcode = await helpers.hashPasscode(user.passcode);
     })
   }
 }
);


module.exports = User;


