const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Volunteer = require('../models/Volunteer');
const { sendEmail } = require('../config/mailer');

// @desc    Create a new event (Admin only)
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  const { title, description, category, location, startDateTime, endDateTime, maxParticipants, hoursCredited } = req.body;

  try {
    if (!title || !description || !category || !location || !startDateTime || !endDateTime || !maxParticipants) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const event = await Event.create({
      title,
      description,
      category,
      location,
      startDateTime,
      endDateTime,
      maxParticipants,
      hoursCredited: hoursCredited || 2,
      status: 'upcoming',
    });

    // Notify all approved volunteers about new event via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('new_event', {
        id: event._id,
        title: event.title,
        location: event.location,
        startDateTime: event.startDateTime,
      });
    }

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event (Admin only)
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { title, description, category, location, startDateTime, endDateTime, maxParticipants, hoursCredited, status } = req.body;

    event.title = title || event.title;
    event.description = description || event.description;
    event.category = category || event.category;
    event.location = location || event.location;
    event.startDateTime = startDateTime || event.startDateTime;
    event.endDateTime = endDateTime || event.endDateTime;
    event.maxParticipants = maxParticipants || event.maxParticipants;
    event.hoursCredited = hoursCredited !== undefined ? hoursCredited : event.hoursCredited;
    event.status = status || event.status;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event (Admin only)
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete associated registrations
    await Registration.deleteMany({ event: req.params.id });
    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event and associated registrations deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events with optional filters (Search, Category, Location, Status)
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  const { search, category, location, status } = req.query;
  let query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  if (category) {
    query.category = category;
  }
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }
  if (status) {
    query.status = status;
  }

  try {
    const events = await Event.find(query).sort({ startDateTime: 1 });
    
    // Enrich with dynamic participant counts
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const participantCount = await Registration.countDocuments({
          event: event._id,
          status: 'registered',
        });
        return {
          ...event.toObject(),
          participantCount,
        };
      })
    );

    res.json(enrichedEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get details of a single event
// @route   GET /api/events/:id
// @access  Private
const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const participantCount = await Registration.countDocuments({
      event: event._id,
      status: 'registered',
    });

    res.json({
      ...event.toObject(),
      participantCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register for an event (Volunteers only)
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(400).json({ message: 'Only volunteers can register for events' });
    }

    if (volunteer.status !== 'approved') {
      return res.status(403).json({ message: 'Your volunteer profile is pending approval' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'upcoming' && event.status !== 'ongoing') {
      return res.status(400).json({ message: 'You can only register for upcoming or ongoing events' });
    }

    // Check capacity
    const registeredCount = await Registration.countDocuments({ event: event._id, status: 'registered' });
    if (registeredCount >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is fully booked' });
    }

    // Check if already registered (including cancelled ones that can be reactivated)
    let registration = await Registration.findOne({ volunteer: volunteer._id, event: event._id });
    
    if (registration) {
      if (registration.status === 'registered') {
        return res.status(400).json({ message: 'You are already registered for this event' });
      } else {
        registration.status = 'registered';
        await registration.save();
      }
    } else {
      registration = await Registration.create({
        volunteer: volunteer._id,
        event: event._id,
      });
    }

    // Send confirmation email
    const startStr = new Date(event.startDateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    sendEmail({
      to: req.user.email,
      subject: `Registration Confirmed: ${event.title} - NayePankh Foundation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ea580c; text-align: center;">Event Registration Confirmed!</h2>
          <p>Dear <strong>${volunteer.fullName}</strong>,</p>
          <p>You have successfully registered for the upcoming event <strong>${event.title}</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <h3>Event Details:</h3>
          <ul>
            <li><strong>Event:</strong> ${event.title}</li>
            <li><strong>Category:</strong> ${event.category}</li>
            <li><strong>Location:</strong> ${event.location}</li>
            <li><strong>Date & Time:</strong> ${startStr}</li>
            <li><strong>Hours Credited:</strong> ${event.hoursCredited} hrs</li>
          </ul>
          <p>Please arrive at least 15 minutes before the start time. You can view your check-in QR code on your dashboard profile page.</p>
          <p>If your plans change, please cancel your registration from the dashboard so other volunteers can participate.</p>
          <p>Thank you for your service!</p>
          <p>Best regards,</p>
          <p><strong>NayePankh Foundation Team</strong></p>
        </div>
      `,
    });

    res.status(201).json({ message: 'Successfully registered for event', registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel event registration
// @route   POST /api/events/:id/cancel
// @access  Private
const cancelEventRegistration = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(400).json({ message: 'Only volunteers can cancel event registrations' });
    }

    const registration = await Registration.findOne({ volunteer: volunteer._id, event: req.params.id });
    if (!registration || registration.status === 'cancelled') {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    registration.status = 'cancelled';
    await registration.save();

    res.json({ message: 'Event registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events a logged-in volunteer registered for
// @route   GET /api/events/registered
// @access  Private
const getRegisteredEvents = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(400).json({ message: 'Only volunteers have registered events' });
    }

    const registrations = await Registration.find({
      volunteer: volunteer._id,
      status: 'registered',
    }).populate('event');

    const formattedEvents = registrations.map((r) => r.event);
    res.json(formattedEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all registered participants for an event (Admin only)
// @route   GET /api/events/:id/participants
// @access  Private/Admin
const getEventParticipants = async (req, res) => {
  try {
    const registrations = await Registration.find({
      event: req.params.id,
      status: 'registered',
    }).populate({
      path: 'volunteer',
      populate: { path: 'user', select: 'email' },
    });

    const participants = registrations.map((r) => r.volunteer);
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventDetails,
  registerForEvent,
  cancelEventRegistration,
  getRegisteredEvents,
  getEventParticipants,
};
