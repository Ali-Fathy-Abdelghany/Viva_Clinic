const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    }
  });
};

// Send email notification
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.EMAIL_FROM,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (patientEmail, patientName, appointmentDetails) => {
  const subject = 'Appointment Confirmation';
  const html = `
    <h2>Appointment Confirmed</h2>
    <p>Dear ${patientName},</p>
    <p>Your appointment has been confirmed:</p>
    <ul>
      <li><strong>Date:</strong> ${appointmentDetails.date}</li>
      <li><strong>Time:</strong> ${appointmentDetails.startTime} - ${appointmentDetails.endTime}</li>
      <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
      <li><strong>Specialty:</strong> ${appointmentDetails.specialty}</li>
    </ul>
    <p>Please arrive 10 minutes before your appointment time.</p>
    <p>Thank you!</p>
  `;

  return await sendEmail(patientEmail, subject, html);
};

// Send appointment reminder email
const sendAppointmentReminder = async (patientEmail, patientName, appointmentDetails) => {
  const subject = 'Appointment Reminder';
  const html = `
    <h2>Appointment Reminder</h2>
    <p>Dear ${patientName},</p>
    <p>This is a reminder for your upcoming appointment:</p>
    <ul>
      <li><strong>Date:</strong> ${appointmentDetails.date}</li>
      <li><strong>Time:</strong> ${appointmentDetails.startTime} - ${appointmentDetails.endTime}</li>
      <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
    </ul>
    <p>We look forward to seeing you!</p>
  `;

  return await sendEmail(patientEmail, subject, html);
};

// Send appointment cancellation email
const sendAppointmentCancellation = async (patientEmail, patientName, appointmentDetails) => {
  const subject = 'Appointment Cancelled';
  const html = `
    <h2>Appointment Cancelled</h2>
    <p>Dear ${patientName},</p>
    <p>Your appointment has been cancelled:</p>
    <ul>
      <li><strong>Date:</strong> ${appointmentDetails.date}</li>
      <li><strong>Time:</strong> ${appointmentDetails.startTime} - ${appointmentDetails.endTime}</li>
      <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
    </ul>
    <p>If you need to reschedule, please book a new appointment.</p>
    <p>Thank you!</p>
  `;

  return await sendEmail(patientEmail, subject, html);
};

// Send prescription update email
const sendPrescriptionUpdate = async (patientEmail, patientName, prescriptionDetails) => {
  const subject = 'Prescription Update';
  const html = `
    <h2>New Prescription Available</h2>
    <p>Dear ${patientName},</p>
    <p>A new prescription has been added to your medical records:</p>
    <p><strong>Prescription:</strong></p>
    <pre>${prescriptionDetails.prescription}</pre>
    <p>Please visit the clinic to collect your prescription.</p>
    <p>Thank you!</p>
  `;

  return await sendEmail(patientEmail, subject, html);
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetToken, resetUrl) => {
  const subject = 'Password Reset Request';
  const html = `
    <h2>Password Reset Request</h2>
    <p>Dear ${userName},</p>
    <p>You have requested to reset your password. Click the link below to reset it:</p>
    <p>
      <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p>${resetUrl}</p>
    <p><strong>This link will expire in 1 hour.</strong></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you!</p>
  `;

  const text = `
    Password Reset Request
    
    Dear ${userName},
    
    You have requested to reset your password. Use the following link to reset it:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you did not request a password reset, please ignore this email.
  `;

  return await sendEmail(userEmail, subject, html, text);
};

// Send password reset confirmation email
const sendPasswordResetConfirmation = async (userEmail, userName) => {
  const subject = 'Password Reset Successful';
  const html = `
    <h2>Password Reset Successful</h2>
    <p>Dear ${userName},</p>
    <p>Your password has been successfully reset.</p>
    <p>If you did not make this change, please contact us immediately.</p>
    <p>Thank you!</p>
  `;

  return await sendEmail(userEmail, subject, html);
};

// Send SMS (placeholder - implement with actual SMS service)
const sendSMS = async (phoneNumber, message) => {
  // TODO: Implement SMS service integration
  // This is a placeholder for future SMS implementation
  console.log(`SMS to ${phoneNumber}: ${message}`);
  return { success: true, message: 'SMS sent (mock)' };
};

module.exports = {
  sendEmail,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendPrescriptionUpdate,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  sendSMS
};

