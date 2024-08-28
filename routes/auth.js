const express = require('express');
const auth_router = express.Router();
const { sign_up, login, logout, verifyOTP } = require('../contollers/auth');



auth_router.route('/auth/sign_up').post(sign_up);
auth_router.route('/auth/verifyOTP/:id').post(verifyOTP);
auth_router.route('/auth/login').post(login);
auth_router.route('/auth/logout').post(logout);
// // auth_router.route('/auth/test').get(auth_controllers.checkRevokedToken);

module.exports = auth_router;