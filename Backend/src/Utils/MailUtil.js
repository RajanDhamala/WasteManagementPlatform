import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendMail = async (recipientEmail, otp, type) => {
  const Transponder = nodemailer.createTransport({
    service: "gmail",
    headers:{
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept"
    },
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    },
  });

  try {
    if (type === "forgotPassword") {
      await Transponder.sendMail({
        from: process.env.EMAIL,
        to: recipientEmail,
        subject: "Reset your password in EcoClean",
        html: `
          <div style="font-size: 20px; font-family: Arial, sans-serif; color: #333;">
            <p><strong>Your OTP for password reset is:</strong> <span style="color: blue;">${otp}</span></p>
            <p>Please use this OTP to reset your password. If you did not request this, please ignore this email.</p>
          </div>
        `
      });
    } else if (type === "verification") {
      await Transponder.sendMail({
        from: process.env.EMAIL,
        to: recipientEmail,
        subject: "OTP Verification for your EcoClean account",
        html: `
          <div style="font-size: 20px; font-family: Arial, sans-serif; color: #333;">
            <p><strong>Your OTP for account verification is:</strong> <span style="color: blue;">${otp}</span></p>
            <p>Please use this OTP to verify your email address and complete your Verification.</p>
          </div>
        `
      });
    }
    
    console.log("OTP sent successfully");
  } catch (error) {
    console.log("Error while sending email", error);
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export { sendMail, generateOTP };
