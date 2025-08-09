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

const SendQr = async (title, location, time, username, recipientEmail) => {
  console.log('🔖 Sending QR code email to:', recipientEmail),title,location,time,username;
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
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; padding: 20px;">
        <h2 style="color: #2c3e50;">Reminder: <span style="color: #007BFF;">${title}</span> is Coming Up!</h2>
        
        <p>Hello <strong>${username}</strong>,</p>

        <p>This is a friendly reminder that the event you've joined is happening in the next 24 hours.</p>

        <ul style="line-height: 1.6;">
          <li><strong>Event:</strong> ${title}</li>
          <li><strong>Location:</strong> ${location}</li>
          <li><strong>Time:</strong> ${time}</li>
        </ul>

        <p>✨ Great news! You can now access your event QR code directly on the website:</p>
        <p>
          <a href="http://localhost:5173/events/${encodeURIComponent(title)}" target="_blank" style="color: #007BFF;">
            View Your QR Code Here
          </a>
        </p>

        <p>Make sure to bring this QR code with you for entry. It's valid for 24 hours before the event.</p>

        <p>We're excited to have you there!</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;" />

        <p style="font-size: 14px; color: #666;">If you have any questions or issues, feel free to reach out.</p>
      </div>
    `;

    await Transponder.sendMail({
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `Reminder: "${title}" is in 24 Hours – Get Your QR Code`,
      html: htmlContent,
    });

    console.log(`Reminder email sent to ${recipientEmail}`);
  } catch (err) {
    console.log("Error while sending mail to", recipientEmail, err);
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
