/**
 * @file auth.js
 * @description Controller functions for user authentication and related actions.
 * @version 1.0.0
 * 
 * @overview
 * This file contains controller functions for user authentication, account creation, and logout. It uses helper functions
 * from the 'helpers' module for tasks such as password hashing, token generation, and validation.
 * 
 * The file is divided into three main sections: "Sign Up," "Login," and "Logout."
 * 
 * @author

 * Asare Emmanuel <aimmanuel925@gmail.com>
 * 
 * @license
 * This code is confidential and proprietary to Markclone. Unauthorized distribution or reproduction without
 * express permission from Your Markclone is prohibited.
 * 
 * For inquiries, please contact aimmanuel925@gmail.com.
 */

const User = require('../models/User');
const helpers = require('../utils/helpers');
const asyncHandler = require('express-async-handler');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const CONSTANTS = require('../utils/constants');
const { where } = require('sequelize');

/*
  Sign Up
*/

/**
 * @function sign_up
 * @description Controller function for user account creation.
 * @async
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void}
 */
const sign_up = asyncHandler(async (req, res, next) => {
    const { email, phone, passcode } = req.body;
    //first step client data validation
    const data = [email, phone, passcode];
    const status = await helpers.validateNumberOfValues(data, 3, res);
    if(status == -1) return;

    try{
      //check for account existence
       let user = await User.findOne({ where:{ email } });
       user = user ? user : await User.findOne({ where : { phone }});
       if(!user){
          //create new user if there is no user by the presented
          //credentials
          const otp = await helpers.generateOTP();  //generate otp for user
          req.body.otp = otp;
          const newUser = await User.create(req.body);
          //send otp to user for verification
          await helpers.sendOTP('ikeeop45@gmail.com', 'Immanuel', otp);
          res.json(newUser);
       }else {
        res.status(401).json({
        responseStatus:"Access Denied", message:"User already exist"
       });
     }
    }catch(error){
        throw new Error("Error creating user: " + error.message);
    }

});



/*
  verification
*/

/**
* @function verifyOTP
* @description Controller function for user OTP verification.
* @async
* @param {object} req - Express request object.
* @param {object} res - Express response object.
* @param {function} next - Express next middleware function.
* @returns {void}
* 
*/

const verifyOTP = asyncHandler(async(req, res)=>{
       try{
         const userId = parseInt(req?.params?.id); //user id from sign_up controller
         if(userId){
            //check correctness of otp against user's otp  in database
            const user = await User.findByPk(userId); 
            if(user.otp == req.body.otp){
              user.otp_verified = true; //verify user in database 
              await user.save(); 
              res.json({ message: 'You\'re verified successfully' });
            }
        }else{
            res.status(400).json({ message: 'No user to verify' });
        }
       }catch(err){
           throw new Error(err); //internal server error
       }

});

/*
  Login
*/

/**
* @function login
* @description Controller function for user login.
* @async
* @param {object} req - Express request object.
* @param {object} res - Express response object.
* @param {function} next - Express next middleware function.
* @returns {void}
* 
*/
const login = asyncHandler(async (req, res, next) => {
    const { email, phone, passcode } = req.body;
    // let data = [email, phone, passcode];
    
    try{ 
    //check for existence
    user = phone ? await User.findOne({ where : { phone } }) 
                   : await User.findOne({ where: { email } });
    if (user) {
        //verify passcode
        const hashedPasscode = user.passcode; // original passcode
        const isCorrect = await helpers.validatePasscode(passcode, hashedPasscode);
        let accessToken;
        let refreshToken;
        //authentication strategies
        if (isCorrect) {
            accessToken = await helpers.generateToken(user, CONSTANTS.ACCESS_TOKEN_DURATION, 'Access'); // access token
            refreshToken = await helpers.generateToken(user, CONSTANTS.REFRESH_TOKEN_DURATION, 'Refresh'); // refreshToken
            //update user's refresh token
            const id = user.id
            await User.update({ refreshtoken: refreshToken }, { where : { id }});
            //update last login
            let timestamp = await helpers.getTimestamp();
            await User.update({ last_login: timestamp }, { where: { id }});
            res.json({ message: 
                "Welcome!", 
                access: accessToken,

            });
        } else {
            res.status(401).json({ responseStatus: 
                "failed", 
                message: "Incorrect credential(s)" 
            });
        }
    } else { // no account detected
        res.status(400).json({ responseStatus: 
            "failed", 
            message: "No such user" 
        });
    }
}catch(err){
    throw new Error(err);
}
});



/*
  Logout
*/

/**
 * @function logout
 * @description Controller function for user logout.
 * @async
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void}
 */
const logout = asyncHandler(async (req, res, next) => {
    //clear cache
    //invalidate user's access
    //client-side cleanup

    //revoke access token
    const token = req.headers.authorization?.startsWith('Bearer') ?
        req.headers.authorization.split(' ')[1] : undefined;
    //invalidating access tokens
    let newToken
    try {
        //verify token, if valid it's then invalidated by generating a new expired one
        const decodedToken = token ? jwt.verify(token, process.env.SECRET_KEY) : undefined;
        if(!decodedToken){
            res.json({msg:"You're out successfully"}); //if no token provided
            return
        }
        const tokenDuration = Math.floor(Date.now() / 1000) - 1; //back-date the token
        newToken = await helpers.generateTokenExpired(decodedToken, tokenDuration, 'Access');
    } catch (_) {
        //ignore token invalidity
    }
    res.json({
        msg:"You're out successfully",
        accessToken: newToken
      });
    
 
});


module.exports = { sign_up, login, logout, verifyOTP };