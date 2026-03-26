const express = require('express');
const router = express.Router();
const { getUsers, changeRole, deleteUser } = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/', isAuthenticated, isAdmin, getUsers);
router.put('/:id/role', isAuthenticated, isAdmin, changeRole);
router.delete('/:id', isAuthenticated, isAdmin, deleteUser);

module.exports = router;
