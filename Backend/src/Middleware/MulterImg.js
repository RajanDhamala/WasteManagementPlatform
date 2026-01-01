import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './temp');
  },
  filename: function (req, file, cb) {
    const sanitizedFilename = file.originalname;
    cb(null, sanitizedFilename);
  }
});

const upload = multer({ storage: storage });

export default upload;