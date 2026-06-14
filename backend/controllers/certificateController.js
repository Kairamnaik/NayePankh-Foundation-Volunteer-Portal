const PDFDocument = require('pdfkit');
const Certificate = require('../models/Certificate');
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');

// @desc    Get all certificates for logged in volunteer
// @route   GET /api/certificates/my-certificates
// @access  Private
const getVolunteerCertificates = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    const certificates = await Certificate.find({ volunteer: volunteer._id })
      .populate('event', 'title category location startDateTime endDateTime hoursCredited')
      .sort({ createdAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download PDF Certificate
// @route   GET /api/certificates/:id/download
// @access  Private
const downloadCertificate = async (req, res) => {
  try {
    const certId = req.params.id;

    // Find certificate
    const certificate = await Certificate.findById(certId)
      .populate({
        path: 'volunteer',
        populate: { path: 'user', select: 'email' },
      })
      .populate('event');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Authorization check: User can download only their own certificate unless they are admin
    // Note: req.user is set by auth middleware
    if (req.user.role !== 'admin' && certificate.volunteer.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to download this certificate' });
    }

    const { volunteer, event, certificateCode, issueDate } = certificate;

    // Set Response Headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Certificate-${volunteer.fullName.replace(/\s+/g, '_')}-${event.title.replace(/\s+/g, '_')}.pdf`
    );

    // Create a PDF Document in Landscape
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 40,
    });

    // Pipe the PDF direct to the response
    doc.pipe(res);

    // --- Draw Certificate Border & Graphics ---

    // Outer Thin Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(2)
       .stroke('#cbd5e1'); // light grey slate

    // Inner Thick Elegant Border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .lineWidth(6)
       .stroke('#ea580c'); // NayePankh Orange

    // Inner Accent Thin Border
    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
       .lineWidth(1)
       .stroke('#f97316'); // Light Orange

    // Corner Decor: Top-Left
    doc.rect(45, 45, 40, 4)
       .fill('#ea580c');
    doc.rect(45, 45, 4, 40)
       .fill('#ea580c');

    // Corner Decor: Top-Right
    doc.rect(doc.page.width - 85, 45, 40, 4)
       .fill('#ea580c');
    doc.rect(doc.page.width - 49, 45, 4, 40)
       .fill('#ea580c');

    // Corner Decor: Bottom-Left
    doc.rect(45, doc.page.height - 49, 40, 4)
       .fill('#ea580c');
    doc.rect(45, doc.page.height - 85, 4, 40)
       .fill('#ea580c');

    // Corner Decor: Bottom-Right
    doc.rect(doc.page.width - 85, doc.page.height - 49, 40, 4)
       .fill('#ea580c');
    doc.rect(doc.page.width - 49, doc.page.height - 85, 4, 40)
       .fill('#ea580c');

    // Decorative Watermark (Simulated with text/opacity)
    doc.save()
       .fillOpacity(0.04)
       .fontSize(70)
       .fill('#ea580c')
       .text('NAYEPANKH FOUNDATION', 50, 250, { align: 'center', width: doc.page.width - 100 })
       .restore();

    // --- Content Details ---

    // Title / Institution Name
    doc.fontSize(22)
       .fillColor('#1e293b') // dark slate
       .text('NAYEPANKH FOUNDATION', 50, 70, {
         align: 'center',
         paragraphGap: 5,
       });

    // Sub-title for organization description
    doc.fontSize(10)
       .fillColor('#64748b')
       .text('Empowering Lives, Spreading Wings of Change | Registered NGO', 50, 95, {
         align: 'center',
         paragraphGap: 20,
       });

    // Gold Medal Separator Icon (represented by elegant lines & circle)
    const midX = doc.page.width / 2;
    doc.moveTo(midX - 100, 125).lineTo(midX - 10, 125).stroke('#cbd5e1');
    doc.moveTo(midX + 10, 125).lineTo(midX + 100, 125).stroke('#cbd5e1');
    doc.circle(midX, 125, 8).fill('#ea580c');

    // Main Certificate Header
    doc.fontSize(32)
       .fillColor('#ea580c')
       .text('CERTIFICATE OF APPRECIATION', 50, 150, {
         align: 'center',
         paragraphGap: 15,
       });

    doc.fontSize(14)
       .fillColor('#475569')
       .text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', 50, 205, {
         align: 'center',
         paragraphGap: 15,
       });

    // Recipient Name
    doc.fontSize(28)
       .fillColor('#0f172a') // deep black slate
       .text(volunteer.fullName.toUpperCase(), 50, 235, {
         align: 'center',
         paragraphGap: 15,
       });

    // Underline for recipient name
    doc.moveTo(midX - 180, 270).lineTo(midX + 180, 270).lineWidth(1.5).stroke('#64748b');

    // Citation text
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = new Date(event.startDateTime).toLocaleDateString('en-US', dateOptions);
    doc.fontSize(12)
       .fillColor('#475569')
       .text(
         `for their exceptional dedication and valuable contribution as a volunteer in the event\n` +
         `"${event.title}" conducted on ${dateFormatted}.\n` +
         `Their selfless efforts towards social upliftment are highly appreciated and valued.`,
         100,
         295,
         {
           align: 'center',
           width: doc.page.width - 200,
           lineGap: 4,
         }
       );

    // Footer - Signatures & Dates
    const footerY = 430;

    // Date
    doc.fontSize(10)
       .fillColor('#64748b')
       .text(`Date of Issue: ${new Date(issueDate).toLocaleDateString('en-US', dateOptions)}`, 80, footerY);
    doc.moveTo(80, footerY + 18).lineTo(230, footerY + 18).lineWidth(1).stroke('#cbd5e1');

    // Certificate ID
    doc.fontSize(9)
       .fillColor('#94a3b8')
       .text(`Verification Code: ${certificateCode}`, 80, footerY + 28);

    // Signatures
    // E-signature representation
    doc.fontSize(14)
       .fillColor('#ea580c')
       .text('Prashant Shukla', doc.page.width - 250, footerY - 10, { width: 170, align: 'center' }); // Simulated handwritten font replacement
    doc.fontSize(10)
       .fillColor('#64748b')
       .text('Founder & President', doc.page.width - 250, footerY, { width: 170, align: 'center' });
    doc.moveTo(doc.page.width - 250, footerY + 18).lineTo(doc.page.width - 80, footerY + 18).lineWidth(1).stroke('#cbd5e1');
    doc.fontSize(9)
       .fillColor('#94a3b8')
       .text('NayePankh Foundation Authority', doc.page.width - 250, footerY + 28, { width: 170, align: 'center' });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('PDF Certificate generation error:', error);
    res.status(500).json({ message: 'Error generating PDF certificate: ' + error.message });
  }
};

module.exports = {
  getVolunteerCertificates,
  downloadCertificate,
};
