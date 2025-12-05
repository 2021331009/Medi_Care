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
