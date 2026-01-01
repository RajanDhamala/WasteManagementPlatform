import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const NanoMiddle = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch {
    req.user = null; // invalid or expired token, but don’t block
   next();
  }

  next();
};

export default NanoMiddle
