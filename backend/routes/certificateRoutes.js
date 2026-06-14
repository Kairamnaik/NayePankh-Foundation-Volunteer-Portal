const express = require('express');
const {
  getVolunteerCertificates,
  downloadCertificate,
} = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/my-certificates', protect, getVolunteerCertificates);
router.get('/:id/download', protect, downloadCertificate); // Authenticates inside the controller for user role logic

module.exports = router;
