const express = require('express');
const { signup, verifyOtp, login, logout , resendOtp, changePassword, protect} = require('../controller/authController');
const isAuthenticated = require('../middlewares/isAuthenticated');

const router = express.Router();

router.post('/signup', signup);

// router.post('/verifyOtp', verifyOtp);

router.post('/verifyAccount', verifyOtp);

router.post('/resendOtp', resendOtp);

router.post('/login', login);

router.post('/logout', logout);

router.get('/verify-token', isAuthenticated, (req, res) => {
  res.status(200).json({ status: 'success', message: 'Token is valid' });
});

router.post('/change-password', protect,changePassword);

module.exports = router;    