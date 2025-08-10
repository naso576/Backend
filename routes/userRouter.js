const express = require('express');
const { signup, verifyOtp, login, logout , resendOtp} = require('../controller/authController');
const isAuthenticated = require('../middlewares/isAuthenticated');

const router = express.Router();

router.post('/signup', signup);

// router.post('/verifyOtp', verifyOtp);

router.post('/verifyAccount', verifyOtp);

router.post('/resendOtp', resendOtp);

router.post('/login', login);

router.post('/logout', logout);

module.exports = router;    