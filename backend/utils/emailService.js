import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Check and log email environment variables
 */
console.log("Email configuration:");
console.log(
  "EMAIL_USERNAME =",
  process.env.EMAIL_USERNAME ? "SET" : "MISSING"
);
console.log(
  "EMAIL_PASSWORD =",
  process.env.EMAIL_PASSWORD ? "SET" : "MISSING"
);
console.log(
  "EMAIL_FROM =",
  process.env.EMAIL_FROM ? "SET" : "DEFAULTED"
);
console.log("FRONTEND_URL =", process.env.FRONTEND_URL || "http://localhost:5173");

let transporter = null;

/**
 * Get or create Nodemailer transporter
 */
const getTransporter = () => {
  if (transporter) return transporter;

  const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_SERVICE } = process.env;

  if (!EMAIL_USERNAME || !EMAIL_PASSWORD) {
    console.warn(
      "❌ Email credentials are missing! Set EMAIL_USERNAME and EMAIL_PASSWORD in your .env"
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE || "gmail",
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  });

  return transporter;
};

/**
 * Ensure FRONTEND_URL has no trailing slash
 */
const getFrontendBaseUrl = () => {
  console.log(process.env.FRONTEND_URL);
  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  console.log(base);
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

/**
 * Format slot date for appointment emails
 */
const formatSlotDate = (slotDate) => {
  if (!slotDate) return "the scheduled date";
  if (slotDate.includes("_")) {
    const [day, month, year] = slotDate.split("_");
    return `${day}/${month}/${year}`;
  }
  return slotDate;
};

/**
 * Send appointment cancellation email
 */
export const sendAppointmentCancellationEmail = async ({
  to,
  patientName,
  doctorName,
  slotDate,
  slotTime,
  reason,
}) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn(`Cannot send cancellation email to ${to}: transporter not configured`);
    return;
  }
  if (!to) {
    console.warn("Cannot send cancellation email: recipient email missing");
    return;
  }

  const formattedDate = formatSlotDate(slotDate);
  const safePatientName = patientName || "Patient";
  const safeDoctorName = doctorName || "your doctor";
  const safeReason = reason?.trim()
    ? reason
    : "The doctor had to cancel the appointment.";
  const friendlyTime = slotTime ? ` at ${slotTime}` : "";

  const subject = `Appointment with ${safeDoctorName} cancelled`;
  const html = `
    <p>Hi ${safePatientName},</p>
    <p>We’re sorry to let you know that your appointment with <strong>${safeDoctorName}</strong> scheduled for <strong>${formattedDate}${friendlyTime}</strong> has been cancelled.</p>
    <p>Reason: ${safeReason}</p>
    <p>Please log in to the portal to book another appointment at your convenience.</p>
    <p>— Prescripto Care Team</p>
  `;

  const text = `Hi ${safePatientName},
Your appointment with ${safeDoctorName} on ${formattedDate}${friendlyTime} has been cancelled.
Reason: ${safeReason}
Please log in to the portal to book another appointment.
- Prescripto Care Team`;

  try {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
      to,
      subject,
      text,
      html,
    });
    console.log(`✅ Appointment cancellation email sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send cancellation email:", error.message);
  }
};

/**
 * Send user verification email
 */
export const sendVerificationEmail = async ({ to, token, userName }) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn(`Cannot send verification email to ${to}: transporter not configured`);
    return;
  }
  if (!to || !token) {
    console.warn(`Cannot send verification email: missing recipient or token`);
    return;
  }

  const verificationUrl = `${getFrontendBaseUrl()}/verify-email?token=${token}`;
  console.log(verificationUrl);
  const safeName = userName || "there";

  const subject = "Verify your Prescripto email";
  const html = `
    <p>Hi ${safeName},</p>
    <p>Thanks for signing up! Please confirm your email by clicking the button below:</p>
    <p style="margin: 24px 0;">
      <a href="${verificationUrl}" target="_blank" rel="noopener"
        style="background-color:#2563EB;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
        Verify my email
      </a>
    </p>
    <p>If the button doesn’t work, copy and paste this link into your browser:</p>
    <p><a href="${verificationUrl}" target="_blank" rel="noopener">${verificationUrl}</a></p>
    <p>This link expires in 24 hours.</p>
    <p>— Prescripto Care Team</p>
  `;

  const text = `Hi ${safeName},
Please confirm your email by visiting the link below (valid for 24 hours):
${verificationUrl}
- Prescripto Care Team`;

  try {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
      to,
      subject,
      text,
      html,
    });
    console.log(`✅ Verification email sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error.message);
  }
};
