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
export {
  registerUser,
};