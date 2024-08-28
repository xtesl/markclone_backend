/**
 * @file user-controller.js
 * @description Controller function for retrieving user information.
 * @version 1.0.0
 * 
 * @overview
 * This file contains a controller function for retrieving user information based on the provided encrypted user ID.
 * It uses helper functions from the 'helpers' module for tasks such as data validation and decryption.
 * 
 * @author
 * Your Company Name <your.email@example.com>
 * 
 * @license
 * This code is confidential and proprietary to Your Company Name. Unauthorized distribution or reproduction without
 * express permission from Your Company Name is prohibited.
 * 
 * For inquiries, please contact info@yourcompany.com.
 */

const User = require('../models/User');
const helpers = require('../utils/helpers');
const asyncHandler = require('express-async-handler');

const add = asyncHandler(async(req, res, next)=>{
       try{
           const userId = req?.user.id;
           User.findByPk(userId).then((user)=>{
              if(user){
                let currentCart = user.cart;
                const newProduct = [req.body];
                currentCart = currentCart.concat(newProduct);
                user.cart = currentCart;
                res.json({message: "Ok"});
              }else res.json({mssage: "User not found"});
           });
       }catch(err){
         throw new Error(err); // error
       }
});


const get = asyncHandler(async(req, res, next)=>{
   try{
       const userId = req?.user.id;
       User.findByPk(userId).then((user) => {
          if(user){
            let currentCart = user.cart;
            res.json(currentCart);
          }
       });
       
   }catch(err){
     throw new Error(err);
   }
});


module.exports = { add, get };