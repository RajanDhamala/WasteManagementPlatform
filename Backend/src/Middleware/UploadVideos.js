import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../Utils/CloudinaryConfig.js";
import path from "path";

function uploadVideoMiddleware(folderName) {
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
        resource_type: "video",  
        format: fileExtension,
        eager: [
          { format: "mp4", quality: "auto" }, 
        ],
        eager_async: true,
      };
    },
  });

  return multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const videoTypes = /mp4|mov|avi|mkv|webm/;
      const isValid = videoTypes.test(path.extname(file.originalname).toLowerCase());

      if (isValid) return cb(null, true);
      return cb(new Error("Only MP4, MOV, AVI, MKV, WebM formats allowed"), false);
    },
  });
}

export default uploadVideoMiddleware;
