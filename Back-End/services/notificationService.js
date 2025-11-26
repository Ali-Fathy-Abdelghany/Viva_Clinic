const nodemailer = require('nodemailer');
const config = require('../config/config');

// CREATE A SINGLE REUSABLE TRANSPORTER
const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,              
  port: config.EMAIL_PORT,              
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.EMAIL_USER,             
    pass: config.EMAIL_PASS              
  },
});


//VERIFY CONNECTION ON SERVER STARTUP
transporter.verify()
  .then(() => console.log('Email transporter is READY'))
  .catch(err => console.error('Email transporter ERROR:', err));


// GENERIC sendEmail FUNCTION
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const fromName = config.CLINIC_NAME || 'Viva Clinics';

    const mailOptions = {
      from: `"${fromName}" <${config.EMAIL_FROM}>`,  
      to,                                             
      subject,                                        
      text,                                           
      html                                           
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    // Log failure and return structured error
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};


// HTML TEMPLATE BUILDERS

// Appointment Confirmation Email Template
const buildAppointmentConfirmationHtml = (patientName, appointmentDetails) => `
  <h2>Appointment Confirmed</h2>
  <p>Dear ${patientName},</p>
  <p>Your appointment has been confirmed:</p>
  <ul>
    <li><strong>Date:</strong> ${appointmentDetails.date}</li>
    <li><strong>Time:</strong> ${appointmentDetails.startTime} - ${appointmentDetails.endTime}</li>
    <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
    <li><strong>Specialty:</strong> ${appointmentDetails.specialty}</li>
  </ul>
  <p>Please arrive 10 minutes early.</p>
  <p>Thank you!</p>
`;

// Appointment Reminder Template
const buildAppointmentReminderHtml = (patientName, appointmentDetails) => `
  <h2>Appointment Reminder</h2>
  <p>Dear ${patientName},</p>
  <p>This is a reminder for your upcoming appointment:</p>
  <ul>
    <li><strong>Date:</strong> ${appointmentDetails.date}</li>
    <li><strong>Time:</strong> ${appointmentDetails.startTime} - ${appointmentDetails.endTime}</li>
    <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
  </ul>
  <p>We look forward to seeing you.</p>
`;

// Appointment Cancellation Template
const buildAppointmentCancellationHtml = (patientName, appointmentDetails) => `
  <h2>Appointment Cancelled</h2>
  <p>Dear ${patientName},</p>
  <p>Your appointment has been cancelled:</p>
  <ul>
    <li><strong>Date:</strong> ${appointmentDetails.date}</li>
    <li><strong>Time:</strong> ${appointmentDetails.startTime} - ${appointmentDetails.endTime}</li>
    <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
  </ul>
  <p>If you wish to reschedule, please book a new appointment.</p>
`;

// Prescription Update Template
const buildPrescriptionUpdateHtml = (patientName, prescriptionDetails) => `
  <h2>New Prescription Available</h2>
  <p>Dear ${patientName},</p>
  <p>A new prescription has been added to your medical records:</p>
  <pre>${prescriptionDetails.prescription}</pre>
  <p>Please visit the clinic to collect it.</p>
`;


// PUBLIC EMAIL FUNCTIONS

const sendAppointmentConfirmation = (patientEmail, patientName, appointmentDetails) => {
  const subject = 'Appointment Confirmation';
  const html = buildAppointmentConfirmationHtml(patientName, appointmentDetails);
  return sendEmail(patientEmail, subject, html);
};

const sendAppointmentReminder = (patientEmail, patientName, appointmentDetails) => {
  const subject = 'Appointment Reminder';
  const html = buildAppointmentReminderHtml(patientName, appointmentDetails);
  return sendEmail(patientEmail, subject, html);
};

const sendAppointmentCancellation = (patientEmail, patientName, appointmentDetails) => {
  const subject = 'Appointment Cancelled';
  const html = buildAppointmentCancellationHtml(patientName, appointmentDetails);
  return sendEmail(patientEmail, subject, html);
};

const sendPrescriptionUpdate = (patientEmail, patientName, prescriptionDetails) => {
  const subject = 'Prescription Update';
  const html = buildPrescriptionUpdateHtml(patientName, prescriptionDetails);
  return sendEmail(patientEmail, subject, html);
};

// Send password reset link
const sendPasswordResetEmail = (userEmail, userName, resetToken, resetUrl) => {
  const subject = 'Password Reset Request';

  // HTML template
  const html = `
    <h2>Password Reset Request</h2>
    <p>Dear ${userName},</p>
    <p>Click below to reset your password:</p>
    <a href="${resetUrl}" style="background:#4CAF50;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">
      Reset Password
    </a>
    <p>This link expires in 1 hour.</p>
  `;

  // Plain text fallback (to avoid filteration)
  const text = `Hello ${userName},\nReset your password using this link: ${resetUrl}`;

  return sendEmail(userEmail, subject, html, text);
};


const sendPasswordResetConfirmation = (userEmail, userName) => {
  const subject = 'Password Reset Successful';
  const html = `
    <h2>Password Reset Successful</h2>
    <p>Dear ${userName},</p>
    <p>Your password has been successfully updated.</p>
  `;
  return sendEmail(userEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendPrescriptionUpdate,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
};
