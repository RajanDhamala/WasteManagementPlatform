import express from 'express';
import AuthMiddleware from '../Middleware/JwtMiddleware.js';
import { RegisterUser,LoginUser,LogoutUser,UpdateProfile,UserProfile,ForgotPassword,verifyPasswordOtp,VerifyUser,VerifyVerficationOtp,LeaveEvent,SeeJoinedEvents,browserdetails } from '../Controller/UserController.js';
import UpdatePfp from '../Middleware/ProfilePic.js';
import {rateLimit} from 'express-rate-limit';
import { AiApi } from '../Utils/AiIntegration.js';

const UserRoute=express.Router();

UserRoute.get('/',(req,res)=>{
    console.log('User Route hitted')
    return res.send('User Route hitted')
})

UserRoute.post('/register',RegisterUser)

UserRoute.post('/login',LoginUser)
// ,rateLimit({ windowMs:60*60*1000,max:4,message:'login req blocked due to multiple req'})

UserRoute.get('/logout',AuthMiddleware,LogoutUser)

UserRoute.post('/UpdateProfile',rateLimit({windowMs:60*60*7000,max:2,message:'cannot update profile such frequently'}),AuthMiddleware,UpdatePfp.single('ProfileImage'),UpdateProfile)

UserRoute.get('/profile',AuthMiddleware,UserProfile);

UserRoute.post('/forgotpassword',rateLimit({windowMs:24*60*60*1000,max:100,message:'cannot hit password route frequently'}),ForgotPassword);

UserRoute.post('/verifyPasswordOtp',rateLimit({windowMs:24*60*60*1000,max:6,message:'cannot attempt otp'}),verifyPasswordOtp);

UserRoute.get('/verifyUser',rateLimit({windowMs:24*60*60*1000,max:2,message:'cannot hit password route frequently'}),AuthMiddleware,VerifyUser);

UserRoute.post('/verifyVerificationOtp',rateLimit({windowMs:24*60*60*1000,max:6,message:'cannot attempt otp'}),AuthMiddleware,VerifyVerficationOtp);

UserRoute.post('/leaveEvent',AuthMiddleware,LeaveEvent);

UserRoute.get('/joinedevents',AuthMiddleware,SeeJoinedEvents);

UserRoute.get('/info',AuthMiddleware,browserdetails);

UserRoute.get('/ai',(req,res)=>{
    AiApi('how ai works')
    return res.send('AI working')
})

export default UserRoute;