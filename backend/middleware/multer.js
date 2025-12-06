import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter function to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Initialize multer with memory storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload file to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    // Convert buffer to base64
    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    
    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'uploads',
      resource_type: 'auto'
    });
    
    return result;
  } catch (error) {
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

// Middleware to handle file uploads
const uploadMiddleware = {
  single: (fieldName) => {
    return [
      upload.single(fieldName),
      async (req, res, next) => {
        if (!req.file) return next();
        
        try {
          const result = await uploadToCloudinary(req.file);
          
          // Replace file with cloudinary result
          req.file.cloudinary = result;
          req.file.url = result.secure_url;
          next();
        } catch (error) {
          next(error);
        }
      }
    ];
  },
  
  multiple: (fieldName, maxCount) => {
    return [
      upload.array(fieldName, maxCount),
      async (req, res, next) => {
        if (!req.files || req.files.length === 0) return next();
        
        try {
          const uploadPromises = req.files.map(uploadToCloudinary);
          const results = await Promise.all(uploadPromises);
          
          // Add cloudinary data to each file
          req.files = req.files.map((file, index) => {
            file.cloudinary = results[index];
            file.url = results[index].secure_url;
            return file;
          });
          
          next();
        } catch (error) {
          next(error);
        }
      }
    ];
  }
};

// Add a middleware that uploads to Cloudinary after multer processes the file
const cloudinaryUpload = {
  single: (fieldName) => {
    return async (req, res, next) => {
      if (!req.file) return next();
      
      try {
        const result = await uploadToCloudinary(req.file);
        req.file.cloudinary = result;
        req.file.url = result.secure_url;
        next();
      } catch (error) {
        next(error);
      }
    };
  },
  
  array: (fieldName, maxCount) => {
    return async (req, res, next) => {
      if (!req.files || req.files.length === 0) return next();
      
      try {
        const uploadPromises = req.files.map(uploadToCloudinary);
        const results = await Promise.all(uploadPromises);
        
        req.files = req.files.map((file, index) => {
          file.cloudinary = results[index];
          file.url = results[index].secure_url;
          return file;
        });
        
        next();
      } catch (error) {
        next(error);
      }
    };
  }
};

// Export both the middleware and direct upload for backward compatibility
export { uploadMiddleware, cloudinaryUpload };
export default upload;
