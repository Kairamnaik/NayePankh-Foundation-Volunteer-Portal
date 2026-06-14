const express = require('express');
const {
  exportVolunteersCSV,
  exportVolunteersPDF,
  exportEventsCSV,
  exportEventsPDF,
  exportAttendanceCSV,
  exportAttendancePDF,
} = require('../controllers/reportController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All report routes require admin protection
router.use(protect, admin);

router.get('/volunteers/csv', exportVolunteersCSV);
router.get('/volunteers/pdf', exportVolunteersPDF);

router.get('/events/csv', exportEventsCSV);
router.get('/events/pdf', exportEventsPDF);

router.get('/attendance/csv', exportAttendanceCSV);
router.get('/attendance/pdf', exportAttendancePDF);

module.exports = router;
