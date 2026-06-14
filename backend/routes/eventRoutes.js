const express = require('express');
const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventDetails,
  registerForEvent,
  cancelEventRegistration,
  getRegisteredEvents,
  getEventParticipants,
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getEvents);
router.get('/registered', protect, getRegisteredEvents);
router.get('/:id', protect, getEventDetails);
router.post('/:id/register', protect, registerForEvent);
router.post('/:id/cancel', protect, cancelEventRegistration);

// Admin-only routes
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);
router.get('/:id/participants', protect, admin, getEventParticipants);

module.exports = router;
