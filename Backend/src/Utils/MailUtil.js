import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

  const sendMail=async (recipientEmail,otp)=>{

    const Transponder = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        },
    });
    
    try {
        await Transponder.sendMail({
            from: process.env.EMAIL,
            to: recipientEmail,
            subject: "OTP Verification of userProfile in EcoClean",
            html: `
                <div style="font-size: 20px; font-family: Arial, sans-serif; color: #333;">
                    <p><strong>Your OTP is:</strong> <span style="color: blue;">${otp}</span></p>
                    <p>Please use this OTP to verify your email address.</p>
                </div>
            `
        });
        console.log("OTP sent successfully");
    } catch (error) {
        console.log("Error while sending email", error);
    }
  }


  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
}


export {sendMail,generateOTP};
