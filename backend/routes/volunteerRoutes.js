const express = require('express');
const {
  createProfile,
  getProfile,
  updateProfile,
  getAllVolunteers,
  updateStatus,
  deleteVolunteer,
  getLeaderboard,
  getAdminStats,
} = require('../controllers/volunteerController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.post('/register', protect, createProfile);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/leaderboard', protect, getLeaderboard);

// Admin-only routes
router.get('/', protect, admin, getAllVolunteers);
router.get('/admin/stats', protect, admin, getAdminStats);
router.put('/:id/status', protect, admin, updateStatus);
router.delete('/:id', protect, admin, deleteVolunteer);

module.exports = router;
