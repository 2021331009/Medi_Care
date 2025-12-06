import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { sendVerificationEmail } from "../utils/emailService.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const emailVerificationDisabled =
      process.env.DISABLE_EMAIL_VERIFICATION === "true";
    const sanitizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !sanitizedEmail || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }
    if (!validator.isEmail(sanitizedEmail)) {
      return res.json({ success: false, message: "Enter a valid Email" });
    }
    if (!sanitizedEmail.endsWith("@gmail.com")) {
      return res.json({
        success: false,
        message: "Registration requires a valid Gmail address.",
      });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let user = await userModel.findOne({ email: sanitizedEmail });

    if (user) {
      if (user.isEmailVerified && !emailVerificationDisabled) {
        return res.json({
          success: false,
          message: "User already exists. Please login.",
        });
      }
      user.name = name.trim();
      user.password = hashedPassword;
      user.isEmailVerified = false;
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = verificationExpiry;
      await user.save();
    } else {
      user = await new userModel({
        name: name.trim(),
        email: sanitizedEmail,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpiry,
      }).save();
    }

    // If email verification is explicitly disabled (e.g. in local/dev),
    // mark the user as verified immediately so they can log in even if
    // email sending is not configured.
    if (emailVerificationDisabled) {
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();

      return res.json({
        success: true,
        message:
          "Email verification is disabled on this server. Your account is ready, you can log in now.",
      });
    }

    await sendVerificationEmail({
      to: sanitizedEmail,
      token: verificationToken,
      userName: user.name,
    });

    res.json({
      success: true,
      message:
        "Almost there! We sent a verification link to your Gmail inbox. Please verify your email to finish signing up.",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = email?.trim().toLowerCase();

    if (!sanitizedEmail || !password) {
      return res.json({ success: false, message: "Missing credentials" });
    }

    const user = await userModel.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }
    if (!user.isEmailVerified) {
      return res.json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token?.trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    // First, try to find a user with this token
    const user = await userModel.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.json({
        success: false,
        message: "Verification link is invalid. Please request a new one.",
      });
    }

    // If an expiry is set, ensure it's still in the future
    if (user.emailVerificationExpires && user.emailVerificationExpires <= new Date()) {
      return res.json({
        success: false,
        message: "Verification link has expired. Please register again to receive a new link.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, dob, gender, address } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    const updateData = {
      name,
      phone,
      dob,
      gender,
      address: JSON.parse(address),
    };

    if (imageFile) {
      // Check if the image was already uploaded to Cloudinary by our middleware
      if (imageFile.url) {
        // New system: image is already uploaded to Cloudinary
        updateData.image = imageFile.url;
      } else if (imageFile.path) {
        // Old system: manual upload to Cloudinary using local path
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        updateData.image = imageUpload.secure_url;
      }
    }

    await userModel.findByIdAndUpdate(userId, updateData);
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user.id;

    if (!slotTime) {
      return res.json({ success: false, message: "Please select a time slot." });
    }

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available for booking." });
    }

    let slots_booked = docData.slots_booked || {};

    // Ensure slots_booked[slotDate] is an array, initialize if undefined or not an array
    if (!Array.isArray(slots_booked[slotDate])) {
      slots_booked[slotDate] = [];
    }

    // Check if the slot is already booked
    if (slots_booked[slotDate].includes(slotTime)) {
      return res.json({ success: false, message: "Slot is not available" });
    }

    // Add the new slot
    slots_booked[slotDate].push(slotTime);

    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.json({ success: false, message: "User data not found." });
    }

    const docInfoForAppointment = { ...docData.toObject() };
    delete docInfoForAppointment.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData: userData.toObject(),
      docData: docInfoForAppointment,
      patientEmail: userData.email,
      amount: docData.fees,
      slotDate,
      slotTime,
      date: new Date(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Update doctor's slots_booked
    await doctorModel.findByIdAndUpdate(docId, { slots_booked }, { new: true });

    res.json({ success: true, message: "Appointment booked successfully" });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.json({ success: false, message: "Failed to book appointment: " + error.message });
  }
};
export {
  registerUser,
  loginUser,
  verifyEmail,
  getProfile,
  updateProfile,
  bookAppointment,
};