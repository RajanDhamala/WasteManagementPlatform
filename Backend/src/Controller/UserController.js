import asyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ApiResponse.js";
import User from "../Schema/User.js";
import bcrypt from 'bcryptjs'
import { CreateAccessToken,CreateRefreshToken } from "../Utils/Tokens.js";
import fs from 'fs';
import {sendMail,generateOTP} from '../Utils/MailUtil.js'

import upload2Cloudinary from "../Utils/CloundinaryImg.js";
import e from "cors";

const RegisterUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    console.log(req.body);

    if (!username || !email || !password) {
        return res.send(new ApiResponse(400, 'Please Fill All The Fields', null));
    }
    try {
        const existingUserEmail = await User.findOne({ email: email });
        const existingUserUsername = await User.findOne({ username: username });

        if (existingUserEmail) {
            return res.send(new ApiResponse(400, 'Email already exists', null));
        }

        if (existingUserUsername) {
            return res.send(new ApiResponse(400, 'Username already exists', null));
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name: username,
            email: email,
            password: hashedPassword,
        });

        await user.save();
        console.log("User registered successfully");
        res.send(new ApiResponse(200, 'User Registered Successfully', null));
    } catch (err) {
        console.log(err);
        res.send(new ApiResponse(500, 'Server Error', null));
    }
});


const LoginUser = asyncHandler(async (req, res) => {
  console.log(req.body);
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.send(new ApiResponse(400, 'Please Fill All The Fields', null));
      }

      const existingUser = await User.findOne({ email }).select('password email name _id ');
      console.log(existingUser);

      if (!existingUser) {
        return res.send(new ApiResponse(400, 'Invalid Credentials', null));
      }
  
      const isMatch = await bcrypt.compare(password, existingUser.password);
      console.log(isMatch);
  
      if (!isMatch) {
        return res.send(new ApiResponse(400, 'Invalid Credentials', null));
      }
      const accessToken = CreateAccessToken(existingUser);
      const refreshToken = CreateRefreshToken(existingUser);

      const update = await User.findOneAndUpdate(
        { _id: existingUser._id },
        { $set: { RefreshToken: refreshToken } },  
        { new: true } 
    );
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true, 
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });
  
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true, 
        maxAge: 10 * 60 * 1000, 
      });
      const currentUser={
        name:existingUser.name,
        email:existingUser.email,
        _id:existingUser._id
      }
  
      res.send(new ApiResponse(200, 'User Logged In Successfully', currentUser));
  
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send(new ApiResponse(500, 'Internal Server Error', null));
    }
  });

  const LogoutUser=asyncHandler(async(req,res)=>{
    const {accessToken,refreshToken}=req.cookies;
    const user=req.user;
    console.log(user);
    if(!accessToken || !refreshToken){
      return res.send(new ApiResponse(400, 'Invalid Credentials', null));
    }

    try{
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.send(new ApiResponse(200, 'User Logged Out Successfully', null));
    }catch(err){
      console.log("err logging out",err)
      res.send(new ApiResponse(500, 'Internal Server Error', null));
    }

  })

  const UpdateProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    const { bio, location, birthdate } = req.body;
    if (!user) {
        return res.status(400).json(new ApiResponse(400, 'Invalid Credentials', null));
    }
    if (!req.file && !bio && !location && !birthdate) {
        return res.status(400).json(new ApiResponse(400, 'Please fill at least one field', null));
    }

    try {
        const currentUser = await User.findOne({ email: user.email }).select(
            'name email _id bio location birthdate ProfileImage '
        );

        if (!currentUser) {
            return res.status(404).json(new ApiResponse(404, 'User not found', null));
        }

        if (req.file) {
            const imgres = await upload2Cloudinary(req.file.path);
            currentUser.ProfileImage = imgres.optimizeUrl || imgres.uploadResult; 
            fs.unlinkSync(req.file.path);
        }

     if (bio) currentUser.bio = bio;
        if (location) currentUser.location = location;
        if (birthdate) currentUser.birthdate = birthdate;

        await currentUser.save();
        return res.status(200).json(new ApiResponse(200, 'Profile Updated Successfully', currentUser));
    } catch (err) {
        console.error("Error updating profile:", err);
        return res.status(500).json(new ApiResponse(500, 'Internal Server Error', null));
    }
});

