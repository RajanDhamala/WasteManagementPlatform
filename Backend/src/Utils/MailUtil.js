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

const SendQr = async (title, location, time, qrHash, username, recipientEmail) => {
  const Transponder = nodemailer.createTransport({
    service: "gmail",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    },
    auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD, 
    },
  });

  try {
    const htmlContent = `
      <div style="font-size: 20px; font-family: Arial, sans-serif; color: #333;">
        <h2>Event QR Code</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>We are excited to have you join the event titled <strong>${title}</strong>.</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>Here is your unique QR code to check in at the event:</p>
        <p><img src="data:image/png;base64,${qrHash}" alt="QR Code" style="width: 200px; height: 200px;"/></p>
        <p>Please make sure to scan the QR code to gain access to the event. The code will be valid for 24hrs.</p>
        <p>Looking forward to your participation!</p>
      </div>
    `;

    await Transponder.sendMail({
      from: process.env.EMAIL, 
      to: recipientEmail,         
      subject: `Your QR Code for ${title}`,
      html: htmlContent,
    });

    console.log(`QR Code sent to ${recipientEmail}`);
  } catch (Err) {
    console.log("Error while sending mail to", recipientEmail, Err);
  }
};

const TrialMail = async (recipientEmail, username = "User", subject = "Trial Email", message = "This is a test email.") => {
  const Transponder = nodemailer.createTransport({
    service: "gmail",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    },
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <h3>Hello ${username},</h3>
        <p>${message}</p>
        <p>This email is a test/trial from our email system.</p>
        <p>Thank you!</p>
      </div>
    `;

    await Transponder.sendMail({
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    });

    console.log(`Trial email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error while sending trial email to", recipientEmail, error);
  }
};


export { sendMail, generateOTP,SendQr,TrialMail };
