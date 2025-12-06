import express from "express";
import { registerUser, loginUser, verifyEmail, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, deleteAppointmentHistory, payCash, getDoctorById } from "../controllers/userControllers.js";
import authUser from "../middleware/authUser.js";
import upload, { cloudinaryUpload } from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/verify-email", verifyEmail);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post("/update-profile", authUser, upload.single("image"), cloudinaryUpload.single(), updateProfile);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.delete("/delete-appointment/:id", authUser, deleteAppointmentHistory);
userRouter.post("/pay-cash", authUser, payCash);
userRouter.get("/doctor/:doctorId", getDoctorById);

export default userRouter;