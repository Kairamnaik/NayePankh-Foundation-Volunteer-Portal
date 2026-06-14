const express = require('express');
const {
  checkIn,
  checkOut,
  getAttendanceLogs,
  getVolunteerAttendance,
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/my-logs', protect, getVolunteerAttendance);

// Admin-only routes
router.post('/check-in', protect, admin, checkIn);
router.post('/check-out', protect, admin, checkOut);
router.get('/', protect, admin, getAttendanceLogs);

module.exports = router;
