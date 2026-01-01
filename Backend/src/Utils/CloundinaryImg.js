import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const upload2Cloudinary = async (path) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDNARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });

    const uploadResult = await cloudinary.uploader.upload(path, {
      resource_type: 'auto', 
      public_id: `event_images/${Date.now()}`, 
      overwrite: true, 
    });

    const optimizeUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',  
      quality: 'auto',      
    });
    console.log('Optimized URL:', optimizeUrl);

    return {
      uploadResult,
      optimizeUrl,
    };

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Error uploading image to Cloudinary');
  }
};

export default upload2Cloudinary;
