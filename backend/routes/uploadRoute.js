import express from 'express';
import { uploadSingleFile, uploadMultipleFiles } from '../controllers/fileUploadController.js';
import upload, { cloudinaryUpload } from '../middleware/multer.js';

const router = express.Router();

// Route for single file upload using the combined approach
router.post('/single', upload.single('image'), cloudinaryUpload.single(), uploadSingleFile);

// Route for multiple file uploads (max 5 files)
router.post('/multiple', upload.array('images', 5), cloudinaryUpload.array(), uploadMultipleFiles);

export default router; 