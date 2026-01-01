import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary';


dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDNARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  export default cloudinary