const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const { sendEmail } = require('../config/mailer');

// Helper to determine badge level based on hours
const determineBadge = (hours) => {
  if (hours >= 100) return 'Platinum';
  if (hours >= 50) return 'Gold';
  if (hours >= 20) return 'Silver';
  return 'Bronze';
};

// @desc    Register volunteer profile details
// @route   POST /api/volunteers/register
// @access  Private
const createProfile = async (req, res) => {
  const {
    fullName,
    phone,
    age,
    gender,
    address,
    skills,
    interests,
    availability,
    emergencyContact,
    profilePhoto,
  } = req.body;

  try {
    // Check if volunteer profile already exists
    const existingProfile = await Volunteer.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Volunteer profile already exists' });
    }

    // Input Validation
    if (!fullName || !phone || !age || !gender || !address || !availability || !emergencyContact) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const volunteer = await Volunteer.create({
      user: req.user._id,
      fullName,
      phone,
      age,
      gender,
      address,
      skills: skills || [],
      interests: interests || [],
      availability,
      emergencyContact,
      profilePhoto: profilePhoto || '',
      status: 'pending', // Awaiting admin approval
    });

    // Send email notification (async)
    sendEmail({
      to: req.user.email,
      subject: 'Volunteer Application Received - NayePankh Foundation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ea580c; text-align: center;">Welcome to NayePankh Foundation!</h2>
          <p>Dear <strong>${fullName}</strong>,</p>
          <p>Thank you for registering to volunteer with us. Your application has been successfully submitted and is currently undergoing review by our administration team.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <h3>Application Details Summary:</h3>
          <ul>
            <li><strong>Email:</strong> ${req.user.email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Skills:</strong> ${skills ? skills.join(', ') : 'None specified'}</li>
            <li><strong>Availability:</strong> ${availability}</li>
          </ul>
          <p>We will notify you immediately once your application is approved. Normally this takes less than 24 hours.</p>
          <p>Best regards,</p>
          <p><strong>NayePankh Foundation Team</strong></p>
        </div>
      `,
    });

    // Notify admins via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('new_application', {
        id: volunteer._id,
        fullName: volunteer.fullName,
        email: req.user.email,
      });
    }

    res.status(201).json({
      message: 'Profile created successfully and is pending admin approval',
      volunteer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get volunteer profile (self)
// @route   GET /api/volunteers/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update volunteer profile
// @route   PUT /api/volunteers/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    const {
      fullName,
      phone,
      age,
      gender,
      address,
      skills,
      interests,
      availability,
      emergencyContact,
      profilePhoto,
    } = req.body;

    volunteer.fullName = fullName || volunteer.fullName;
    volunteer.phone = phone || volunteer.phone;
    volunteer.age = age || volunteer.age;
    volunteer.gender = gender || volunteer.gender;
    volunteer.address = address || volunteer.address;
    volunteer.skills = skills || volunteer.skills;
    volunteer.interests = interests || volunteer.interests;
    volunteer.availability = availability || volunteer.availability;
    volunteer.emergencyContact = emergencyContact || volunteer.emergencyContact;
    if (profilePhoto) {
      volunteer.profilePhoto = profilePhoto;
    }

    const updatedVolunteer = await volunteer.save();
    res.json(updatedVolunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all volunteers (Admin only)
// @route   GET /api/volunteers
// @access  Private/Admin
const getAllVolunteers = async (req, res) => {
  const { search, skill, location, status } = req.query;
  let query = {};

  if (search) {
    query.fullName = { $regex: search, $options: 'i' };
  }
  if (status) {
    query.status = status;
  }
  if (skill) {
    query.skills = { $in: [new RegExp(skill, 'i')] };
  }
  if (location) {
    query.address = { $regex: location, $options: 'i' };
  }

  try {
    const volunteers = await Volunteer.find(query).populate('user', 'email role');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject a volunteer profile (Admin only)
// @route   PUT /api/volunteers/:id/status
// @access  Private/Admin
const updateStatus = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const volunteer = await Volunteer.findById(req.params.id).populate('user', 'email');
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    volunteer.status = status;
    await volunteer.save();

    // Notify user via Email
    const isApproved = status === 'approved';
    const emailSubject = isApproved 
      ? 'Your Volunteer Application is Approved! - NayePankh Foundation'
      : 'Update on your Volunteer Application - NayePankh Foundation';

    const emailHtml = isApproved 
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #16a34a; text-align: center;">Congratulations!</h2>
          <p>Dear <strong>${volunteer.fullName}</strong>,</p>
          <p>We are thrilled to inform you that your volunteer application for the NayePankh Foundation has been approved!</p>
          <p>You can now log in to your dashboard, register for upcoming events, view badges, and track your volunteer hours.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/login" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
          </div>
          <p>Thank you for choosing to make a difference with NayePankh Foundation.</p>
          <p>Warm regards,</p>
          <p><strong>NayePankh Foundation Admin Team</strong></p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #dc2626; text-align: center;">Application Status Update</h2>
          <p>Dear <strong>${volunteer.fullName}</strong>,</p>
          <p>Thank you for your interest in volunteering with NayePankh Foundation.</p>
          <p>After reviewing your details, we regret to inform you that we are unable to accept your application at this time.</p>
          <p>If you have any questions or feel there was an error, please reach out to our support team.</p>
          <p>Sincerely,</p>
          <p><strong>NayePankh Foundation Admin Team</strong></p>
        </div>
      `;

    sendEmail({
      to: volunteer.user.email,
      subject: emailSubject,
      html: emailHtml,
    });

    // Notify via Sockets
    const io = req.app.get('io');
    if (io) {
      io.emit(`status_update_${volunteer.user._id}`, {
        status,
        message: `Your application status has been updated to: ${status}`,
      });
    }

    res.json({ message: `Volunteer status updated to ${status}`, volunteer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a volunteer profile (Admin only)
// @route   DELETE /api/volunteers/:id
// @access  Private/Admin
const deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    // Delete User login credential as well
    await User.findByIdAndDelete(volunteer.user);
    await Volunteer.findByIdAndDelete(req.params.id);

    res.json({ message: 'Volunteer and user account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top volunteers leaderboard
// @route   GET /api/volunteers/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const topVolunteers = await Volunteer.find({ status: 'approved' })
      .select('fullName totalHours badge profilePhoto')
      .sort({ totalHours: -1 })
      .limit(10);
    res.json(topVolunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin analytics statistics
// @route   GET /api/volunteers/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalVolunteers = await Volunteer.countDocuments();
    const approvedVolunteers = await Volunteer.countDocuments({ status: 'approved' });
    const pendingVolunteers = await Volunteer.countDocuments({ status: 'pending' });

    // Participation statistics
    // Average hours
    const volunteersWithHours = await Volunteer.find({ status: 'approved' }).select('totalHours');
    const totalHoursAgg = volunteersWithHours.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const avgHours = approvedVolunteers > 0 ? (totalHoursAgg / approvedVolunteers).toFixed(1) : 0;

    // Growth stats (volunteers registered per month in current year)
    const currentYear = new Date().getFullYear();
    const growthData = await Volunteer.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id': 1 },
      },
    ]);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Format for charting
    const formattedGrowth = months.map((m, index) => {
      const found = growthData.find((g) => g._id === index + 1);
      return {
        month: m,
        count: found ? found.count : 0,
      };
    });

    res.json({
      totalVolunteers,
      approvedVolunteers,
      pendingVolunteers,
      totalHours: totalHoursAgg,
      avgHours,
      growthChart: formattedGrowth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProfile,
  getProfile,
  updateProfile,
  getAllVolunteers,
  updateStatus,
  deleteVolunteer,
  getLeaderboard,
  getAdminStats,
  determineBadge,
};
