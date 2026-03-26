const express = require('express');
const router = express.Router();
const { getProfile, putProfile, putPassword } = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/multer');

router.get('/', isAuthenticated, getProfile);
router.put('/', isAuthenticated, uploadAvatar.single('avatar'), putProfile);
router.put('/password', isAuthenticated, putPassword);

module.exports = router;
