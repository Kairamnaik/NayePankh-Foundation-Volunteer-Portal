const mongoose = require('../config/dbShim');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    category: {
      type: String,
      enum: ['Education', 'Environment', 'Healthcare', 'Community', 'Disaster Relief', 'Other'],
      required: [true, 'Category is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    startDateTime: {
      type: Date,
      required: [true, 'Start date and time is required'],
    },
    endDateTime: {
      type: Date,
      required: [true, 'End date and time is required'],
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants number is required'],
      min: [1, 'Maximum participants must be at least 1'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    hoursCredited: {
      type: Number,
      required: [true, 'Hours credited per participant is required'],
      min: [0, 'Hours credited must be a positive number'],
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
