import express from 'express'
import { addDoctor, allDoctors, loginAdmin, appointmentAdmin, cancelAppointmentAdmin, deleteAppointment, getDashboardStats, deleteDoctor } from '../controllers/adminController.js'
import upload, { cloudinaryUpload } from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js'
import { changeAvailablity } from '../controllers/doctorController.js'

const adminRouter = express.Router()

adminRouter.post('/add-doctor', authAdmin, upload.single('image'), cloudinaryUpload.single(), addDoctor)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/change-availability', authAdmin, changeAvailablity)
adminRouter.get('/appointments', authAdmin, appointmentAdmin)
adminRouter.post('/cancel-appointment', authAdmin, cancelAppointmentAdmin)
adminRouter.delete('/delete-appointment', authAdmin, deleteAppointment)
adminRouter.get('/dashboard-stats', authAdmin, getDashboardStats)
adminRouter.delete('/doctors/:id',authAdmin,deleteDoctor)

export default adminRouter 