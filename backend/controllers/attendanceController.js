const Attendance = require('../models/Attendance');
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');
const { determineBadge } = require('./volunteerController');
const { sendEmail } = require('../config/mailer');

// @desc    Check-in volunteer for an event (Admin scans volunteer QR)
// @route   POST /api/attendance/check-in
// @access  Private/Admin
const checkIn = async (req, res) => {
  const { volunteerId, eventId } = req.body;

  try {
    if (!volunteerId || !eventId) {
      return res.status(400).json({ message: 'Volunteer ID and Event ID are required' });
    }

    const volunteer = await Volunteer.findById(volunteerId).populate('user', 'email');
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if check-in already exists for today/event
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      volunteer: volunteerId,
      event: eventId,
      date: { $gte: today },
    });

    if (attendance) {
      return res.status(400).json({ message: 'Volunteer is already checked in for this event today' });
    }

    attendance = await Attendance.create({
      volunteer: volunteerId,
      event: eventId,
      date: new Date(),
      checkInTime: new Date(),
      status: 'present',
      verified: false,
    });

    res.status(201).json({ message: 'Volunteer checked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check-out volunteer (Admin triggers checkout)
// @route   POST /api/attendance/check-out
// @access  Private/Admin
const checkOut = async (req, res) => {
  const { volunteerId, eventId } = req.body;

  try {
    if (!volunteerId || !eventId) {
      return res.status(400).json({ message: 'Volunteer ID and Event ID are required' });
    }

    const volunteer = await Volunteer.findById(volunteerId).populate('user', 'email');
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find latest check-in that doesn't have a check-out yet
    let attendance = await Attendance.findOne({
      volunteer: volunteerId,
      event: eventId,
      checkOutTime: { $exists: false },
    });

    if (!attendance) {
      // Fallback: search for any attendance for this event today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      attendance = await Attendance.findOne({
        volunteer: volunteerId,
        event: eventId,
        date: { $gte: today },
      });

      if (!attendance) {
        return res.status(400).json({ message: 'No check-in record found for this volunteer and event' });
      }

      if (attendance.checkOutTime) {
        return res.status(400).json({ message: 'Volunteer has already checked out' });
      }
    }

    const checkOutTime = new Date();
    attendance.checkOutTime = checkOutTime;

    // Calculate hours worked (hours difference, round to 2 decimals, minimum 0.5 hours)
    const timeDiffMs = checkOutTime - attendance.checkInTime;
    const hours = Math.max(0.5, parseFloat((timeDiffMs / (1000 * 60 * 60)).toFixed(2)));
    attendance.hoursWorked = hours;
    attendance.verified = true;

    await attendance.save();

    // Update volunteer's cumulative hours and badge
    const previousHours = volunteer.totalHours || 0;
    const newHours = parseFloat((previousHours + hours).toFixed(2));
    volunteer.totalHours = newHours;

    const oldBadge = volunteer.badge;
    const newBadge = determineBadge(newHours);
    volunteer.badge = newBadge;

    await volunteer.save();

    // Generate certificate automatically since event attendance is verified and completed
    let certificate = await Certificate.findOne({ volunteer: volunteerId, event: eventId });
    let certGenerated = false;

    if (!certificate) {
      const uniqueCode = `NP-CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      certificate = await Certificate.create({
        volunteer: volunteerId,
        event: eventId,
        certificateCode: uniqueCode,
        issueDate: new Date(),
      });
      certGenerated = true;
    }

    // Send email notification for check-out and hours update
    let emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #ea580c; text-align: center;">Hours Credited!</h2>
        <p>Dear <strong>${volunteer.fullName}</strong>,</p>
        <p>Thank you for participating in our event <strong>${event.title}</strong> today.</p>
        <p>Your attendance has been verified, and <strong>${hours} volunteer hours</strong> have been added to your profile.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <ul>
          <li><strong>Event Name:</strong> ${event.title}</li>
          <li><strong>Hours Credited:</strong> ${hours} hrs</li>
          <li><strong>Total Cumulative Hours:</strong> ${newHours} hrs</li>
          <li><strong>Current Badge:</strong> ${newBadge} ${newBadge !== oldBadge ? '🎉 (New Rank!)' : ''}</li>
        </ul>
    `;

    if (certGenerated) {
      emailHtml += `
        <div style="background-color: #fff7ed; padding: 15px; border-left: 4px solid #ea580c; border-radius: 4px; margin-top: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #c2410c;">🎓 Certificate Available!</h4>
          <p style="margin: 0;">A certificate of participation has been generated for you! You can download it from your volunteer dashboard under the certificates tab.</p>
        </div>
      `;
    }

    emailHtml += `
        <p style="margin-top: 25px;">Thank you for your valuable contribution towards making our community better.</p>
        <p>Warm regards,</p>
        <p><strong>NayePankh Foundation Team</strong></p>
      </div>
    `;

    sendEmail({
      to: volunteer.user.email,
      subject: `Attendance Verified: ${hours} Hours Credited - NayePankh Foundation`,
      html: emailHtml,
    });

    // Notify Volunteer Dashboard via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit(`attendance_update_${volunteer.user._id}`, {
        hours,
        totalHours: newHours,
        badge: newBadge,
        badgeChanged: newBadge !== oldBadge,
        certificateCode: certGenerated ? certificate.certificateCode : null,
        message: `Verified: ${hours} hours added for ${event.title}.`,
      });
    }

    res.json({
      message: 'Volunteer checked out and hours credited',
      attendance,
      totalHours: newHours,
      badge: newBadge,
      certificateCode: certGenerated ? certificate.certificateCode : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance logs (Admin only)
// @route   GET /api/attendance
// @access  Private/Admin
const getAttendanceLogs = async (req, res) => {
  const { eventId, volunteerId } = req.query;
  let query = {};

  if (eventId) query.event = eventId;
  if (volunteerId) query.volunteer = volunteerId;

  try {
    const logs = await Attendance.find(query)
      .populate('volunteer', 'fullName')
      .populate('event', 'title hoursCredited')
      .sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in volunteer's attendance logs
// @route   GET /api/attendance/my-logs
// @access  Private
const getVolunteerAttendance = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    const logs = await Attendance.find({ volunteer: volunteer._id })
      .populate('event', 'title category location hoursCredited')
      .sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendanceLogs,
  getVolunteerAttendance,
};
