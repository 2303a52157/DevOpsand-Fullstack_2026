const express = require('express');
const router = express.Router();
const { getLogin, postLogin, getRegister, postRegister, logout } = require('../controllers/authController');
const { isGuest } = require('../middleware/auth');

router.get('/login', isGuest, getLogin);
router.post('/login', isGuest, postLogin);
router.get('/register', isGuest, getRegister);
router.post('/register', isGuest, postRegister);
router.get('/logout', logout);

module.exports = router;
