import jwt from 'jsonwebtoken';
import asyncHandler from '../Utils/AsyncHandler.js';
import ApiResponse from '../Utils/ApiResponse.js';
import dotenv from 'dotenv';
import { CreateAccessToken, CreateRefreshToken } from '../Utils/Tokens.js';
import User from '../Schema/User.js';

dotenv.config();

const AuthMiddleware = asyncHandler(async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken && !refreshToken) {
        return res.status(400).json(new ApiResponse(400, 'Please add the cookies'));
    }

    try {
        const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if (decodedAccessToken) {
            req.user = decodedAccessToken;
            return next(); 
        }
    } catch (error) {
        console.log("Access token expired or invalid:", error.message);
    }
    try {
        console.log("Refresh token:", refreshToken,accessToken);
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const user = await User.findOne({ email: decodedRefreshToken.email }).select("name email _id RefreshToken");
        
        if (!user || user.RefreshToken !== refreshToken) {
            return res.status(401).json(new ApiResponse(401, 'Cookies expired'));
        }

        const newAccessToken = CreateAccessToken(user);

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 10 * 60 * 1000,
        });

        req.user = user;
        next();
    } catch (error) {
        console.log("Refresh token expired or invalid:", error.message);
        return res.status(401).json(new ApiResponse(401, 'Cookies expired'));
    }
});

export default AuthMiddleware;
