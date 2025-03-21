import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Utils/CloudinaryConfig.js';
import path from 'path';

function uploadMiddleware(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const folderPath = folderName.trim();
      const fileExtension = path.extname(file.originalname).substring(1); 
      const trimmedFileName = file.originalname.substring(0, 15); 
      const publicId = `${trimmedFileName}-${Date.now()}`;  

      return {
        folder: folderPath,
        public_id: publicId,
        format: fileExtension, 
      };
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, 
    },
    fileFilter: (req, file, cb) => {
      const fileTypes = /jpeg|jpg|avif|png|gif|webp|bmp|tiff/;
      const mimeType = fileTypes.test(file.mimetype);
      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

      if (mimeType && extname) {
        return cb(null, true); 
      } else {
        return cb(new Error('Only image files are allowed'), false);
      }
    },
  });
}

export default uploadMiddleware;
