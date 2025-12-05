import { uploadMiddleware } from '../middleware/multer.js';

// Controller for single file upload
const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // At this point, file is already uploaded to Cloudinary by the middleware
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: req.file.url,
        public_id: req.file.cloudinary.public_id,
        resource_type: req.file.cloudinary.resource_type,
        format: req.file.cloudinary.format,
        original_filename: req.file.originalname
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// Controller for multiple file uploads
const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    
    // At this point, files are already uploaded to Cloudinary by the middleware
    const fileData = req.files.map(file => ({
      url: file.url,
      public_id: file.cloudinary.public_id,
      resource_type: file.cloudinary.resource_type,
      format: file.cloudinary.format,
      original_filename: file.originalname
    }));
    
    return res.status(200).json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: fileData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};

export { uploadSingleFile, uploadMultipleFiles }; 