/**
 * @file utils-helpers.js
 * @description Helper functions for encryption, authentication, and user verification across the project.
 * @version 1.0.0
 * 
 * @overview
 * This file contains a set of utility functions for handling security-related tasks, such as password hashing, encryption,
 * authentication token generation, and user verification through OTP (One-Time Password).
 * 
 * The file is divided into two main sections: "Security helpers" and "Users verification and authentication helpers."
 * 
 * @copyright 2023 Markclone
 * All rights reserved. This code is the intellectual property of Markclone.
 * Unauthorized copying or reproduction of this code, via any medium, is strictly prohibited.
 * 
 * @author
 * Asare Emmanuel <aimmanuel925@gmail.com>
 * 
 * @license
 * This code is confidential and proprietary to Marclone. Unauthorized distribution or reproduction without
 * express permission from Markclone is prohibited.
 * 
 * For inquiries, please contact aimmanuel925@gmail.com.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

/*
  Security helpers
*/

//===============================================================

/**
 * Hashes the provided raw passcode using bcrypt.
 * 
 * @param {string} rawPasscode - The raw passcode to be hashed.
 * @returns {Promise<string>} - A promise that resolves to the hashed passcode.
 */
exports.hashPasscode = async (rawPasscode) => {
    const saltRounds = 10;
    const hashedPasscode = await bcrypt.hash(rawPasscode, saltRounds);
    return hashedPasscode;
}

/**
 * Compares a raw passcode with a hashed passcode for validation.
 * 
 * @param {string} rawPasscode - The raw passcode to be validated.
 * @param {string} hashedPasscode - The hashed passcode for comparison.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passcodes match, false otherwise.
 */
exports.validatePasscode = async (rawPasscode, hashedPasscode) => {
    const match = await bcrypt.compare(rawPasscode, hashedPasscode);
    return match;
}

/**
 * Validates the number of values present in the data against the required number.
 * 
 * @param {Array} data - The data to be validated.
 * @param {number} requireValues - The required number of values.
 * @param {object} res - Express response object.
 * @returns {Promise<number>} - A promise that resolves to 0 for success, -1 for failure.
 */
exports.validateNumberOfValues = asyncHandler(async (data, requireValues, res) => {
    const filteredData = data.filter(value => value != undefined);
    if (filteredData.length < requireValues) {
          res.status(400).json({
            error:"Incomplete data",
            message:"Please provide all required fields"
          });

          return -1 //indicating failure
    }
    return 0 //success
    
});

/**
 * Encrypts the provided data using AES-256-CBC encryption algorithm.
 * 
 * @param {string} data - The data to be encrypted.
 * @returns {Promise<string>} - A promise that resolves to the encrypted data in hexadecimal format.
 * @throws {Error} - If there is an issue with the encryption process.
 */
exports.encrypt = asyncHandler(async (data) => {
    const algorithm = 'aes-256-cbc';
    const password = process.env.SECRET_KEY;
    //encryption key with fixed length of 32
    const key = crypto.scryptSync(password, process.env.SECRET_KEY, 32);
    const iv = Buffer.alloc(16, 0); //Initialization vector(IV) set to buffer

    const cipher = crypto.createCipheriv(algorithm, key, iv); 
    let encrypted = cipher.update(data, 'utf8', 'hex'); //update cipher with data
    encrypted += cipher.final('hex');

    return encrypted;
});

/**
 * Decrypts the provided encrypted data using AES-256-CBC decryption algorithm.
 * 
 * @param {string} encrypted - The encrypted data in hexadecimal format.
 * @returns {Promise<string>} - A promise that resolves to the decrypted data in utf8 format.
 * @throws {Error} - If there is an issue with the decryption process.
 */
exports.decrypt = asyncHandler(async (encrypted) => {
    const algorithm = 'aes-256-cbc';
    const password = process.env.SECRET_KEY;
    const key = crypto.scryptSync(password, process.env.SECRET_KEY, 32);
    const iv = Buffer.alloc(16, 0);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
});

//=======================================================================

/*
  Users verification and authentication helpers
*/

//==================================================================

/**
 * Generates a JWT token for user authentication.
 * 
 * @param {object} user - The user object.
 * @param {string} duration - The duration for which the token will be valid.
 * @param {string} type - The type of token.
 * @returns {Promise<string>} - A promise that resolves to the generated JWT token.
 */
exports.generateToken = asyncHandler(async (user, duration, type) => {
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        phone: user.phone,
        token_type: type
    }, //payload
        process.env.SECRET_KEY, { expiresIn: duration },
    );
    return token;
});

/**
 * Generates a JWT token with a specified expiration time for user authentication.
 * 
 * @param {object} user - The user object.
 * @param {string} duration - The duration for which the token will be valid.
 * @param {string} type - The type of token.
 * @returns {Promise<string>} - A promise that resolves to the generated JWT token with expiration time.
 */
exports.generateTokenExpired = asyncHandler(async (user, duration, type) => {
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        phone: user.phone,
        token_type: type,
        exp: duration
    },
        process.env.SECRET_KEY
    );
    return token;
});

/**
 * Verifies the provided JWT token.
 * 
 * @param {string} token - The JWT token to be verified.
 * @returns {Promise<object>} - A promise that resolves to the decoded token if verification is successful, undefined otherwise.
 */
exports.verifyToken = asyncHandler(async (token) => {
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    } catch (_) {
        decodedToken = undefined;
    } finally {
        return decodedToken;
    }
});

/**
 * Generates a unique OTP for user verification using speakeasy.
 * 
 * @returns {string} - The generated OTP.
 */
exports.generateOTP = () => {
    const otp = speakeasy.totp({
        secret: speakeasy.generateSecret().base32,
        encoding: 'base32',
        digits: 6
    });
    return otp;
}

/**
 * Sends an OTP to the user's email for verification.
 * 
 * @param {string} user_email - The email address of the user.
 * @param {string} otp - The OTP to be sent.
 * @returns {object} - An object containing information about the status of the OTP email sending.
 */
exports.sendOTP = asyncHandler(async(user_email, name, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.EMAIL,
            pass: 'tley ewnp icnn xpdh'
        }
    });

    const companyName = 'Markclone';
    const otpMessage = `
    Subject: Your One-Time Password (OTP) for Secure Access\r\n\r\n
    Dear ${name},\r\n\r\n
    To enhance the security of your account, we have generated a one-time password (OTP) for you. Please use the following OTP to complete your login or transaction:\r\n\r\n
    OTP: ${otp}\r\n\r\n
    This OTP is valid for a single use and will expire in 5 min. Please do not share this OTP with anyone, including ${companyName} support. If you did not initiate this action, please contact us immediately.\r\n\r\n
    Thank you for choosing ${companyName} for your secure transactions.\r\n\r\n
    Best regards,\r\n
    ${companyName} Team
    `;

    const mailOptions = {
        from: {
            name: 'Markclone',
            address: process.env.EMAIL
        },
        to: user_email,
        subject: 'Your One-Time Password (OTP) for Secure Access',
        text: otpMessage
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
    
                console.log(`Error sending the OTP`);
                console.log(err);
            
        } else {
            
               console.log(`OTP sent`);
               console.log(nfo.response);
        }
    }
  )});
//==============================================
/**
 * returns timestamp
 * @returns {timestamp}
 */
exports.getTimestamp = asyncHandler(async()=>{
    
    let date = new Date();
    
    let year = date.getFullYear();
    let month = date.getMonth() + 1;// get month returns month from 0 to 11
    let day = date.getDate();

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
});