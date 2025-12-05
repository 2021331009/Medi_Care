import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from 'jsonwebtoken'
//import { Suspense } from "react";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// Helper function to calculate age from DOB
const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

// API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;
    //checking for all data to doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({
        success: false,
        message: "Please provide all required fields.",
      });
    }
    //validation email
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please  enter a valid email.",
      });
    }
    //validating password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please  enter a strong password.",
      });
    }
    //hassing doctor password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get image URL from Cloudinary (already uploaded by middleware)
    let imageUrl = '';
    
    if (imageFile && imageFile.url) {
      // New system: image is already uploaded to Cloudinary by middleware
      imageUrl = imageFile.url;
    } else if (imageFile && imageFile.path) {
      // Old system: manual upload to Cloudinary using local path
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;
    } else {
      return res.json({
        success: false,
        message: "Please provide a profile image.",
      });
    }

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    res.json({ success: true, message: "Doctor added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api for admin login

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
        const token=jwt.sign(email+password,process.env.JWT_SECRET )
        res.json({success:true,token})

    }else{
        res.json({success:false,message:"Invalid  credentials"})
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get all doctors list for admin panel
const allDoctors=async (req,res)=>{
  try{
    const doctors=await doctorModel.find({}).select('-password')
     res.json({success:true,doctors})
  }catch(error){
    console.log(error)
    res.json({success:false,message:error.message})
  }
}

const appointmentAdmin = async (req, res) => {
    try {
        if (!appointmentModel) {
            console.error('Appointment model is not properly imported');
            return res.status(500).json({
                success: false,
                message: "Internal server error: Model not found"
            });
        }

        const appointments = await appointmentModel.find({})
            .sort({ date: -1 })
            .lean();

        const appointmentsWithUserDetails = await Promise.all(
            appointments.map(async (appointment) => {
                try {
                    const user = await userModel.findById(appointment.userId)
                        .select('name dob phone image')
                        .lean();
                    
                    if (user) {
                        const age = calculateAge(user.dob);
                        return {
                            ...appointment,
                            userData: {
                                ...user,
                                age: age // Add calculated age to userData
                            }
                        };
                    }
                    
                    return {
                        ...appointment,
                        userData: {
                            name: 'User not found',
                            dob: null,
                            age: null,
                            phone: null,
                            image: null
                        }
                    };
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    return appointment;
                }
            })
        );

        return res.status(200).json({
            success: true,
            appointments: appointmentsWithUserDetails
        });
    } catch (error) {
        console.error('Full error details:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const cancelAppointmentAdmin = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({
                success: false,
                message: "Appointment ID is required"
            });
        }

        // Find the appointment first to get its details
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Update the appointment status
        appointment.cancelled = true;
        appointment.showToUser = false;
        await appointment.save();

        // Remove the booked slot from doctor's schedule
        if (appointment.docId && appointment.slotDate && appointment.slotTime) {
            const doctor = await doctorModel.findById(appointment.docId);
            if (doctor) {
                // Initialize slots_booked if it doesn't exist
                if (!doctor.slots_booked) {
                    doctor.slots_booked = {};
                }

                // Check if the date exists and has the slot
                if (doctor.slots_booked[appointment.slotDate]) {
                    // Remove the time slot from the array
                    doctor.slots_booked[appointment.slotDate] = doctor.slots_booked[appointment.slotDate]
                        .filter(time => time.toLowerCase() !== appointment.slotTime.toLowerCase());
                    
                    // If no more slots for that date, remove the date entry
                    if (doctor.slots_booked[appointment.slotDate].length === 0) {
                        delete doctor.slots_booked[appointment.slotDate];
                    }
                }
                
                // Mark as modified to ensure save triggers
                doctor.markModified('slots_booked');
                await doctor.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully",
            appointment
        });
    } catch (error) {
        console.error('Error in cancelAppointmentAdmin:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel appointment"
        });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({
                success: false,
                message: "Appointment ID is required"
            });
        }

        // Find and delete the appointment
        const deletedAppointment = await appointmentModel.findByIdAndDelete(appointmentId);

        if (!deletedAppointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Appointment deleted successfully"
        });
    } catch (error) {
        console.error('Error in deleteAppointment:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete appointment"
        });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        // Get total doctors count
        const totalDoctors = await doctorModel.countDocuments();

        // Get total patients (all registered users)
        const totalPatients = await userModel.countDocuments();

        // Get total appointments
        const totalAppointments = await appointmentModel.countDocuments();

        // Get cancelled appointments count
        const cancelledAppointments = await appointmentModel.countDocuments({ cancelled: true });

        // Get 5 most recent appointments with user and doctor details
        const recentAppointments = await appointmentModel
            .find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Fetch user data for each appointment
        const appointmentsWithUserData = await Promise.all(
            recentAppointments.map(async (appointment) => {
                const userData = await userModel.findById(appointment.userId)
                    .select('name image')
                    .lean();
                return {
                    ...appointment,
                    userData: userData || { name: 'Unknown User' }
                };
            })
        );

        const stats = {
            totalDoctors,
            totalPatients,
            totalAppointments,
            cancelledAppointments,
            recentAppointments: appointmentsWithUserData
        };

        return res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};

const getAllAppointments = async (req, res) => {
    try {
        const appointments = await appointmentModel.find().sort({ createdAt: -1 });

        // Format dates and add additional information
        const formattedAppointments = appointments.map(appointment => {
            // Format the date
            const [day, month, year] = appointment.slotDate.split('_');
            const formattedDate = `${day.padStart(2, '0')}_${month.padStart(2, '0')}_${year}`;

            return {
                ...appointment.toObject(),
                slotDate: formattedDate
            };
        });

        res.json({
            success: true,
            appointments: formattedAppointments
        });
    } catch (error) {
        console.error('Error in getAllAppointments:', error);
        res.json({ success: false, message: error.message });
    }
};


const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    if (!doctorId) {
      return res.status(400).json({ success: false, message: "Doctor ID required" });
    }

    const deleted = await doctorModel.findByIdAndDelete(doctorId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    return res.status(200).json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export { 
    addDoctor,
    loginAdmin,
    allDoctors,
    appointmentAdmin,
    cancelAppointmentAdmin,
    deleteAppointment,
    getDashboardStats,
    getAllAppointments,
    deleteDoctor
};
