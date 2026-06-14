const PDFDocument = require('pdfkit');
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');

// CSV Escaping Helper
const csvCell = (val) => {
  if (val === undefined || val === null) return '""';
  let str = String(val).replace(/\n/g, ' ').trim();
  str = str.replace(/"/g, '""');
  return `"${str}"`;
};

// ==========================================
// 1. VOLUNTEER REPORTS
// ==========================================

// @desc    Export volunteer report as CSV (Admin only)
// @route   GET /api/reports/volunteers/csv
// @access  Private/Admin
const exportVolunteersCSV = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate('user', 'email');
    
    let csv = 'Full Name,Email,Phone,Age,Gender,Address,Availability,Badge,Total Hours,Status,Joined Date\n';
    
    volunteers.forEach((v) => {
      csv += `${csvCell(v.fullName)},` +
             `${csvCell(v.user ? v.user.email : '')},` +
             `${csvCell(v.phone)},` +
             `${v.age || ''},` +
             `${csvCell(v.gender)},` +
             `${csvCell(v.address)},` +
             `${csvCell(v.availability)},` +
             `${csvCell(v.badge)},` +
             `${v.totalHours || 0},` +
             `${csvCell(v.status)},` +
             `${new Date(v.createdAt).toLocaleDateString()}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=Volunteer_Report.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export volunteer report as PDF (Admin only)
// @route   GET /api/reports/volunteers/pdf
// @access  Private/Admin
const exportVolunteersPDF = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate('user', 'email');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Volunteer_Report.pdf');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    // Header
    doc.fontSize(16).fillColor('#1e293b').text('NayePankh Foundation - Volunteer Report', { align: 'center' });
    doc.fontSize(9).fillColor('#64748b').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Table Headers
    const startY = doc.y;
    doc.fontSize(10).fillColor('#ea580c');
    doc.text('Name', 30, startY, { width: 130 });
    doc.text('Email', 160, startY, { width: 150 });
    doc.text('Phone', 310, startY, { width: 90 });
    doc.text('Badge', 400, startY, { width: 50 });
    doc.text('Hours', 450, startY, { width: 40 });
    doc.text('Status', 490, startY, { width: 50 });

    doc.moveTo(30, startY + 14).lineTo(560, startY + 14).lineWidth(1).stroke('#cbd5e1');
    doc.moveDown(1.5);

    doc.fontSize(9).fillColor('#334155');
    
    volunteers.forEach((v) => {
      // Check if we need to add a page
      if (doc.y > 750) {
        doc.addPage();
        doc.fontSize(10).fillColor('#ea580c');
        const nextY = doc.y;
        doc.text('Name', 30, nextY, { width: 130 });
        doc.text('Email', 160, nextY, { width: 150 });
        doc.text('Phone', 310, nextY, { width: 90 });
        doc.text('Badge', 400, nextY, { width: 50 });
        doc.text('Hours', 450, nextY, { width: 40 });
        doc.text('Status', 490, nextY, { width: 50 });
        doc.moveTo(30, nextY + 14).lineTo(560, nextY + 14).lineWidth(1).stroke('#cbd5e1');
        doc.moveDown(1.5);
        doc.fontSize(9).fillColor('#334155');
      }

      const currentY = doc.y;
      doc.text(v.fullName || '', 30, currentY, { width: 125, height: 12, ellipsis: true });
      doc.text(v.user ? v.user.email : '', 160, currentY, { width: 145, height: 12, ellipsis: true });
      doc.text(v.phone || '', 310, currentY, { width: 85 });
      doc.text(v.badge || 'Bronze', 400, currentY, { width: 45 });
      doc.text(String(v.totalHours || 0), 450, currentY, { width: 35 });
      doc.text(v.status || 'pending', 490, currentY, { width: 60 });
      doc.moveDown(1.2);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 2. EVENT REPORTS
// ==========================================

// @desc    Export event report as CSV (Admin only)
// @route   GET /api/reports/events/csv
// @access  Private/Admin
const exportEventsCSV = async (req, res) => {
  try {
    const events = await Event.find().sort({ startDateTime: -1 });
    let csv = 'Event Title,Category,Location,Start Date,End Date,Capacity,Status,Hours Credited\n';
    
    events.forEach((e) => {
      csv += `${csvCell(e.title)},` +
             `${csvCell(e.category)},` +
             `${csvCell(e.location)},` +
             `${csvCell(new Date(e.startDateTime).toLocaleString())},` +
             `${csvCell(new Date(e.endDateTime).toLocaleString())},` +
             `${e.maxParticipants || ''},` +
             `${csvCell(e.status)},` +
             `${e.hoursCredited || 0}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=Events_Report.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export event report as PDF (Admin only)
// @route   GET /api/reports/events/pdf
// @access  Private/Admin
const exportEventsPDF = async (req, res) => {
  try {
    const events = await Event.find().sort({ startDateTime: -1 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Events_Report.pdf');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(16).fillColor('#1e293b').text('NayePankh Foundation - Events Conducted Report', { align: 'center' });
    doc.fontSize(9).fillColor('#64748b').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const startY = doc.y;
    doc.fontSize(10).fillColor('#ea580c');
    doc.text('Event Title', 30, startY, { width: 140 });
    doc.text('Category', 180, startY, { width: 80 });
    doc.text('Location', 270, startY, { width: 90 });
    doc.text('Start Date', 370, startY, { width: 100 });
    doc.text('Hours', 480, startY, { width: 40 });
    doc.text('Status', 520, startY, { width: 40 });

    doc.moveTo(30, startY + 14).lineTo(560, startY + 14).lineWidth(1).stroke('#cbd5e1');
    doc.moveDown(1.5);

    doc.fontSize(8.5).fillColor('#334155');
    
    events.forEach((e) => {
      if (doc.y > 750) {
        doc.addPage();
        doc.fontSize(10).fillColor('#ea580c');
        const nextY = doc.y;
        doc.text('Event Title', 30, nextY, { width: 140 });
        doc.text('Category', 180, nextY, { width: 80 });
        doc.text('Location', 270, nextY, { width: 90 });
        doc.text('Start Date', 370, nextY, { width: 100 });
        doc.text('Hours', 480, nextY, { width: 40 });
        doc.text('Status', 520, nextY, { width: 40 });
        doc.moveTo(30, nextY + 14).lineTo(560, nextY + 14).lineWidth(1).stroke('#cbd5e1');
        doc.moveDown(1.5);
        doc.fontSize(8.5).fillColor('#334155');
      }

      const currentY = doc.y;
      doc.text(e.title || '', 30, currentY, { width: 145, height: 12, ellipsis: true });
      doc.text(e.category || '', 180, currentY, { width: 85 });
      doc.text(e.location || '', 270, currentY, { width: 95, height: 12, ellipsis: true });
      doc.text(new Date(e.startDateTime).toLocaleDateString(), 370, currentY, { width: 95 });
      doc.text(String(e.hoursCredited || 0), 480, currentY, { width: 35 });
      doc.text(e.status || 'upcoming', 520, currentY, { width: 50 });
      doc.moveDown(1.2);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. ATTENDANCE REPORTS
// ==========================================

// @desc    Export attendance logs as CSV (Admin only)
// @route   GET /api/reports/attendance/csv
// @access  Private/Admin
const exportAttendanceCSV = async (req, res) => {
  try {
    const logs = await Attendance.find()
      .populate('volunteer', 'fullName')
      .populate('event', 'title')
      .sort({ date: -1 });

    let csv = 'Volunteer,Event,Date,Check-In Time,Check-Out Time,Hours Worked,Status,Verified\n';
    
    logs.forEach((l) => {
      csv += `${csvCell(l.volunteer ? l.volunteer.fullName : '')},` +
             `${csvCell(l.event ? l.event.title : '')},` +
             `${csvCell(new Date(l.date).toLocaleDateString())},` +
             `${csvCell(l.checkInTime ? new Date(l.checkInTime).toLocaleTimeString() : '')},` +
             `${csvCell(l.checkOutTime ? new Date(l.checkOutTime).toLocaleTimeString() : '')},` +
             `${l.hoursWorked || 0},` +
             `${csvCell(l.status)},` +
             `${l.verified ? 'YES' : 'NO'}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=Attendance_Report.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export attendance logs as PDF (Admin only)
// @route   GET /api/reports/attendance/pdf
// @access  Private/Admin
const exportAttendancePDF = async (req, res) => {
  try {
    const logs = await Attendance.find()
      .populate('volunteer', 'fullName')
      .populate('event', 'title')
      .sort({ date: -1 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Attendance_Report.pdf');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(16).fillColor('#1e293b').text('NayePankh Foundation - Event Attendance Log', { align: 'center' });
    doc.fontSize(9).fillColor('#64748b').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const startY = doc.y;
    doc.fontSize(10).fillColor('#ea580c');
    doc.text('Volunteer Name', 30, startY, { width: 130 });
    doc.text('Event Title', 170, startY, { width: 140 });
    doc.text('Date', 320, startY, { width: 70 });
    doc.text('Checked In', 400, startY, { width: 60 });
    doc.text('Checked Out', 470, startY, { width: 60 });
    doc.text('Hrs', 540, startY, { width: 25 });

    doc.moveTo(30, startY + 14).lineTo(560, startY + 14).lineWidth(1).stroke('#cbd5e1');
    doc.moveDown(1.5);

    doc.fontSize(8.5).fillColor('#334155');
    
    logs.forEach((l) => {
      if (doc.y > 750) {
        doc.addPage();
        doc.fontSize(10).fillColor('#ea580c');
        const nextY = doc.y;
        doc.text('Volunteer Name', 30, nextY, { width: 130 });
        doc.text('Event Title', 170, nextY, { width: 140 });
        doc.text('Date', 320, nextY, { width: 70 });
        doc.text('Checked In', 400, nextY, { width: 60 });
        doc.text('Checked Out', 470, nextY, { width: 60 });
        doc.text('Hrs', 540, nextY, { width: 25 });
        doc.moveTo(30, nextY + 14).lineTo(560, nextY + 14).lineWidth(1).stroke('#cbd5e1');
        doc.moveDown(1.5);
        doc.fontSize(8.5).fillColor('#334155');
      }

      const currentY = doc.y;
      doc.text(l.volunteer ? l.volunteer.fullName : '', 30, currentY, { width: 125, height: 12, ellipsis: true });
      doc.text(l.event ? l.event.title : '', 170, currentY, { width: 135, height: 12, ellipsis: true });
      doc.text(new Date(l.date).toLocaleDateString(), 320, currentY, { width: 65 });
      doc.text(l.checkInTime ? new Date(l.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-', 400, currentY, { width: 55 });
      doc.text(l.checkOutTime ? new Date(l.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-', 470, currentY, { width: 55 });
      doc.text(String(l.hoursWorked || 0), 540, currentY, { width: 25 });
      doc.moveDown(1.2);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportVolunteersCSV,
  exportVolunteersPDF,
  exportEventsCSV,
  exportEventsPDF,
  exportAttendanceCSV,
  exportAttendancePDF,
};
