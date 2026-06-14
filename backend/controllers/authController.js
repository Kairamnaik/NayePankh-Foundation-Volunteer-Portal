const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'naye_pankh_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      email,
      password,
      role: role || 'volunteer', // Default to volunteer
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Find associated volunteer profile if the user is a volunteer
      let volunteerProfile = null;
      if (user.role === 'volunteer') {
        volunteerProfile = await Volunteer.findOne({ user: user._id });
      }

      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        hasProfile: !!volunteerProfile,
        profileStatus: volunteerProfile ? volunteerProfile.status : null,
        volunteerId: volunteerProfile ? volunteerProfile._id : null,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      let volunteerProfile = null;
      if (user.role === 'volunteer') {
        volunteerProfile = await Volunteer.findOne({ user: user._id });
      }
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        hasProfile: !!volunteerProfile,
        profileStatus: volunteerProfile ? volunteerProfile.status : null,
        volunteerProfile,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, getMe };
