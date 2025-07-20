import multer from 'multer';

// Allowed image MIME types
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.memoryStorage();

const ReviewImg = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error("Only JPG, PNG, and WEBP images are allowed"), false); // Reject file
    }
  }
});

export default ReviewImg;
