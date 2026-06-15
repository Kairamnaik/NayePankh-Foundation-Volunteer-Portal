require('dotenv').config();
const mongoose = require('./config/dbShim');

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connectDB();
    
    // Require models after connectDB is resolved to compile schemas in the correct mode
    const User = require('./models/User');
    const Volunteer = require('./models/Volunteer');
    const Event = require('./models/Event');
    const Registration = require('./models/Registration');
    const Attendance = require('./models/Attendance');
    const Certificate = require('./models/Certificate');

    console.log('Connected. Clearing existing collections...');
    
    // Clear all existing data to prevent duplicate keys or cluttered records during manual testing
    await User.deleteMany({});
    await Volunteer.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Attendance.deleteMany({});
    await Certificate.deleteMany({});

    console.log('Existing collections cleared. Seeding accounts...');

    // 1. Create Admin User
    const adminUser = await User.create({
      email: 'admin@gmail.org',
      password: 'admin@123', // Will be automatically hashed in pre-save middleware
      role: 'admin',
    });
    console.log('Admin account created (admin@gmail.com / admin123)');

    // 2. Create Volunteer User
    const volunteerUser = await User.create({
      email: 'volunteer@gmail.com',
      password: 'volunteerpassword123',
      role: 'volunteer',
    });
    console.log('Volunteer login account created (volunteer@gmail.com / volunteerpassword123)');

    // 3. Create Volunteer Profile details
    const volunteerProfile = await Volunteer.create({
      user: volunteerUser._id,
      fullName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      age: 21,
      gender: 'Male',
      address: 'Pocket A-1, Vasant Kunj, New Delhi',
      skills: ['Teaching', 'Social Media Marketing', 'Public Speaking'],
      interests: ['Child Education', 'Environmental Care'],
      availability: 'Flexible',
      emergencyContact: {
        name: 'Suresh Sharma',
        relationship: 'Father',
        phone: '+91 98765 00000',
      },
      profilePhoto: '',
      badge: 'Silver',
      totalHours: 25.5,
      status: 'approved', // Pre-approve for immediate testing!
    });
    console.log('Rahul Sharma volunteer profile created (pre-approved, 25.5 hours, Silver badge)');

    // 4. Create another pending volunteer
    const pendingUser = await User.create({
      email: 'priya@gmail.com',
      password: 'priyapassword123',
      role: 'volunteer',
    });
    await Volunteer.create({
      user: pendingUser._id,
      fullName: 'Priya Patel',
      phone: '+91 98111 22233',
      age: 19,
      gender: 'Female',
      address: 'Sector 62, Noida, UP',
      skills: ['Graphic Design', 'First Aid'],
      interests: ['Healthcare Support'],
      availability: 'Weekends',
      emergencyContact: {
        name: 'Anita Patel',
        relationship: 'Mother',
        phone: '+91 98111 00000',
      },
      profilePhoto: '',
      badge: 'Bronze',
      totalHours: 0,
      status: 'pending', // Awaiting admin action!
    });
    console.log('Priya Patel volunteer profile created (pending approval, 0 hours, Bronze badge)');

    // 5. Create Events
    console.log('Seeding campaign events...');
    const now = new Date();
    
    // Upcoming Event 1
    const event1 = await Event.create({
      title: 'Youth Literacy Drive: Phase 1',
      description: 'Spend your weekend teaching foundational mathematics and English reading skills to underprivileged children in slum clusters.',
      category: 'Education',
      location: 'Community Center, Phase-1 Slums, Okhla, New Delhi',
      startDateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endDateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours duration
      maxParticipants: 15,
      hoursCredited: 4,
      status: 'upcoming',
    });

    // Upcoming Event 2
    const event2 = await Event.create({
      title: 'Ganga Cleanliness & Waste Drive',
      description: 'Join hands with NayePankh team to clear plastic debris from the river banks and raise waste segregation awareness.',
      category: 'Environment',
      location: 'Yamuna Ghat No. 4, Wazirabad, Delhi',
      startDateTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      endDateTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      maxParticipants: 40,
      hoursCredited: 3,
      status: 'upcoming',
    });

    // Ongoing Event (Happening now)
    const event3 = await Event.create({
      title: 'Mobile Health Checkup Camp',
      description: 'Assisting general physicians in checking vital stats, distributing free medicines, and filing medical forms for local residents.',
      category: 'Healthcare',
      location: 'RWA Office Hall, Sector 12, Dwarka, Delhi',
      startDateTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // started 1 hour ago
      endDateTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // ends in 3 hours
      maxParticipants: 10,
      hoursCredited: 4,
      status: 'ongoing',
    });

    // Completed Event
    const event4 = await Event.create({
      title: 'Slum Food & Nutrition Distribution',
      description: 'Packaging and distributing nutrition kits, raw grains, and hygiene packets to daily wage workers and single mothers.',
      category: 'Community',
      location: 'Sanjay Colony, Okhla Industrial Area, Delhi',
      startDateTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endDateTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
      maxParticipants: 20,
      hoursCredited: 2,
      status: 'completed',
    });

    console.log('Events seeded successfully!');

    // 6. Register Volunteer (Rahul Sharma) to Food Distribution (Completed) and Literacy Drive (Upcoming)
    console.log('Seeding event registrations and logs...');
    
    // Register for upcoming literacy drive
    await Registration.create({
      volunteer: volunteerProfile._id,
      event: event1._id,
      status: 'registered',
    });

    // Register & complete attendance for Food Distribution (Completed)
    await Registration.create({
      volunteer: volunteerProfile._id,
      event: event4._id,
      status: 'registered',
    });

    // Create completed attendance log for Food Distribution
    const logDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const checkInTime = new Date(logDate.getTime());
    const checkOutTime = new Date(logDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    await Attendance.create({
      volunteer: volunteerProfile._id,
      event: event4._id,
      date: logDate,
      checkInTime,
      checkOutTime,
      hoursWorked: 2,
      status: 'present',
      verified: true,
    });

    // Create certificate of completion for Food Distribution
    await Certificate.create({
      volunteer: volunteerProfile._id,
      event: event4._id,
      certificateCode: 'NP-CERT-DEMO9999',
      issueDate: checkOutTime,
    });

    console.log('Database seeding successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
