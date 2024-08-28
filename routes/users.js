const express = require('express');
const user_router = express.Router();
const { add, get }= require('../contollers/users');
const { verifyToken } = require('../middlewares/auth');


user_router.route('/users/cart_create').post(verifyToken, add);
user_router.route('/users/cart_get').get(verifyToken, get);

module.exports = user_router;