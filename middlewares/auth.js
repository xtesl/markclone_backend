/**
 * @file auth-middleware.js
 * @description Middleware functions for user authentication and token verification.
 * @version 1.0.0
 * 
 * @overview
 * This file contains middleware functions for verifying user tokens, including access and refresh tokens.
 * It utilizes helper functions from the 'helpers' module for tasks such as token verification and generation.
 * 
 * @author
 * Markclone <aimmanuel925@gmail.com>
 * 
 * @license
 * This code is confidential and proprietary to Your Company Name. Unauthorized distribution or reproduction without
 * express permission from Markclone is prohibited.
 * 
 * For inquiries, please contact info@yourcompany.com.
 */

const helpers = require('../utils/helpers');
const jwt = require("jsonwebtoken");
const asyncHandler = require('express-async-handler');
const RefreshToken = require('../models/RefreshToken');
const CONSTANTS = require('../utils/constants');

/**
 * @function verifyToken
 * @description Middleware function for verifying user tokens.
 * @async
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void}
 */
const verifyToken = asyncHandler(async (req, res, next) => {
  // User authorization token
  const token = req.headers.authorization?.startsWith("Bearer") ? 
               req.headers.authorization.split(' ')[1] : undefined;
  if(!token){
    res.status(401).json({
      error:"No token provided",
      message:"Please provide access token in the authorization header"
  });

  return;
  }
  const { userId } = req.body; // For backup if the token is expired
  

  try {
    const decodedAccessToken = await helpers.verifyToken(token); // Verify token without any error
    if (decodedAccessToken) {
      req.user = decodedAccessToken; // Pass the user to the protected route
      next();
    }
    // Get refreshToken for the user if their access token has expired
    // If the refresh token is also expired, then the user has to re-login
    let refreshToken;
    let decodedRefreshToken;
    if(!decodedAccessToken){
      refreshToken = await RefreshToken.findTokenByUserId(userId);
      //no refresh token means user does not exist
      if(!refreshToken){
         res.status(400).json({error:"No token associated with the user id provided"});
         return ;
      }
      decodedRefreshToken = refreshToken ? jwt.verify(refreshToken.token, process.env.SECRET_KEY) :
      undefined;
    }
   
    const newAccessToken = decodedRefreshToken ? 
                             await helpers.generateToken(decodedRefreshToken,
                             CONSTANTS.ACCESS_TOKEN_DURATION,
                             'Access'
                          ) : undefined;
   
   newAccessToken && res.status(401).json({
    msg: "Token not valid",
    access: newAccessToken
 }); //new access token for user
  } catch (err) { //when both access and refresh tokens are expired
     res.status(401).json({ 
      error: "Token not valid"
    }); // Invalid token presented
  }
});

module.exports = { verifyToken };
