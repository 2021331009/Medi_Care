import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import uploadRouter from './routes/uploadRoute.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.send('API working great ');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: err.message,
  });
});

app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