const UserProfile=asyncHandler(async(req,res)=>{
  const user=req.user;

  if(!user){
    return res.send(new ApiResponse(400, 'Invalid Credentials', null));
  }

  try{
    const existingUser=await User.findOne({email:user.email}).select('name email _id bio location birthdate ProfileImage ');
    console.log(existingUser);
    return res.send(new ApiResponse(200, 'User Profile', existingUser));

  }catch(err){
    console.log(err);
    res.send(new ApiResponse(500, 'Internal Server Error', null));
  }
})


const ForgotPassword=asyncHandler(async(req,res)=>{
  const {email}=req.body;
  console.log(email);
  if(!email){
    return res.send(new ApiResponse(400, 'Please fill all the fields', null));
  }

  try{
    const existingUser=await User.findOne({email:email}).select('email _id password isVerfied');
    console.log(existingUser);
    if(!existingUser && !existingUser.isVerfied){
      return res.send(new ApiResponse(400, 'User not found or not verified', null));
    }
    
    const otp=generateOTP();
    // await sendMail(email,otp);
    existingUser.PassOtp=otp;

    console.log('otp:',otp);
    await existingUser.save();
    return res.send(new ApiResponse(200, 'Password reset OTP sent to ur email', null));

  }catch(err){
    console.log(err);
    res.send(new ApiResponse(500, 'Internal Server Error', null));
  }

})

const verifyPasswordOtp=asyncHandler(async(req,res)=>{

  const {otp,email}=req.body
  if(!otp || !email){
    return res.send(new ApiResponse(400, 'Please fill all the fields', null));
  }
  try{
    const existingUser=await User.findOne({email:email}).select('_id PassOtp');
    if (!existingUser) {
      return res.send(new ApiResponse(400, 'User not found', null));
    }

    if(existingUser.PassOtp!==otp){
      return res.send(new ApiResponse(400, 'Invalid OTP', null));
    }
    existingUser.PassOtp='';
    await existingUser.save();
    return res.send(new ApiResponse(200, 'OTP verified successfully', null));

  }catch(err){
    console.log(err);
    res.send(new ApiResponse(500, 'Internal Server Error', null));
  }

})

const VerifyUser=asyncHandler(async(req,res)=>{
  const user=req.user;

  if(!user){
    return res.send(new ApiResponse(400, 'Invalid Credentials', null));
  }

  try{
    const existingUser=await User.findOne({email:user.email}).select('name email _id isVerfied VerificationOtp');

    if(existingUser.isVerfied){
      return res.send(new ApiResponse(400, 'User already verified', null));
    }
    const Otp=generateOTP();
    console.log('otp for verfication:',Otp);
    // await sendMail(user.email,Otp);
    existingUser.VerificationOtp=Otp;
    res.send(new ApiResponse(200, 'Verification OTP sent to ur email', null));

  }catch(err){
    console.log(err);
    res.send(new ApiResponse(500, 'Internal Server Error', null));
  }
})


const VerifyVerficationOtp=asyncHandler(async(req,res)=>{
  const {otp}=req.body;
  const user=req.user;

if(!otp && !user){
  return res.send(new ApiResponse(400, 'Please check credentials and otp', null));}

  try{
    const existingUser=await User.findOne({email:user.email}).select('name email _id VerificationOtp isVerfied');
    if(!existingUser){
      return res.send(new ApiResponse(400, 'User not found', null));
    }
    if(otp==!existingUser.VerificationOtp){
      return res.send(new ApiResponse(401, 'Please enter valid Otp', null));
    }
    existingUser.isVerfied=true;
    existingUser.VerificationOtp='';
    await existingUser.save();
    return res.send(new ApiResponse(200, 'User verified successfully', null));

  }catch(err){
    console.log(err);
    res.send(new ApiResponse(500, 'Internal Server Error', null));
  }
})


export {
    RegisterUser,
    LoginUser,
    LogoutUser,
    UpdateProfile,
    UserProfile,
    ForgotPassword,
    verifyPasswordOtp,
    VerifyUser,
    VerifyVerficationOtp
}