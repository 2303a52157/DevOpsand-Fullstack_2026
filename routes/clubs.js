const express = require('express');
const router = express.Router();
const {
  getClubs, getCreateClub, postCreateClub,
  getClub, joinClub, leaveClub, deleteClub
} = require('../controllers/clubController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, getClubs);
router.get('/create', isAuthenticated, getCreateClub);
router.post('/create', isAuthenticated, postCreateClub);
router.get('/:id', isAuthenticated, getClub);
router.post('/:id/join', isAuthenticated, joinClub);
router.post('/:id/leave', isAuthenticated, leaveClub);
router.delete('/:id', isAuthenticated, deleteClub);

module.exports = router;
