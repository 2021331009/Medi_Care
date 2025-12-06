import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js';

const verifyDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers;
        
        if (!dtoken) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        try {
            const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);
            req.doctorId = decoded.id;
            
            // Verify doctor exists
            const doctor = await doctorModel.findById(decoded.id);
            if (!doctor) {
                return res.status(401).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            next();
        } catch (tokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

export { verifyDoctor }; 