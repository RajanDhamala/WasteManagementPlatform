import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const CreateAccessToken = (user) => {
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
  
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  }
  
  const CreateRefreshToken = (user) => {
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
  
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  }

export {
    CreateAccessToken,
    CreateRefreshToken,
}