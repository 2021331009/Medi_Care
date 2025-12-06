import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    docData: { type: Object, required: true },
    patientEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, default: null }, 
    date: { type: Date, default: Date.now },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    paymentMethod: { type: String, default: null },
    paymentInfo: { type: Object, default: null },
    isConfirmed: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    patientVisited: { type: Boolean, default: false },
    showToUser: { type: Boolean, default: true },
    showToDoctor: { type: Boolean, default: true }
}, {
    timestamps: true
});

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;
