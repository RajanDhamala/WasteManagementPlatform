import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './temp/ProfilePic')
    },
    filename: function (req, file, cb) {
        const sanitizedFilename = file.originalname;
    cb(null, sanitizedFilename);
    }
  })
  
  const UpdatePfp = multer({ storage: storage })

  export default UpdatePfp;