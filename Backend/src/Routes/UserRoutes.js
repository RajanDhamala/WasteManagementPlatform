import express from 'express';
import AuthMiddleware from '../Middleware/JwtMiddleware.js';
import { RegisterUser,LoginUser,LogoutUser,UpdateProfile,UserProfile,ForgotPassword,verifyPasswordOtp,VerifyUser,VerifyVerficationOtp } from '../Controller/UserController.js';
import UpdatePfp from '../Middleware/ProfilePic.js';

const UserRoute=express.Router();

UserRoute.get('/',(req,res)=>{
    console.log('User Route hitted')
    return res.send('User Route hitted')
})

UserRoute.post('/register',RegisterUser)

UserRoute.post('/login',LoginUser)

UserRoute.get('/logout',AuthMiddleware,LogoutUser)

UserRoute.post('/UpdateProfile',AuthMiddleware,UpdatePfp.single('ProfileImage'),UpdateProfile)

UserRoute.get('/profile',AuthMiddleware,UserProfile);

UserRoute.post('/forgotpassword',ForgotPassword);

UserRoute.post('/verifyPasswordOtp',verifyPasswordOtp);

UserRoute.get('/verifyUser',AuthMiddleware,VerifyUser);

UserRoute.post('/verifyVerificationOtp',AuthMiddleware,VerifyVerficationOtp);

export default UserRoute;