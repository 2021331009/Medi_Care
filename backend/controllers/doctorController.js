import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from "cloudinary"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import { sendAppointmentCancellationEmail } from "../utils/emailService.js"

const changeAvailablity=async(req,res)=>{
    try{
        // Get doctor ID from request body (for admin) or from auth middleware (for doctor)
        const docId = req.body.docId || req.doctorId;

        const docData = await doctorModel.findById(docId);
        if (!docData) {
            return res.json({success: false, message: 'Doctor not found'});
        }

        // Update the doctor's availability
        const newAvailability = !docData.available;
        const updatedDoctor = await doctorModel.findByIdAndUpdate(docId, 
            {available: newAvailability}, 
            {new: true}
        ).select('-password');

        // Update the doctor's availability status in all related appointments
        try {
            const doctorInfoForAppointments = { ...updatedDoctor.toObject() };
            delete doctorInfoForAppointments.password;
            delete doctorInfoForAppointments.slots_booked;
            
            // Update all appointments that contain this doctor's data
            await appointmentModel.updateMany(
                { docId: docId },
                { 
                    $set: { 
                        "docData.available": newAvailability
                    } 
                }
            );
            
            console.log(`Updated doctor availability in all related appointments for doctor ID: ${docId}`);
        } catch (appointmentUpdateError) {
            console.error('Error updating doctor availability in appointments:', appointmentUpdateError);
            // We don't want to fail the availability update if appointment updates fail
            // Just log the error
        }

        res.json({success:true, message:'Availability updated successfully'});
    }catch(error){
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

const doctorList=async(req,res)=>{
    try{
        // Get appointment counts for all doctors
        const appointmentCounts = await appointmentModel.aggregate([
            {
                $match: {
                    cancelled: false
                }
            },
            {
                $group: {
                    _id: "$docId",
                    appointmentCount: { $sum: 1 }
                }
            }
        ]);

        // Create a map of doctor ID to appointment count
        const countMap = new Map(
            appointmentCounts.map(item => [item._id.toString(), item.appointmentCount])
        );

        // Get all doctors
        const doctors = await doctorModel.find({}).select(['-password', '-email']);

        // Sort doctors by their appointment count
        const sortedDoctors = doctors.sort((a, b) => {
            const countA = countMap.get(a._id.toString()) || 0;
            const countB = countMap.get(b._id.toString()) || 0;
            return countB - countA;
        });

        res.json({ success: true, doctors: sortedDoctors });
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//api for doctor login
const loginDoctor=async(req,res)=>{
    try{
        const {email,password}=req.body
        const doctor=await doctorModel.findOne({email})
        if(!doctor){
            return res.json({success:false,message:'invalid credentials'})
        }
        const isMatch=await bcrypt.compare(password,doctor.password)

        if(isMatch){
            const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET)

            res.json({success:true,token})
        }else{
          res.json({success:false,message:'invalid credentials'})  
        }
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Get doctor profile
const getDoctorProfile = async (req, res) => {
    try {
        const doctor = await doctorModel.findById(req.doctorId).select('-password');
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }
        res.json({ success: true, doctor });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
    try {
        const {
            name,
            speciality,
            degree,
            experience,
            fees,
            about,
            address
        } = req.body;

        // Validate required fields
        if (!name || !speciality || !degree || !experience || !fees || !about || !address) {
            return res.json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Create update object
        const updateData = {
            name,
            speciality,
            degree,
            experience,
            fees,
            about,
            address: JSON.parse(address)
        };

        // Handle image upload if provided
        if (req.file) {
            try {
                // Check if image was already uploaded to Cloudinary by middleware
                if (req.file.url) {
                    // New system: image already uploaded to Cloudinary by middleware
                    updateData.image = req.file.url;
                } else if (req.file.path) {
                    // Old system: manual upload to Cloudinary
                    const imageUpload = await cloudinary.uploader.upload(req.file.path, {
                        resource_type: "image",
                    });
                    updateData.image = imageUpload.secure_url;
                }
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.json({
                    success: false,
                    message: "Error uploading image"
                });
            }
        }

        // Update doctor profile
        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            req.doctorId,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedDoctor) {
            return res.json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Update doctor data in all appointments
        try {
            const doctorInfoForAppointments = { ...updatedDoctor.toObject() };
            delete doctorInfoForAppointments.password;
            delete doctorInfoForAppointments.slots_booked;
            
            // Update all appointments that contain this doctor's data
            await appointmentModel.updateMany(
                { docId: req.doctorId },
                { 
                    $set: { 
                        docData: doctorInfoForAppointments,
                        amount: fees // Update the fee in case it changed
                    } 
                }
            );
            
            console.log(`Updated doctor info in all related appointments for doctor ID: ${req.doctorId}`);
        } catch (appointmentUpdateError) {
            console.error('Error updating doctor data in appointments:', appointmentUpdateError);
            // We don't want to fail the profile update if appointment updates fail
            // Just log the error
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            doctor: updatedDoctor
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

const getDoctorAppointments = async (req, res) => {
    try {
        const docId = req.doctorId;
        const appointments = await appointmentModel.find({ 
            docId,
            showToDoctor: true  // Only show appointments that are visible to the doctor
        })
            .sort({ date: -1 })
            .lean();

        // Fetch user details for each appointment
        const appointmentsWithUserDetails = await Promise.all(
            appointments.map(async (appointment) => {
                const user = await userModel.findById(appointment.userId)
                    .select('name dob image email phone')
                    .lean();

                // Calculate age
                let age = null;
                if (user?.dob) {
                    const birthDate = new Date(user.dob);
                    const today = new Date();
                    age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                }

                // Calculate appointment status
                let status = 'pending';
                if (appointment.cancelled) {
                    status = 'cancelled';
                } else if (appointment.isCompleted) {
                    status = appointment.patientVisited ? 'completed' : 'missed';
                } else if (appointment.isConfirmed) {
                    status = 'confirmed';
                }

                return {
                    _id: appointment._id,
                    patientName: user?.name || 'Unknown',
                    age: age || 'N/A',
                    date: appointment.slotDate,
                    time: appointment.slotTime,
                    fees: appointment.amount,
                    paymentMode: appointment.payment ? 
                        (appointment.paymentMethod === 'cash' ? 'Cash Payment' : 
                         appointment.paymentMethod ? `Paid via ${appointment.paymentMethod}` : 'Online') 
                        : 'Unpaid',
                    payment: appointment.payment,
                    paymentMethod: appointment.paymentMethod,
                    status,
                    isConfirmed: appointment.isConfirmed,
                    isCompleted: appointment.isCompleted,
                    patientVisited: appointment.patientVisited,
                    cancelled: appointment.cancelled,
                    userData: {
                        name: user?.name,
                        email: user?.email,
                        phone: user?.phone,
                        image: user?.image,
                        age: age
                    }
                };
            })
        );

        res.json({ success: true, appointments: appointmentsWithUserDetails });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const cancelDoctorAppointment = async (req, res) => {
    try {
        const { appointmentId, reason } = req.body;
        const docId = req.doctorId;

        const appointment = await appointmentModel.findOne({
            _id: appointmentId,
            docId,
            isCompleted: false
        });

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found or cannot be cancelled' });
        }

        // Reset all status flags and set cancelled to true
        appointment.cancelled = true;
        appointment.isConfirmed = false;
        appointment.isCompleted = false;
        appointment.patientVisited = false;
        await appointment.save();

        // Remove the booked slot from doctor's schedule
        const doctor = await doctorModel.findById(docId);
        if (doctor && doctor.slots_booked && doctor.slots_booked[appointment.slotDate]) {
            doctor.slots_booked[appointment.slotDate] = doctor.slots_booked[appointment.slotDate]
                .filter(time => time !== appointment.slotTime);
            
            if (doctor.slots_booked[appointment.slotDate].length === 0) {
                delete doctor.slots_booked[appointment.slotDate];
            }
            
            doctor.markModified('slots_booked');
            await doctor.save();
        }

        const patient = await userModel.findById(appointment.userId).select('name email');
        const patientEmail = appointment.patientEmail || patient?.email;
        const cancellationMessage =
            reason?.trim() || "The doctor has cancelled this appointment.";

        if (patientEmail) {
            await sendAppointmentCancellationEmail({
                to: patientEmail,
                patientName: patient?.name,
                doctorName: appointment.docData?.name || doctor?.name,
                slotDate: appointment.slotDate,
                slotTime: appointment.slotTime,
                reason: cancellationMessage,
            });
        }

        res.json({ success: true, message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const deleteDoctorAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const docId = req.doctorId;

        const appointment = await appointmentModel.findOne({
            _id: appointmentId,
            docId,
            $or: [{ cancelled: true }, { isCompleted: true }]
        });

        if (!appointment) {
            return res.json({ 
                success: false, 
                message: 'Appointment not found or cannot be deleted (must be cancelled or completed)' 
            });
        }

        // Instead of deleting, just hide from doctor's view
        appointment.showToDoctor = false;
        await appointment.save();

        res.json({ success: true, message: 'Appointment removed from history successfully' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const confirmAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const docId = req.doctorId;

        const appointment = await appointmentModel.findOne({
            _id: appointmentId,
            docId,
            cancelled: false,
            isConfirmed: false,
            isCompleted: false
        });

        if (!appointment) {
            return res.json({ 
                success: false, 
                message: 'Appointment not found or cannot be confirmed' 
            });
        }

        if (!appointment.payment) {
            return res.json({
                success: false,
                message: 'Appointment has not been paid. Cannot confirm.'
            });
        }

        appointment.isConfirmed = true;
        appointment.status = 'confirmed'; // Optional for easier status tracking
        await appointment.save();

        res.json({ success: true, message: 'Appointment confirmed successfully' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};


const completeAppointment = async (req, res) => {
    try {
        const { appointmentId, patientVisited } = req.body;
        const docId = req.doctorId;

        const appointment = await appointmentModel.findOne({
            _id: appointmentId,
            docId,
            cancelled: false,
            isConfirmed: true,
            isCompleted: false
        });

        if (!appointment) {
            return res.json({ 
                success: false, 
                message: 'Appointment not found or cannot be completed' 
            });
        }

        appointment.isCompleted = true;
        appointment.patientVisited = patientVisited;
        await appointment.save();

        res.json({ 
            success: true, 
            message: patientVisited ? 
                'Appointment marked as completed with patient visit' : 
                'Appointment marked as completed without patient visit'
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const getDoctorDashboardStats = async (req, res) => {
    try {
        const docId = req.doctorId;

        // Get total appointments for this doctor
        const totalAppointments = await appointmentModel.countDocuments({ 
            docId,
            showToDoctor: true 
        });

        // Get completed appointments count
        const completedAppointments = await appointmentModel.countDocuments({ 
            docId, 
            isCompleted: true,
            showToDoctor: true
        });

        // Get confirmed appointments count (not completed, not cancelled, but confirmed)
        const confirmedAppointments = await appointmentModel.countDocuments({ 
            docId, 
            isConfirmed: true,
            isCompleted: false,
            cancelled: false,
            showToDoctor: true
        });

        // Get cancelled appointments count
        const cancelledAppointments = await appointmentModel.countDocuments({ 
            docId, 
            cancelled: true,
            showToDoctor: true
        });

        // Get pending appointments count (not confirmed, not completed, not cancelled)
        const pendingAppointments = await appointmentModel.countDocuments({ 
            docId, 
            isConfirmed: false,
            isCompleted: false, 
            cancelled: false,
            showToDoctor: true
        });

        // Get today's appointments
        const today = new Date();
        const todayStr = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
        const todayAppointments = await appointmentModel.find({ 
            docId,
            slotDate: todayStr,
            cancelled: false,
            showToDoctor: true
        }).sort({ slotTime: 1 }).lean();

        // Get recent appointments
        const recentAppointments = await appointmentModel
            .find({ 
                docId,
                showToDoctor: true
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Fetch user details for appointments
        const appointmentsWithUserDetails = await Promise.all(
            [...todayAppointments, ...recentAppointments].map(async (appointment) => {
                const user = await userModel.findById(appointment.userId)
                    .select('name dob image email phone')
                    .lean();

                // Calculate age
                let age = null;
                if (user?.dob) {
                    const birthDate = new Date(user.dob);
                    const today = new Date();
                    age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                }

                // Calculate status
                let status = 'pending';
                if (appointment.cancelled) {
                    status = 'cancelled';
                } else if (appointment.isCompleted) {
                    status = appointment.patientVisited ? 'completed' : 'missed';
                } else if (appointment.isConfirmed) {
                    status = 'confirmed';
                }

                return {
                    _id: appointment._id,
                    patientName: user?.name || 'Unknown',
                    date: appointment.slotDate,
                    time: appointment.slotTime,
                    fees: appointment.amount,
                    paymentMode: appointment.payment ? 
                        (appointment.paymentMethod === 'cash' ? 'Cash Payment' : 
                         appointment.paymentMethod ? `Paid via ${appointment.paymentMethod}` : 'Online') 
                        : 'Unpaid',
                    status,
                    userData: user || {}
                };
            })
        );

        // Split appointments into today and recent
        const todayAppointmentsWithDetails = appointmentsWithUserDetails.slice(0, todayAppointments.length);
        const recentAppointmentsWithDetails = appointmentsWithUserDetails.slice(todayAppointments.length);

        // Log the data being sent
        console.log('Today\'s Appointments:', todayAppointmentsWithDetails);
        console.log('Recent Appointments:', recentAppointmentsWithDetails);

        const stats = {
            totalAppointments,
            completedAppointments,
            confirmedAppointments,
            cancelledAppointments,
            pendingAppointments,
            todayAppointments: todayAppointmentsWithDetails,
            recentAppointments: recentAppointmentsWithDetails
        };

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error in getDoctorDashboardStats:', error);
        res.json({ success: false, message: error.message });
    }
};

const getTopDoctors = async (req, res) => {
    try {
        // Get all appointments that are not cancelled
        const appointments = await appointmentModel.aggregate([
            {
                $match: {
                    cancelled: false
                }
            },
            {
                $group: {
                    _id: "$docId",
                    appointmentCount: { $sum: 1 }
                }
            },
            {
                $sort: { appointmentCount: -1 }
            }
        ]);

        // Get doctor details for each doctor ID
        const topDoctors = await Promise.all(
            appointments.map(async (item) => {
                const doctor = await doctorModel.findById(item._id)
                    .select('-password -email');
                if (!doctor) return null; // Skip if doctor not found
                return {
                    ...doctor.toObject(),
                    appointmentCount: item.appointmentCount
                };
            })
        );

        // Filter out any null values (doctors that weren't found)
        const filteredDoctors = topDoctors.filter(doctor => doctor !== null);

        res.json({ success: true, doctors: filteredDoctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    changeAvailablity,
    doctorList,
    loginDoctor,
    getDoctorProfile,
    updateDoctorProfile,
    getDoctorAppointments,
    cancelDoctorAppointment,
    deleteDoctorAppointment,
    confirmAppointment,
    completeAppointment,
    getDoctorDashboardStats,
    getTopDoctors
}